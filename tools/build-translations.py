"""Builds Onyx's large Spanish and French word lists, src/translations/, from the Open Multilingual Wordnet 1.4.

The hand-written list in src/onyx-languages.js (3,500 everyday words, written for Onyx, with articles) always comes
first. These files add tens of thousands more, in both directions:

  - English -> Spanish, French: for each English word and part of speech, the translation found in its most used
    WordNet senses, preferring the one that is most common in Spanish or French (wordfreq). A word that is only common
    because English texts use it ("can" in Spanish) is passed over.
  - Spanish, French -> English: for each Spanish or French word in the wordnets, the English words of its senses, the
    most common first.

The Spanish comes from the Multilingual Central Repository 3.0 (CC BY 3.0) and the French from WOLF, the Wordnet Libre
du Français (CeCILL-C), each in its own file under its own license. They are built automatically, so they are less
reliable than the hand-written list, and Onyx says so when it uses them.

    pip install nltk wordfreq
    python3 tools/build-translations.py --data <nltk_data dir with corpora/wordnet and corpora/omw-1.4>

The output is deterministic: the same inputs give the same files.
"""
import argparse
import os
import re
import subprocess
import sys
import json
import warnings

warnings.filterwarnings('ignore')
if os.environ.get('PYTHONHASHSEED') != '0':
    os.environ['PYTHONHASHSEED'] = '0'
    os.execv(sys.executable, [sys.executable] + sys.argv)

ap = argparse.ArgumentParser()
ap.add_argument('--data', required=True, help='an nltk_data directory containing corpora/wordnet and corpora/omw-1.4')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'src', 'translations'))
ap.add_argument('--min-zipf', type=float, default=2.5, help='English words at least this common are covered (and every everyday word)')
ap.add_argument('--pythonpath', help='extra directory for nltk and wordfreq')
args = ap.parse_args()
if args.pythonpath:
    sys.path.insert(0, args.pythonpath)

import nltk  # noqa: E402

nltk.data.path.insert(0, args.data)
from nltk.corpus import wordnet as wn  # noqa: E402
from wordfreq import zipf_frequency  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onyx_wordnet import BAD_TEXT, BLOCK  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SOURCES = {
    'es': ('mcr', 'wn-data-spa.tab', 'Multilingual Central Repository 3.0', 'CC BY 3.0', 'LICENSE-MCR'),
    'fr': ('fra', 'wn-data-fra.tab', 'WOLF (Wordnet Libre du Français)', 'CeCILL-C', 'LICENSE-WOLF'),
}

# ---------- The wordnets: WordNet 3.0 sense (offset-pos) -> Spanish or French words ----------

def load(lang):
    folder, name = SOURCES[lang][:2]
    senses = {}
    for line in open(os.path.join(args.data, 'corpora', 'omw-1.4', folder, name), encoding='utf8'):
        if line.startswith('#'):
            continue
        parts = line.rstrip('\n').split('\t')
        if len(parts) < 3 or not parts[1].endswith('lemma'):
            continue
        key = parts[0].replace('-s', '-a')
        word = parts[2].strip().replace('_', ' ')
        if not word or re.search(r'[0-9|`]', word) or len(word) > 40:
            continue
        senses.setdefault(key, [])
        if word not in senses[key]:
            senses[key].append(word)
    return senses


WN = {lang: load(lang) for lang in SOURCES}


def key(s):
    return '%08d-%s' % (s.offset(), 'a' if s.pos() == 's' else s.pos())


def zipf(word, lang):
    # A phrase is as common as its least common word.
    return min(zipf_frequency(p, lang) for p in word.split()) if word.strip() else 0


def clean_ok(word):
    return not BAD_TEXT.search(word) and word.lower() not in BLOCK


# ---------- Which English words: the everyday dictionary, and every WordNet word at least somewhat common ----------

everyday = json.loads(subprocess.check_output(['node', '-e', '''
require(process.argv[1] + '/host/host.js');
require(process.argv[1] + '/src/onyx-lexicon.js');
require(process.argv[1] + '/src/onyx-dictionary.js');
require(process.argv[1] + '/src/onyx-languages.js');
const D = Omni.onyxDictionary, L = Omni.onyxLanguages;
console.log(JSON.stringify({ words: [...new Set(D.WORDS.map((e) => e.w))], hand: [...L.TABLE.keys()].map((k) => k.replace(/\\.[a-z]+$/, '')) }));
''', ROOT]).decode())
hand = set(everyday['hand'])
english = set(w for w in everyday['words'] if re.fullmatch(r"[a-z][a-z '-]*", w))
for name in wn.all_lemma_names():
    w = name.replace('_', ' ')
    if re.fullmatch(r"[a-z][a-z '-]*", w) and zipf(w, 'en') >= args.min_zipf:
        english.add(w)
POS_NAMES = {'n': 'n', 'v': 'v', 'a': 'adj', 'r': 'adv'}


