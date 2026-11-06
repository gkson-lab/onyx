"""Builds src/onyx-lexicon.js, the generated part of Onyx 2's dictionary.

Onyx's dictionary has two parts. The hand-written core (src/onyx-dictionary.js) carries the everyday words and the hints
that let Onyx read what people tell it (feelings, events, moods). This script adds the rest from two open databases:

  - Princeton WordNet 3.0: definitions, examples, synonyms, opposites, irregular forms, what kind of thing a noun is
    ("a whale is a kind of mammal") and what it is part of or made of.
  - The CMU Pronouncing Dictionary: pronunciations, which give syllables and rhymes.

Words are chosen by how common they are (wordfreq), skipping anything the core already has, inflections of other words
("years", "said"), names, abbreviations, vulgar and sexual words, and slurs. Common words without an example in WordNet
get one from tools/examples.txt, written for Onyx.

    pip install nltk wordfreq
    python3 tools/build-lexicon.py --data <nltk_data dir with corpora/wordnet and corpora/cmudict>

The output is deterministic: the same inputs give the same file.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import warnings

warnings.filterwarnings('ignore')

ap = argparse.ArgumentParser()
ap.add_argument('--data', required=True, help='an nltk_data directory containing corpora/wordnet and corpora/cmudict')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'src', 'onyx-lexicon.js'))
ap.add_argument('--common', type=int, default=6000, help='candidates this common are always kept (examples written by hand when WordNet has none)')
ap.add_argument('--target', type=int, default=10400, help='how many new words to add')
ap.add_argument('--report', help='write the words that still need a hand-written example to this file')
ap.add_argument('--pythonpath', help='extra directory for nltk and wordfreq')
args = ap.parse_args()
if args.pythonpath:
    sys.path.insert(0, args.pythonpath)

import nltk  # noqa: E402

nltk.data.path.insert(0, args.data)
from nltk.corpus import wordnet as wn  # noqa: E402
from wordfreq import top_n_list, zipf_frequency  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# ---------- What the hand-written core already knows ----------

# Every spelling the core recognizes, from Onyx itself, so nothing is added twice.
core = json.loads(subprocess.check_output(['node', '-e', '''
require(process.argv[1] + '/host/host.js');
global.Omni.onyxLexicon = null;
require(process.argv[1] + '/src/onyx-dictionary.js');
const D = Omni.onyxDictionary, f = D.forms, forms = new Set();
for (const e of D.CORE) {
  forms.add(e.w.toLowerCase());
  (e.forms || []).concat(e.variants || []).forEach((x) => forms.add(x.toLowerCase()));
  if (e.pos === 'noun') forms.add(f.plural(e));
  if (e.pos === 'verb') [f.third(e), f.past(e), f.ing(e)].forEach((x) => forms.add(x));
}
console.log(JSON.stringify({ entries: D.CORE.map((e) => [e.w, e.pos, e.def, e.pos === 'verb' ? f.past(e) : '', e.kind || '']), forms: [...forms] }));
''', ROOT]).decode())
core_forms = set(core['forms'])
core_words = {e[0].lower() for e in core['entries']}

# ---------- Filters ----------

BAD_DOMAINS = {'vulgarism', 'obscenity', 'ethnic_slur', 'disparagement', 'slang', 'derogation', 'profanity', 'vulgarity'}
BAD_GLOSS = re.compile(r'\b(offensive|vulgar|obscene|derogatory|slur|disparaging|copulat\w*|orgasm\w*|erotic\w*|pornograph\w*|masturbat\w*|prostitut\w*|sexual (?:intercourse|desire|appeal|activity|relationship|impropriety|excitement|gratification|partner)|sexually|sex organs?|have sex|extramarital|lust\w*|semen|genitals?|penis|vagina|vulva|clitoris|testes|scrotum|anus|incite to indecency)\b', re.I)
# Words an example sentence or a synonym list must not contain.
BAD_TEXT = re.compile(r'(shit|piss|fuck|crap|cunt|bitch|bastard|whore|slut|nigg|\bfag|retard|\bdick\b|\bcock\b|\btits?\b|\bboobs?\b|\bass\b|asshole|penis|vagina|\bsex\b|sexual|\blust|porn|erotic|seduc|nude|naked|\brape|negro|\bcolou?red people|\bgypsy|gypsies|eskimo|\bharlot|cripple|midget|lunatic|spastic|savages?\b|\bkill(ed|ing|s)?\b|murder)', re.I)
BLOCK = set('''
shit fuck fucking damn crap piss bitch bastard dick cock pussy cunt ass arse asshole whore slut fag faggot dyke nigger nigga
retard retarded spic chink kike gook wetback tranny homo queer twat wank wanker prick tits tit boob boobs booty butt
sex sexy porn porno rape rapist raping molest molester pedophile incest orgy nude nudity naked horny hooker pimp stripper
meth stoned dope john willy
'''.split())


def bad_synset(s):
    doms = {d.name().split('.')[0] for d in s.usage_domains()}
    return bool(doms & BAD_DOMAINS) or bool(BAD_GLOSS.search(s.definition()))


def lemmas_for(w):
    """WordNet lemmas spelled exactly `w` (lowercase, so no names or acronyms), most frequent first."""
    name = w.replace(' ', '_')
    out = []
    for i, s in enumerate(wn.synsets(name)):
        if s.instance_hypernyms() or bad_synset(s):
            continue
        for l in s.lemmas():
            if l.name() == name:
                out.append((l, i))
    return out


def inflection_of(w):
    """A more common base this word is a form of ("years" -> year), or None."""
    for pos in 'nvar':
        for b in wn._morphy(w, pos):
            if b != w and zipf_frequency(b, 'en') >= zipf_frequency(w, 'en') - 0.3:
                return b
    return None


# ---------- Text ----------

def clean_gloss(g):
    g = g.replace('`', '"').replace("''", '"')
    g = re.sub(r"\"([^\"]+)'", r'"\1"', g)
    shorter = re.sub(r'\s*\([^()]*\)', '', g).strip()
    if len(shorter) >= 8:
        g = shorter
    g = re.sub(r'\s+', ' ', g).strip()
    g = re.sub(r';\s*-\s+[^;]+$', '', g).strip().rstrip(';:,. ')
    if len(g) > 150 and ';' in g:
        g = g.split(';')[0].strip()
    return g.replace('|', '/')


# Words an example sentence shouldn't use: WordNet's examples are from 2006 and older, and a few have aged badly.
EX_BLOCK = {'cripple', 'cripples', 'crippled', 'midget', 'midgets', 'negro', 'negroes', 'savages', 'retarded', 'lunatic', 'lunatics', 'spastic', 'dwarf', 'dwarfs', 'whore', 'harlot', 'hell', 'damn', 'god-damn', 'kill', 'killed', 'murdered'}


def clean_example(x):
    """A full sentence comes back capitalized with a full stop; a short phrase ("some paper") stays a phrase."""
    x = x.replace('`', '"').replace("''", '"').strip().strip('"').strip()
    x = re.sub(r'\s+', ' ', x).replace('|', '/')
    if not x or EX_BLOCK & set(re.findall(r"[a-z-]+", x.lower())) or BAD_TEXT.search(x):
        return None
    if len(x.split()) < 5:
        return x.rstrip('.')
    x = x[0].upper() + x[1:]
    if not re.search(r'[.!?]["\']?$', x):
        x += '.'
    return x


def uses(word, example):
    """Whether an example sentence uses the word or a form of it ("advised" for advise), not a longer word ("category")."""
    first = word.split(' ')[0].split('-')[0]
    stem = re.sub(r'(e|y)$', '', first) if len(first) > 3 else first
    for tok in re.findall(r"[a-z]+", example.lower()):
        if tok.startswith(stem) and len(tok) - len(stem) <= 4 and (tok == first or len(tok) >= len(first) - 1):
            return word.lower() in example.lower() if ' ' in word or '-' in word else True
    return False


def stem_word(x):
    """A rough stem, so "breathes", "breathe" and "breathing" compare equal."""
    for suf in ('ing', 'es', 'ed', 's'):
        if len(x) > len(suf) + 3 and x.endswith(suf):
            x = x[:-len(suf)]
            break
    return x[:-1] if len(x) > 4 and x.endswith('e') else x


def pretty(lemma_name):
    return lemma_name.replace('_', ' ')


# ---------- Pronunciation: CMUdict ARPAbet to IPA, with stress marks ----------

ARPA = {
    'AA': 'ɑ', 'AE': 'æ', 'AH': 'ʌ', 'AO': 'ɔ', 'AW': 'aʊ', 'AY': 'aɪ', 'EH': 'ɛ', 'ER': 'ɝ', 'EY': 'eɪ', 'IH': 'ɪ', 'IY': 'i',
    'OW': 'oʊ', 'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'u', 'B': 'b', 'CH': 'tʃ', 'D': 'd', 'DH': 'ð', 'F': 'f', 'G': 'ɡ', 'HH': 'h',
    'JH': 'dʒ', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'r', 'S': 's', 'SH': 'ʃ', 'T': 't',
    'TH': 'θ', 'V': 'v', 'W': 'w', 'Y': 'j', 'Z': 'z', 'ZH': 'ʒ',
}
ONSETS = {tuple(o.split()) for o in '''
B D F G HH JH K L M N P R S SH T TH V W Y Z ZH CH DH
B L|B R|D R|D W|F L|F R|G L|G R|G W|K L|K R|K W|P L|P R|S K|S L|S M|S N|S P|S T|S W|SH R|T R|T W|TH R|TH W|V Y|M Y|P Y|K Y|B Y|F Y|HH Y|G Y|L Y|N Y
S K R|S K W|S P L|S P R|S T R|S K Y|S P Y
'''.replace('|', '\n').split('\n') if o.strip()}


def ipa(phones):
    """ARPAbet phones -> IPA, with ˈ before each primary-stressed syllable (maximal onset)."""
    vowels = [i for i, p in enumerate(phones) if p[-1].isdigit()]
    starts = {}
    prev = -1
    for v in vowels:
        cons = phones[prev + 1:v]
        k = len(cons)
        while k > 0 and tuple(cons[len(cons) - k:]) not in ONSETS:
            k -= 1
        starts[v] = v - k if prev >= 0 else 0
        prev = v
    out = []
    for i, p in enumerate(phones):
        for v, st in starts.items():
            if st == i and phones[v][-1] == '1' and len(vowels) > 1:
                out.append('ˈ')
        base = p.rstrip('012')
        sym = ARPA[base]
        if base == 'AH' and p.endswith('0'):
            sym = 'ə'
        if base == 'ER' and p.endswith('0'):
            sym = 'ɚ'
        out.append(sym)
    return ''.join(out)


CMU = {}
for line in open(os.path.join(args.data, 'corpora', 'cmudict', 'cmudict'), encoding='latin-1'):
    parts = line.split()
    if len(parts) < 3:
        continue
    w, n, phones = parts[0].lower(), parts[1], parts[2:]
    if n == '1' and w not in CMU:
        CMU[w] = phones


def pron(word):
    pieces = []
    for part in re.split(r'[ -]', word.lower()):
        if not part:
            continue
        if part not in CMU:
            return None
        pieces.append(ipa(CMU[part]))
    return ' '.join(pieces) if pieces else None


# ---------- Irregular forms ----------

def exceptions(pos):
    m = {}
    for line in open(os.path.join(args.data, 'corpora', 'wordnet', pos + '.exc'), encoding='utf8'):
        parts = line.split()
        for base in parts[1:]:
            m.setdefault(base, []).append(parts[0])
    return m


NOUN_EXC = exceptions('noun')
VERB_EXC = exceptions('verb')


def verb_forms(w):
    """Irregular forms from WordNet's exception list: "began" and "begun" for begin, "occurred" for occur."""
    out = {}
    forms = [f for f in dict.fromkeys(VERB_EXC.get(w, [])) if '_' not in f]
    for f in forms:
        if f.endswith('ing'):
            out.setdefault('ing', f)
    rest = [f for f in forms if not f.endswith('ing')]
    if len(rest) == 1:
        out['past'] = rest[0]
    elif len(rest) >= 2:
        a, b = rest[0], rest[1]
        # The participle is the one ending in -n (taken, begun), or the u of sung against the a of sang.
        if b.endswith('n') and not a.endswith('n') or ('u' in b and 'a' in a and 'u' not in a):
            out['past'], out['pp'] = a, b
        elif a.endswith('n') and not b.endswith('n') or ('u' in a and 'a' in b and 'u' not in b):
            out['past'], out['pp'] = b, a
        else:
            out['past'] = a
    return out


