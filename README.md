# Onyx 3

**Thinks in steps you can follow. Still free. Still open source.**

**Try it: [gkson-lab.github.io/onyx](https://gkson-lab.github.io/onyx/)**. Free to use, with no account and nothing to install.

Onyx is the small conversational engine inside [OmniTool](https://github.com/gkson-lab/omnitool), and Onyx 3 is its third generation. It plans what you ask before it answers, shows the steps it took with every reply, writes text and code from a prompt, and has dictionaries for 31 languages besides English. It runs on your device: no account, no model download, and it goes online only when its internet switch says it may. Open weights, open source: yours to run, study and build on.

This repository is the engine on its own, the same source files OmniTool ships, plus a tiny host so you can run it without OmniTool. Earlier versions live on their own branches: [`onyx-1.0`](../../tree/onyx-1.0), [`onyx-1.1`](../../tree/onyx-1.1), [`onyx-1.2`](../../tree/onyx-1.2), [`onyx-1.3`](../../tree/onyx-1.3), [`onyx-2.0`](../../tree/onyx-2.0), [`onyx-2.1`](../../tree/onyx-2.1) and [`onyx-2.5`](../../tree/onyx-2.5).

## What's new in Onyx 3

| | Onyx 2.5 | Onyx 3 |
|---|---|---|
| Thinking | one message, one answer | **a plan**: one step or several, each able to use the one before, with the steps and a confidence returned with every reply |
| Languages | English, Spanish, French | the same three to talk in, and **dictionaries for 31**: 594,242 translations in all |
| Writing | a haiku, a poem, a card | **essays, stories, emails, letters, speeches, toasts and product descriptions from a prompt**, then shorter, longer, more formal |
| Code | 26 ready-made programs | those, plus **programs composed from a description** in six languages, **web pages** from the sections you name, **HTTP requests** from their parts |
| Uses | words, math, OmniTool | plus **documents** you can ask about, **quizzes**, **units**, **dates** |
| Internet | asks each time | **a switch**: off, on, or on and asking first |
| Held-out accuracy | 97.8% (91 of 93) | 97.8% (91 of 93) |

Onyx 3 also has a new look: a cut stone with three bands across it. Onyx the stone is made of bands laid down one at a time, and Onyx 3 thinks in steps laid down one at a time, so the bands are the mark, and the same colours mark the steps of its thinking. The app opens with the bands parting.

## What Onyx 3 is, honestly

Still not a large language model. There is no model to download because there isn't one: Onyx is a planner, two small neural networks (200,380 and 340,320 weights), dictionaries, and a set of skills written by hand. That is why it fits in a page and answers in about a millisecond, and it is also where its limits are:

- Its **writing** is assembled from patterns and from what its dictionary says about the topic. It is well formed and on topic, and plainer than a person's or a large model's.
- Its **code from a prompt** covers one family of programs well (take a list of numbers or words; keep, drop, change, sort, count or add them up; print the result), plus pages and requests. It shows the plan it read from your prompt, so a misreading is visible. It does not write arbitrary programs or fix yours.
- For **29 of the 31 other languages** it has a dictionary and no grammar. It translates words into them, and says so rather than produce a broken sentence.
- It **does not see images** or hear. It reads text you paste or a text file you give it, and in a browser that can speak it can read replies aloud.
- It knows what its dictionaries know. Anything else it looks up, if the switch allows, or says it doesn't know.

## The mind

Every message goes through four stages, in [`src/onyx-mind.js`](src/onyx-mind.js) and `respond` in [`src/onyx.js`](src/onyx.js):

1. **Read**: how long the message is, whether it asks or tells, what it points back to.
2. **Plan**: one step, or several. "Write a haiku about the sea, then translate it into Spanish" is two steps. "How do you say cat in French, German and Japanese" is three. "Take the numbers 1 to 10, add 5 to each one, then keep those above 12" is one program, whatever its "then".
3. **Act**: each step goes to the skill that fits it. A step can work on the result of the one before ("translate it", "double it", "summarize it").
4. **Check**: how far the answer can be trusted, from what happened on the way: computed exactly, taken from a hand-written dictionary, taken from one built automatically, assembled from patterns, fetched from a site it can't verify, or not understood.

The steps come back with the reply:

```js
const r = await Omni.onyx.respond('what is the square root of 144, then double it');
r.text        // 'sqrt(144) = **12**\n\n12 × 2 = **24**'
r.confidence  // 'sure'   ('sure', 'fair' or 'unsure')
r.thinking    // [{ step: 'read', detail: '10 words: a question, pointing back at something said before' },
              //  { step: 'plan', detail: '2 steps, each free to use the result before it: (1) what is the square root of 144 (2) double it' },
              //  { step: 'step', detail: '1 of 2: "what is the square root of 144"' },
              //  { step: 'skill', detail: 'arithmetic' }, { step: 'exact', detail: 'computed, not recalled' }, ...
              //  { step: 'check', detail: 'Confident: computed, not recalled.' }]
```

In conversation, "how did you get that?" shows the same steps in words. After any result: "translate it to French", "make it shorter", "make it longer", "more formal", "how many words is that", "explain it" (for code), "read it aloud".

## Dictionaries for 31 languages

"How do you say water in Japanese", "what does Schmetterling mean in German", "translate casa from Italian to Finnish", "how do you say good morning in Greek". English plus these thirty-one, each from its language's open wordnet, linked to the English dictionary through Princeton WordNet's meanings:

| Language | | English words translated | From |
|---|---|---|---|
| Spanish | español | 28,107 | Multilingual Central Repository 3.0 (CC BY 3.0) |
| French | français | 41,517 | WOLF (Wordnet Libre du Français) (CeCILL-C) |
| German | Deutsch | 17,627 | OdeNet, the Open German WordNet 1.4 (CC BY-SA 4.0) |
| Italian | italiano | 24,642 | MultiWordNet (CC BY 3.0) |
| Portuguese | português | 29,014 | OpenWN-PT (CC BY-SA) |
| Dutch | Nederlands | 21,617 | Open Dutch WordNet (CC BY-SA 4.0) |
| Catalan | català | 27,843 | Multilingual Central Repository 3.0 (CC BY 3.0) |
| Galician | galego | 15,594 | Multilingual Central Repository 3.0 (CC BY 3.0) |
| Basque | euskara | 20,395 | Multilingual Central Repository 3.0 (CC BY 3.0) |
| Romanian | română | 19,622 | Romanian Wordnet (CC BY-SA) |
| Polish | polski | 20,738 | plWordNet (the WordNet license) |
| Swedish | svenska | 8,280 | Swedish wordnet (SALDO) (CC BY 3.0) |
| Danish | dansk | 5,487 | DanNet (the WordNet license) |
| Norwegian | norsk | 5,977 | Norwegian Wordnet (Bokmål) (the WordNet license) |
| Norwegian Nynorsk | nynorsk | 5,187 | Norwegian Wordnet (Nynorsk) (the WordNet license) |
| Finnish | suomi | 45,463 | FinnWordNet (CC BY 3.0) |
| Icelandic | íslenska | 6,127 | IceWordNet (CC BY 3.0) |
| Lithuanian | lietuvių | 9,611 | Lithuanian WordNet (CC BY-SA 3.0) |
| Croatian | hrvatski | 14,974 | Croatian Wordnet (CC BY 3.0) |
| Slovenian | slovenščina | 21,973 | sloWNet (CC BY-SA 3.0) |
| Slovak | slovenčina | 16,825 | Slovak WordNet (CC BY-SA 3.0) |
| Bulgarian | български | 6,086 | BulTreeBank Wordnet (CC BY 3.0) |
| Greek | ελληνικά | 11,291 | Greek Wordnet (Apache 2.0) |
| Albanian | shqip | 5,706 | Albanet (CC BY 3.0) |
| Arabic | العربية | 10,167 | Arabic WordNet (CC BY-SA 3.0) |
| Hebrew | עברית | 4,916 | Hebrew Wordnet (the WordNet license) |
| Chinese | 中文 | 24,111 | Chinese Open Wordnet (the WordNet license) |
| Japanese | 日本語 | 37,492 | Japanese Wordnet (the Japanese WordNet license) |
| Thai | ไทย | 40,940 | Thai Wordnet (the WordNet license) |
| Indonesian | Bahasa Indonesia | 23,624 | Wordnet Bahasa (MIT) |
| Malay | Bahasa Melayu | 23,289 | Wordnet Bahasa (MIT) |

Each dictionary is one file in [`src/translations/`](src/translations) (41 MB in all), loaded the first time its language is asked for, and built by [`tools/build-translations.py`](tools/build-translations.py). When a meaning has several words, the commonest comes first, ranked with [wordfreq](https://github.com/rspeer/wordfreq)'s word counts. German also has a core of 230 everyday words written by hand, because its wordnet misses or misranks some of them.

These are **dictionaries, not translators**. Built automatically, they are less sure than Onyx's hand-written Spanish and French: a reply from one says where the word came from. Onyx knows ten everyday phrases in every language (hello, thank you, I love you...), translates other phrases word by word and says the grammar will be rough, and for anything longer gives the main words rather than a sentence it can't vouch for. Whole sentences it translates between English, Spanish and French ([below](#translation)).

## Writing from a prompt

[`src/onyx-compose.js`](src/onyx-compose.js) reads what a prompt asks for and writes it in parts:

- **Essays**: "write an essay about volcanoes", "a short essay about friendship", "a long essay on the French Revolution". Written from what the dictionary knows: what the thing is, what kind of thing, its parts, its kinds, how the word is used. With the internet on, an essay about something the dictionary doesn't cover is built from the Wikipedia article, mostly in its own sentences, with the link.
- **Stories**: "tell me a story about a shy dragon who wants to sing", "a story about Mia who loses her kite at the beach". The hero, the wish and the place come from the prompt.
- **Emails and letters**: "write an email to my landlord about the broken heater", "a formal letter resigning from my job", "an email thanking Sam for the gift". Requests, thanks, apologies, invitations, complaints, follow-ups, resignations, congratulations, news.
- **Speeches and toasts**, and **product descriptions**: "a toast for my sister's wedding", "a product description for a waterproof backpack".

Then "make it shorter", "longer", "more formal", "casual", "another", or "translate it to Spanish". Card messages, haiku, poems and acrostics are still written by [`src/onyx-write.js`](src/onyx-write.js). Songs, and anything book-length, are beyond it.

## Code from a prompt

> **You:** a rust program that takes the numbers 1 to 20, keeps the even ones, squares them and prints the sum
> **Onyx:** **A program in Rust**, composed from your prompt. This is how I read it:
> 1. Start with the numbers 1 to 20
> 2. Keep the ones that are even
> 3. Square each one
> 4. Print their sum

```rust
fn main() {
    let numbers: Vec<i64> = (1..=20).collect();
    let numbers: Vec<i64> = numbers.into_iter().filter(|&n| n % 2 == 0).collect();
    let numbers: Vec<i64> = numbers.iter().map(|&n| n * n).collect();
    println!("{}", numbers.iter().sum::<i64>());
}
```

[`src/onyx-synth.js`](src/onyx-synth.js) reads a prompt into a small plan (where the data comes from, the steps, what to print) and writes the plan in **Python, JavaScript, Rust, C, C# or C++**. Then "now in Python", or "explain it".

- **Where the data comes from**: numbers you list, a range, a file of numbers, the keyboard; words you list, the words of a sentence, the lines of a file.
- **Steps**: keep or drop (even, odd, above 12, divisible by 3, longer than 4 letters, starting with "a"...), change (square, double, add 5, capitals, backwards, lengths), sort, drop repeats, take or skip the first few, reverse.
- **Results**: each one, the sum, average, product, count, largest, smallest, longest, shortest, or all on one line.

It also composes **web pages** from the sections you name ("a landing page for a bakery called Sweet Crumbs with a hero, three features, a contact form and a footer": navigation, hero, about, features, gallery, pricing, menu, customers' words, questions, hours, contact, footer; a colour; dark) and **HTTP requests** from their parts ("a PUT request to https://api.example.com/users/42 with a bearer token and a JSON body with name Sam and age 30": method, address, headers, query, a JSON body with the right Content-Length, and the same thing as a curl command).

[`tools/check-synth.js`](tools/check-synth.js) checks it the hard way: every plan is written in all six languages, compiled with warnings as errors, run, and what each program prints is compared with the answer worked out independently from the plan. The 26 ready-made programs of Onyx 2.5 are all still there ([below](#code)).

## Documents, quizzes, units and dates

[`src/onyx-uses.js`](src/onyx-uses.js):

- **Documents.** Paste a long text, say "read this: ...", or hand Onyx a text file (`Omni.onyx.read(text, name)`; the demo has a button). It says how long it is and what words it keeps coming back to, then answers "summarize it", "what does it say about carbon", "how many times does it mention forest", "key words", "the first sentence". Summaries and answers are the document's own sentences: Onyx measures and searches a text exactly, and doesn't understand it the way a reader does.
- **Quizzes.** "Quiz me on German", "a math quiz with 10 questions", "quiz me on word meanings". Vocabulary in any of the dictionaries, arithmetic that gets harder as you get it right, or which word fits a definition. "Skip" passes, "stop" ends, and it keeps the score.
- **Units.** "5 miles in km", "how many cups in a liter", "72 F to C", "2.5 GB to MB", "100 kph to mph": length, mass, volume, area, speed, time, data, energy and temperature. Kitchen measures are US ones, and it says so.
- **Dates.** "How many days until Christmas", "what day of the week is March 1, 2027", "what day was July 4 1776", "3 weeks from now", "is 2028 a leap year", "how many days between March 1 and May 1".
- **Runs of numbers.** "The sum of the numbers from 1 to 100" (5,050, by the formula), "the product of 1 to 6", "add up the even numbers from 1 to 20".

## What's new in Onyx 2.5

| | Onyx 2.1 | Onyx 2.5 |
|---|---|---|
| Words | 14,390 | **147,561**: all 147,306 words and phrases in WordNet, in 117,659 senses, behind 14,459 everyday ones |
| Translation | 3,536 words, one at a time | **Spanish for 29,179 English words and French for 43,738** (28,107 and 41,517 since Onyx 3 ranks them differently), both ways; 139 phrases; **simple sentences**, with grammar |
| Neural networks | one, for what you mean | **two**: the new one predicts your next word as you type |
| Code | none | **small programs in Python, JavaScript, Rust, C, C#, C++, HTML and HTTP**: 26 tasks, 149 programs, each compiled and run by a checker |
| Held-out accuracy | 96.8% (90 of 93) | **97.8%** (91 of 93) |

- **All of WordNet.** "define sesquipedalian", "what does defenestration mean", "define narwhals" (*the plural of narwhal*), "is a narwhal a mammal?" (*narwhal → whale → cetacean → aquatic mammal → placental → mammal*), "name some cetaceans", "where is Timbuktu?", "who was Mozart?" (answered offline, then Wikipedia offered for more), "all meanings of set" (45 of them). Plus 70 words from after WordNet was finished in 2006, written for Onyx: selfie, emoji, phishing, deepfake... [More below.](#the-dictionary-147561-words)
- **Translation of sentences, not just words.** "translate 'I don't have a car' to French" (*Je n'ai pas de voiture.*), "how do you say 'the old man reads a book' in Spanish" (*El hombre viejo lee un libro.*), "what does 'mi hermano juega al fútbol' mean?" (*My brother plays football.*). Articles, gender, plurals, agreement, adjective order and the present tense, both ways; anything beyond that is translated word by word, and Onyx says so. [More below.](#translation)
- **Predicting what you'll say.** A second small network, trained on what people say to Onyx, guesses your next word as you type (the demo shows its guesses; Tab takes the first), and "finish this sentence: I have an exam on" lets you watch it think. [More below.](#predicting-what-youll-say)
- **Small programs in eight languages.** "fizzbuzz in rust", "a class Book with title, author and price in C#", "a GET request to https://... in JavaScript", "an HTML form with name and email", "a raw HTTP POST with title and pages", then "now in Python". [More below.](#code)

## What's new in Onyx 2.1

- **The internet, with your permission.** Ask something Onyx doesn't know, or say "research black holes", "what's the weather in Austin?" or "what's in the news?", and it offers to look it up. It says exactly what it would send and where, then waits for a yes. Say "always" to stop being asked, or "stay offline" to never go online. It uses Wikipedia (in English, Spanish or French), Open-Meteo and the Free Dictionary API: no account, no key, nothing stored. [More below.](#the-internet-with-your-permission)
- **Research briefs.** "research Ada Lovelace" gets Wikipedia's summary, key points picked from the whole article, related articles and the link. "tell me more" gives more points.
- **Short pieces of writing.** Haiku of exactly 5, 7 and 5 syllables, rhyming poems, acrostics, short stories, messages for cards, descriptions and summaries, all built from the dictionary. After a lookup, "write a poem about it" uses what Onyx just read. [More below.](#writing)

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

## How it understands you

Under the mind, the parts that read a single message are the ones Onyx 2 introduced. They are plain and inspectable:

- **Two models that vote.** A phrase matcher compares your message with 1,102 example phrases (763 English, 171 Spanish, 168 French), using word and word-pair features weighted by how rare each word is (TF-IDF), and counts a match only for as much of your sentence as it explains. A small neural network reads the same message as words, word pairs and three-letter pieces of words, so "helo" still looks like "hello". It has two layers and 200,380 parameters. Its weights are in [`src/onyx-weights.js`](src/onyx-weights.js) and [`tools/train.js`](tools/train.js) retrains them in a minute and a half, deterministically. Each scores every intent; Onyx blends the two (65% phrases, 35% network).
- **A dictionary it reasons with.** See below. When no fixed reply fits, Onyx reads your message with it and answers the specific thing you said.
- **A third network that predicts.** It reads the last four words and scores every word that could come next. See [below](#predicting-what-youll-say).
- **Templates, grammar and checks, not a language model, for translation and code.** Each sentence pattern and each program was written for Onyx and is filled in with what you ask; every program is compiled and run by `tools/check-code.js`.
- **A memory of the conversation.** What you've told it, the names of your pets and people, what you're talking about, and the language you're writing in.
- **Typo tolerance**, **math of its own**, **word tricks**, **settings** and a **memory** that stays on your device, as in Onyx 1.

## The dictionary: 147,561 words

Two layers. The **everyday dictionary**, 14,459 words, is what Onyx talks and reasons with:

- **3,480 everyday words written by hand for Onyx** (3,613 entries): a plain definition, an example sentence, similar and opposite words, and the hints Onyx reads conversations with: whether a word is a feeling and how it sits (good, bad, heavy), whether an event calls for good luck, congratulations or sympathy, what kind of thing a noun is. New in Onyx 2.5: 70 words from after 2006 (selfie, emoji, hashtag, phishing, ransomware, influencer, deepfake, QR code...).
- **10,979 more from [Princeton WordNet 3.0](https://wordnet.princeton.edu/)**, the most common English words not already covered (ranked with [wordfreq](https://github.com/rspeer/wordfreq)): definitions, examples, synonyms and opposites, irregular forms ("began", "begun", "analyses"), plus 604 countries, states, cities, rivers and planets. WordNet has no example sentence for many common words, so 2,346 were written for Onyx (in [`tools/examples.txt`](tools/examples.txt)). Names, abbreviations, slurs and sexual or vulgar senses are left out of this layer.
- **Pronunciations** for 14,376 entries from the [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict), in IPA, which give syllables and rhymes.
- **What things are.** Nouns know what they're a kind of (a whale → cetacean → aquatic mammal → mammal), their parts and what they're part of.

Behind it, the **full dictionary** ([`src/english/`](src/english), built by [`tools/build-full.py`](tools/build-full.py)) is all of WordNet 3.0: **147,306 words and phrases in 117,659 senses**, each with its definition, examples, synonyms, opposites, what it is a kind of and its parts, plus 81,689 pronunciations and WordNet's 5,952 irregular forms. Onyx turns to it for any word the everyday dictionary doesn't have, and for "is a X a Y" and "name some X" when the everyday words don't reach. As in a printed dictionary nothing is left out: offensive senses are kept and marked *Offensive*, informal ones *Informal*. People and places in WordNet answer "who was..." and "where is..." offline, with a note that WordNet was finished in 2006 (and an offer to look it up online, if Onyx can). Word games, made-up sentences and the conversation stay with everyday words, so a rare sense never shapes a reply.

It is about 18 MB in five files. A page loads them last; Onyx uses them as soon as they arrive, reads the index on first use (about 0.15 seconds) and each block of senses when it's first needed. Without them, Onyx simply has its 14,459 everyday words.

Ask "define serendipity", "what does ephemeral mean", "another word for happy", "opposite of brave", "is quickly an adverb", "use curious in a sentence", "all meanings of run". And:

- **Thinking with words**: "is a whale a mammal?" (*Yes: whale → cetacean → aquatic mammal → placental → mammal*), "is a platypus a bird?" (*No, a platypus is a kind of mammal*), "name some cetaceans", "is a bat a bird?" (*No, a bat is a kind of mammal*), "what kind of animal is a salmon?", "name some reptiles", "what's the difference between a frog and a toad?" (both definitions, and *Both are amphibians*), "what do a lion and a tiger have in common?", "what are the parts of a flower?", "where is Paris?".
- **How words sound**: "how do you pronounce whale" (*/weɪl/*), "how many syllables in banana", "what rhymes with moon".
- **Words by their letters**: "words that start with qu", "words ending in tion", "anagram of listen" (*silent, tinsel*), "word of the day".
- "it" follows the conversation: after "where is Paris?", "define it" defines Paris.

## Spanish and French

Write to Onyx in either and it answers in the same language; it tells them apart by their common words, their accents, and the English, Spanish and French words it knows ("¿cómo estás?", "ça va ?"). Or say "speak Spanish", "parle français", "habla inglés". Translation has [its own section](#translation).
- **Conversation**: greetings, how are you, thanks, goodbye, who Onyx is, help, jokes and facts in each language, the time and date, your name ("me llamo Ana", "je m'appelle Léa"), and how you feel ("estoy muy cansada" gets *Siento que estés cansada*, in your own words).
- **Math in words**: "¿cuánto es doce por siete?", "combien font quatre-vingt-dix-neuf plus un ?".
- **Care**: a message about self-harm gets a reply in the same language with people who can help: 024 in Spain, 3114 in France, 988 in the US, findahelpline.com elsewhere.

What it doesn't do yet in Spanish and French: definitions come in English; beyond feelings, the replies built from what you say (events, plans, pets) are English-only; and writing and code are asked for in English.

## Translation

Between English, Spanish and French, every direction (Spanish to French goes through English). Ask in any of the three: "how do you say 'where are my keys' in Spanish", "translate tengo dos gatos negros", "what does 'je suis fatiguée' mean", "¿cómo se dice 'I am hungry' en francés?", "comment dit-on 'where is the station' en espagnol ?".

**Words.** First the **3,536 everyday words translated by hand for Onyx**, with their articles so the gender shows (*el perro*, *la maison*, *l'arbre (m.)*). Then the **large lists** in [`src/translations/`](src/translations), built by [`tools/build-translations.py`](tools/build-translations.py) from the Open Multilingual Wordnet: **Spanish for 29,179 English words** (and 23,312 Spanish words back to English) from the Multilingual Central Repository, and **French for 43,738** (and 34,849 back) from WOLF, the Wordnet Libre du Français. For each English word Onyx takes the translations of its most used senses and prefers the one most common in Spanish or French (ranked with wordfreq), passing over English words that merely turn up in Spanish or French text. These lists are built automatically, so Onyx says when an answer comes from them, and guesses a noun's gender from its ending when it must (and says so). WOLF is the noisier of the two.

**Phrases.** A phrasebook of 139 everyday phrases, written for Onyx in all three languages: greetings, thanks, apologies, directions, restaurants, shops, health, the weather, emergencies.

**Sentences.** A small grammar, written for Onyx, for the sentences people most often want: where is X, how much is X, I want / I'd like / I need / I have / I like X, there is X, I am (hungry, tired, a teacher, 30 years old), X is Y, I am going to X, can I have X, do you have X, my name is, I'm from, I live in, I (don't) speak, and any simple "someone does something" sentence (*I eat apples*, *the children play football*, *my sister doesn't eat meat*), with a place on the end (*in the garden*, *on the table*). It handles articles (including *du*, *de la* and *de* after a negation in French), gender and number agreement, adjectives after the noun (and *beau*, *petit*, *grand*... before it in French), contractions (*al*, *del*, *au*, *aux*), *ser* and *estar*, *tener hambre* and *avoir faim*, *jugar al* and *tocar el* for sports and instruments, and the present tense of regular verbs and about 60 irregular ones. The other way, it reads Spanish and French sentences of the same shapes back into English.

Anything else is **translated word by word**, and Onyx says the grammar may be off and which words it didn't know. "translate 'the quick brown fox jumps over the lazy dog'" gets that treatment. When it doesn't know whether "I" is a man or a woman, it gives both: *No estoy cansado (o cansada).*

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

What Onyx can't do, by design: write long pieces (essays, songs, big programs), fix your code, or answer general knowledge questions beyond its dictionary on its own. It says so plainly instead of guessing, and with your permission it looks the question up.

## The internet, with your permission

**The switch.** Onyx has one setting for the internet, with three positions: **off** (never online, and it won't offer), **ask** (it says what it would look up and where, and waits for your yes) and **on** (it looks things up without asking). The demo puts it on the side as a switch with an "ask me before each lookup" box, and a first visit starts with it off. In code it is `Omni.onyx.settings.set('internet', 'off' | 'ask' | 'on')`; in conversation, "stay offline", "ask first" and "you can go online" do the same. When a reply used the internet, or would have, its thinking says so.

The engine itself has no network code. It goes online only through a host's internet port, and [`host/net.js`](host/net.js) is a ready-made one: load it after `host/host.js` (the demo page does) and Onyx can look things up. Without it, Onyx stays offline and says so.

**It asks first, every time**, until you say otherwise:

> **You:** who was Ada Lovelace?
> **Onyx:** I don't know that offline. I can look that up online: I'd send "who was Ada Lovelace" to Wikipedia.
> Want me to? (yes, no, or "always" so I stop asking)

| You say | Onyx |
|---|---|
| "yes" | looks up this one thing |
| "no" | stays offline for it |
| "always", or "you can go online" | looks things up without asking from now on |
| "ask first" | goes back to asking every time (the default) |
| "stay offline" | never goes online, and stops offering |

This choice is the `internet` setting (`ask`, `on` or `off`), kept on your device with the other settings. In Spanish and French, answer "sí", "siempre", "no" or "oui", "toujours", "non"; "sin internet" and "reste hors ligne" turn it off. If a service can't be reached, Onyx says so and offers to try again.

**What it looks up, and where:**

| Ask | Service | What is sent |
|---|---|---|
| a question Onyx can't answer; "look up X", "search for X", "busca X", "cherche X" | Wikipedia, in your language | the question or topic |
| "research X"; then "tell me more" | Wikipedia | the topic, then the article's title |
| "what's the weather in Austin?", "¿qué tiempo hace en Madrid?" | Open-Meteo | the place name, then its coordinates |
| "what's in the news?" | Wikipedia's "In the news" (English) | today's date |
| "define X" for a word not in Onyx's dictionary | Free Dictionary API (from Wiktionary) | the word |

Words in Onyx's own dictionary are always answered offline, even when you say "look up". Nothing else is sent: no account, no key, no cookies, nothing from the conversation but the words being looked up. Requests to Wikipedia name Onyx in a User-Agent header (`Api-User-Agent` in a browser), as Wikimedia asks of every client. Each request gets 6 seconds and one retry if the connection drops; a whole lookup gets 25 seconds. Wikipedia limits how often one network may ask, so on a busy shared connection it can sometimes answer "too many requests"; Onyx then offers to try again.

**The port, for your own host** (OmniTool, a server, a test):

```js
Omni.net = {
  enabled: true,
  sources: { search: 'Wikipedia', research: 'Wikipedia', news: 'Wikipedia', weather: 'Open-Meteo', define: 'the Free Dictionary API' },
  ask: async ({ kind, query, topic, place, lang }) => ({ data }),  // or { text }, or null
};
```

`kind` is `search`, `research`, `weather`, `news` or `define`, and `lang` is `en`, `es` or `fr`. `ask` is called only after the person agrees, and resolves to `{ text }` (Markdown, shown as Onyx's reply), `{ data }` in the shapes `host/net.js` documents (Onyx words them in the person's language), or `null` when the service can't be reached. `sources` names the services in Onyx's question. `host/net.js` takes a `fetch` of your choice in `Omni.net.fetch`; the tests use that to replay recorded answers from [`test/fixtures`](test/fixtures).

**In Node**, `host/net.js` uses the built-in `fetch` (Node 18 and later). Behind an HTTP proxy, recent versions of Node use the `HTTPS_PROXY` variable when `NODE_USE_ENV_PROXY=1` is set.

## Code

Besides [composing programs from a prompt](#code-from-a-prompt), Onyx writes small, complete programs in **Python, JavaScript, Rust, C, C#, C++, HTML and raw HTTP**, for 26 everyday tasks: hello world, counting, FizzBuzz, a function (add, multiply, square, average... or your own: "a function called area that takes w and h and returns w * h"), reversing a string, palindromes, factorials, Fibonacci numbers, primes, sorting a list (up or down), sum and average, looping over a list, reading and writing files, counting words, a class or struct with the fields you name (Onyx works out their types: *age* is a whole number, *price* a decimal, *is_available* true or false), HTTP GET and POST requests, a tiny web server, asking for a name, a number guessing game, temperature conversion, and web pages, tables, forms and buttons. Each comes with what it does and how to run it, and "now in Rust" (or "what about C#?") writes the same thing in another language. Say "can you code?" for the list.

It isn't a language model. Each task is written for Onyx in each language, in that language's usual style, and filled in with what you asked: the numbers, names, fields, file names, URLs and text. That keeps every program correct: [`tools/check-code.js`](tools/check-code.js) writes all 26 tasks in every language they support, with their defaults and with 1 to 3 variations each (284 programs), compiles them with warnings treated as errors (`gcc` and `g++ -Wall -Wextra -Werror`, `rustc -D warnings`, `mcs -warnaserror+`), runs them, feeds the interactive ones their input, starts the servers and sends them a request, sends the raw HTTP to a local server, checks the HTML is well formed, and checks that FizzBuzz, a factorial or a sorted list comes out the same in every language. All 284 pass. The Rust HTTP examples use the `reqwest` crate, and the C and C++ ones libcurl; requests to the internet are compiled but not sent.

Big programs, and fixing your own code, are beyond Onyx, and it says so.

## Predicting what you'll say

A second small neural network guesses the next word of what you're typing. In the demo its guesses sit above the text box: the end of the word you're typing ("write a hai" → *haiku*), or the next word ("is a whale a" → *mammal*, "fizzbuzz in" → *Python*, *JavaScript*, *C*). Tab takes the first. "finish this sentence: I have an exam on" shows its best ending and its top three guesses.

It reads the last four words, each as 48 numbers (an embedding), passes them through a hidden layer of 192, projects back into the embedding space and scores all 6,000 words it knows against their embeddings: 340,320 numbers in all, in [`src/onyx-predict-weights.js`](src/onyx-predict-weights.js) as 8-bit integers. [`tools/train-predict.py`](tools/train-predict.py) trains it with NumPy in about five minutes, the same weights every time, on what people say to Onyx and nothing scraped: Onyx's example phrases in three languages, its dictionary's example sentences, the phrasebook, and requests for everything Onyx does, made from templates ("write a haiku about...", "how do you say... in French", "...in Rust"). Dropout, and stopping when a separate validation slice stops improving, keep it from memorizing.

Measured honestly, on 1,995 sentences it never saw, counting only real next words (the end of a sentence isn't a suggestion, and a word it doesn't know is a miss): **its first guess is right 24.3% of the time, and one of its first three 33.3%.** Counting which word most often follows the last two words gets 21.3% and 30.9%, so the network is better, but modestly: it is small, and so is what it learned from. A network 40% bigger did no better.

## Writing

Onyx writes short pieces from its dictionary, using templates, the dictionary's pronunciations and what it knows about each word. It is not a language model: the pieces are short and simple, and different every time ("another one").

- **Haiku**: "write a haiku about the ocean". Exactly 5, 7 and 5 syllables, counted from real pronunciations.
- **Rhyming poems**: "write a poem about the moon". Two rhyming couplets.
- **Acrostics**: "write an acrostic for SAM".
- **Short stories**: "tell me a story about a dragon".
- **Messages for cards**: "write a birthday message for my mom", "a thank you note to Ana for the lovely dinner", "a congratulations card for my sister on her promotion". There are 17 occasions, including get well, good luck, sympathy, wedding, new baby, graduation, retirement and missing someone.
- **Descriptions**: "describe a whale", from what the dictionary knows about it.
- **Summaries**: "summarize: …" followed by your text keeps the sentences that carry it.
- **After a lookup**: "write a poem about it" borrows words from the article, and "summarize it" gives its key points.

Long writing (essays, songs, code) is beyond Onyx, and it says so. Writing is in English for now; in Spanish and French, Onyx says so and suggests the English request.

## Measured

`node test/test.js` checks Onyx against phrasings that are **not** in its examples, plus scripted conversations. All 281 checks pass:

| | Result |
|---|---|
| English intent accuracy on 93 held-out phrasings | 97.8% (91 of 93), as in Onyx 2.5 |
| Spanish, 20 held-out phrasings | intent 100%, language recognized 100% |
| French, 20 held-out phrasings | intent 95%, language recognized 100% |
| English phrasings taken for Spanish or French | 0 of 93 |
| The intent network on its own | 89 of 93 held-out phrasings |
| **New in Onyx 3** | |
| The planner: messages split into the right steps, or rightly left whole | 13 of 13 |
| Follow-ups read as the right thing to do to the last result | 10 of 10 |
| A conversation using what is new (steps, other languages, writing, code, a document) | 33 of 33 |
| Replies that come with their thinking and a confidence | 33 of 33 |
| Programs from a prompt: read, written in JavaScript and run, with the right answer | 9 of 9, plus a page and a request |
| `node tools/check-synth.js 300`: 19 prompts and 300 random plans, each written in six languages, compiled with warnings as errors, run and compared with the answer; 5 pages; 5 requests sent to a local server | 1,943 of 1,943 |
| Units, runs of numbers and dates | 18 of 18 |
| Quizzes (a math quiz marked right, a German one asked) and a document read from a file | pass |
| The internet switch: on, an essay is built from Wikipedia; off, nothing is fetched or offered | pass |
| Dictionaries: Spanish for 28,107 English words, French for 41,517, and 29 more languages | 594,242 translations |
| **As before** | |
| Conversation checks from Onyx 1 and 2 | all pass |
| Dictionary data checks (no duplicates; every feeling has a mood, every event a type, every example uses its word) | 14,799 entries pass |
| The full dictionary: every word's senses exist, every sense has a definition | 147,306 words, 117,659 senses |
| Full-dictionary questions (word forms, kinds, people, places, all meanings, pronunciations) | 15 of 15 |
| Sentences translated exactly as a person would write them (both ways, three languages) | 40 of 40 |
| Code requests read right (task and language), and things that aren't code requests left alone | 21 of 21 |
| Prediction network, on held-out sentences: right first / in the first three | 24.3% / 33.3% (counting: 21.3% / 30.9%) |
| The JavaScript gives the trainer's own numbers on its sample of held-out sentences | 23.23% / 32.98%, exactly |
| `node tools/check-code.js`: the ready-made programs compiled with warnings as errors, run, and compared across languages | 284 of 284 |
| Internet permission checks, and lookups replaying recorded answers from Wikipedia, Open-Meteo and the Free Dictionary API | all pass |
| The connector contacts only its four services | yes |
| Writing checks (haiku syllables, rhymes, acrostics, stories, messages, descriptions, summaries) | 11 of 11 |
| Deciding a reply, on average over 240 messages | about 0.7 ms (0.4 in Onyx 2.5: planning and the trace cost the difference) |
| Predicting the next word | about 2.5 ms |
| Network requests from the app to other sites with the switch off | 0 |

What isn't measured, because there is no fair way to put a number on it here: how good the essays, stories and emails are. They are well formed and on topic; read a few and judge. The same goes for the word-by-word translations into the 29 dictionary-only languages, which is why Onyx labels them.

The intent network was retrained for Onyx 3 (the examples about its version changed) and still misses "i need some rest" and "work is overwhelming". These are reported as they are, not tuned away. The misses are listed by the test itself, so you can see exactly where it is wrong.

The recorded answers in `test/fixtures` keep the tests offline and repeatable.

## Run it

**On the web:** [gkson-lab.github.io/onyx](https://gkson-lab.github.io/onyx/). It is this repository served as it is by GitHub Pages, from the `gh-pages` branch: the page and its files are downloaded once, and after that everything runs in your browser.

**From a copy of the repository:** open `index.html`. Everything runs in the page, and it goes online only when the switch on the side is on.

**In Node:**

```bash
node test/test.js
```

**Check the code it writes** (needs python3, node, rustc, gcc, g++, and mcs and mono for C#; cargo and libcurl's headers for the ready-made HTTP examples; whatever isn't installed is skipped and listed):

```bash
node tools/check-synth.js        # programs composed from a prompt: 19 prompts and 40 random plans, in six languages
node tools/check-synth.js 300    # more random plans
node tools/check-code.js         # the 26 ready-made programs in every language
```

**In your own page:** load the scripts in order, then ask:

```html
<script src="host/host.js"></script>
<script src="host/net.js"></script>          <!-- optional: lookups online, when the switch allows -->
<script src="src/onyx-math.js"></script>
<script src="src/onyx-lexicon.js"></script>
<script src="src/onyx-dictionary.js"></script>
<script src="src/onyx-tongues.js"></script>  <!-- the 31 languages' names and everyday phrases -->
<script src="src/onyx-languages.js"></script>
<script src="src/onyx-data.js"></script>
<script src="src/onyx-model.js"></script>
<script src="src/onyx-weights.js"></script>
<script src="src/onyx-write.js"></script>    <!-- optional: haiku, poems, cards, summaries -->
<script src="src/translations/onyx-translations-es.js"></script>  <!-- optional: the others load when asked for -->
<script src="src/translations/onyx-translations-fr.js"></script>
<script src="src/onyx-translate.js"></script>                     <!-- optional: phrases, sentences, the dictionaries -->
<script src="src/onyx-compose.js"></script>                       <!-- optional: essays, stories, emails, speeches -->
<script src="src/onyx-code.js"></script>                          <!-- optional: ready-made programs -->
<script src="src/onyx-synth.js"></script>                         <!-- optional: programs, pages and requests from a prompt -->
<script src="src/onyx-uses.js"></script>                          <!-- optional: documents, quizzes, units, dates -->
<script src="src/onyx-mind.js"></script>                          <!-- optional: planning in steps, and the thinking -->
<script src="src/onyx-predict-weights.js"></script>               <!-- optional: the prediction network -->
<script src="src/onyx-predict.js"></script>
<script src="src/onyx.js"></script>
<script>
  Omni.onyx.respond('hi').then((reply) => console.log(reply.text, reply.thinking));
</script>
<!-- optional, and best loaded last: the full English dictionary, about 18 MB -->
<script src="src/english/onyx-english-index.js"></script>
<script src="src/english/onyx-english-nouns-1.js"></script>
<script src="src/english/onyx-english-nouns-2.js"></script>
<script src="src/english/onyx-english-verbs.js"></script>
<script src="src/english/onyx-english-modifiers.js"></script>
```

Everything marked optional is: without it Onyx falls back to less (one message at a time and no thinking trace, the hand-written dictionary, English, its phrase matcher alone, no writing, no code, no predictions, no internet), and says so when asked for what's missing. The other 29 dictionaries are fetched from `src/translations/`, next to wherever `host/host.js` was loaded from, the first time each is needed (`Omni.languages.load('de')`).

`respond(text)` returns `{ text, thinking, confidence, ms, offer?, expect?, action?, command?, code?, plan?, piece?, speak? }`. `thinking` is the list of steps and `confidence` is `'sure'`, `'fair'` or `'unsure'`. `offer` is a yes/no question Onyx is waiting on, `action` is something the host should do (open a tool, switch the theme), `command` is a request for OmniTool's tools, which only exist inside OmniTool, `code` is the program in a reply, and `speak` is text the host should read aloud (set `Omni.speech = { say(text, lang) }` to offer a voice). `Omni.onyx.read(text, name)` hands it a document, `Omni.onyx.thinking()` gives the steps behind the last reply, `Omni.onyx.context()` shows what Onyx has gathered from the conversation, `Omni.onyx.detect(text)` the language of a message, and `Omni.onyx.predict(text)` its guesses for the next word.

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

**Rebuild the full dictionary and the large word lists** from the same nltk_data folder (the dictionaries also need the Open Multilingual Wordnet, `omw-1.4.zip`, from the same place, and for German the [OdeNet](https://github.com/hdaSprachtechnologie/odenet) file `deWordNet.xml` with the CILI map `ili-map-pwn30.tab`, in the folder given as `--odenet`):

```bash
python3 tools/build-full.py --data nltk_data            # src/english/, about 35 seconds
python3 tools/build-translations.py --data nltk_data --odenet odenet    # src/translations/, all 31 languages
python3 tools/build-translations.py --data nltk_data --only it,ja       # or just some
```

**Retrain the prediction network** after changing the examples, the dictionary or its templates:

```bash
pip install numpy
python3 tools/train-predict.py      # src/onyx-predict-weights.js and test/fixtures/predict-heldout.txt, about 5 minutes
```

All of them give the same output every time.

## Files

```
src/onyx.js            the engine: the plan, the skills, the conversation, the thinking trace
src/onyx-mind.js       the mind: reading a message, planning its steps, what can be done to a result, how sure
src/onyx-model.js      the intent network: features and the forward pass (no training code)
src/onyx-weights.js    its open weights (generated by tools/train.js)
src/onyx-dictionary.js the hand-written dictionary (format documented at the top), word forms, sentences, and the
                       reasoning on top: kinds of things, rhymes, syllables, anagrams
src/onyx-lexicon.js    the generated part of the dictionary: WordNet, pronunciations (generated by tools/build-lexicon.py)
src/onyx-tongues.js    the 31 languages: their names, ten everyday phrases in each, a hand-written German core
src/onyx-languages.js  Spanish and French: the word list, what Onyx understands and says, their grammar and numbers
src/onyx-math.js       math: number words, a safe parser, equations, percentages, statistics, number facts
src/onyx-data.js       English intents and replies, jokes, tips, facts, glossary
src/onyx-write.js      short writing: haiku, rhyming poems, acrostics, stories, messages, descriptions, summaries
src/onyx-compose.js    writing from a prompt: essays, stories, emails, letters, speeches, product descriptions
src/onyx-translate.js  translation: the phrasebook, the grammar for sentences in English, Spanish and French, and
                       the other dictionaries
src/onyx-code.js       ready-made programs: 26 tasks in Python, JavaScript, Rust, C, C#, C++, HTML and HTTP
src/onyx-synth.js      code from a prompt: plans, written in six languages; web pages; HTTP requests
src/onyx-uses.js       units, runs of numbers, dates, documents, quizzes
src/onyx-predict.js    the prediction network: running it (next words, word endings, likely endings)
src/onyx-predict-weights.js  its open weights (generated by tools/train-predict.py)
src/english/           the full dictionary: all of WordNet 3.0, in five files (generated by tools/build-full.py)
src/translations/      the dictionaries of 31 languages, one file each (generated by tools/build-translations.py)
licenses/              the license of each wordnet the dictionaries come from
host/host.js           a minimal host (storage, randomness, loading a language) so Onyx runs outside OmniTool
host/net.js            the internet connector: Wikipedia, Open-Meteo, the Free Dictionary API
index.html             the app, and the website's front page: the conversation, and on the side the internet
                       switch and the thinking
.nojekyll              tells GitHub Pages to serve the files as they are
test/test.js           held-out accuracy in three languages, the networks, the planner, conversations, the internet
                       port and switch, writing, dictionaries, translation, code, predictions, data checks, speed
test/fixtures/         answers recorded from the three services, so the connector's tests run offline; held-out
                       sentences for the prediction network
tools/train.js         trains the intent network
tools/train-predict.py trains the prediction network
tools/build-lexicon.py builds the lexicon from WordNet and CMUdict
tools/build-full.py    builds the full dictionary from WordNet and CMUdict
tools/build-translations.py  builds the 31 dictionaries from the Open Multilingual Wordnet and OdeNet
tools/onyx_wordnet.py  what the three builders share: text cleaning, filters, pronunciations
tools/check-code.js    compiles and runs every ready-made program
tools/check-synth.js   compiles and runs programs composed from prompts and from random plans, in six languages
tools/examples.txt     example sentences written for Onyx, for common words WordNet has none for
```

## Privacy

The engine has no network code. Without `host/net.js` (or a host's own connector), nothing is sent anywhere. With it, Onyx sends only the words being looked up, only to the services in the table above, and only when the internet switch allows it: after you agree, in its "ask" position, or without asking once you've turned it fully on. The connector stores nothing and sends no account, key or cookie. The only things Onyx stores are your name, the facts you ask it to keep and your settings (including your choice about going online), in your browser's local storage (or in memory under Node). What you tell it during a conversation stays in memory and is gone when the page closes.

The data files in `src/` are not secret and can't be: anything a web page runs can be read by whoever opens it. That is fine, because they contain no personal data, keys or passwords. Anything private belongs in a `private/` folder, which `.gitignore` keeps out of this repository.

## Licenses and credits

Onyx is MIT licensed (see [LICENSE](LICENSE)), except the dictionaries in `src/translations/` (below). The generated lexicon and the full dictionary include data from **Princeton WordNet 3.0** (WordNet 3.0 Copyright 2006 by Princeton University, all rights reserved; see [LICENSE-WORDNET](LICENSE-WORDNET)) and the **CMU Pronouncing Dictionary** (Copyright (C) 1993-2008 Carnegie Mellon University, all rights reserved; see [LICENSE-CMUDICT](LICENSE-CMUDICT)). [wordfreq](https://github.com/rspeer/wordfreq) was used to choose which words to include; none of its data is in this repository. The hand-written Spanish and French translations, the phrasebook and the sentence grammar, the Spanish and French conversation, the code for every task, and 2,346 example sentences were written for Onyx.

The 31 dictionaries in `src/translations/` come from the **Open Multilingual Wordnet 1.4** and, for German, **OdeNet**. **Each file is derived from its language's wordnet and is distributed under that wordnet's license, not under MIT**; the [table above](#dictionaries-for-31-languages) names each one, every file says so at its top, and [`licenses/`](licenses) has each license with the wordnet's citation. Several are share-alike (CC BY-SA), and the French one, from **WOLF, the Wordnet Libre du Français** (Sagot and Fišer, 2008), is under CeCILL-C. The Spanish, Catalan, Galician and Basque come from the **Multilingual Central Repository 3.0** (Gonzalez-Agirre, Laparra and Rigau, 2012), under CC BY 3.0. The rest of Onyx is not affected by these licenses: leave a file out and that language is simply not there. The hand-written German core and the everyday phrases in `src/onyx-tongues.js` were written for Onyx. The prediction network learned only from Onyx's own text.

What Onyx looks up online comes from [Wikipedia](https://www.wikipedia.org/) (text under CC BY-SA 4.0), [Open-Meteo](https://open-meteo.com/) (weather data under CC BY 4.0) and the [Free Dictionary API](https://dictionaryapi.dev/) (Wiktionary text under CC BY-SA 3.0). Onyx names the source and links to it in every reply that uses them. The recorded answers in `test/fixtures` are test data from the same services, under the same licenses.

## Version

**Onyx 3** (2026-11-11): a mind that plans each message as one step or several, lets a step use the result of the one before, and returns its thinking and a confidence with every reply; dictionaries for 31 languages besides English, 594,242 translations, each under its wordnet's license; essays, stories, emails, letters, speeches and product descriptions written from a prompt; programs composed from a description in Python, JavaScript, Rust, C, C# and C++, web pages from named sections and HTTP requests from their parts, all checked by compiling and running them; documents that can be read and questioned; quizzes, unit conversion, dates and sums of runs of numbers; follow-ups on the last result (translate it, shorter, longer, more formal, explain it, read it aloud); the internet setting as a switch; and a new look, with an app that opens on its bands parting. Held-out accuracy 97.8% (91 of 93), unchanged.

**Onyx 2.5** (2026-11-09): all of WordNet 3.0 behind the everyday dictionary (147,561 words in all), and 70 newer words written for Onyx; translation of simple sentences both ways, a phrasebook, and Spanish and French for tens of thousands of words from the Open Multilingual Wordnet; a second neural network, which predicts the next word as you type; and small programs in Python, JavaScript, Rust, C, C#, C++, HTML and HTTP, every one compiled and run by a checker. Held-out accuracy is 97.8% (Onyx 2.1: 96.8%). Onyx 2.1 is on the [`onyx-2.1`](../../tree/onyx-2.1) branch.

**Onyx 2.1** (2026-11-07): the internet, with permission: research briefs, answers and the news from Wikipedia in English, Spanish and French, weather from Open-Meteo, and definitions from the Free Dictionary API, through the new `host/net.js` connector. Onyx asks before every lookup until you say "always", and "stay offline" keeps it offline. Also new: short pieces of writing (haiku, rhyming poems, acrostics, stories, messages for 17 occasions, descriptions and summaries). Held-out accuracy is 96.8% (Onyx 2: 98.9%). Onyx 2 is on the [`onyx-2.0`](../../tree/onyx-2.0) branch.

**Onyx 2** (2026-11-06): a dictionary of 14,390 words (up from 3,035), with pronunciations, rhymes, and what kind of thing each noun is, which Onyx reasons with ("is a whale a mammal?"); Spanish and French, with 3,536 words translated; a small neural network with open weights that votes with the phrase matcher (held-out accuracy 98.9%, up from 96.8%); replies to several things in one message; a memory of the whole conversation; faster replies; and fixes to replies built from what people say. Onyx 1.3 is on the [`onyx-1.3`](../../tree/onyx-1.3) branch.

**Onyx 1.3** (2026-10-24): a dictionary of 3,035 words (up from 255); replies built from what people tell Onyx; follow-ups that read an answer against the question Onyx asked; and settings for tone, questions, tips, names and the replies themselves.

**Onyx 1.2** (2026-10-24): much more math, a mini dictionary of 255 words with word forms, synonyms and opposites, sentences made from it, more greetings and "what's up" replies, and a prepared internet port that stays off.

**Onyx 1.1** (2026-10-22): math of its own, word tricks, and a bigger vocabulary.

**Onyx 1** (2026-10-22): the first release, as shipped in OmniTool.

---

Made with love by **GK Labs** (gksonlabs), Austin, TX.
