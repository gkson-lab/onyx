"""Builds Onyx's full English dictionary, src/english/, from all of Princeton WordNet 3.0 and the CMU Pronouncing
Dictionary.

Onyx has three layers of words. The hand-written core (src/onyx-dictionary.js) and the generated lexicon
(src/onyx-lexicon.js, built by tools/build-lexicon.py) hold the ~14,000 everyday words Onyx reasons and talks with. This
script adds everything else in WordNet: about 147,000 words and phrases in 117,659 senses, each with its definition,
examples, synonyms, opposites, what it is a kind of, and its parts. Onyx consults it when the everyday dictionary doesn't
know a word, so "define sesquipedalian" and "is a narwhal a mammal" work, while word games and conversation keep to
everyday words.

Nothing is left out, as in a printed dictionary: words that are offensive are kept, and marked so Onyx says so.

    pip install nltk
    python3 tools/build-full.py --data <nltk_data dir with corpora/wordnet and corpora/cmudict>

Output, five files that each add a part to Omni.onyxEnglish (any subset can be loaded; a missing part only means fewer
words):

    src/english/onyx-english-index.js      every word -> its senses; irregular forms; pronunciations
    src/english/onyx-english-nouns-1.js    noun senses, first half
    src/english/onyx-english-nouns-2.js    noun senses, second half
    src/english/onyx-english-verbs.js      verb senses
    src/english/onyx-english-modifiers.js  adjective and adverb senses

The output is deterministic: the same inputs give the same files.
"""
import argparse
import os
import re
import sys
import warnings

warnings.filterwarnings('ignore')
if os.environ.get('PYTHONHASHSEED') != '0':
    os.environ['PYTHONHASHSEED'] = '0'
    os.execv(sys.executable, [sys.executable] + sys.argv)

ap = argparse.ArgumentParser()
ap.add_argument('--data', required=True, help='an nltk_data directory containing corpora/wordnet and corpora/cmudict')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'src', 'english'))
ap.add_argument('--pythonpath', help='extra directory for nltk')
args = ap.parse_args()
if args.pythonpath:
    sys.path.insert(0, args.pythonpath)

import nltk  # noqa: E402

nltk.data.path.insert(0, args.data)
from nltk.corpus import wordnet as wn  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from onyx_wordnet import clean_example, ipa, load_cmu  # noqa: E402

CMU = load_cmu(args.data)
LEXNAMES = wn._lexnames  # 45 lexicographer files: noun.animal, verb.motion, adj.all...

OFFENSIVE = {'vulgarism', 'obscenity', 'ethnic_slur', 'disparagement', 'derogation', 'profanity', 'vulgarity'}
INFORMAL = {'slang', 'colloquialism'}


def b36(n):
    digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    out = ''
    while True:
        n, r = divmod(n, 36)
        out = digits[r] + out
        if not n:
            return out


def text(s):
    """WordNet's text with its quotes straightened and no field separators."""
    s = s.replace('`', '"').replace("''", '"').replace('|', '/').replace('~', '-')
    return re.sub(r'\s+', ' ', s).strip()


def pron(word):
    pieces = []
    for part in re.split(r'[ -]', word.lower()):
        if not part:
            continue
        if part not in CMU:
            return None
        pieces.append(ipa(CMU[part]))
    return ' '.join(pieces) if pieces else None


# ---------- Senses, in a fixed order: nouns, verbs, adjectives (heads and satellites), adverbs ----------

GROUPS = [('n', ('n',)), ('v', ('v',)), ('m', ('a', 's', 'r'))]
synsets = []
for _, poses in GROUPS:
    # NLTK lists adjective satellites with the adjectives as well as on their own: each sense goes in once.
    group = list({s.name(): s for p in poses for s in wn.all_synsets(p)}.values())
    group.sort(key=lambda s: ('asr'.index(s.pos()) if s.pos() in 'asr' else 0, s.offset()))
    synsets.extend(group)
ID = {s.name(): i for i, s in enumerate(synsets)}


def ids(lst, mark=''):
    return ','.join(mark + b36(ID[x.name()]) for x in lst)


def line(s):
    doms = {d.name().split('.')[0] for d in s.usage_domains()}
    flags = ('o' if doms & OFFENSIVE else '') + ('i' if doms & INFORMAL else '')
    examples = [e for e in (clean_example(x) for x in s.examples()) if e][:2]
    up = ids(s.hypernyms()) + (',' if s.hypernyms() and s.instance_hypernyms() else '') + ids(s.instance_hypernyms(), '!')
    if s.pos() == 's':
        up = ids(s.similar_tos())
    ants = []
    for l in s.lemmas():
        a = [x.name().replace('_', ' ') for x in l.antonyms()]
        if a:
            ants.append(l.name().replace('_', ' ') + '>' + ','.join(a))
    return '|'.join([
        str(s.lexname() and LEXNAMES.index(s.lexname())),
        text(s.definition()),
        '~'.join(examples),
        ','.join(l.name().replace('_', ' ') for l in s.lemmas()),
        up,
        ids(s.part_meronyms() + s.substance_meronyms()),
        ids(s.part_holonyms()),
        ';'.join(ants),
        flags,
    ])