# ---------- Kinds and the "is a" chain ----------

SKIP_ISA = {'entity', 'physical entity', 'abstraction', 'abstract entity', 'object', 'physical object', 'whole', 'unit'}


def first_lemma(s):
    return pretty(s.lemmas()[0].name())


def isa_chain(s, limit=10):
    """What a noun is a kind of, nearest first, along WordNet's most specific path (dog: canine, carnivore, mammal...),
    then anything else it is also a kind of (domestic animal)."""
    paths = s.hypernym_paths()
    if not paths:
        return []
    paths.sort(key=len, reverse=True)
    out = []
    for path in paths:
        for anc in reversed(path[:-1]):
            name = first_lemma(anc)
            if name.lower() in SKIP_ISA or name in out:
                continue
            out.append(name)
    return out[:limit]


def ancestors(s):
    names = set()
    for path in s.hypernym_paths():
        names.update(x.name() for x in path)
    return names


def kind_of(s):
    lex = s.lexname()
    anc = ancestors(s)
    if lex == 'noun.animal':
        return 'animal'
    if lex == 'noun.person':
        return 'person'
    if lex == 'noun.food' and anc & {'food.n.01', 'food.n.02', 'beverage.n.01', 'dish.n.02'}:
        return 'food'
    if lex == 'noun.plant':
        return 'nature'
    if lex == 'noun.body':
        return 'body'
    if lex == 'noun.time':
        return 'time'
    if lex == 'noun.artifact':
        if 'vehicle.n.01' in anc:
            return 'vehicle'
        if 'furniture.n.01' in anc:
            return 'furniture'
        return 'thing'
    return None


