"""Trains Onyx's prediction network, which guesses the next words of what people say, and writes its open weights to
src/onyx-predict-weights.js.

What it learns from, all from Onyx itself or written for it (nothing scraped):
  - the example phrases Onyx understands, in English, Spanish and French;
  - the dictionary's example sentences (hand-written ones, tools/examples.txt and WordNet's);
  - the phrasebook in src/onyx-translate.js, in all three languages;
  - requests for everything Onyx does, made from templates below ("write a haiku about the sea", "fizzbuzz in rust",
    "how do you say happy in French", "what's the weather in Austin").
One sentence in ten is held out to measure it (400 of those go to test/fixtures/predict-heldout.txt for the tests), and
another one in twenty decides when to stop training, before the network starts memorizing.

The network: the last four words, each a 48-number embedding, then a hidden layer of 192, then a projection back into
the embedding space, scored against every word in the vocabulary (the output reuses the input embeddings). About
330,000 numbers, stored as 8-bit integers. A count-based model (the commonest next word after the last two or one
word) is measured on the same held-out sentences, for comparison.

    pip install numpy
    python3 tools/train-predict.py              about two minutes; the same weights every time on the same machine
"""
import argparse
import base64
import hashlib
import json
import os
import random
import re
import subprocess
import sys
import time

os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
os.environ.setdefault('MKL_NUM_THREADS', '1')
if os.environ.get('PYTHONHASHSEED') != '0':
    os.environ['PYTHONHASHSEED'] = '0'
    os.execv(sys.executable, [sys.executable] + sys.argv)

ap = argparse.ArgumentParser()
ap.add_argument('--epochs', type=int, default=12)
ap.add_argument('--vocab', type=int, default=6000)
ap.add_argument('--pythonpath', help='extra directory for numpy')
ap.add_argument('--corpus', help='also write the training sentences to this file')
args = ap.parse_args()
if args.pythonpath:
    sys.path.insert(0, args.pythonpath)
import numpy as np  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CONTEXT, EMBED, HIDDEN = 4, 48, 192

# ---------- What Onyx knows, from Onyx ----------

data = json.loads(subprocess.check_output(['node', '-e', '''
const R = process.argv[1];
for (const f of ['host/host.js', 'src/onyx-lexicon.js', 'src/onyx-dictionary.js', 'src/onyx-languages.js', 'src/onyx-data.js', 'src/onyx-translate.js', 'src/onyx-code.js']) require(R + '/' + f);
const D = Omni.onyxDictionary, L = Omni.onyxLanguages;
const words = (pred) => [...new Set(D.WORDS.filter(pred).map((e) => e.w))];
const out = {
  intents: Omni.onyxData.INTENTS.flatMap((i) => i.examples || []),
  foreign: Object.fromEntries(['es', 'fr'].map((l) => [l, L.LANGS[l].intents.flatMap((i) => i.examples || [])])),
  examples: D.WORDS.map((e) => e.ex).filter((x) => x && x.split(' ').length >= 3),
  phrases: Omni.onyxTranslate.PHRASES,
  animals: words((e) => e.pos === 'noun' && e.kind === 'animal' && !e.src && !/^[A-Z]/.test(e.w)),
  foods: words((e) => e.pos === 'noun' && e.kind === 'food' && !e.src && !e.mass && !/^[A-Z]/.test(e.w)),
  things: words((e) => e.pos === 'noun' && e.kind === 'thing' && !e.src && !e.mass && !/^[A-Z]/.test(e.w)),
  events: words((e) => e.pos === 'noun' && e.kind === 'event' && !e.src && !e.mass),
  feelings: words((e) => e.pos === 'adjective' && e.use === 'feel' && !e.src),
  adjectives: words((e) => e.pos === 'adjective' && e.use === 'object' && !e.src),
  nature: words((e) => e.pos === 'noun' && e.kind === 'nature' && !e.src && !/^[A-Z]/.test(e.w)),
  people: words((e) => e.pos === 'noun' && e.kind === 'person' && e.rel && !e.src),
  places: words((e) => e.pos === 'noun' && e.kind === 'place' && /^[A-Z]/.test(e.w) && !e.w.includes(' ')).slice(0, 300),
  verbs: words((e) => e.pos === 'verb' && e.act && !e.src),
  common: words((e) => !e.src && /^[a-z]+$/.test(e.w) && e.w.length > 3).slice(0, 2500),
  hand: [...L.TABLE.keys()].map((k) => k.replace(/\\.[a-z]+$/, '')).filter((w) => /^[a-z]+$/.test(w)),
  es: [...L.TABLE.values()].map((v) => v.es).filter(Boolean).map((s) => s.replace(/^(?:el|la|los|las) /, '')).filter((w) => /^[a-záéíóúñ]+$/.test(w)),
  fr: [...L.TABLE.values()].map((v) => v.fr).filter(Boolean).map((s) => s.replace(/^(?:le|la|les) |^l'| [mf]$/g, '')).filter((w) => /^[a-zàâçéèêëîïôûùüÿœ]+$/.test(w)),
};
console.log(JSON.stringify(out));
''', ROOT]).decode())