def translate(word, pos, lang, avoid=()):
    """The best words for `word` as `pos` in `lang`: [(word, score)], best first. `avoid`: the word's translations as
    another part of speech, which a wordnet sometimes repeats here ("livre", the book, for to book)."""
    synsets = [s for s in wn.synsets(word.replace(' ', '_'), pos) if any(l.name().lower() == word.replace(' ', '_') for l in s.lemmas())][:4]
    scores = {}
    for i, s in enumerate(synsets):
        for c in WN[lang].get(key(s), []):
            if not clean_ok(c):
                continue
            z = zipf(c, lang)
            if z < 1.5 and ' ' not in c:
                continue
            # Common in English texts, not in Spanish or French ones: an English word, not a translation.
            if c.lower() != word and zipf(c, 'en') - z > 0.8:
                continue
            # The wordnets sometimes file a noun under a verb sense ("maison" for to house): a verb must look like one.
            if pos == 'v' and not INFINITIVE[lang].search(re.sub(r"^(?:se |s')", '', c).split(' ')[0]):
                continue
            scores[c] = scores.get(c, 0) + 2.0 / (i + 1)
    for c in scores:
        scores[c] += zipf(c, lang) / 4
        # A phrase for a single word ("muy por encima" for quickly) only when nothing shorter fits as well.
        if ' ' in c and ' ' not in word:
            scores[c] -= 0.6
        # An infinitive for a noun or adjective ("courir" for a run) is usually a wordnet slip, though some are real
        # ("le dîner").
        if pos in 'nar' and INFINITIVE[lang].search(c) and ' ' not in c:
            scores[c] -= 2.0
        if c in avoid:
            scores[c] -= 1.5
    return sorted(scores.items(), key=lambda x: (-x[1], x[0]))


INFINITIVE = {'es': re.compile(r'(?:ar|er|ir|ír)(?:se)?$'), 'fr': re.compile(r'(?:er|ir|re|oir)$')}


def back(word, lang):
    """English words for a Spanish or French word: [(english, score)], best first."""
    out = {}
    for s in INDEX[lang].get(word, []):
        for l in s.lemmas():
            e = l.name().replace('_', ' ')
            if not re.fullmatch(r"[a-z][a-z '-]*", e) or not clean_ok(e):
                continue
            out[e] = out.get(e, 0) + 1 + min(l.count(), 30) / 10
    for e in out:
        out[e] += zipf(e, 'en') / 2
    return sorted(out.items(), key=lambda x: (-x[1], x[0]))


OFFSETS = {}
for s in wn.all_synsets():
    OFFSETS.setdefault(key(s), s)
INDEX = {}
for lang in SOURCES:
    INDEX[lang] = {}
    for k, words in WN[lang].items():
        s = OFFSETS.get(k)
        if not s:
            continue
        for w in words:
            INDEX[lang].setdefault(w, []).append(s)

# ---------- Files ----------


def block(rows):
    return '\n'.join(rows).replace('\\', '\\\\').replace('`', "'").replace('${', '$ {')


os.makedirs(args.out, exist_ok=True)
report = {}
for lang, (_, _, source, license_name, license_file) in SOURCES.items():
    forward = []
    for w in sorted(english):
        found = {}
        # The most used part of speech first, so its translations are the ones another part of speech avoids.
        used = {p: sum(l.count() for s in wn.synsets(w.replace(' ', '_'), p) for l in s.lemmas() if l.name().lower() == w.replace(' ', '_')) for p in 'nvar'}
        for pos in sorted('nvar', key=lambda p: (-used[p], 'nvar'.index(p))):
            best = translate(w, pos, lang, {c for p, cs in found.items() for c in cs[:1]})
            if not best:
                continue
            found[pos] = [c for c, _ in best]
            top = best[0][1]
            said = [c for c, sc in best if sc >= top - 0.75][:3]
            forward.append(f'{w}|{POS_NAMES[pos]}|' + ';'.join(said))
    backward = []
    for word in sorted(INDEX[lang]):
        if not clean_ok(word) or (' ' not in word and zipf(word, lang) < 1.0):
            continue
        # An English word that turns up in Spanish or French texts ("computer") isn't theirs to translate back.
        if ' ' not in word and zipf(word, 'en') - zipf(word, lang) > 0.8:
            continue
        best = back(word, lang)
        if best:
            backward.append(word + '|' + ','.join(e for e, _ in best[:3]))
    name = f'onyx-translations-{lang}.js'
    language = {'es': 'Spanish', 'fr': 'French'}[lang]
    with open(os.path.join(args.out, name), 'w', encoding='utf8') as f:
        f.write(f'''// Onyx 2.5's large {language} word list. Built by tools/build-translations.py from the Open Multilingual Wordnet 1.4:
// {source}, linked to Princeton WordNet 3.0, ranked with wordfreq. Built automatically, so less reliable than the
// hand-written list in onyx-languages.js, which comes first. Don't edit by hand.
//
// This file contains data from the {source}, distributed under {license_name}; see {license_file}. WordNet 3.0
// Copyright 2006 by Princeton University; see LICENSE-WORDNET.
(function (root) {{
\t'use strict';

\tconst T = ((root.Omni = root.Omni || {{}}).onyxTranslations = root.Omni.onyxTranslations || {{}});
\tT.{lang} = {{
\t\tsource: '{source} ({license_name})',
\t\t// English word|part of speech|{language}, best first (; between)
\t\tfrom: `
{block(forward)}
`,
\t\t// {language} word|English, best first (, between)
\t\tto: `
{block(backward)}
`,
\t}};
}})(typeof window !== 'undefined' ? window : globalThis);
''')
    report[lang] = {'english_words_translated': len({l.split('|')[0] for l in forward}), 'lines': len(forward), 'back': len(backward), 'bytes': os.path.getsize(os.path.join(args.out, name))}
print(json.dumps({'english_candidates': len(english), **report}))