# ---------- One entry ----------

POS_NAME = {'n': 'n', 'v': 'v', 'a': 'adj', 's': 'adj', 'r': 'adv'}
EXAMPLES = {}
SKIP = set()
ex_path = os.path.join(ROOT, 'tools', 'examples.txt')
if os.path.exists(ex_path):
    for line in open(ex_path, encoding='utf8'):
        if '|' not in line or line.startswith('#'):
            continue
        parts = line.rstrip('\n').split('|', 2)
        if parts[1] == '-':
            SKIP.add(parts[0])
        else:
            EXAMPLES[(parts[0], parts[1])] = parts[2].strip()


def related_words(syn, lemma, w, limit=4):
    syns = []
    for l in syn.lemmas():
        n = pretty(l.name())
        if n.lower() == w or n[0].isupper() or w in n.lower().split() or n in syns:
            continue
        if zipf_frequency(n, 'en') < (2.8 if ' ' in n else 2.2) or re.search(r'\d', n) or re.fullmatch(r'[ivxlc]+', n):
            continue
        syns.append(n)
    numeral = any(h.name() in ('cardinal.a.01', 'ordinal.a.01') for h in syn.similar_tos())
    if syn.pos() in 'as' and not numeral:
        for s2 in syn.similar_tos():
            n = first_lemma(s2)
            if n.lower() != w and not n[0].isupper() and n not in syns and ' ' not in n and zipf_frequency(n, 'en') >= 2.2:
                syns.append(n)
    syns = [x for x in syns if not BLOCK & set(x.lower().split()) and not BAD_TEXT.search(x)]
    syns.sort(key=lambda x: -zipf_frequency(x, 'en'))
    ants = []
    for a in lemma.antonyms():
        ants.append(pretty(a.name()))
    if not ants and syn.pos() == 's' and not numeral:
        for head in syn.similar_tos():
            for l in head.lemmas():
                for a in l.antonyms():
                    ants.append(pretty(a.name()))
    ants = [x for x in dict.fromkeys(ants) if not x[0].isupper() and zipf_frequency(x, 'en') >= 2.0 and not BAD_TEXT.search(x)]
    return syns[:limit], ants[:3]