rng = random.Random(2026)
pick = lambda xs: xs[rng.randrange(len(xs))]  # noqa: E731

NAMES = ['Sam', 'Ana', 'Léa', 'Max', 'Priya', 'Omar', 'Mia', 'Leo', 'Zoe', 'Kai']
DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'tomorrow', 'today', 'tonight', 'next week', 'this weekend']
CITIES = ['Austin', 'Paris', 'London', 'Madrid', 'Tokyo', 'New York', 'Chicago', 'Berlin', 'Rome', 'Lyon', 'Seattle', 'Mexico City', 'Toronto', 'Sydney']
TOPICS = ['the sea', 'the moon', 'autumn', 'rain', 'my dog', 'the city', 'coffee', 'winter', 'friendship', 'the stars', 'a fox', 'spring', 'the mountains', 'snow']
CODE_LANGS = ['python', 'javascript', 'rust', 'c', 'c#', 'c++', 'html', 'http', 'js']
CODE_TASKS = ['fizzbuzz', 'hello world', 'a web server', 'a number guessing game', 'a function that adds two numbers', 'a function that multiplies two numbers', 'a program that counts to 10', 'a class person with name and age', 'a struct book with title and price', 'a get request', 'a post request', 'a program that reverses a string', 'a palindrome checker', 'a factorial function', 'the first 10 fibonacci numbers', 'a prime checker', 'a program that sorts a list', 'a program that reads a file', 'a program that writes to a file', 'a word counter', 'an html form with name and email', 'an html table', 'a web page', 'a button']
OCCASIONS = ['birthday', 'thank you', 'get well', 'congratulations', 'good luck', 'wedding', 'graduation', 'retirement', 'sympathy', 'new baby']
SPORTS = ['football', 'tennis', 'basketball', 'chess', 'soccer']

# {slot} fillers.
SLOTS = {
    'animal': data['animals'], 'food': data['foods'], 'thing': data['things'], 'event': data['events'] or ['exam', 'party'],
    'feeling': data['feelings'], 'adj': data['adjectives'], 'nature': data['nature'], 'person': data['people'] or ['mom', 'dad'],
    'place': data['places'] or CITIES, 'verb': data['verbs'], 'word': data['common'], 'hand': data['hand'], 'name': NAMES,
    'day': DAYS, 'city': CITIES, 'topic': TOPICS, 'codelang': CODE_LANGS, 'codetask': CODE_TASKS, 'occasion': OCCASIONS,
    'num': [str(n) for n in (2, 3, 5, 7, 10, 12, 15, 20, 25, 50, 100)], 'lang': ['spanish', 'french'], 'sport': SPORTS,
    'es': data['es'], 'fr': data['fr'],
}

