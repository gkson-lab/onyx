# Onyx 1

**Omni Agent - Onyx** is the small conversational engine inside [OmniTool](https://github.com/gkson-lab/omnitool). It runs entirely on your device: no internet, no account, no model download, about 1,900 lines of JavaScript.

This repository is the raw engine on its own, the same source files OmniTool ships, plus a tiny host so you can run it without OmniTool.

## What Onyx is, honestly

Onyx is not a large language model, and not a neural network. It is a deliberately small assistant built from plain, inspectable parts:

- **An intent model.** 70 intents, each with example phrases (731 in total). Your message is turned into word and word-pair features, weighted by how rare each word is (TF-IDF), and compared with every example. A match only counts for as much of your sentence as it explains, so one shared word in a long sentence is weak evidence.
- **Typo tolerance.** A word Onyx doesn't know is mapped to the closest one it does, within one or two letters ("helo" becomes "hello").
- **Memory.** Your name and anything you ask it to remember ("remember that my car is blue"). Kept on your device only; "forget me" clears it.
- **Conversation state.** Follow-ups work: "another one" after a joke, "yes" to an offer, "why", "say that again".
- **Math of its own.** Digits or number words ("twelve times seven"), with follow-ups like "times 3". A small parser works it out; nothing is run as code.
  - Sums with fractions shown when they're tidy ("1/3 + 1/6 = 0.5 (1/2)"), powers, roots, factorials, pi, `sin`/`cos`/`tan` in degrees, `log` and `ln`.
  - Equations in one unknown, linear or quadratic ("solve 2x + 3 = 11", "x^2 - 5x + 6 = 0"), and checking a claim ("is 7 × 8 = 54" gets "Not quite: 56").
  - Percentages: "15% of 80", "15% off 80", "20% tip on 45", "increase 50 by 10%", "percent change from 50 to 75", "3/4 as a percent", "0.75 as a fraction".
  - Number facts and statistics: primes, prime factorization, factors, GCD, LCM, perfect squares, leap years, combinations ("10 choose 3"), permutations, and the average, median, mode, range and standard deviation of a list.
- **Word tricks.** Count letters or words, reverse, spell out, change case, palindromes, numbers in words.
- **A glossary and a mini dictionary.** 76 short definitions of things developers run into (UUID, JWT, cron, base64, hashing, contrast ratio...), plus a dictionary of 255 everyday English words. Each word has its part of speech, a plain definition, an example sentence, and similar and opposite words. It knows word forms, so "ran" finds *run*, "children" finds *child* and "happier" finds *happy*. Ask "define serendipity", "what does ephemeral mean", "another word for happy", "opposite of brave" or "is quickly an adverb".
- **Sentences.** "Use curious in a sentence" gives the dictionary example; "another one" makes up new sentences with the same word. "Make a sentence" picks a word at random. The sentences come from templates sorted by kind of word (a person, a place, a feeling, an action that takes an object...), so they come out grammatical, with the right "a" or "an", plural and past tense.
- **Small talk with care.** Greetings ("heya", "howdy", "hey hey"), "what's up?" and its many spellings ("sup", "what's good", "wassup"), a reply to "not much", moods, jokes, tips and facts. A message about self-harm gets a short, caring reply that points to people who can help (988 in the US, findahelpline.com elsewhere), never a joke.
- **Inside OmniTool only:** a tool finder ("I need to pretty print some JSON" offers the JSON formatter) and commands that run OmniTool's tools ("generate 10 uuids and save them to a file", asking before anything is saved).

What Onyx can't do, by design: write essays, stories or code, translate, look anything up online, or answer general knowledge questions. It says so plainly instead of guessing.

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

`ask` should resolve to `{ text }` (Markdown, shown as Onyx's reply) or `null`. If it returns nothing, throws, or takes longer than 8 seconds, Onyx gives the same offline answer it gives today. The engine itself contains no network code: whatever goes in `ask` is the host's code, and the host decides what it may contact.

## Measured

`node test/test.js` checks Onyx against 93 phrasings that are **not** in its examples, plus a scripted conversation:

| | Result |
|---|---|
| Intent accuracy on held-out phrasings | 96.8% (90 of 93) |
| Conversation checks | 49 of 49 |
| Internet port checks (off by default, falls back offline) | 5 of 5 |
| Network requests (in OmniTool's browser test) | 0 |
| Time to decide a reply | under 1 ms |

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
<script src="src/onyx-dictionary.js"></script>
<script src="src/onyx-data.js"></script>
<script src="src/onyx.js"></script>
<script>
  Omni.onyx.respond('hi').then((reply) => console.log(reply.text));
</script>
```

`respond(text)` returns `{ text, offer?, expect?, action?, command? }`. `offer` is a yes/no question Onyx is waiting on, `action` is something the host should do (open a tool, switch the theme), and `command` is a request for OmniTool's tools, which only exist inside OmniTool.

## Files

```
src/onyx.js        the engine: text handling, intent model, memory, conversation, tool finder
src/onyx-math.js   math: number words, a safe parser, equations, percentages, statistics, number facts
src/onyx-dictionary.js  the mini dictionary: words, definitions, word forms, sentence templates
src/onyx-data.js   what Onyx knows: intents and replies, jokes, tips, facts, glossary
host/host.js       a minimal host (storage, randomness) so Onyx runs outside OmniTool
demo/index.html    a standalone chat page
test/test.js       held-out accuracy and a conversation, in Node
```

## Privacy

Onyx has no network code at all. The internet port above is an empty socket: it is off, and turning it on does nothing until a host writes its own `ask`. The only things it stores are your name and the facts you ask it to keep, in your browser's local storage (or in memory under Node). Nothing is sent anywhere.

The data files in `src/` are not secret and can't be: anything a web page runs can be read by whoever opens it. That is fine, because they contain no personal data, keys or passwords. Anything private belongs in a `private/` folder, which `.gitignore` keeps out of this repository.

## Version

**Onyx 1.2** (2026-10-24): much more math (equations, trigonometry, logarithms, percentage word problems, statistics, fractions), a mini dictionary of 255 words with word forms, synonyms and opposites, sentences made from it, more greetings and "what's up" replies, and a prepared internet port that stays off (70 intents, 731 phrases).

**Onyx 1.1** (2026-10-22): math of its own, word tricks, and a bigger vocabulary (68 intents, 658 phrases, 76 glossary terms).

**Onyx 1** (2026-10-22): the first release, as shipped in OmniTool.

---

Made with love by **gksonlabs**.