def entry_for(w, pos_key, lemmas):
    """One dictionary line for word `w` in one part of speech, or (None, reason)."""
    lemmas = sorted(lemmas, key=lambda x: (-x[0].count(), x[1]))
    lemma, _ = lemmas[0]
    syn = lemma.synset()
    definition = clean_gloss(syn.definition())
    if BAD_TEXT.search(definition) and not re.search(r'\b(sex|sexual)\b', w):
        return None, ('needex', w, POS_NAME[syn.pos()], definition)
    example = None
    for x in sorted(syn.examples(), key=len):
        c = clean_example(x)
        if c and uses(w, c) and len(c) <= 170 and not BLOCK & set(re.findall(r'[a-z]+', c.lower())):
            example = c
            break
    if not example:
        # Another common sense of the word may have an example: then the entry carries both senses.
        for l2, _ in lemmas[1:4]:
            s2 = l2.synset()
            for x in sorted(s2.examples(), key=len):
                c = clean_example(x)
                if c and uses(w, c) and len(c) <= 170 and not BLOCK & set(re.findall(r'[a-z]+', c.lower())):
                    example = c
                    second = clean_gloss(s2.definition())
                    definition = f'{definition.split(";")[0]}; also, {second.split(";")[0]}'
                    break
            if example:
                break
    pos = POS_NAME[syn.pos()]
    if not example:
        example = EXAMPLES.get((w, pos))
    if not example:
        return None, ('needex', w, pos, definition)
    syns, ants = related_words(syn, lemma, w)
    hints = []
    if pos == 'n':
        kind = kind_of(syn)
        if kind:
            hints.append('kind=' + kind)
        if w in NOUN_EXC:
            pl = [f for f in NOUN_EXC[w] if ' ' not in f and '_' not in f]
            if pl:
                hints.append('plural=' + pl[0])
        chain = isa_chain(syn)
        if chain:
            hints.append('isa=' + ','.join(chain))
        parts = [first_lemma(m) for m in syn.part_meronyms()[:8]]
        if parts:
            hints.append('has=' + ','.join(dict.fromkeys(parts)))
        wholes = [first_lemma(h) for h in syn.part_holonyms()[:4] if w not in first_lemma(h).lower()]
        if wholes:
            hints.append('partof=' + ','.join(dict.fromkeys(wholes)))
        if kind != 'animal':
            hints.append('nogen')
    elif pos == 'v':
        forms = verb_forms(w)
        for k in ('past', 'pp', 'ing'):
            if k in forms:
                hints.append(f'{k}={forms[k]}')
        hints.append('nogen')
    else:
        hints.append('nogen')
    line = '|'.join([w, pos, definition, example, ', '.join(syns), ', '.join(ants), ';'.join(hints)])
    return line, None