TEMPLATES = '''
hi i'm {name}
my name is {name}
i have an {event} on {day}
i have a {event} {day}
i'm feeling {feeling} today
i feel {feeling}
i'm so {feeling}
i'm really {feeling} about the {event}
my {animal} is sick
i adopted a {animal}
i'm going to {city} {day}
i went to {city} last week
what's the weather in {city}
what's the weather like in {city} {day}
is it going to rain in {city}
what's in the news
define {word}
what does {word} mean
what is the meaning of {word}
another word for {word}
what's the opposite of {word}
use {word} in a sentence
how do you pronounce {word}
how many syllables in {word}
what rhymes with {word}
words that start with {word}
is a {animal} a mammal
is a {animal} a bird
what kind of animal is a {animal}
name some {animal}s
what's the difference between a {animal} and a {animal}
what are the parts of a {thing}
how do you say {hand} in {lang}
what is {hand} in {lang}
translate {hand} to {lang}
what does {es} mean
what does {fr} mean
how do you say i'm hungry in {lang}
how do you say where is the station in {lang}
translate i want a coffee to {lang}
write a haiku about {topic}
write a poem about {topic}
write a short poem about {nature}
tell me a story about a {animal}
write a story about a {animal}
write an acrostic for {name}
write a {occasion} message for my {person}
write a {occasion} card for {name}
describe a {animal}
summarize this text
write {codetask} in {codelang}
{codetask} in {codelang}
write {codetask}
now in {codelang}
what about {codelang}
can you write {codetask} in {codelang}
how do i write {codetask} in {codelang}
show me {codetask} in {codelang}
write a function in {codelang}
look up {name}
research {topic}
research black holes
who was {name}
tell me more
tell me a joke
tell me a fact
give me a tip
what time is it
what's the date today
what can you do
who are you
who made you
how are you
thank you
thanks {name}
good morning
good night
remember that my {person}'s birthday is on {day}
what have i told you
when is my {event}
what's my {animal}'s name
my {animal}'s name is {name}
i need a {thing}
i want a {food}
i'd like a {food} please
i love {food}
i don't like {food}
can i have a {food}
where is my {thing}
i lost my {thing}
i bought a new {thing}
i'm cooking {food} tonight
i'm tired
i'm hungry
i'm bored
what should i do
should i {verb} or {verb}
i want to {verb}
i need to {verb}
i like to {verb}
i can't {verb}
let's {verb}
what is {num} times {num}
what is {num} plus {num}
what's {num} percent of {num}
what is the square root of {num}
solve 2x + {num} = {num}
my {person} is coming to visit {day}
i'm visiting my {person} {day}
i play {sport} on {day}
do you like {sport}
the {thing} is broken
the {animal} is {adj}
it's a {adj} {thing}
i have a {adj} {thing}
stay offline
you can go online
ask first
settings
be brief
reset
'''.strip().split('\n')

FOREIGN_TEMPLATES = {
    'es': '''
hola me llamo {name}
estoy cansado
estoy cansada
tengo hambre
¿cómo estás?
¿qué significa {es}?
¿cómo se dice {hand} en inglés?
¿cómo se dice {hand} en francés?
quiero un café por favor
¿qué tiempo hace en {city}?
cuéntame un chiste
gracias
buenos días
'''.strip().split('\n'),
    'fr': '''
bonjour je m'appelle {name}
je suis fatigué
je suis fatiguée
j'ai faim
comment ça va ?
que veut dire {fr} ?
comment dit-on {hand} en anglais ?
comment dit-on {hand} en espagnol ?
je voudrais un café s'il vous plaît
quel temps fait-il à {city} ?
raconte-moi une blague
merci
bonsoir
'''.strip().split('\n'),
}


def fill(t):
    return re.sub(r'\{(\w+)\}', lambda m: pick(SLOTS[m.group(1)]) if SLOTS[m.group(1)] else m.group(0), t)


sentences = []
for _ in range(3):
    sentences += data['intents']
for lang in ('es', 'fr'):
    sentences += data['foreign'][lang] * 2
    for t in FOREIGN_TEMPLATES[lang]:
        sentences += [fill(t) for _ in range(6)]
