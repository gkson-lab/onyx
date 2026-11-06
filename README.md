# Onyx 2

**Thinks deeper. Answers faster. Sees the whole picture. And it's still free.**

Onyx is the small conversational engine inside [OmniTool](https://github.com/gkson-lab/omnitool), and Onyx 2 is its second generation. It runs entirely on your device: no internet, no account, no model download. Open weights, open source: yours to run, study and build on.

This repository is the engine on its own, the same source files OmniTool ships, plus a tiny host so you can run it without OmniTool. Earlier versions live on their own branches: [`onyx-1.0`](../../tree/onyx-1.0), [`onyx-1.1`](../../tree/onyx-1.1), [`onyx-1.2`](../../tree/onyx-1.2) and [`onyx-1.3`](../../tree/onyx-1.3).

## What's new in Onyx 2

| | Onyx 1.3 | Onyx 2 |
|---|---|---|
| Dictionary | 3,035 words | **14,390 words** (14,730 entries, 14,362 with a pronunciation) |
| Languages | English | **English, Spanish and French**, with 3,536 words translated |
| Understanding | a phrase matcher | a phrase matcher **and a neural network with open weights**, voting |
| Held-out accuracy | 96.8% (90 of 93) | **98.9%** (92 of 93) |
| Choosing an intent | 0.24 ms | **0.11 ms** |
| Whole reply | 0.38 ms | **0.25 ms** |
| One message, several things | one reply | **a reply to each** |
| Conversation | the last question | **everything you've said**: "when is my exam?", "what's my dog's name?" |
| Reasoning | | **with the dictionary**: "is a whale a mammal?", "name some birds" |

## What Onyx is, honestly

Onyx is not a large language model. It is a deliberately small assistant built from plain, inspectable parts:

- **Two models that vote.** A phrase matcher compares your message with 1,095 example phrases (756 English, 171 Spanish, 168 French), using word and word-pair features weighted by how rare each word is (TF-IDF), and counts a match only for as much of your sentence as it explains. A small neural network reads the same message as words, word pairs and three-letter pieces of words, so "helo" still looks like "hello". It has two layers and 200,380 parameters. Its weights are in [`src/onyx-weights.js`](src/onyx-weights.js) and [`tools/train.js`](tools/train.js) retrains them in a minute and a half, deterministically. Each scores every intent; Onyx blends the two (65% phrases, 35% network).
- **A dictionary it reasons with.** See below. When no fixed reply fits, Onyx reads your message with it and answers the specific thing you said.
- **A memory of the conversation.** What you've told it, the names of your pets and people, what you're talking about, and the language you're writing in.
- **Typo tolerance**, **math of its own**, **word tricks**, **settings** and a **memory** that stays on your device, as in Onyx 1.

## The dictionary: 14,390 words

- **3,411 everyday words written by hand for Onyx** (3,544 entries): a plain definition, an example sentence, similar and opposite words, and the hints Onyx reads conversations with: whether a word is a feeling and how it sits (good, bad, heavy), whether an event calls for good luck, congratulations or sympathy, what kind of thing a noun is. New in Onyx 2: the little words that hold sentences together ("the", "which", "despite", "be" with is/am/are/was/were/been), numbers, and 188 common words whose usual meaning WordNet gets wrong ("trailer", "police", "server").
- **10,979 more from [Princeton WordNet 3.0](https://wordnet.princeton.edu/)**, the most common English words not already covered (ranked with [wordfreq](https://github.com/rspeer/wordfreq)): definitions, examples, synonyms and opposites, irregular forms ("began", "begun", "analyses"), plus 604 countries, states, cities, rivers and planets. WordNet has no example sentence for many common words, so 2,346 were written for Onyx (in [`tools/examples.txt`](tools/examples.txt)). Names, abbreviations, slurs and sexual or vulgar senses are left out.
- **Pronunciations** for 14,362 entries from the [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict), in IPA, which give syllables and rhymes.
- **What things are.** 6,893 nouns know what they're a kind of (a whale → cetacean → aquatic mammal → mammal), 737 know their parts and 1,033 what they're part of.

Ask "define serendipity", "what does ephemeral mean", "another word for happy", "opposite of brave", "is quickly an adverb", "use curious in a sentence". New:

- **Thinking with words**: "is a whale a mammal?" (*Yes: whale → cetacean → aquatic mammal → placental → mammal*), "is a bat a bird?" (*No, a bat is a kind of mammal*), "what kind of animal is a salmon?", "name some reptiles", "what's the difference between a frog and a toad?" (both definitions, and *Both are amphibians*), "what do a lion and a tiger have in common?", "what are the parts of a flower?", "where is Paris?".
- **How words sound**: "how do you pronounce whale" (*/weɪl/*), "how many syllables in banana", "what rhymes with moon".
- **Words by their letters**: "words that start with qu", "words ending in tion", "anagram of listen" (*silent, tinsel*), "word of the day".
- "it" follows the conversation: after "where is Paris?", "define it" defines Paris.

## Spanish and French

Write to Onyx in either and it answers in the same language; it tells them apart by their common words, their accents, and the 14,000 English and 3,500 Spanish and French words it knows ("¿cómo estás?", "ça va ?"). Or say "speak Spanish", "parle français", "habla inglés".

- **Translation, every direction**, for the 3,536 everyday words of the hand-written dictionary, each translated for Onyx with its article so the gender shows: "how do you say happy in French?" (*heureux*), "what does gato mean?" (*cat*, with its definition), "¿cómo se dice perro en francés?" (*le chien*), "comment dit-on chat en espagnol ?" (*el gato*). It knows word forms in both languages, so "cansada" finds *cansado*, "parlons" finds *parler*, "chiens" finds *chien*.
- **Conversation**: greetings, how are you, thanks, goodbye, who Onyx is, help, jokes and facts in each language, the time and date, your name ("me llamo Ana", "je m'appelle Léa"), and how you feel ("estoy muy cansada" gets *Siento que estés cansada*, in your own words).
- **Math in words**: "¿cuánto es doce por siete?", "combien font quatre-vingt-dix-neuf plus un ?".
- **Care**: a message about self-harm gets a reply in the same language with people who can help: 024 in Spain, 3114 in France, 988 in the US, findahelpline.com elsewhere.

What it doesn't do yet in Spanish and French: definitions come in English, and beyond feelings, the replies built from what you say (events, plans, pets) are English-only for now.

## The whole conversation

- **Several things in one message.** "Hi! I'm Sam. I have an exam on Friday and I'm nervous." gets *Hi! Nice to meet you, Sam. Feeling nervous before the exam is completely normal. Good luck on Friday, Sam!* Each sentence is answered, a greeting in front shrinks to "Hi!", and words like "also" are understood ("tell me a joke. also what is 2+2?").
- **What you've said, later.** "what's my kitten's name?" (*Luna!*), "when is my exam?" (*You said the exam is on Friday*), "when is my dentist appointment?", "how am I feeling?", "what did I say about work?", and "what have I told you?" or "summarize our conversation", which list it all. "Puppy" finds "dog" too, through the dictionary. This is kept for the conversation only, in memory; "remember that..." is what saves to the device.

## Replies built from what you say

When no fixed reply fits, Onyx reads the message with the dictionary and answers the specific thing in it: a feeling, including negation and whose it is ("my dog is sick"); an event with its timing ("I have an exam tomorrow" gets *Good luck with the exam tomorrow!*); an activity in the right tense; pets, food, places, family, aches and illness, good news; life events and how things went. Onyx remembers what it just asked: after "How did the exam go?", "pretty well" is answered about the exam; after "What's its name?", "Biscuit" gets *Biscuit is a great name for your new puppy!* A heavy feeling gets care and a gentle nudge toward someone who can help.

New in Onyx 2: "the concert was amazing" (*Glad the concert was amazing! What was the best part?*, not "How was the concert?"), "I'm going to the dentist on Monday" (*Good luck at the dentist on Monday!*), "I adopted a kitten" (*A kitten! What's its name?*), "I have to deal with my landlord tomorrow" (*Good luck dealing with your landlord tomorrow*), and trips to any of 604 places ("I went to Kyoto last week"). Only the hand-written dictionary and WordNet nouns of a safe kind (animals, food, body parts, people, named places) shape these replies, so a rare WordNet sense never does.

## Settings for those replies

Say "settings" to see them, or just ask:

| Setting | Default | Change it with |
|---|---|---|
| Tone | warm | "be brief", "be playful", "be warm" |
| Follow-up questions | on | "stop asking questions", "you can ask questions" |
| Tips ("a few slow breaths can help") | on | "no tips", "tips on" |
| Using your name | on | "don't use my name", "use my name" |
| Replies built from what you say | on | "turn off dynamic replies", "turn on dynamic replies" |

"Reset settings" restores the defaults. A host can read and change them with `Omni.onyx.settings.get()` and `.set(key, value)`.

## Everything else, as in Onyx 1

- **Math**: sums with fractions, powers, roots, factorials, trigonometry, logarithms; equations in one unknown ("solve 2x + 3 = 11", "x^2 - 5x + 6 = 0") and checking a claim ("is 7 × 8 = 54"); percentages ("15% off 80", "20% tip on 45"); number facts and statistics. Follow-ups like "times 3" work. Nothing is run as code.
- **Word tricks**: count letters or words, reverse, spell out, change case, palindromes, numbers in words.
- **A glossary** of 76 things developers run into (UUID, JWT, cron, base64...).
- **Small talk with care**, jokes, tips and facts, and **memory** of your name and anything you ask it to remember, on this device only.
- **Inside OmniTool only:** a tool finder and commands that run OmniTool's tools, asking before anything is saved.

What Onyx can't do, by design: write essays, stories or code, look anything up online, or answer general knowledge questions. It says so plainly instead of guessing.

## Internet port (prepared, not connected)

Onyx has one place where a host *could* let it reach the internet, and nothing uses it yet. `host/host.js` ships it switched off:

```js
Omni.net = { enabled: false, ask: async () => null };
```

When a host sets `enabled: true`, Onyx calls `ask({ kind, query })` for four kinds of question and nothing else:

| `kind` | When | `query` |
|---|---|---|
| `weather` | "what's the weather" | the message |
| `news` | "latest headlines" | the message |
| `search` | "search the web for...", or a question Onyx can't answer | the message |
| `define` | "define X" for a word not in the dictionary | the word |

`ask` should resolve to `{ text }` (Markdown, shown as Onyx's reply) or `null`. If it returns nothing, throws, or takes longer than 8 seconds, Onyx gives the same offline answer it gives today. The engine itself contains no network code.

## Measured

`node test/test.js` checks Onyx against phrasings that are **not** in its examples, plus two scripted conversations:

| | Result |
|---|---|
| English intent accuracy on 93 held-out phrasings | 98.9% (92 of 93); Onyx 1.3: 96.8% |
| Spanish, 20 held-out phrasings | intent 100%, language recognized 100% |
| French, 20 held-out phrasings | intent 95%, language recognized 100% |
| English phrasings taken for Spanish or French | 0 of 93 |
| The neural network on its own | 91 of 93 held-out phrasings |
| Conversation checks | 155 of 155 (Onyx 1.3's 102, all still passing, and 53 new) |
| Dictionary data checks (no duplicates; every feeling has a mood, every event a type, every example uses its word) | 14,730 entries pass |
| Spanish and French word list (every word in the dictionary, both languages present) | 3,536 words pass |
| Internet port checks (off by default, falls back offline) | 5 of 5 |
| Deciding a reply, on average over 239 messages | about 0.3 ms |
| Network requests (demo page in a browser) | 0 |

On the same machine and messages, choosing an intent takes 0.11 ms (Onyx 1.3: 0.24 ms) and a whole reply 0.25 ms (0.38 ms). Loading takes longer than before, about 0.2 seconds instead of 0.04, because the dictionary is almost five times bigger.

The misses are listed by the test itself, so you can see exactly where it is wrong.

## Run it

**In a browser:** open `demo/index.html`. Everything runs in the page.

**In Node:**

```bash
node test/test.js
```

**In your own page:** load the scripts in order, then ask:

```html
<script src="host/host.js"></script>
<script src="src/onyx-math.js"></script>
<script src="src/onyx-lexicon.js"></script>
<script src="src/onyx-dictionary.js"></script>
<script src="src/onyx-languages.js"></script>
<script src="src/onyx-data.js"></script>
<script src="src/onyx-model.js"></script>
<script src="src/onyx-weights.js"></script>
<script src="src/onyx.js"></script>
<script>
  Omni.onyx.respond('hi').then((reply) => console.log(reply.text));
</script>
```

The lexicon, languages and weights are optional: without them Onyx falls back to the hand-written dictionary, English, and its phrase matcher alone.

`respond(text)` returns `{ text, offer?, expect?, action?, command? }`. `offer` is a yes/no question Onyx is waiting on, `action` is something the host should do (open a tool, switch the theme), and `command` is a request for OmniTool's tools, which only exist inside OmniTool. `Omni.onyx.context()` shows what Onyx has gathered from the conversation, and `Omni.onyx.detect(text)` the language of a message.

## Study it, build on it

**Retrain the neural network** after changing any example phrases:

```bash
node tools/train.js        # writes src/onyx-weights.js; about 90 seconds, the same weights every time
```

**Rebuild the lexicon** after changing the hand-written dictionary or `tools/examples.txt`:

```bash
pip install nltk wordfreq
# WordNet 3.0 and CMUdict from nltk_data, into a folder of your choice:
mkdir -p nltk_data/corpora && cd nltk_data/corpora
curl -LO https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip && unzip wordnet.zip
curl -LO https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/cmudict.zip && unzip cmudict.zip
cd ../.. && python3 tools/build-lexicon.py --data nltk_data
```

The build is deterministic too: the same inputs give the same `src/onyx-lexicon.js`.

## Files

```
src/onyx.js            the engine: text, the two models, reading what people say, the conversation, reasoning, languages
src/onyx-model.js      the neural network: features and the forward pass (no training code)
src/onyx-weights.js    its open weights (generated by tools/train.js)
src/onyx-dictionary.js the hand-written dictionary (format documented at the top), word forms, sentences, and the
                       reasoning on top: kinds of things, rhymes, syllables, anagrams
src/onyx-lexicon.js    the generated part of the dictionary: WordNet, pronunciations (generated by tools/build-lexicon.py)
src/onyx-languages.js  Spanish and French: the word list, what Onyx understands and says, their grammar and numbers
src/onyx-math.js       math: number words, a safe parser, equations, percentages, statistics, number facts
src/onyx-data.js       English intents and replies, jokes, tips, facts, glossary
host/host.js           a minimal host (storage, randomness) so Onyx runs outside OmniTool
demo/index.html        a standalone chat page
test/test.js           held-out accuracy in three languages, the network, two conversations, data checks, speed
tools/train.js         trains the neural network
tools/build-lexicon.py builds the lexicon from WordNet and CMUdict
tools/examples.txt     example sentences written for Onyx, for common words WordNet has none for
```

## Privacy

Onyx has no network code at all. The internet port above is an empty socket: it is off, and turning it on does nothing until a host writes its own `ask`. The only things it stores are your name, the facts you ask it to keep and your reply settings, in your browser's local storage (or in memory under Node). What you tell it during a conversation stays in memory and is gone when the page closes. Nothing is sent anywhere.

The data files in `src/` are not secret and can't be: anything a web page runs can be read by whoever opens it. That is fine, because they contain no personal data, keys or passwords. Anything private belongs in a `private/` folder, which `.gitignore` keeps out of this repository.

## Licenses and credits

Onyx is MIT licensed (see [LICENSE](LICENSE)). The generated lexicon includes data from **Princeton WordNet 3.0** (WordNet 3.0 Copyright 2006 by Princeton University, all rights reserved; see [LICENSE-WORDNET](LICENSE-WORDNET)) and the **CMU Pronouncing Dictionary** (Copyright (C) 1993-2008 Carnegie Mellon University, all rights reserved; see [LICENSE-CMUDICT](LICENSE-CMUDICT)). [wordfreq](https://github.com/rspeer/wordfreq) was used to choose which words to include; none of its data is in this repository. The Spanish and French translations, the Spanish and French conversation, and 2,346 example sentences were written for Onyx.

## Version

**Onyx 2** (2026-11-06): a dictionary of 14,390 words (up from 3,035), with pronunciations, rhymes, and what kind of thing each noun is, which Onyx reasons with ("is a whale a mammal?"); Spanish and French, with 3,536 words translated; a small neural network with open weights that votes with the phrase matcher (held-out accuracy 98.9%, up from 96.8%); replies to several things in one message; a memory of the whole conversation; faster replies; and fixes to replies built from what people say. Onyx 1.3 is on the [`onyx-1.3`](../../tree/onyx-1.3) branch.

**Onyx 1.3** (2026-10-24): a dictionary of 3,035 words (up from 255); replies built from what people tell Onyx; follow-ups that read an answer against the question Onyx asked; and settings for tone, questions, tips, names and the replies themselves.

**Onyx 1.2** (2026-10-24): much more math, a mini dictionary of 255 words with word forms, synonyms and opposites, sentences made from it, more greetings and "what's up" replies, and a prepared internet port that stays off.

**Onyx 1.1** (2026-10-22): math of its own, word tricks, and a bigger vocabulary.

**Onyx 1** (2026-10-22): the first release, as shipped in OmniTool.

---

Made with love by **GK Labs** (gksonlabs), Austin, TX.