def entries_for(w):
    by_pos = {}
    for l, i in lemmas_for(w):
        by_pos.setdefault(POS_NAME[l.synset().pos()], []).append((l, i))
    if not by_pos:
        return [], []
    score = {p: sum(l.count() for l, _ in ls) + 0.01 * len(ls) for p, ls in by_pos.items()}
    order = sorted(by_pos, key=lambda p: -score[p])
    keep = [order[0]] + [p for p in order[1:2] if score[p] >= max(3, 0.25 * score[order[0]])]
    lines, missing = [], []
    for p in keep:
        line, why = entry_for(w, p, by_pos[p])
        if line:
            lines.append(line)
        elif p == order[0]:
            missing.append(why)
    return lines, missing


# ---------- Places and other proper names worth knowing ----------

# Kinds of named place, and an example sentence that suits each.
GEO = {
    'country.n.02': 'land', 'african_country.n.01': 'land', 'european_country.n.01': 'land', 'asian_country.n.01': 'land',
    'south_american_country.n.01': 'land', 'north_american_country.n.01': 'land', 'american_state.n.01': 'land',
    'continent.n.01': 'land', 'island.n.01': 'land', 'national_capital.n.01': 'city', 'state_capital.n.01': 'city',
    'city.n.01': 'city', 'port.n.01': 'city', 'ocean.n.01': 'water', 'sea.n.01': 'water', 'river.n.01': 'water',
    'superior_planet.n.01': 'planet', 'inferior_planet.n.01': 'planet', 'planet.n.01': 'planet',
}
GEO_EXAMPLE = {
    'land': ['{name} is high on my list of places to visit.', 'My cousin spent a year living in {name}.', 'We watched a documentary about {name} last night.', 'She sent me a postcard from {name}.'],
    'city': ['We spent a few days in {name} last spring.', 'My friend just moved to {name} for work.', 'The flight to {name} was delayed by an hour.', 'We walked all over {name} on our first day.'],
    'water': ['We read about the {name} in geography class.', 'They sailed along the {name} for a week.', 'The {name} looked calm from the bridge.'],
    'planet': ['You can sometimes see {name} in the night sky.', 'The probe sent back new photos of {name}.'],
}
GEO_RANK = {'national_capital.n.01': 0, 'country.n.02': 0, 'american_state.n.01': 0, 'continent.n.01': 0, 'state_capital.n.01': 1}