sentences += data['examples']
for row in data['phrases']:
    sentences += [row['en'], row['es'], row['fr']]
for t in TEMPLATES:
    sentences += [fill(t) for _ in range(80 if '{' in t else 3)]
for line in open(os.path.join(ROOT, 'tools', 'examples.txt'), encoding='utf8'):
    if '|' in line:
        sentences.append(line.split('|')[-1].strip())

TOKEN = re.compile(r"[a-z0-9àâäçéèêëîïôöùûüÿñœæáíóú#+]+(?:'[a-zàâäçéèêëîïôöùûüÿñœæáíóú]+)?|\?")


def tokens(s):
    t = s.lower().replace('’', "'").replace('¿', ' ').replace('¡', ' ')
    return [w for w in TOKEN.findall(t) if w != '?']


def bucket(s):
    return int(hashlib.md5(s.encode('utf8')).hexdigest(), 16) % 20


seen = set()
train, valid, test = [], [], []
for s in sentences:
    toks = tokens(s)
    if not toks or len(toks) > 30:
        continue
    key = ' '.join(toks)
    b = bucket(key)
    if b in (0, 1):
        if key not in seen:
            test.append(toks)
    elif b == 2:
        if key not in seen:
            valid.append(toks)
    else:
        train.append(toks)
    seen.add(key)
if args.corpus:
    with open(args.corpus, 'w', encoding='utf8') as f:
        f.write('\n'.join(' '.join(t) for t in train) + '\n')

# ---------- Vocabulary ----------

counts = {}
for toks in train:
    for w in toks:
        counts[w] = counts.get(w, 0) + 1
SPECIAL = ['<s>', '</s>', '<unk>']
vocab = SPECIAL + [w for w, c in sorted(counts.items(), key=lambda x: (-x[1], x[0])) if c >= 2][:args.vocab - len(SPECIAL)]
index = {w: i for i, w in enumerate(vocab)}
V = len(vocab)


def ids(toks):
    return [index.get(w, 2) for w in toks]


def examples(sents):
    xs, ys = [], []
    for toks in sents:
        seq = [0] * CONTEXT + ids(toks) + [1]
        for i in range(CONTEXT, len(seq)):
            xs.append(seq[i - CONTEXT:i])
            ys.append(seq[i])
    return np.array(xs, dtype=np.int64), np.array(ys, dtype=np.int64)


Xtr, Ytr = examples(train)
Xva, Yva = examples(valid)
Xte, Yte = examples(test)

# ---------- The network ----------

rs = np.random.RandomState(7)
E = (rs.randn(V, EMBED) * 0.1).astype(np.float32)
W1 = (rs.randn(CONTEXT * EMBED, HIDDEN) * np.sqrt(1.0 / (CONTEXT * EMBED))).astype(np.float32)
b1 = np.zeros(HIDDEN, np.float32)
W2 = (rs.randn(HIDDEN, EMBED) * np.sqrt(1.0 / HIDDEN)).astype(np.float32)
b2 = np.zeros(EMBED, np.float32)
bo = np.zeros(V, np.float32)
params = [E, W1, b1, W2, b2, bo]
m = [np.zeros_like(p) for p in params]
v = [np.zeros_like(p) for p in params]


def forward(X, drop=None):
    x = E[X].reshape(len(X), CONTEXT * EMBED)
    if drop is not None:
        x = x * drop[0]
    h = np.tanh(x @ W1 + b1)
    hd = h * drop[1] if drop is not None else h
    p = hd @ W2 + b2
    logits = p @ E.T + bo
    return x, h, hd, p, logits