lines = [line(s) for s in synsets]
n_nouns = sum(1 for s in synsets if s.pos() == 'n')
n_verbs = sum(1 for s in synsets if s.pos() == 'v')

# ---------- Every word, its senses (the most used part of speech first), forms and pronunciation ----------

words = {}
for s in synsets:
    for l in s.lemmas():
        words.setdefault(l.name().lower(), None)

index = []
prons = []
for w in sorted(words):
    found = wn.synsets(w)
    by_pos = {}
    for s in found:
        p = 'a' if s.pos() == 's' else s.pos()
        by_pos.setdefault(p, []).append(s)
    used = {p: sum(l.count() for s in ss for l in s.lemmas() if l.name().lower() == w) for p, ss in by_pos.items()}
    order = sorted(by_pos, key=lambda p: (-used[p], 'nvar'.index(p)))
    senses = [s for p in order for s in by_pos[p] if any(l.name().lower() == w for l in s.lemmas())]
    if not senses:
        continue
    shown = w.replace('_', ' ')
    index.append(shown + '|' + ','.join(b36(ID[s.name()]) for s in senses))
    p = pron(shown)
    if p:
        prons.append(shown + '|' + p)

forms = []
for pos in ('noun', 'verb', 'adj', 'adv'):
    for raw in open(os.path.join(args.data, 'corpora', 'wordnet', pos + '.exc'), encoding='utf8'):
        parts = raw.split()
        if len(parts) >= 2:
            forms.append(parts[0].replace('_', ' ') + '|' + ','.join(dict.fromkeys(x.replace('_', ' ') for x in parts[1:])) + '|' + pos[0])
forms.sort()

# ---------- Files ----------

HEADER = '''// Onyx 2.5's full English dictionary, part {part}. Built by tools/build-full.py from Princeton WordNet 3.0 and the
// CMU Pronouncing Dictionary; don't edit by hand. The everyday dictionary (onyx-dictionary.js, onyx-lexicon.js) comes
// first; Onyx turns to this for every other word. Each file adds its part to Omni.onyxEnglish; load any of them.
//
// WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. Used under the WordNet license; see
// LICENSE-WORDNET. CMUdict Copyright (C) 1993-2008 Carnegie Mellon University, used under its BSD-style license; see
// LICENSE-CMUDICT.
'''


def block(rows):
    return '\n'.join(rows).replace('\\', '\\\\').replace('`', "'").replace('${', '$ {')


def write(name, part, body):
    path = os.path.join(args.out, name)
    with open(path, 'w', encoding='utf8') as f:
        f.write(HEADER.format(part=part))
        f.write("(function (root) {\n\t'use strict';\n\n\tconst E = ((root.Omni = root.Omni || {}).onyxEnglish = root.Omni.onyxEnglish || { parts: {} });\n")
        f.write(body)
        f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")
    return os.path.getsize(path)


os.makedirs(args.out, exist_ok=True)
SENSE_FORMAT = ('\t// Senses {first}-{last} (ids in base 36): category (Omni.onyxEnglish.LEXNAMES)|definition|examples, ~ between|'
                'words with this sense|is a kind of (! for an instance; for adjectives, similar to)|has parts|is part of|'
                'word>opposites;...|o offensive, i informal\n')


def senses(first, last):
    return (SENSE_FORMAT.format(first=b36(first), last=b36(last - 1)) +
            f"\tE.parts.s{b36(first)} = {{ first: {first}, text: `\n" + block(lines[first:last]) + '\n` };\n')


half = n_nouns // 2
sizes = {
    'onyx-english-index.js': write('onyx-english-index.js', 'the index', (
        '\tE.LEXNAMES = ' + repr(LEXNAMES).replace("'", '"') + ';\n'
        f'\tE.counts = {{ senses: {len(synsets)}, words: {len(index)}, nouns: {n_nouns}, verbs: {n_verbs} }};\n'
        '\t// word|its senses, most used first (ids in base 36)\n'
        '\tE.parts.index = `\n' + block(index) + '\n`;\n'
        '\t// form|base word(s)|part of speech: the irregular forms ("geese|goose|n")\n'
        '\tE.parts.forms = `\n' + block(forms) + '\n`;\n'
        '\t// word|pronunciation (IPA, General American; ˈ marks the stressed syllable)\n'
        '\tE.parts.pron = `\n' + block(prons) + '\n`;\n')),
    'onyx-english-nouns-1.js': write('onyx-english-nouns-1.js', 'nouns, first half', senses(0, half)),
    'onyx-english-nouns-2.js': write('onyx-english-nouns-2.js', 'nouns, second half', senses(half, n_nouns)),
    'onyx-english-verbs.js': write('onyx-english-verbs.js', 'verbs', senses(n_nouns, n_nouns + n_verbs)),
    'onyx-english-modifiers.js': write('onyx-english-modifiers.js', 'adjectives and adverbs', senses(n_nouns + n_verbs, len(synsets))),
}
print({'senses': len(synsets), 'words': len(index), 'forms': len(forms), 'prons': len(prons), 'bytes': sizes})