def geo_entries(limit_zipf=3.2):
    """Countries, states, cities, rivers, seas and planets, most talked-about first. Where a name has several places
    (Columbus, Georgia and Columbus, Ohio), the capital wins, then the first WordNet lists."""
    best = {}
    for s in wn.all_synsets('n'):
        hyps = [h.name() for h in s.instance_hypernyms() if h.name() in GEO]
        if not hyps:
            continue
        name = pretty(s.lemmas()[0].name())
        if not re.fullmatch(r"[A-Z][a-z]+(?: [A-Z][a-z]+)?", name) or name.lower() in core_words or name.lower() in core_forms:
            continue
        rank = min(GEO_RANK.get(h, 2) for h in hyps)
        if name not in best or rank < best[name][0]:
            best[name] = (rank, s, GEO[hyps[0]])
    out = []
    for name, (_, s, what) in best.items():
        z = zipf_frequency(name, 'en')
        if z < limit_zipf:
            continue
        gloss = clean_gloss(s.definition())
        if len(gloss) > 150 or BAD_TEXT.search(gloss):
            gloss = gloss.split(';')[0]
        if BAD_TEXT.search(gloss) or BAD_TEXT.search(name) or name in {'Moron'}:
            continue
        planet = what == 'planet'
        bare = name[4:] if what == 'water' and name.startswith('The ') else name
        options = GEO_EXAMPLE[what]
        example = EXAMPLES.get((name, 'n')) or options[sum(map(ord, name)) % len(options)].format(name=bare)
        chain = isa_chain(s)
        hints = ['kind=place', 'at=in', 'nogen'] if what in ('land', 'city') else ['nogen']
        if chain:
            hints.append('isa=' + ','.join(chain))
        wholes = [first_lemma(h) for h in s.part_holonyms()[:2]]
        if wholes:
            hints.append('partof=' + ','.join(wholes))
        out.append((z, '|'.join([name, 'n', gloss, example, '', '', ';'.join(hints)])))
    return [line for _, line in sorted(out, key=lambda x: -x[0])]


# ---------- Core entries: "is a" chains and parts for the hand-written words ----------

# Words too general to say which sense a definition means ("part", "thing", "way").
GENERIC = set('entity physical object whole abstraction part thing kind type way place unit group act state form something set structure matter being time point area region side piece member number amount quality attribute relation event activity process measure location artifact instrumentality device psychological feature content communication'.split())


KIND_LEX = {
    'animal': ('noun.animal',), 'food': ('noun.food', 'noun.plant'), 'person': ('noun.person',), 'body': ('noun.body',),
    'place': ('noun.location', 'noun.artifact', 'noun.object'), 'thing': ('noun.artifact',), 'vehicle': ('noun.artifact',),
    'furniture': ('noun.artifact',), 'nature': ('noun.plant', 'noun.object', 'noun.phenomenon'), 'time': ('noun.time',),
    'event': ('noun.event', 'noun.act'), 'media': ('noun.communication', 'noun.artifact'),
    'idea': ('noun.cognition', 'noun.attribute', 'noun.feeling', 'noun.state', 'noun.communication', 'noun.act'),
}