def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def evaluate(X, Y):
    """Perplexity over every next token; accuracy over real next words only, the way the suggestions are used: the end
    of a sentence isn't a word to suggest, <unk> is never suggested, and a word the network doesn't know is a miss."""
    top1 = top3 = words = 0
    nll = 0.0
    for i in range(0, len(X), 2048):
        logits = forward(X[i:i + 2048])[-1]
        pr = softmax(logits)
        y = Y[i:i + 2048]
        nll -= np.log(pr[np.arange(len(y)), y] + 1e-12).sum()
        logits[:, :3] = -np.inf
        top = np.argsort(-logits, axis=1)[:, :3]
        real = y != 1
        words += real.sum()
        top1 += ((top[:, 0] == y) & real).sum()
        top3 += ((top == y[:, None]).any(axis=1) & real).sum()
    return top1 / words, top3 / words, float(np.exp(nll / len(Y)))


start = time.time()
order = np.random.RandomState(11)
noise = np.random.RandomState(13)
step = 0
BATCH = 256
DROP_IN, DROP_HIDDEN = 0.1, 0.4
best = (float('inf'), None, 0)
for epoch in range(args.epochs):
    perm = order.permutation(len(Xtr))
    lr = 0.003 * (0.85 ** epoch)
    for i in range(0, len(perm), BATCH):
        idx = perm[i:i + BATCH]
        X, Y = Xtr[idx], Ytr[idx]
        # Dropout: a random tenth of the input and two fifths of the hidden layer are left out of each step.
        drop = ((noise.rand(len(X), CONTEXT * EMBED) > DROP_IN).astype(np.float32) / (1 - DROP_IN), (noise.rand(len(X), HIDDEN) > DROP_HIDDEN).astype(np.float32) / (1 - DROP_HIDDEN))
        x, h, hd, p, logits = forward(X, drop)
        g = softmax(logits)
        g[np.arange(len(Y)), Y] -= 1
        g /= len(Y)
        gE = g.T @ p
        gbo = g.sum(0)
        gp = g @ E
        gW2 = hd.T @ gp
        gb2 = gp.sum(0)
        gh = (gp @ W2.T) * drop[1] * (1 - h * h)
        gW1 = x.T @ gh
        gb1 = gh.sum(0)
        gx = ((gh @ W1.T) * drop[0]).reshape(len(X), CONTEXT, EMBED)
        np.add.at(gE, X.reshape(-1), gx.reshape(-1, EMBED))
        grads = [gE, gW1, gb1, gW2, gb2, gbo]
        step += 1
        for k, (pa, gr) in enumerate(zip(params, grads)):
            gr = gr + 1e-4 * pa
            m[k] = 0.9 * m[k] + 0.1 * gr
            v[k] = 0.999 * v[k] + 0.001 * gr * gr
            mh = m[k] / (1 - 0.9 ** step)
            vh = v[k] / (1 - 0.999 ** step)
            pa -= lr * mh / (np.sqrt(vh) + 1e-8)
    t1, t3, ppl = evaluate(Xva, Yva)
    print(f'epoch {epoch + 1}: validation top-1 {t1:.3f}, top-3 {t3:.3f}, perplexity {ppl:.1f} ({time.time() - start:.0f} s)', flush=True)
    # Keep the weights from the epoch that predicted the validation sentences best.
    if ppl < best[0]:
        best = (ppl, [pa.copy() for pa in params], epoch + 1)
for pa, keep in zip(params, best[1]):
    pa[...] = keep
print(f'kept epoch {best[2]}')

# ---------- The same held-out words, by counting (the commonest next word after the last two words, or one) ----------

after2, after1 = {}, {}
for toks in train:
    seq = ['<s>', '<s>'] + toks + ['</s>']
    for i in range(2, len(seq)):
        a2 = after2.setdefault((seq[i - 2], seq[i - 1]), {})
        a2[seq[i]] = a2.get(seq[i], 0) + 1
        a1 = after1.setdefault(seq[i - 1], {})
        a1[seq[i]] = a1.get(seq[i], 0) + 1
