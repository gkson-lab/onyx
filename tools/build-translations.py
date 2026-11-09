"""Builds Onyx's word dictionaries for 31 languages, src/translations/, from the Open Multilingual Wordnet 1.4 and the
Open German WordNet (OdeNet).

The hand-written Spanish and French list in src/onyx-languages.js (3,500 everyday words, written for Onyx, with
articles) always comes first. These files add many more words and many more languages, in both directions:

  - English -> the language: for each English word and part of speech, the translation found in its most used WordNet
    senses, preferring the one most common in that language (wordfreq, where it knows the language). A word that is
    only common because English texts use it ("can" in Spanish) is passed over.
  - the language -> English: for each of its words in the wordnet, the English words of its senses, commonest first.

Each language's file carries the name and license of the wordnet it comes from; licenses/ has their texts. They are
built automatically from wordnets of very different sizes and quality, so they are less reliable than the hand-written
list, and Onyx says so when it uses them.

    pip install nltk wordfreq
    python3 tools/build-translations.py --data <nltk_data with corpora/wordnet and corpora/omw-1.4> --odenet <folder
        with deWordNet.xml and ili-map-pwn30.tab>

The output is deterministic: the same inputs give the same files.
"""
import argparse
import json
import math
import os
import re
import subprocess
import sys
import warnings

warnings.filterwarnings('ignore')
if os.environ.get('PYTHONHASHSEED') != '0':
    os.environ['PYTHONHASHSEED'] = '0'
    os.execv(sys.executable, [sys.executable] + sys.argv)

ap = argparse.ArgumentParser()
ap.add_argument('--data', required=True, help='an nltk_data directory containing corpora/wordnet and corpora/omw-1.4')
ap.add_argument('--odenet', help='a folder with deWordNet.xml (OdeNet) and ili-map-pwn30.tab (CILI), for German')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'src', 'translations'))
ap.add_argument('--only', help='build only these languages (comma separated codes)')
ap.add_argument('--pythonpath', help='extra directory for nltk and wordfreq')
args = ap.parse_args()
if args.pythonpath:
    sys.path.insert(0, args.pythonpath)

import nltk  # noqa: E402