def core_extras():
    lines = []
    stop = set('a an the of or and to in on for with that which who is are be by as at from it its their your you can'.split())
    for w, pos, d, past, kind in core['entries']:
        if pos == 'verb' and ' ' not in w:
            # The participle is the irregular form that isn't the past tense: gone (went), begun (began).
            others = [f for f in dict.fromkeys(VERB_EXC.get(w, [])) if '_' not in f and not f.endswith('ing') and f != past]
            pp = others[0] if len(others) == 1 and past != w + 'ed' else None
            if pp:
                lines.append('|'.join([w, 'v', '', '', '', 'pp=' + pp]))
        if pos != 'noun':
            continue
        name = w.replace(' ', '_')
        cands = [s for s in wn.synsets(name, 'n') if any(l.name().lower() == name.lower() for l in s.lemmas())]
        if not cands:
            continue
        dw = {stem_word(x) for x in re.findall(r'[a-z]+', d.lower())} - stop

        def overlap(s):
            words = {stem_word(x) for x in re.findall(r'[a-z]+', s.definition().lower())} - stop
            # A category word in the definition ("a clever sea mammal") is strong evidence for the sense that is a kind of it.
            ups = {stem_word(x) for path in s.hypernym_paths() for h in path[:-1] for x in re.findall(r'[a-z]+', first_lemma(h).lower())} - GENERIC
            used = sum(l.count() for l in s.lemmas() if l.name().lower() == name.lower())
            # The core says what kind of thing the word is (an animal, a food...); WordNet files each sense under one.
            fits = 2 if s.lexname() in KIND_LEX.get(kind, ()) else 0
            return len(dw & words) + 1.5 * len(dw & ups) + min(used, 20) / 20 + fits
        best = max(enumerate(cands), key=lambda x: (overlap(x[1]) - 0.1 * x[0], -x[0]))[1]
        chain = isa_chain(best)
        parts = [first_lemma(m) for m in best.part_meronyms()[:8]]
        wholes = [first_lemma(h) for h in best.part_holonyms()[:4] if w.lower() not in first_lemma(h).lower()]
        if chain or parts or wholes:
            lines.append('|'.join([w, 'n', ','.join(chain), ','.join(dict.fromkeys(parts)), ','.join(dict.fromkeys(wholes)), '']))
    return lines


# ---------- Build ----------

candidates = []
for w in top_n_list('en', 80000):
    if not re.fullmatch(r'[a-z][a-z-]*[a-z]', w) or len(w) < 3 or w in core_forms or w in core_words:
        continue
    if w in BLOCK or w in SKIP:
        continue
    if not lemmas_for(w) or inflection_of(w):
        continue
    candidates.append(w)

words, needs = [], []
added = 0
for rank, w in enumerate(candidates):
    lines, missing = entries_for(w)
    if lines:
        words.extend(lines)
        added += 1
    elif rank < args.common:
        needs.extend(missing)
    if added >= args.target:
        break

geo = geo_entries()
words.extend(geo)
extras = core_extras()

# Pronunciations for every word in the dictionary, core and generated.
all_words = sorted({e[0] for e in core['entries']} | {line.split('|')[0] for line in words}, key=str.lower)
prons = []
for w in all_words:
    p = pron(w)
    if p:
        prons.append(f'{w}|{p}')

if args.report:
    with open(args.report, 'w', encoding='utf8') as f:
        for _, w, pos, d in needs:
            f.write(f'{w}|{pos}|{d}\n')


def block(lines):
    return '\n'.join(lines).replace('\\', '\\\\').replace('`', "'").replace('${', '$ {')


header = '''// Onyx 2's lexicon: the generated part of the dictionary. Built by tools/build-lexicon.py from Princeton WordNet 3.0
// (definitions, examples, synonyms, opposites, "is a kind of" and "part of"), the CMU Pronouncing Dictionary
// (pronunciations), and tools/examples.txt (example sentences written for Onyx). Don't edit this file by hand: change the
// tool or the hand-written core in onyx-dictionary.js, then rebuild.
//
// WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. Used under the WordNet license; see
// LICENSE-WORDNET. CMUdict Copyright (C) 1993-2008 Carnegie Mellon University, used under its BSD-style license; see
// LICENSE-CMUDICT. Lines use the same format as onyx-dictionary.js, plus isa=, has= and partof= hints.
'''
with open(args.out, 'w', encoding='utf8') as f:
    f.write(header)
    f.write("(function (root) {\n\t'use strict';\n\n\t(root.Omni = root.Omni || {}).onyxLexicon = {\n")
    f.write('\t\t// word|pos|definition|example|similar|opposite|hints\n')
    f.write('\t\twords: `\n' + block(words) + '\n`,\n')
    f.write('\t\t// word|pos|is a kind of (nearest first)|has parts|is part of|forms, for the hand-written core\n')
    f.write('\t\tcore: `\n' + block(extras) + '\n`,\n')
    f.write('\t\t// word|pronunciation (IPA, General American; ˈ marks the stressed syllable)\n')
    f.write('\t\tpron: `\n' + block(prons) + '\n`,\n')
    f.write("\t};\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(json.dumps({'candidates': len(candidates), 'new_words': added, 'entries': len(words), 'geo': len(geo), 'core_extras': len(extras), 'prons': len(prons), 'need_examples': len(needs)}))