unigram = sorted(counts, key=lambda w: -counts[w])[:3]
c1 = c3 = n = 0
for toks in test:
    seq = ['<s>', '<s>'] + toks + ['</s>']
    for i in range(2, len(seq)):
        guesses = []
        for table, key in ((after2, (seq[i - 2], seq[i - 1])), (after1, seq[i - 1])):
            for w, _ in sorted(table.get(key, {}).items(), key=lambda x: (-x[1], x[0])):
                if w not in guesses:
                    guesses.append(w)
        guesses = [w for w in guesses if w != '</s>']
        guesses = (guesses + [w for w in unigram if w not in guesses])[:3]
        if seq[i] == '</s>':
            continue
        n += 1
        c1 += guesses[0] == seq[i]
        c3 += seq[i] in guesses
t1, t3, ppl = evaluate(Xte, Yte)
report = {'vocab': V, 'train_sentences': len(train), 'epochs': best[2], 'held_out_sentences': len(test), 'held_out_words': int((Yte != 1).sum()), 'top1': round(float(t1), 3), 'top3': round(float(t3), 3), 'perplexity': round(ppl, 1), 'count_top1': round(c1 / n, 3), 'count_top3': round(c3 / n, 3)}
print(json.dumps(report))

# ---------- Open weights, as 8-bit integers ----------


def q8(a):
    scale = float(np.abs(a).max()) / 127 or 1.0
    return base64.b64encode(np.clip(np.round(a / scale), -127, 127).astype(np.int8).tobytes()).decode(), scale


parts = {name: q8(arr) for name, arr in (('E', E), ('W1', W1), ('b1', b1), ('W2', W2), ('b2', b2), ('bo', bo))}

# The tests' sample: 400 held-out sentences picked at random, measured here with the 8-bit weights, so the JavaScript
# that runs them can be checked against these numbers.
sample = random.Random(5).sample(test, min(400, len(test)))
for pa, name in zip(params, ('E', 'W1', 'b1', 'W2', 'b2', 'bo')):
    data64, scale = parts[name]
    pa[...] = np.frombuffer(base64.b64decode(data64), dtype=np.int8).astype(np.float32).reshape(pa.shape) * scale
Xs, Ys = examples(sample)
s1, s3, _ = evaluate(Xs, Ys)
report['sample_top1'] = round(float(s1), 4)
report['sample_top3'] = round(float(s3), 4)
print('8-bit weights on the sample:', report['sample_top1'], report['sample_top3'])
n_params = sum(p.size for p in params)
with open(os.path.join(ROOT, 'src', 'onyx-predict-weights.js'), 'w', encoding='utf8') as f:
    f.write(f'''// Onyx 2.5's prediction network: open weights, written by tools/train-predict.py (don't edit by hand). The last four
// words -> embeddings ({EMBED}) -> hidden layer ({HIDDEN}, tanh) -> projection ({EMBED}) -> a score for each of {V:,} words,
// against the same embeddings. {n_params:,} numbers, as 8-bit integers with one scale per matrix.
// Measured on {len(test):,} held-out sentences: the right next word first {report['top1'] * 100:.1f}% of the time, in the
// first three {report['top3'] * 100:.1f}% (counting the commonest next word: {report['count_top1'] * 100:.1f}% and {report['count_top3'] * 100:.1f}%).
(function (root) {{
\t'use strict';

\t(root.Omni = root.Omni || {{}}).onyxPredictWeights = {{
\t\tcontext: {CONTEXT}, embed: {EMBED}, hidden: {HIDDEN},
\t\treport: {json.dumps(report)},
\t\tvocab: {json.dumps(' '.join(vocab), ensure_ascii=False)},
''')
    for name, (data64, scale) in parts.items():
        f.write(f"\t\t{name}: {{ scale: {scale:.8g}, data: '{data64}' }},\n")
    f.write("\t};\n})(typeof window !== 'undefined' ? window : globalThis);\n")

os.makedirs(os.path.join(ROOT, 'test', 'fixtures'), exist_ok=True)
with open(os.path.join(ROOT, 'test', 'fixtures', 'predict-heldout.txt'), 'w', encoding='utf8') as f:
    f.write('\n'.join(' '.join(t) for t in sample) + '\n')
print(f'{n_params:,} parameters, {os.path.getsize(os.path.join(ROOT, "src", "onyx-predict-weights.js")):,} bytes')