nltk.data.path.insert(0, args.data)
from nltk.corpus import wordnet as wn  # noqa: E402
import wordfreq  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onyx_wordnet import BAD_TEXT, BLOCK  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# code: (English name, OMW folder, file, wordnet, license, license file in licenses/, wordfreq code, English words
# at least this common are covered)
LANGS = {
    'es': ('Spanish', 'mcr', 'wn-data-spa.tab', 'Multilingual Central Repository 3.0', 'CC BY 3.0', 'MCR', 'es', 2.5),
    'fr': ('French', 'fra', 'wn-data-fra.tab', 'WOLF (Wordnet Libre du Français)', 'CeCILL-C', 'WOLF', 'fr', 2.5),
    'de': ('German', None, None, 'OdeNet, the Open German WordNet 1.4', 'CC BY-SA 4.0', 'ODENET', 'de', 3.0),
    'it': ('Italian', 'ita', 'wn-data-ita.tab', 'MultiWordNet', 'CC BY 3.0', 'ita', 'it', 3.0),
    'pt': ('Portuguese', 'por', 'wn-data-por.tab', 'OpenWN-PT', 'CC BY-SA', 'por', 'pt', 3.0),
    'nl': ('Dutch', 'nld', 'wn-data-nld.tab', 'Open Dutch WordNet', 'CC BY-SA 4.0', 'nld', 'nl', 3.0),
    'ca': ('Catalan', 'mcr', 'wn-data-cat.tab', 'Multilingual Central Repository 3.0', 'CC BY 3.0', 'MCR', 'ca', 3.0),
    'gl': ('Galician', 'mcr', 'wn-data-glg.tab', 'Multilingual Central Repository 3.0', 'CC BY 3.0', 'MCR', None, 3.0),
    'eu': ('Basque', 'mcr', 'wn-data-eus.tab', 'Multilingual Central Repository 3.0', 'CC BY 3.0', 'MCR', None, 3.0),
    'ro': ('Romanian', 'ron', 'wn-data-ron.tab', 'Romanian Wordnet', 'CC BY-SA', 'ron', 'ro', 3.0),
    'pl': ('Polish', 'pol', 'wn-data-pol.tab', 'plWordNet', 'the WordNet license', 'pol', 'pl', 3.0),
    'sv': ('Swedish', 'swe', 'wn-data-swe.tab', 'Swedish wordnet (SALDO)', 'CC BY 3.0', 'swe', 'sv', 3.0),
    'da': ('Danish', 'dan', 'wn-data-dan.tab', 'DanNet', 'the WordNet license', 'dan', 'da', 3.0),
    'nb': ('Norwegian', 'nor', 'wn-data-nob.tab', 'Norwegian Wordnet (Bokmål)', 'the WordNet license', 'nor', 'nb', 3.0),
    'nn': ('Norwegian Nynorsk', 'nor', 'wn-data-nno.tab', 'Norwegian Wordnet (Nynorsk)', 'the WordNet license', 'nor', None, 3.0),
    'fi': ('Finnish', 'fin', 'wn-data-fin.tab', 'FinnWordNet', 'CC BY 3.0', 'fin', 'fi', 3.0),
    'is': ('Icelandic', 'isl', 'wn-data-isl.tab', 'IceWordNet', 'CC BY 3.0', 'isl', 'is', 3.0),
    'lt': ('Lithuanian', 'slk', 'wn-data-lit.tab', 'Lithuanian WordNet', 'CC BY-SA 3.0', 'slk', 'lt', 3.0),
    'hr': ('Croatian', 'hrv', 'wn-data-hrv.tab', 'Croatian Wordnet', 'CC BY 3.0', 'hrv', 'sh', 3.0),
    'sl': ('Slovenian', 'slv', 'wn-data-slv.tab', 'sloWNet', 'CC BY-SA 3.0', 'slv', 'sl', 3.0),
    'sk': ('Slovak', 'slk', 'wn-data-slk.tab', 'Slovak WordNet', 'CC BY-SA 3.0', 'slk', 'sk', 3.0),
    'bg': ('Bulgarian', 'bul', 'wn-data-bul.tab', 'BulTreeBank Wordnet', 'CC BY 3.0', 'bul', 'bg', 3.0),
    'el': ('Greek', 'ell', 'wn-data-ell.tab', 'Greek Wordnet', 'Apache 2.0', 'ell', 'el', 3.0),
    'sq': ('Albanian', 'als', 'wn-data-als.tab', 'Albanet', 'CC BY 3.0', 'als', None, 3.0),
    'ar': ('Arabic', 'arb', 'wn-data-arb.tab', 'Arabic WordNet', 'CC BY-SA 3.0', 'arb', 'ar', 3.0),
    'he': ('Hebrew', 'heb', 'wn-data-heb.tab', 'Hebrew Wordnet', 'the WordNet license', 'heb', 'he', 3.0),
    'zh': ('Chinese', 'cow', 'wn-data-cmn.tab', 'Chinese Open Wordnet', 'the WordNet license', 'cow', 'zh', 3.0),
    'ja': ('Japanese', 'jpn', 'wn-data-jpn.tab', 'Japanese Wordnet', 'the Japanese WordNet license', 'jpn', 'ja', 3.0),
    'th': ('Thai', 'tha', 'wn-data-tha.tab', 'Thai Wordnet', 'the WordNet license', 'tha', None, 3.0),
    'id': ('Indonesian', 'msa', 'wn-data-ind.tab', 'Wordnet Bahasa', 'MIT', 'msa', 'id', 3.0),
    'ms': ('Malay', 'msa', 'wn-data-zsm.tab', 'Wordnet Bahasa', 'MIT', 'msa', 'ms', 3.0),
}
ONLY = set(args.only.split(',')) if args.only else None

# ---------- How common a word is, in any language wordfreq knows ----------

FREQ = {}


def zipf(word, lang):
    """Zipf frequency (0 = unknown, 3 = once per million words, 6 = very common); a phrase is as common as its rarest word."""
    if not lang:
        return 0.0
    if lang not in FREQ:
        FREQ[lang] = wordfreq.get_frequency_dict(lang)
    d = FREQ[lang]
    parts = word.lower().split() or [word.lower()]
    f = min(d.get(p, 0.0) for p in parts)
    return round(math.log10(f) + 9, 2) if f > 0 else 0.0


def clean_ok(word):
    return not BAD_TEXT.search(word) and word.lower() not in BLOCK


# ---------- The wordnets: WordNet 3.0 sense (offset-pos) -> the language's words ----------

def load_omw(folder, name):
    senses = {}
    for line in open(os.path.join(args.data, 'corpora', 'omw-1.4', folder, name), encoding='utf8'):
        if line.startswith('#'):
            continue
        parts = line.rstrip('\n').split('\t')
        if len(parts) < 3 or not parts[1].endswith('lemma'):
            continue
        key = parts[0].replace('-s', '-a')
        # Hebrew and Arabic as they are normally written, without the optional vowel marks.
        word = re.sub('[\u0591-\u05c7\u064b-\u065f\u0670]', '', parts[2]).strip().replace('_', ' ').replace('+', ' ')
        if not word or re.search(r'[0-9|`\\]', word) or len(word) > 40:
            continue
        senses.setdefault(key, [])
        if word not in senses[key]:
            senses[key].append(word)
    return senses


