# Onyx 1

**Omni Agent - Onyx** is the small conversational engine inside [OmniTool](https://github.com/gkson-lab/omnitool). It runs entirely on your device: no internet, no account, no model download, about 1,100 lines of JavaScript.

This repository is the raw engine on its own, the same two source files OmniTool ships, plus a tiny host so you can run it without OmniTool.

## What Onyx is, honestly

Onyx is not a large language model, and not a neural network. It is a deliberately small assistant built from plain, inspectable parts:

- **An intent model.** 68 intents, each with example phrases (658 in total). Your message is turned into word and word-pair features, weighted by how rare each word is (TF-IDF), and compared with every example. A match only counts for as much of your sentence as it explains, so one shared word in a long sentence is weak evidence.
- **Typo tolerance.** A word Onyx doesn't know is mapped to the closest one it does, within one or two letters ("helo" becomes "hello").
- **Memory.** Your name and anything you ask it to remember ("remember that my car is blue"). Kept on your device only; "forget me" clears it.
- **Conversation state.** Follow-ups work: "another one" after a joke, "yes" to an offer, "why", "say that again".
- **Math of its own.** Digits or number words ("twelve times seven"), percentages, primes, factors, averages, roots, rounding and times tables, with follow-ups like "times 3". A small parser works it out; nothing is run as code.
- **Word tricks.** Count letters or words, reverse, spell out, change case, palindromes, numbers in words.
- **A glossary.** 76 short, accurate definitions of things developers run into (UUID, JWT, cron, base64, hashing, contrast ratio...).
- **Small talk with care.** Greetings, moods, jokes, tips and facts. A message about self-harm gets a short, caring reply that points to people who can help (988 in the US, findahelpline.com elsewhere), never a joke.
- **Inside OmniTool only:** a tool finder ("I need to pretty print some JSON" offers the JSON formatter) and commands that run OmniTool's tools ("generate 10 uuids and save them to a file", asking before anything is saved).

What Onyx can't do, by design: write essays, stories or code, translate, look anything up online, or answer general knowledge questions. It says so plainly instead of guessing.

## Measured

`node test/test.js` checks Onyx against 84 phrasings that are **not** in its examples, plus a scripted conversation:

| | Result |
|---|---|
| Intent accuracy on held-out phrasings | 95.2% (80 of 84) |
| Conversation checks | 21 of 21 |
| Network requests (in OmniTool's browser test) | 0 |
| Time to decide a reply | under 1 ms |

The three misses are listed by the test itself, so you can see exactly where it is wrong.

## Run it

**In a browser:** open `demo/index.html`. Everything runs in the page.

**In Node:**

```bash
node test/test.js
```

**In your own page:** load the three scripts in order, then ask:

```html
<script src="host/host.js"></script>
<script src="src/onyx-math.js"></script>
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
src/onyx-math.js   arithmetic: number words, a safe parser, number facts
src/onyx-data.js   what Onyx knows: intents and replies, jokes, tips, facts, glossary
host/host.js       a minimal host (storage, randomness) so Onyx runs outside OmniTool
demo/index.html    a standalone chat page
test/test.js       held-out accuracy and a conversation, in Node
```

## Privacy

Onyx has no network code at all. The only things it stores are your name and the facts you ask it to keep, in your browser's local storage (or in memory under Node). Nothing is sent anywhere.

The data files in `src/` are not secret and can't be: anything a web page runs can be read by whoever opens it. That is fine, because they contain no personal data, keys or passwords. Anything private belongs in a `private/` folder, which `.gitignore` keeps out of this repository.

## Version

**Onyx 1.1** (2026-10-22): math of its own, word tricks, and a bigger vocabulary (68 intents, 658 phrases, 76 glossary terms).

**Onyx 1** (2026-10-22): the first release, as shipped in OmniTool.

---

Made with love by **gksonlabs**.
