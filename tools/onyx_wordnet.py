"""Shared by tools/build-lexicon.py and tools/build-full.py: WordNet text cleaning, the word filters, and CMUdict
pronunciations in IPA."""
import os
import re

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


def load_cmu(data):
    """CMUdict's first pronunciation of each word, from an nltk_data directory: {word: [ARPAbet phones]}."""
    cmu = {}
    for line in open(os.path.join(data, 'corpora', 'cmudict', 'cmudict'), encoding='latin-1'):
        parts = line.split()
        if len(parts) < 3:
            continue
        w, n, phones = parts[0].lower(), parts[1], parts[2:]
        if n == '1' and w not in cmu:
            cmu[w] = phones
    return cmu