def load_odenet(folder):
    """OdeNet's German words by WordNet 3.0 sense, through the Collaborative Interlingual Index."""
    ili = {}
    for line in open(os.path.join(folder, 'ili-map-pwn30.tab'), encoding='utf8'):
        a, b = line.split()
        ili[a] = b.replace('-s', '-a')
    xml = open(os.path.join(folder, 'deWordNet.xml'), encoding='utf8').read()
    syn = dict(re.findall(r'<Synset id="([^"]+)" ili="(i\d+)"', xml))
    senses = {}
    for entry in re.findall(r'<LexicalEntry[^>]*>(.*?)</LexicalEntry>', xml, re.S):
        m = re.search(r'<Lemma writtenForm="([^"]+)"', entry)
        if not m:
            continue
        word = m.group(1).replace('&apos;', "'").replace('&amp;', '&').replace('&quot;', '"').strip()
        if not word or re.search(r'[0-9|`\\<>]', word) or len(word) > 40:
            continue
        for sid in re.findall(r'<Sense[^>]* synset="([^"]+)"', entry):
            key = ili.get(syn.get(sid, ''))
            if key:
                senses.setdefault(key, [])
                if word not in senses[key]:
                    senses[key].append(word)
    return senses


def key(s):
    return '%08d-%s' % (s.offset(), 'a' if s.pos() == 's' else s.pos())


# ---------- Which English words: the everyday dictionary, and every WordNet word at least somewhat common ----------

everyday = json.loads(subprocess.check_output(['node', '-e', '''
require(process.argv[1] + '/host/host.js');
require(process.argv[1] + '/src/onyx-lexicon.js');
require(process.argv[1] + '/src/onyx-dictionary.js');
console.log(JSON.stringify([...new Set(Omni.onyxDictionary.WORDS.map((e) => e.w))]));
''', ROOT]).decode())
EVERYDAY = set(w for w in everyday if re.fullmatch(r"[a-z][a-z '-]*", w))
ENGLISH = {}
for name in wn.all_lemma_names():
    w = name.replace('_', ' ')
    if re.fullmatch(r"[a-z][a-z '-]*", w):
        ENGLISH[w] = zipf(w, 'en')
POS_NAMES = {'n': 'n', 'v': 'v', 'a': 'adj', 'r': 'adv'}
INFINITIVE = {'es': r'(?:ar|er|ir|ír)(?:se)?$', 'fr': r'(?:er|ir|re|oir)$', 'it': r'(?:are|ere|ire|rre)(?:si)?$', 'pt': r'(?:ar|er|ir|or|ôr)(?:-se)?$', 'ca': r'(?:ar|er|re|ir)(?:-se)?$', 'gl': r'(?:ar|er|ir)(?:se)?$', 'de': r'(?:en|ern|eln|un|ein)$', 'nl': r'(?:en|n)$'}
INFINITIVE = {k: re.compile(v) for k, v in INFINITIVE.items()}
OFFSETS = {}
for s in wn.all_synsets():
    OFFSETS.setdefault(key(s), s)
SYNSETS = {}


def synsets_of(word, pos):
    k = (word, pos)
    if k not in SYNSETS:
        name = word.replace(' ', '_')
        SYNSETS[k] = [s for s in wn.synsets(name, pos) if any(l.name().lower() == name for l in s.lemmas())][:4]
    return SYNSETS[k]


def translate(senses, word, pos, lang, wf, avoid=()):
    """The best words for `word` as `pos`: [(word, score)], best first. `avoid`: the word's translations as another
    part of speech, which a wordnet sometimes repeats here ("livre", the book, for to book)."""
    scores = {}
    inf = INFINITIVE.get(lang)
    for i, s in enumerate(synsets_of(word, pos)):
        for c in senses.get(key(s), []):
            if not clean_ok(c):
                continue
            z = zipf(c, wf)
            if wf and z < 1.5 and ' ' not in c and lang not in ('zh', 'ja'):
                continue
            # Common in English texts, not in this language's: an English word, not a translation.
            if wf and c.lower() != word and re.fullmatch(r"[a-z' -]+", c.lower()) and zipf(c, 'en') - z > 0.8:
                continue
            # The wordnets sometimes file a noun under a verb sense ("maison" for to house): a verb must look like one.
            if inf and pos == 'v' and not inf.search(re.sub(r"^(?:se |s')", '', c).split(' ')[0]):
                continue
            scores[c] = scores.get(c, 0) + 2.0 / (i + 1)
    for n, c in enumerate(list(scores)):
        scores[c] += zipf(c, wf) / 4 if wf else -0.01 * n
        # A phrase for a single word ("muy por encima" for quickly) only when nothing shorter fits as well.
        if ' ' in c and ' ' not in word:
            scores[c] -= 0.6
        # An infinitive for a noun or adjective ("courir" for a run) is usually a wordnet slip.
        if inf and pos in 'nar' and inf.search(c) and ' ' not in c and lang in ('es', 'fr'):
            scores[c] -= 2.0
        if c in avoid:
            scores[c] -= 1.5
    return sorted(scores.items(), key=lambda x: (-x[1], x[0]))


def block(rows):
    return '\n'.join(rows).replace('\\', '\\\\').replace('`', "'").replace('${', '$ {')


os.makedirs(args.out, exist_ok=True)
report = {}
for lang, (language, folder, name, source, license_name, license_file, wf, min_zipf) in LANGS.items():
    if ONLY and lang not in ONLY:
        continue
    if folder is None:
        if not args.odenet:
            continue
        senses = load_odenet(args.odenet)
    else:
        senses = load_omw(folder, name)
    english = sorted(w for w, z in ENGLISH.items() if z >= min_zipf or w in EVERYDAY)
    forward = []
    for w in english:
        found = {}
        # The most used part of speech first, so its translations are the ones another part of speech avoids.
        used = {p: sum(l.count() for s in synsets_of(w, p) for l in s.lemmas() if l.name().lower() == w.replace(' ', '_')) for p in 'nvar'}
        for pos in sorted('nvar', key=lambda p: (-used[p], 'nvar'.index(p))):
            best = translate(senses, w, pos, lang, wf, {c for p, cs in found.items() for c in cs[:1]})
            if not best:
                continue
            found[pos] = [c for c, _ in best]
            top = best[0][1]
            said = [c for c, sc in best if sc >= top - 0.75][:3]
            forward.append(f'{w}|{POS_NAMES[pos]}|' + ';'.join(said))
    # Back to English: each of the language's words, with the English words of its senses.
    index = {}
    for k, words in senses.items():
        s = OFFSETS.get(k)
        if s:
            for w in words:
                index.setdefault(w, []).append(s)
    backward = []
    for word in sorted(index):
        z = zipf(word, wf)
        if not clean_ok(word) or (wf and ' ' not in word and z < (1.0 if lang in ('es', 'fr') else 2.0) and lang not in ('zh', 'ja')):
            continue
        # An English word that turns up in this language's texts ("computer") isn't its to translate back.
        if wf and ' ' not in word and re.fullmatch(r"[a-z'-]+", word.lower()) and zipf(word, 'en') - z > 0.8:
            continue
        out = {}
        for s in index[word]:
            for l in s.lemmas():
                e = l.name().replace('_', ' ')
                if not re.fullmatch(r"[a-z][a-z '-]*", e) or not clean_ok(e):
                    continue
                out[e] = out.get(e, 0) + 1 + min(l.count(), 30) / 10
        for e in out:
            out[e] += ENGLISH.get(e, 0) / 2
        best = sorted(out.items(), key=lambda x: (-x[1], x[0]))
        # Without a frequency list for the language, keep the words whose English is a common word.
        if best and (wf or ENGLISH.get(best[0][0], 0) >= 3.0):
            backward.append(word + '|' + ','.join(e for e, _ in best[:3]))
    fname = f'onyx-translations-{lang}.js'
    path = os.path.join(args.out, fname)
    with open(path, 'w', encoding='utf8') as f:
        f.write(f'''// Onyx 3's {language} dictionary. Built by tools/build-translations.py from {source}, linked to Princeton
// WordNet 3.0{', ranked with wordfreq' if wf else ''}. Built automatically, so less reliable than a hand-written list. Don't edit by hand.
//
// This file contains data from {source}, distributed under {license_name}; see licenses/{license_file}. WordNet 3.0
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
    report[lang] = {'words': len({l.split('|')[0] for l in forward}), 'back': len(backward), 'kb': os.path.getsize(path) // 1024}
    print(lang, language, report[lang], flush=True)
print(json.dumps({'languages': len(report), 'mb': round(sum(r['kb'] for r in report.values()) / 1024, 1)}))
