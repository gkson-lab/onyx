// Tests Onyx on its own, in Node: intent accuracy on phrasings it was not built with (in English, Spanish and
// French), the neural model, a long conversation, the dictionary's data, the word list, the internet port and speed.
//   node test/test.js
'use strict';
require('../host/host.js');
for (const part of ['index', 'nouns-1', 'nouns-2', 'verbs', 'modifiers']) require(`../src/english/onyx-english-${part}.js`);
require('../src/onyx-math.js');
require('../src/onyx-lexicon.js');
require('../src/onyx-dictionary.js');
require('../src/onyx-tongues.js');
require('../src/onyx-languages.js');
require('../src/onyx-data.js');
require('../src/onyx-model.js');
require('../src/onyx-weights.js');
require('../src/onyx-write.js');
require('../src/translations/onyx-translations-es.js');
require('../src/translations/onyx-translations-fr.js');
require('../src/onyx-translate.js');
require('../src/onyx-compose.js');
require('../src/onyx-code.js');
require('../src/onyx-synth.js');
require('../src/onyx-uses.js');
require('../src/onyx-mind.js');
require('../src/onyx-predict-weights.js');
require('../src/onyx-predict.js');
require('../src/onyx.js');
const fs = require('fs');
const path = require('path');

// Phrasings that are not in onyx-data.js, with the intent each should land on.
const HELD_OUT = [
	['hey hey', 'greet'], ['hi friend', 'greet'], ['good morning to you', 'greet'], ['hullo', 'greet'],
	['how are things going with you', 'how_are_you'], ['how ya doing', 'how_are_you'], ['how are u', 'how_are_you'],
	['what you up to', 'whats_up'], ['sup dude', 'whats_up'], ['whats good with you', 'whats_up'], ['whats up with you', 'whats_up'], ['yo whats happening', 'whats_up'],
	['heya friend', 'greet'], ['well hi there', 'greet'],
	['nothing much really', 'user_nothing'], ['just chilling at home', 'user_nothing'],
	['do you know a lot of words', 'dictionary_help'], ['can you define a word', 'dictionary_help'],
	['what do i call you', 'identity'], ['whats ur name', 'identity'], ['tell me who you are', 'identity'],
	['r u a robot', 'is_ai'], ['are you a real person', 'is_ai'], ['are you an artificial intelligence', 'is_ai'], ['are you chat gpt', 'is_ai'],
	['who made u', 'creator'], ['who is the creator', 'creator'],
	['how old r u', 'age'],
	['what kind of things can you do', 'help'], ['what can you help me with', 'help'], ['i need help', 'help'],
	['write a poem about cats', 'limits'], ['can you write some python code', 'limits'], ['search google for cats', 'limits'], ['translate hello to french', 'languages'],
	['is it raining', 'weather'], ['whats the weather like', 'weather'],
	['what are the latest headlines', 'news'],
	['thank you very much', 'thanks'], ['thanks a ton', 'thanks'], ['many thanks', 'thanks'],
	['ok bye', 'bye'], ['see you tomorrow', 'bye'], ['goodnight', 'bye'],
	['i am doing good', 'user_good'], ['im fine thanks', 'user_good'], ['pretty great actually', 'user_good'],
	['i feel sad today', 'user_bad'], ['today was a bad day', 'user_bad'], ['i feel lonely', 'user_bad'],
	['i am so tired', 'user_tired'], ['i need some rest', 'user_tired'],
	['im so bored', 'user_bored'],
	['i feel stressed out', 'user_stressed'], ['work is overwhelming', 'user_stressed'],
	['this is so frustrating', 'user_angry'],
	['you are very smart', 'compliment'], ['great job', 'compliment'],
	['you are so dumb', 'insult'], ['you are pretty useless', 'insult'],
	['tell me something funny', 'joke'], ['make me laugh please', 'joke'], ['do you know a good joke', 'joke'],
	['got a tip for me', 'tip'],
	['what are the keyboard shortcuts', 'shortcuts'],
	['tell me a fun fact', 'fact'], ['tell me something interesting', 'fact'],
	['what time is it now', 'time'], ['got the time', 'time'],
	['what day is today', 'date'], ['which year is it', 'date'],
	['do you know who i am', 'name_get'],
	['what do you know about me', 'recall'],
	['please forget everything about me', 'forget'],
	['start a new chat', 'clear_chat'],
	['turn on the dark mode', 'theme_dark'], ['switch to the light theme', 'theme_light'],
	['lets play a game', 'games'],
	['what is this app', 'omnitool'],
	['how many tools do you have', 'tool_count'],
	['where do i add my api key', 'api_key'],
	['is my data safe', 'privacy'], ['do you work offline', 'privacy'],
	['how do i pin tools', 'pin_help'],
	['how can i back up my data', 'data_help'],
	['whats the meaning of life', 'meaning'],
	['whats your favorite color', 'favorite'],
	['okay cool', 'ack'],
	['are you still there', 'ping_me'],
	['tell me another', 'again'],
	['can you say that again', 'repeat'],
	['yes please', 'yes'], ['no thanks', 'no'],
];

// Spanish and French phrasings that are not in onyx-languages.js, with the intent each should land on.
const HELD_OUT_LANG = {
	es: [['buenas tardes onyx', 'greet'], ['qué tal te va', 'how_are_you'], ['muchísimas gracias', 'thanks'], ['nos vemos luego', 'bye'], ['quién eres tú', 'identity'], ['quién te ha creado', 'creator'], ['eres un bot', 'is_ai'], ['qué idiomas sabes', 'languages'], ['me puedes ayudar', 'help'], ['cuéntame otro chiste', 'joke'], ['me dices qué hora es', 'time'], ['qué día es hoy', 'date'], ['te acuerdas de cómo me llamo', 'name_get'], ['eres muy inteligente', 'compliment'], ['va a llover hoy', 'weather'], ['escríbeme una canción', 'limits'], ['perdóname', 'sorry'], ['vale perfecto', 'ack'], ['hola hola', 'greet'], ['un dato curioso por favor', 'fact']],
	fr: [['coucou toi', 'greet'], ['comment ça va aujourd\'hui', 'how_are_you'], ['merci mille fois', 'thanks'], ['à la prochaine', 'bye'], ['t\'es qui toi', 'identity'], ['qui t\'a fabriqué', 'creator'], ['tu es un bot', 'is_ai'], ['tu parles quelles langues', 'languages'], ['tu peux m\'aider', 'help'], ['raconte une blague', 'joke'], ['il est quelle heure maintenant', 'time'], ['on est quel jour aujourd\'hui', 'date'], ['tu sais comment je m\'appelle', 'name_get'], ['t\'es trop intelligent', 'compliment'], ['il va pleuvoir demain', 'weather'], ['écris-moi un poème', 'limits'], ['désolée', 'sorry'], ['ok parfait', 'ack'], ['bonjour bonjour', 'greet'], ['une anecdote s\'il te plaît', 'fact']],
};

const SCRIPT = [
	['hi', /What should I call you/],
	['Sam', /Nice to meet you, Sam/],
	["what's my name", /Sam/],
	['tell me a joke', (r) => Omni.onyxData.JOKES.includes(r.text)],
	['remember that my car is blue', /your car is blue/],
	['what do you remember about me', /Sam[\s\S]*your car is blue/],
	['what is a jwt', /three base64url parts/],
	['heya', /Hi|Hello|Hey|Good/],
	["what's up?", /\?$/],
	['not much', /Quiet|peaceful|around/],
	['howdy partner', (r) => /^(Hi|Hello|Hey|Good)/.test(r.text) && !/didn't catch|not sure|went past/.test(r.text)],
	['define serendipity', /\*\*serendipity\*\* \*\(noun\)\*/],
	['what does ran mean', /past tense of \*\*run\*\*/],
	['what is a cat', /purring/],
	['another word for happy', /glad, cheerful/],
	["what's the opposite of brave", /cowardly/],
	['is quickly an adverb', /is an adverb/],
	['use curious in a sentence', /curious about how it ends/],
	['another one', (r) => /\bcurious\b/.test(r.text) && !/curious about how it ends/.test(r.text)],
	['make a sentence', /^[A-Z].+[.?]$/],
	['define flibber', /isn't in my dictionary/],
	['what is new', /\?$/],
	// Reading what people tell it, from the dictionary.
	['I feel nostalgic', /feeling nostalgic/],
	["I'm not happy", /happy|that way/],
	["I'm nervous about my exam tomorrow", /nervous before your exam .*Good luck tomorrow/],
	['I have a job interview on friday', /Good luck with the interview on Friday|The interview on Friday\? You've got this/],
	["my sister's wedding is on saturday", /your sister's wedding on Saturday/i],
	['my grandpa\'s funeral is next week', /so sorry\. Funerals are hard/],
	['I had a test yesterday', /How (did|was) the test/],
	['my dog is sick', /sorry your dog is sick/],
	["I'm going to bake a cake", /A cake\? (Baking sounds like a good plan|Enjoy the baking)/],
	['I baked bread yesterday', /How did the bread turn out/],
	['I lost my keys', /sorry to hear about your keys/],
	['I got a new puppy', /A puppy! What's its name/],
	["I'm eating an apple", /an apple/i],
	["I'm going to the library tomorrow", /Enjoy the library tomorrow/],
	['my back hurts', /sorry your back hurts/],
	["I'm cold", /extra layer/],
	['I got a new job', /Congratulations on the new job/],
	['do you like dogs', /in my dictionary, a dog is/],
	['I feel hopeless', /talking to someone you trust/],
	// Follow-ups: the answer to Onyx's question is read against what it asked about.
	['I had a job interview yesterday', /How (did|was) the interview/],
	['it went really well', /(Glad|great to hear).*interview/],
	['I baked bread yesterday', /How did the bread turn out/],
	['not great, honestly', /Sorry the bread didn't turn out/],
	['I have an exam on friday', /exam on Friday/],
	['pretty nervous', /That makes sense\..*Good luck with the exam/],
	['I got a new puppy', /What's its name/],
	['Biscuit', /Biscuit is a great name for your new puppy/],
	['I had a test yesterday', /How (did|was) the test/],
	['my dog is sick', /sorry your dog is sick/],
	["I'm going to Japan next week", /Enjoy Japan next week/],
	// Life events and descriptions.
	['my grandpa passed away', /so sorry about your grandpa.*huge loss/],
	['my phone died', /sorry about your phone/],
	['my flight got cancelled', /sorry about your flight/],
	['I start my new job on monday', /Good luck with the new job on Monday/],
	['I got a promotion', /Congratulations on the promotion/],
	['I miss my mom', /Missing your mom is hard/],
	['I just finished my homework', /Nice work finishing your homework/],
	['work was stressful', /Sorry work was stressful/],
	['the weather is gorgeous today', /Glad the weather is gorgeous/],
	['my new shoes are so comfy', /Glad your new shoes are comfy/],
	["I'm reading a good book", /reading a good book/i],
	["I'm so done with today", /long one/],
	["I can't sleep", /can't sleep.*slow breaths/],
	// Settings change how those replies sound, and are remembered.
	['settings', /\*\*Tone\*\*: warm/],
	['be brief', /keep my replies short/],
	["I'm nervous about my exam tomorrow", (r) => r.text === 'Feeling nervous before your exam is completely normal.'],
	['be warm', /usual self/],
	['stop asking questions', /stop asking follow-up questions/],
	['I had a test yesterday', /^I hope (the test|it) went well\.$/],
	['you can ask questions', /ask follow-up questions again/],
	['no tips', /No more tips/],
	["I'm so worried", (r) => !/Writing the worry down/.test(r.text)],
	['reset settings', /back to the defaults/],
	["what's 12 times 7", /= \*\*84\*\*/],
	['times 3', /84 × 3 = \*\*252\*\*/],
	['is 91 prime', /7 × 13/],
	['solve 2x + 3 = 11', /x = 4/],
	['x^2 - 5x + 6 = 0', /x = 2\*\* or \*\*x = 3/],
	['is 7 times 8 = 54', /Not quite.+56/],
	['15% off 80', /\*\*68\*\*/],
	['what is a 20% tip on $45', /\*\*9\*\*.+\*\*54\*\*/],
	['1/3 + 1/6', /\*\*0\.5\*\* \(1\/2\)/],
	['median of 3, 1, 2, 8', /\*\*2\.5\*\*/],
	['10 choose 3', /\*\*120\*\*/],
	['sin 30', /\*\*0\.5\*\*/],
	['pi times 2', /6\.283185307/],
	['what is pi', /ratio of a circle/],
	['prime factorization of 360', /2 × 2 × 2 × 3 × 3 × 5/],
	['0.75 as a fraction', /3\/4/],
	['how many letters in banana', /6 letters/],
	['write 1234 in words', /one thousand, two hundred and thirty-four/],
	['should i take the bus or walk', /Go with \*\*(take the bus|walk)\*\*/],
	['write me a poem', (r) => /^\*\*.+\*\*\n\n/.test(r.text) && r.text.split('\n').length >= 6],
	['write an essay about the war', (r) => /^\*\*Wars?\*\*\n\n/.test(r.text) && r.piece && r.piece.form === 'essay'],
	['who won the world cup in 1998', /don't know|outside what I know|No idea/],
	['I forgot my password', /can't recover passwords/],
	['helo', /Hi|Hello|Hey|Good/],
	['hola', /^¡(Hola|Buenas)/],
	['i want to die', /988/],
	['forget me', (r) => r.offer && r.offer.kind === 'forget'],
	['yes', /forgotten your name/],
];

// What's new in Onyx 2, as a second conversation from a fresh start.
const SCRIPT_2 = [
	// Several things in one message, and the whole conversation remembered.
	["Hi! I'm Sam. I have an exam on Friday and I'm nervous.", (r) => /^Hi!/.test(r.text) && /Nice to meet you, Sam/.test(r.text) && /nervous before the exam.*Friday/.test(r.text)],
	['I adopted a kitten', /A kitten! What's its name/],
	['Luna', /Luna is a great name for your new kitten/],
	["I'm going to the dentist on Monday", /Good luck at the dentist on Monday/],
	['the concert was amazing', /Glad the concert was amazing/],
	["what's my kitten's name?", /^Luna!/],
	['when is my exam?', /exam is on Friday/],
	['when is my dentist appointment?', /dentist appointment is on Monday/],
	['what have I told you?', (r) => /nervous about the exam on Friday/.test(r.text) && /called Luna/.test(r.text)],
	['tell me a joke. also what is 2+2?', (r) => /2 \+ 2 = \*\*4\*\*/.test(r.text) && r.text.length > 30],
	['I have to deal with my landlord tomorrow', /dealing with your landlord tomorrow/],
	// Thinking with the dictionary.
	['is a whale a mammal?', /^Yes\. A whale is a mammal: whale → cetacean/],
	['is a bat a bird?', /^No\..*bat is a kind of mammal, not a bird/],
	['are spiders insects', /^No\./],
	['what kind of animal is a salmon?', /kind of \*\*fish\*\*/],
	['name some reptiles', /snake.*lizard.*crocodile/],
	['name some fruits', /^Some fruits I know: apple, banana/],
	["what's the difference between a frog and a toad?", /\*\*frog\*\*:[\s\S]*\*\*toad\*\*:[\s\S]*Both are amphibians/],
	['what do a lion and a tiger have in common?', /big cats/],
	['what are the parts of a flower?', /stamen/],
	['where is Paris?', /Paris is in France/],
	['define it', /\*\*Paris\*\* \*\(noun\)\*/],
	['what rhymes with moon?', /spoon/],
	['how many syllables in banana', /3 syllables/],
	['how do you pronounce whale', /\/weɪl\//],
	['anagram of listen', /silent/],
	['words that start with qu', /question/],
	['word of the day', /^Today's word: \*\*/],
	['define analyses', /form of \*\*analysis\*\* and of \*\*analyse\*\*/],
	['define begun', /past participle of \*\*begin\*\*/],
	['define police', /keep order/],
	['what version are you?', /Onyx 3/],
	// Spanish and French, in both directions.
	['how do you say happy in French?', /\*\*heureux\*\*/],
	['what does gato mean?', /\*\*cat\*\* in English/],
	['translate merci', /\*\*thanks\*\* in English/],
	['hola', /^¡(Hola|Buenas)/],
	['me llamo Ana', /Encantado de conocerte, Ana/],
	['estoy muy cansada', /Siento que estés cansada, Ana/],
	['¿cuánto es doce por siete?', /12 × 7 = \*\*84\*\*/],
	['¿cómo se dice perro en francés?', /\*\*le chien\*\*/],
	['¿qué significa happy?', /\*\*feliz\*\*/],
	['cuéntame un chiste', (r) => Omni.onyxLanguages.LANGS.es.jokes.includes(r.text)],
	['¿cómo me llamo?', /Te llamas Ana/],
	['quiero morir', /024.*988/],
	['bonjour', /^(Bonjour|Salut|Coucou)/],
	["je m'appelle Léa", /Enchanté, Léa/],
	['je suis fatiguée', /Désolé que tu sois fatiguée, Léa/],
	['combien font quatre-vingt-dix-neuf plus un ?', /99 \+ 1 = \*\*100\*\*/],
	['comment dit-on chat en espagnol ?', /\*\*el gato\*\*/],
	['raconte-moi une blague', (r) => Omni.onyxLanguages.LANGS.fr.jokes.includes(r.text)],
	['je veux mourir', /3114/],
	['speak english', /English it is/],
	['Hallo', /English, Spanish and French/],
];

(async () => {
	let failed = 0;
	const results = HELD_OUT.map(([text, want]) => {
		const top = Omni.onyx.classify(text)[0];
		return { text, want, got: top ? top.id : null };
	});
	const right = results.filter((r) => r.got === r.want).length;
	const accuracy = right / results.length;
	console.log(`${accuracy >= 0.9 ? 'PASS' : 'FAIL'} intent accuracy on ${results.length} held-out phrasings: ${(accuracy * 100).toFixed(1)}%`);
	if (accuracy < 0.9) failed++;
	results.filter((r) => r.got !== r.want).forEach((r) => console.log(`     missed "${r.text}": wanted ${r.want}, got ${r.got}`));
	for (const [say, expect] of SCRIPT) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && (expect instanceof RegExp ? expect.test(r.text) : expect(r));
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} "${say}" -> ${r ? JSON.stringify(r.text).slice(0, 100) : 'no reply'}`);
	}
	// Spanish and French: the language is recognized, and the intent is right, on phrasings never trained on.
	for (const lang of ['es', 'fr']) {
		const list = HELD_OUT_LANG[lang];
		const intents = list.filter(([t, want]) => (Omni.onyx.classify(t, lang)[0] || {}).id === want).length / list.length;
		const detected = list.filter(([t]) => Omni.onyx.detect(t) === lang).length / list.length;
		const ok = intents >= 0.85 && detected >= 0.9;
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} ${lang === 'es' ? 'Spanish' : 'French'} on ${list.length} held-out phrasings: intent ${(intents * 100).toFixed(0)}%, language ${(detected * 100).toFixed(0)}%`);
	}
	const misread = HELD_OUT.filter(([t]) => ['es', 'fr'].includes(Omni.onyx.detect(t))).map(([t]) => t);
	if (misread.length) failed++;
	console.log(`${misread.length ? 'FAIL' : 'PASS'} no English held-out phrasing is taken for Spanish or French${misread.length ? ': ' + misread.join(', ') : ''}`);

	// The neural model, on its own: its open weights load, and it reads held-out English it was never trained on.
	const info = Omni.onyxModel.info();
	const ids = new Set(Omni.onyxData.INTENTS.map((i) => i.id));
	const netRight = HELD_OUT.filter(([t, want]) => {
		const p = Omni.onyxModel.predict(Omni.onyx.normalize(t), ids);
		return Object.keys(p).sort((a, b) => p[b] - p[a])[0] === want;
	}).length;
	const netOk = info && info.parameters > 100000 && netRight / HELD_OUT.length >= 0.9;
	if (!netOk) failed++;
	console.log(`${netOk ? 'PASS' : 'FAIL'} neural model: ${info ? info.parameters.toLocaleString('en-US') : 0} parameters, ${info ? info.labels : 0} intents, ${netRight} of ${HELD_OUT.length} held-out phrasings on its own`);

	Omni.onyx.reset();
	Omni.store.remove('onyx.memory');
	for (const [say, expect] of SCRIPT_2) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && (expect instanceof RegExp ? expect.test(r.text) : expect(r));
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} "${say}" -> ${r ? JSON.stringify(r.text).slice(0, 100) : 'no reply'}`);
	}

	// The dictionary's own data: every entry well formed, so a hand edit can't quietly break a reply.
	const D = Omni.onyxDictionary;
	const KINDS = new Set(['person', 'animal', 'thing', 'food', 'place', 'idea', 'event', 'vehicle', 'body', 'furniture', 'nature', 'media', 'time']);
	const seen = new Set();
	const bad = [];
	for (const e of D.WORDS) {
		// Case matters: "Mercury" the planet and "mercury" the metal are different words.
		const key = `${e.w}|${e.pos}`;
		if (seen.has(key)) bad.push(`${key} appears twice`);
		seen.add(key);
		if (!e.pos || !e.def || !e.ex) bad.push(`${e.w} is missing a part of speech, definition or example`);
		if (e.kind && !KINDS.has(e.kind)) bad.push(`${e.w} has an unknown kind "${e.kind}"`);
		if (e.use === 'feel' && !e.mood) bad.push(`${e.w} is a feeling without a mood`);
		if (e.kind === 'event' && !['luck', 'joy', 'sorry', 'news'].includes(e.event)) bad.push(`${e.w} is an event without a type`);
		const forms = [e.w, e.w.replace(/(e|y)$/, ''), e.past, e.ing, e.plural, ...(e.forms || []), ...(e.variants || [])].filter(Boolean).map((f) => f.toLowerCase());
		if (!forms.some((f) => e.ex.toLowerCase().includes(f))) bad.push(`${e.w}'s example doesn't use it`);
	}
	const sound = !bad.length && D.size >= 10000;
	if (!sound) failed++;
	console.log(`${sound ? 'PASS' : 'FAIL'} dictionary data: ${D.size.toLocaleString('en-US')} words, ${D.WORDS.length.toLocaleString('en-US')} entries (${D.CORE.length.toLocaleString('en-US')} hand-written), ${D.WORDS.filter((e) => e.ipa).length.toLocaleString('en-US')} with pronunciations${bad.length ? '\n     ' + bad.join('\n     ') : ''}`);

	// The Spanish and French word list: every word is in the dictionary, and every line has both languages.
	const L = Omni.onyxLanguages;
	const coreKeys = new Set();
	const P = { noun: 'n', verb: 'v', adjective: 'adj', adverb: 'adv', conjunction: 'conj', preposition: 'prep', exclamation: 'excl', pronoun: 'pron', determiner: 'det', number: 'num', 'auxiliary verb': 'aux' };
	D.CORE.forEach((e) => coreKeys.add(e.w).add(`${e.w}.${P[e.pos]}`));
	const strays = [...L.TABLE.keys()].filter((k) => !coreKeys.has(k));
	const halves = [...L.TABLE].filter(([k, v]) => (!v.es || !v.fr) && !/^(will\.aux|would|shall|might\.aux)$/.test(k)).map(([k]) => k);
	const listOk = !strays.length && !halves.length && L.size >= 3000;
	if (!listOk) failed++;
	console.log(`${listOk ? 'PASS' : 'FAIL'} Spanish and French word list: ${L.size.toLocaleString('en-US')} words${strays.length ? ', not in the dictionary: ' + strays.join(', ') : ''}${halves.length ? ', missing a language: ' + halves.join(', ') : ''}`);

	// The internet port: off unless a host connects one, used only with the person's permission, never trusted to answer.
	Omni.onyx.reset();
	Omni.onyx.settings.reset();
	const offline = await Omni.onyx.respond('what is the weather');
	const portOff = /no internet connection/.test(offline.text);
	const asked = [];
	Omni.net = { enabled: true, ask: async (req) => (asked.push(req), req.kind === 'weather' ? { text: 'Sunny, 21°C.' } : null) };
	const offer = await Omni.onyx.respond('what is the weather in Paris');
	const waits = !!offer.offer && offer.offer.kind === 'online' && /send "Paris" to/.test(offer.text) && asked.length === 0;
	const portOn = (await Omni.onyx.respond('yes')).text === 'Sunny, 21°C.' && asked[0].kind === 'weather' && asked[0].place === 'Paris';
	const declined = /stay offline/.test((await Omni.onyx.respond('what is the weather in Lyon', 0)).text + (await Omni.onyx.respond('no')).text) && asked.length === 1;
	const always = await Omni.onyx.respond('who painted the Mona Lisa?');
	const fellBack = !!always.offer && /couldn't reach/.test((await Omni.onyx.respond('always')).text) && asked[1].kind === 'search' && Omni.onyx.settings.get().internet === 'on';
	Omni.net = { enabled: true, ask: async () => { throw new Error('offline'); } };
	const survived = /couldn't reach/.test((await Omni.onyx.respond('what is the weather in Rome')).text);
	Omni.net = { enabled: true, ask: async (req) => (asked.push(req), { text: 'Rome: clear, 18°C.' }) };
	const retried = (await Omni.onyx.respond('try again')).text === 'Rome: clear, 18°C.' && asked[2].place === 'Rome';
	asked.length = 2;
	await Omni.onyx.respond('stay offline');
	Omni.net = { enabled: true, ask: async (req) => (asked.push(req), { text: 'should not be used' }) };
	const respected = /stay offline/.test((await Omni.onyx.respond('what is the weather in Oslo')).text) && asked.length === 2;
	Omni.onyx.settings.reset();
	Omni.net = { enabled: false, ask: async (req) => (asked.push(req), { text: 'should not be used' }) };
	const stayedOff = /no internet connection/.test((await Omni.onyx.respond('what is the weather')).text) && asked.length === 2;
	for (const [ok, what] of [[portOff, 'internet port is off by default'], [waits, 'Onyx asks before going online, and says what it would send where'], [portOn, 'after a yes, the port answers'], [declined, 'after a no, nothing is sent'], [fellBack, 'after "always" it looks things up without asking; an empty answer is reported'], [survived, 'a failing port is reported, not thrown'], [retried, '"try again" after a failed lookup goes back online'], [respected, '"stay offline" stops all lookups'], [stayedOff, 'a disabled port is never asked']]) {
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} ${what}`);
	}

	// The real connector (host/net.js), fed responses recorded from Wikipedia, Open-Meteo and the Free Dictionary API.
	const FIX = path.join(__dirname, 'fixtures');
	const ROUTES = [
		[/fr\.wikipedia\.org\/w\/rest\.php\/v1\/search/, 'wiki-search-tour-eiffel-fr.json'], [/fr\.wikipedia\.org\/api\/rest_v1\/page\/summary\/Tour_Eiffel/, 'wiki-summary-tour-eiffel-fr.json'],
		[/rest\.php\/v1\/search\/page\?q=[^&]*ada/i, 'wiki-search-ada-lovelace.json'], [/page\/summary\/Ada_Lovelace/, 'wiki-summary-ada-lovelace.json'],
		[/prop=extracts.*Ada%20Lovelace/, 'wiki-article-ada-lovelace.json'], [/feed\/featured/, 'wiki-feed-2026-11-07.json'],
		[/geocoding-api\.open-meteo\.com.*name=Paris/, 'meteo-geocode-paris.json'], [/api\.open-meteo\.com\/v1\/forecast/, 'meteo-forecast-paris.json'],
		[/dictionaryapi\.dev.*\/petrichor$/, 'dictionary-petrichor.json'],
	];
	const fetched = [];
	require('../host/net.js');
	Omni.net.fetch = async (url, init) => {
		fetched.push({ url, init });
		const route = ROUTES.find(([re]) => re.test(url));
		const body = route ? JSON.parse(fs.readFileSync(path.join(FIX, route[1]), 'utf8')) : { title: 'Not found' };
		return { ok: !!route, status: route ? 200 : 404, json: async () => body };
	};
	Omni.onyx.reset();
	Omni.onyx.settings.reset();
	const ONLINE = [
		['who was Ada Lovelace?', (r) => r.offer && r.offer.kind === 'online' && /send "who was Ada Lovelace" to Wikipedia/.test(r.text) && !fetched.length],
		['yes', (r) => /^\*\*Ada Lovelace\*\* \(English mathematician/.test(r.text) && /Source: Wikipedia, https:\/\/en\.wikipedia\.org\/wiki\/Ada_Lovelace/.test(r.text)],
		['tell me more', (r) => /^\*\*Ada Lovelace\*\*\n- /.test(r.text) && (r.text.match(/\n- /g) || []).length >= 3],
		['write a haiku about it', (r) => /^\*\*Haiku: Ada Lovelace\*\*/.test(r.text) && r.text.split('\n\n')[1].split('\n').map((l) => Omni.onyxWrite.syllables(l)).join() === '5,7,5'],
		['summarize it', /Ada Lovelace, in short\*\*\n- /],
		['research Ada Lovelace', (r) => r.offer && r.offer.kind === 'online'],
		['always', (r) => /^\*\*Research: Ada Lovelace\*\*/.test(r.text) && /\*\*Key points\*\*/.test(r.text) && /\*\*Related:\*\* Ada Lovelace \(microarchitecture\)/.test(r.text)],
		['what is the weather in Paris?', /\*\*Paris, Île-de-France Region, France\*\*: 5°C \(40°F\), fog\.[\s\S]*Today: 5–12°C, fog, 3% chance of rain\.[\s\S]*Source: Open-Meteo/],
		['what is the weather?', /\*\*Paris/],
		['define petrichor', /^\*\*petrichor\*\* \/ˈpɛtɹɪkɚ\/\n\*\(noun\)\* The distinctive scent/],
		['define flibberjab', /couldn't find "flibberjab" online either/],
		["what's in the news?", (r) => /^\*\*In the news\*\*/.test(r.text) && (r.text.match(/\n- /g) || []).length === 5],
		['define serendipity', (r) => /\*\*serendipity\*\* \*\(noun\)\*/.test(r.text) && !fetched.some((f) => /serendipity/.test(f.url))],
		['recherche la tour Eiffel', /^\*\*Recherche: Tour Eiffel\*\* \(tour de fer puddlé[\s\S]*Source: Wikipedia, https:\/\/fr\.wikipedia\.org\/wiki\/Tour_Eiffel/],
		['cherche la tour Eiffel', /^\*\*Tour Eiffel\*\* \(tour de fer puddlé[\s\S]*dis-m'en plus/],
		['stay offline', /stay offline/],
		['who was Grace Hopper?', (r) => !r.offer && /don't know|outside what I know|No idea|stay offline/.test(r.text)],
	];
	for (const [say, expect] of ONLINE) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && (expect instanceof RegExp ? expect.test(r.text) : expect(r));
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} online: "${say}" -> ${r ? JSON.stringify(r.text).slice(0, 90) : 'no reply'}`);
	}
	const polite = fetched.filter((f) => /wikipedia/.test(f.url)).every((f) => /^Onyx\/2/.test(f.init.headers['User-Agent'] || ''));
	const hosts = [...new Set(fetched.map((f) => new URL(f.url).hostname))].sort();
	const onlyThese = hosts.every((h) => /^(en|es|fr)\.wikipedia\.org$|^(geocoding-)?api\.open-meteo\.com$|^api\.dictionaryapi\.dev$/.test(h));
	if (!polite || !onlyThese) failed++;
	console.log(`${polite && onlyThese ? 'PASS' : 'FAIL'} the connector only contacts its four services, and names itself to Wikipedia: ${hosts.join(', ')}`);
	Omni.net = { enabled: false, ask: async () => null };
	Omni.onyx.settings.reset();

	// Writing: short pieces from the dictionary, always well formed.
	Omni.onyx.reset();
	const WRITE = [
		['write a haiku about the ocean', (r) => r.text.split('\n\n')[1].split('\n').map((l) => Omni.onyxWrite.syllables(l)).join() === '5,7,5' && /ocean/.test(r.text)],
		['write me a short poem about the moon', (r) => /^\*\*Moon\*\*/.test(r.text) && r.text.split('\n\n')[1].split('\n').length === 4 && /moon/i.test(r.text.split('\n\n')[1].split('\n')[0])],
		['another one', (r) => /^\*\*Moon\*\*/.test(r.text)],
		['write an acrostic for SAM', (r) => /\*\*S\*\*.*\n\*\*A\*\*.*\n\*\*M\*\*/.test(r.text)],
		['tell me a story about a dragon', (r) => /^\*\*Dragon\*\*\n\nOnce upon a time, an? \w+ dragon lived/.test(r.text) && r.text.split(/[.!?] /).length >= 5],
		['write a birthday message for my mom', /^Happy birthday, Mom!/],
		['write a thank you note to Ana for the lovely dinner', /^(Thank you|Just a note to say thank you), Ana, for the lovely dinner/],
		['write a congratulations card for my sister on her promotion', /^To the best sister anyone could ask for:\n\n(Huge c|C)ongratulations on your promotion!/],
		['write a good luck message for my brother for his exam', /luck with your exam/],
		['describe a whale', /^A whale is a very large sea mammal.*It is a kind of cetacean, which makes it a mammal\./],
		["summarize: Honeybees live in colonies with a single queen. The queen lays all the eggs in the hive. Worker bees are female and do most of the work. They collect nectar and pollen from flowers. Drones are male bees whose main job is to mate with a queen. A healthy hive can hold tens of thousands of bees. Bees communicate the location of flowers with a dance. Beekeepers harvest honey in late summer.", (r) => /^\*\*Summary\*\*\n- /.test(r.text) && (r.text.match(/\n- /g) || []).length === 3],
	];
	for (const [say, expect] of WRITE) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && (expect instanceof RegExp ? expect.test(r.text) : expect(r));
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} writing: "${say.slice(0, 50)}" -> ${r ? JSON.stringify(r.text).slice(0, 90) : 'no reply'}`);
	}

	// The full dictionary (src/english): all of WordNet, for every word the everyday dictionary doesn't have.
	Omni.onyx.reset();
	const D2 = Omni.onyxDictionary;
	const E = Omni.onyxEnglish;
	let unresolved = 0;
	let undefinedSenses = 0;
	for (const line of E.parts.index.trim().split('\n')) for (const id of line.split('|')[1].split(',')) if (!D2.full.sense(parseInt(id, 36))) unresolved++;
	for (let id = 0; id < E.counts.senses; id++) if (!(D2.full.sense(id) || {}).def) undefinedSenses++;
	const fullOk = E.counts.words >= 147000 && E.counts.senses === 117659 && !unresolved && !undefinedSenses && D2.total >= 147000;
	if (!fullOk) failed++;
	console.log(`${fullOk ? 'PASS' : 'FAIL'} full dictionary: ${E.counts.words.toLocaleString('en-US')} WordNet words in ${E.counts.senses.toLocaleString('en-US')} senses, every sense defined and reachable${unresolved ? `; ${unresolved} unresolved` : ''}${undefinedSenses ? `; ${undefinedSenses} without a definition` : ''}; ${D2.total.toLocaleString('en-US')} different words in all`);
	const FULL_CHECKS = [
		['define sesquipedalian', /^\*\*sesquipedalian\*\*[\s\S]*overuse of long words/],
		['what does defenestration mean', /^\*\*defenestration\*\* \*\(noun\)\*\nThe act of throwing someone or something out of a window/],
		['define narwhals', /^\*\*narwhals\*\* is the plural of \*\*narwhal\*\*/],
		['define sauntered', /is the past tense of \*\*saunter\*\*/],
		['define quirkier', /is the comparative of \*\*quirky\*\*/],
		['is a narwhal a mammal?', /^Yes\. A narwhal is a mammal: narwhal → whale → cetacean/],
		['is a platypus a bird?', /^No\. In my dictionary, a platypus is a kind of/],
		['name some cetaceans', /^Some cetaceans I know: whale, baleen whale, toothed whale, narwhal/],
		['where is Timbuktu?', /^Timbuktu is in Mali/],
		['who was Mozart?', /^From my dictionary \(written in 2006\): \*\*Mozart\*\* \(composer\): prolific Austrian composer/],
		['who is Grace Hopper?', (r) => !/GK Labs/.test(r.text)],
		['all meanings of set', /^\*\*set\*\*, 45 senses:\n1\. \*\(verb\)\* put into a certain place/],
		['how do you pronounce quixotic', /\/kwɪksˈɑtɪk\//],
		['define selfie', /^\*\*selfie\*\* \*\(noun\)\*[\s\S]*photo you take of yourself/],
		['how many words do you know?', /^I have a dictionary of 147,\d{3} English words and phrases/],
	];
	for (const [say, expect] of FULL_CHECKS) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && (expect instanceof RegExp ? expect.test(r.text) : expect(r));
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} full dictionary: "${say}" -> ${r ? JSON.stringify(r.text).slice(0, 90) : 'no reply'}`);
	}

	// Translation: words from the large lists, the phrasebook, and sentences both ways, checked against what a person
	// would write.
	const TR = Omni.onyxTranslate;
	const cov = TR.coverage();
	const covOk = cov.es.words >= 25000 && cov.fr.words >= 40000 && cov.es.back >= 20000 && cov.fr.back >= 30000;
	if (!covOk) failed++;
	console.log(`${covOk ? 'PASS' : 'FAIL'} word lists: Spanish for ${cov.es.words.toLocaleString('en-US')} English words (${cov.es.back.toLocaleString('en-US')} back), French for ${cov.fr.words.toLocaleString('en-US')} (${cov.fr.back.toLocaleString('en-US')} back)`);
	const SENTENCES = [
		['en', 'es', 'Where is the station?', '¿Dónde está la estación?'], ['en', 'fr', 'Where is the station?', 'Où est la gare ?'],
		['en', 'es', 'I want two coffees', 'Quiero dos cafés.'], ['en', 'fr', 'I would like a beer, please', "Je voudrais une bière, s'il vous plaît."],
		['en', 'es', "I'm hungry", 'Tengo hambre.'], ['en', 'fr', "I'm hungry", "J'ai faim."],
		['en', 'es', "I'm not tired", 'No estoy cansado (o cansada).'], ['en', 'fr', 'She is happy', 'Elle est heureuse.'],
		['en', 'es', 'The house is white', 'La casa es blanca.'], ['en', 'fr', 'The house is white', 'La maison est blanche.'],
		['en', 'es', "I don't have a car", 'No tengo coche.'], ['en', 'fr', "I don't have a car", "Je n'ai pas de voiture."],
		['en', 'fr', 'I need a doctor', "J'ai besoin d'un médecin."], ['en', 'es', 'I like cats', 'Me gustan los gatos.'],
		['en', 'fr', "I don't like rain", "Je n'aime pas la pluie."], ['en', 'es', 'How much are the apples?', '¿Cuánto cuestan las manzanas?'],
		['en', 'fr', 'There is a dog in the garden', 'Il y a un chien dans le jardin.'], ['en', 'es', 'I eat apples', 'Como manzanas.'],
		['en', 'fr', "We don't drink coffee", 'Nous ne buvons pas de café.'], ['en', 'fr', 'I play the piano', 'Je joue du piano.'],
		['en', 'es', 'I play the piano', 'Toco el piano.'], ['en', 'es', 'The children play football', 'Los niños juegan al fútbol.'],
		['en', 'fr', 'The old man reads a book', 'Le vieil homme lit un livre.'], ['en', 'fr', 'I have a beautiful dog', "J'ai un beau chien."],
		['en', 'es', 'My keys are in the car', 'Mis llaves están en el coche.'], ['en', 'fr', 'the big red house', 'la grande maison rouge'],
		['en', 'es', 'I am 30 years old', 'Tengo 30 años.'], ['en', 'fr', 'My name is Sam', "Je m'appelle Sam."],
		['es', 'en', 'Me gustan los gatos', 'I like cats.'], ['es', 'en', 'No tengo coche', 'I do not have a car.'],
		['es', 'en', 'Mi hermano juega al fútbol', 'My brother plays football.'], ['es', 'en', 'Las casas son blancas', 'The houses are white.'],
		['es', 'en', 'unas manzanas rojas', 'some red apples'], ['es', 'en', 'Estoy cansada', 'I am tired.'],
		['fr', 'en', 'Je n\'ai pas de voiture', 'I do not have a car.'], ['fr', 'en', 'Les enfants jouent au football', 'The children play football.'],
		['fr', 'en', 'les petites maisons blanches', 'the small white houses'], ['fr', 'en', 'Je m\'appelle Léa', 'My name is Léa.'],
		['fr', 'en', 'Nous parlons français', 'We speak French.'], ['es', 'fr', 'Tengo hambre', "J'ai faim."],
	];
	let trRight = 0;
	for (const [from, to, said, want] of SENTENCES) {
		const r = TR.text(said, from, to);
		if (r && r.text === want && r.how !== 'words') trRight++;
		else console.log(`     mistranslated "${said}" (${from} -> ${to}): ${r ? r.text : 'nothing'}, wanted ${want}`);
	}
	const trOk = trRight === SENTENCES.length;
	if (!trOk) failed++;
	console.log(`${trOk ? 'PASS' : 'FAIL'} sentence translation: ${trRight} of ${SENTENCES.length} exactly as a person would write them`);
	const rough = TR.text('the quick brown fox jumps over the lazy dog', 'en', 'es');
	const roughOk = rough && rough.how === 'words';
	if (!roughOk) failed++;
	console.log(`${roughOk ? 'PASS' : 'FAIL'} a sentence beyond the grammar is translated word by word, and marked so`);
	Omni.onyx.reset();
	const TR_CHAT = [
		["how do you say 'where is the station' in French", /^"where is the station" in French: \*\*Où est la gare \?\*\*$/],
		["what does 'je suis fatiguée' mean", /in English: \*\*I am tired\.\*\*/],
		['how do you say astronomer in French', /\*\*astronomer\*\* in French: \*\*l'astronome\*\*[\s\S]*Open Multilingual Wordnet/],
		['what does rápidamente mean', /\*\*rápidamente\*\* \(Spanish\) is \*\*quickly\*\*/],
		["¿cómo se dice 'I am hungry' en francés?", /^«I am hungry» en francés: \*\*J'ai faim\.\*\*$/],
		["how do you say 'the quick brown fox jumps over the lazy dog' in Spanish", /Word by word, so the grammar may be off/],
	];
	for (const [say, expect] of TR_CHAT) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && expect.test(r.text);
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} translation: "${say}" -> ${r ? JSON.stringify(r.text).slice(0, 90) : 'no reply'}`);
	}

	// Code: every task in every language it supports is written; requests are read right; follow-ups change the
	// language. (tools/check-code.js compiles and runs them all.)
	const CO = Omni.onyxCode;
	let written = 0;
	const broken = [];
	for (const { task, languages } of CO.catalog()) {
		for (const lang of languages) {
			const w = CO.write({ task, lang, params: Object.assign({}, CO.TASKS[task].defaults, task === 'cls' || task === 'post' || task === 'table' || task === 'form' ? { fields: CO.parse('write a class Thing with name, age and price in python').params.fields } : {}) });
			if (w && w.code && w.code.length > 20) written++;
			else broken.push(`${task}/${lang}`);
		}
	}
	const codeOk = !broken.length && written === CO.catalog().reduce((n, t) => n + t.languages.length, 0);
	if (!codeOk) failed++;
	console.log(`${codeOk ? 'PASS' : 'FAIL'} code: ${CO.catalog().length} tasks, ${written} programs across ${CO.ORDER.length} languages${broken.length ? '; broken: ' + broken.join(', ') : ''}`);
	const READS = [
		['fizzbuzz in rust', 'fizzbuzz', 'rust'], ['write hello world in c#', 'hello', 'csharp'], ['print the numbers 1 to 20 in c', 'count', 'c'],
		['write a python function that adds two numbers', 'func', 'python'], ['write a function called area that takes w and h and returns w * h in rust', 'func', 'rust'],
		['write a class Book with title, author and price in c++', 'cls', 'cpp'], ['make a GET request to https://api.github.com in javascript', 'get', 'javascript'],
		['http post to https://api.example.com/books with title and pages', 'post', 'http'], ['an html form with name, email and message', 'form', 'html'],
		['sort 5 2 9 1 in descending order in c#', 'sort', 'csharp'], ['reverse a string in c', 'reverse', 'c'], ['write a number guessing game in c++', 'guess', 'cpp'],
		['write a web server in python', 'server', 'python'], ['write fizzbuzz', 'fizzbuzz', 'python'], ['is 17 prime in javascript', 'prime', 'javascript'],
		['what is a class', null], ['what is rust', null], ['is 29 prime', null], ['write a poem about python', null], ['write a blog post', null], ['python is a snake', null],
	];
	const codeMisread = [];
	for (const [say, task, lang] of READS) {
		const j = CO.parse(say);
		if (task === null ? j !== null : !j || j.task !== task || j.lang !== lang) codeMisread.push(`${say} -> ${JSON.stringify(j && { task: j.task, lang: j.lang })}`);
	}
	const readsOk = !codeMisread.length;
	if (!readsOk) failed++;
	console.log(`${readsOk ? 'PASS' : 'FAIL'} code requests: ${READS.length - codeMisread.length} of ${READS.length} read right${codeMisread.length ? '\n     ' + codeMisread.join('\n     ') : ''}`);
	Omni.onyx.reset();
	const CODE_CHAT = [
		['fizzbuzz in rust', /^\*\*FizzBuzz in Rust\*\*[\s\S]*```rust\nfn main\(\) \{[\s\S]*rustc main\.rs/],
		['now in python', /^\*\*FizzBuzz in Python\*\*[\s\S]*```python\nfor i in range\(1, 101\):/],
		['what about C#?', /^\*\*FizzBuzz in C#\*\*[\s\S]*static void Main\(\)/],
		['in java', /^I don't write that language yet/],
		['an html form with name, email and message', /^\*\*An HTML form\*\*: it shows a form with name, email and message\.[\s\S]*<input id="email" name="email" type="email" required>/],
		['now in rust', /^I write an HTML form in HTML, not Rust\./],
		['can you code?', /^I can write small programs in Python, JavaScript, Rust, C, C#, C\+\+/],
		['is 29 prime?', /^Yes, 29 is prime\./],
		['write an essay', /^About what\?/],
	];
	for (const [say, expect] of CODE_CHAT) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && expect.test(r.text);
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} code: "${say}" -> ${r ? JSON.stringify(r.text).slice(0, 90) : 'no reply'}`);
	}

	// The prediction network: the JavaScript gives exactly the trainer's numbers on its random sample of held-out
	// sentences, beats counting, and its guesses make sense.
	const PR = Omni.onyxPredict;
	const rep = PR.report;
	let p1 = 0;
	let p3 = 0;
	let pn = 0;
	for (const line of fs.readFileSync(path.join(__dirname, 'fixtures', 'predict-heldout.txt'), 'utf8').trim().split('\n')) {
		const w = line.split(' ');
		for (let i = 0; i < w.length; i++) {
			const got = PR.next(w.slice(0, i).join(' ') + ' ', 3).map((x) => x.word.toLowerCase());
			pn++;
			if (got[0] === w[i]) p1++;
			if (got.includes(w[i])) p3++;
		}
	}
	const sameAsTrainer = Math.abs(p1 / pn - rep.sample_top1) < 0.0006 && Math.abs(p3 / pn - rep.sample_top3) < 0.0006;
	const beatsCounting = rep.top1 > rep.count_top1 && rep.top3 > rep.count_top3;
	const pOk = sameAsTrainer && beatsCounting;
	if (!pOk) failed++;
	console.log(`${pOk ? 'PASS' : 'FAIL'} prediction network: ${PR.size.toLocaleString('en-US')} words; on ${rep.held_out_sentences.toLocaleString('en-US')} held-out sentences the next word is its first guess ${(rep.top1 * 100).toFixed(1)}% of the time and in its first three ${(rep.top3 * 100).toFixed(1)}% (counting: ${(rep.count_top1 * 100).toFixed(1)}% and ${(rep.count_top3 * 100).toFixed(1)}%); in JavaScript, ${(p1 / pn * 100).toFixed(2)}% and ${(p3 / pn * 100).toFixed(2)}% on the sample, as trained`);
	const GUESSES = [
		['fizzbuzz in ', (g) => g.some((w) => /^(?:python|javascript|rust|c|c#|c\+\+|js)$/i.test(w))],
		['is a whale a ', (g) => g.includes('mammal')],
		['i have an exam on ', (g) => g.some((w) => /day$/i.test(w))],
		['tell me a ', (g) => g.includes('joke') || g.includes('story')],
		['write a hai', (g) => g[0] === 'haiku'],
		['how do you say happy in ', (g) => g.includes('French') || g.includes('Spanish')],
	];
	const badGuess = GUESSES.filter(([t, ok]) => !ok(PR.next(t, 3).map((x) => x.word))).map(([t]) => `"${t}" -> ${PR.next(t, 3).map((x) => x.word).join(', ')}`);
	const t0 = performance.now();
	for (let i = 0; i < 50; i++) PR.next('what is the weather in ', 5);
	const perGuess = (performance.now() - t0) / 50;
	const guessOk = !badGuess.length && perGuess < 10;
	if (!guessOk) failed++;
	console.log(`${guessOk ? 'PASS' : 'FAIL'} predictions make sense (${GUESSES.length - badGuess.length} of ${GUESSES.length}), ${perGuess.toFixed(2)} ms each${badGuess.length ? '\n     ' + badGuess.join('\n     ') : ''}`);
	const fin = await Omni.onyx.respond('finish this sentence: I have an exam on');
	const finOk = /^\*\*I have an exam on\*\* \*\w+day\b/.test(fin.text) && /My guesses for the next word/.test(fin.text);
	if (!finOk) failed++;
	console.log(`${finOk ? 'PASS' : 'FAIL'} "finish this sentence: I have an exam on" -> ${JSON.stringify(fin.text).slice(0, 80)}`);

	/* ---------- Onyx 3 ---------- */

	// The planner on its own: what is one thing, what is several, and what is done to the last result.
	const MIND = Omni.onyxMind;
	const PLANS = [
		['write a haiku about the sea then translate it to spanish', ['write a haiku about the sea', 'translate it to spanish']],
		['how do you say cat in french, german and japanese', ['how do you say cat in french', 'how do you say cat in german', 'how do you say cat in japanese']],
		['define serendipity and translate it to French', ['define serendipity', 'translate it to French']],
		['what is the square root of 144, then double it', ['what is the square root of 144', 'double it']],
		['define brave, kind and curious', ['define brave', 'define kind', 'define curious']],
		['look up Ada Lovelace, then summarize it, then translate it to french', ['look up Ada Lovelace', 'summarize it', 'translate it to french']],
		['write a python program that prints the even numbers from 1 to 10, then show it in rust', ['write a python program that prints the even numbers from 1 to 10', 'show it in rust']],
		// One program, however many "then"s it has; and things that only look like lists.
		['take the numbers 1 to 10, add 5 to each one, then keep those greater than 12 and print them on one line in python', null],
		['i went to the shop and then i went home', null],
		['salt and pepper', null],
		['how do you say "cats and dogs" in german', null],
		['generate 5 uuids and save them to a file', null],
		['what is the difference between a crocodile and an alligator', null],
	];
	const badPlan = PLANS.filter(([t, want]) => JSON.stringify((MIND.plan(t) || {}).steps || null) !== JSON.stringify(want)).map(([t]) => `${t} -> ${JSON.stringify(MIND.plan(t))}`);
	const OPS = [['make it shorter', 'shorten'], ['translate that into Japanese please', 'translate'], ['in french', 'translate'], ['how many words is that', 'count'], ['explain it', 'explain'], ['read it aloud', 'speak'], ['make it more formal', 'tone'], ['summarize it', 'summarize'], ['what is it', null], ['shorter days', null]];
	const badOp = OPS.filter(([t, want]) => ((MIND.operation(t) || {}).op || null) !== want).map(([t]) => `${t} -> ${JSON.stringify(MIND.operation(t))}`);
	const mindOk = !badPlan.length && !badOp.length;
	if (!mindOk) failed++;
	console.log(`${mindOk ? 'PASS' : 'FAIL'} the planner: ${PLANS.length - badPlan.length} of ${PLANS.length} messages planned right, ${OPS.length - badOp.length} of ${OPS.length} follow-ups read right${[...badPlan, ...badOp].map((x) => '\n     ' + x).join('')}`);

	// Units, runs of numbers and dates, with the date fixed so the answers don't move.
	const USES = Omni.onyxUses;
	const day0 = new Date(2026, 10, 11);
	const TOOLS = [
		[USES.convert('convert 5 miles to km'), /^5 miles = \*\*8\.04672 kilometers\*\*\.$/],
		[USES.convert('how many cups in a liter'), /^1 liter = \*\*4\.22675 US cups\*\*\.$/],
		[USES.convert('72 f to c'), /22\.2222 degrees Celsius/],
		[USES.convert('how many seconds in a day'), /\*\*86,400 seconds\*\*/],
		[USES.convert('2.5 gb to mb'), /\*\*2,500 megabytes\*\*/],
		[USES.convert('convert 3 hours to meters'), /one measures time and the other length/],
		[USES.convert('what is 12 times 7') || { text: 'null' }, /^null$/],
		[USES.series('what is the sum of the numbers from 1 to 100'), /= \*\*5,050\*\*/],
		[USES.series('sum of the first 50 odd numbers'), /= \*\*2,500\*\*/],
		[USES.series('product of the numbers from 1 to 6'), /= \*\*720\*\*/],
		[USES.series('add up the even numbers from 1 to 20'), /= \*\*110\*\*/],
		[USES.dates('how many days until christmas', day0), /in \*\*44 days\*\*: Friday, December 25, 2026/],
		[USES.dates('what day of the week is 2027-03-01', day0), /will be a \*\*Monday\*\*/],
		[USES.dates('what day was july 4 1776', day0), /was a \*\*Thursday\*\*/],
		[USES.dates('3 weeks from now', day0), /\*\*Wednesday, December 2, 2026\*\*/],
		[USES.dates('is 1900 a leap year', day0), /^No: 1900 isn't a leap year/],
		[USES.dates('how many days between march 1 and may 1', day0), /\*\*61 days\*\*/],
		[USES.dates('what day is it', day0) || { text: 'null' }, /^null$/],
	];
	const badTool = TOOLS.filter(([r, re]) => !r || !re.test(r.text)).map(([r, re]) => `${re} <- ${r && r.text}`);
	if (badTool.length) failed++;
	console.log(`${badTool.length ? 'FAIL' : 'PASS'} units, sums and dates: ${TOOLS.length - badTool.length} of ${TOOLS.length} right${badTool.map((x) => '\n     ' + x).join('')}`);

	// Programs composed from a prompt: the plan is read, written in JavaScript and run here; tools/check-synth.js
	// compiles and runs the same plans in all six languages.
	const SY = Omni.onyxSynth;
	const PROGRAMS = [
		['take the numbers 1 to 20, keep the even ones, square them and print the sum', '1540'],
		['the sum of the squares of the odd numbers from 1 to 9', '165'],
		['take the list 4, 8, 15, 16, 23, 42, remove the even ones and print the average', '19'],
		['given the numbers 5, 3, 9, 3, 5, 1, remove the duplicates, sort them in descending order and print them separated by commas', '9, 5, 3, 1'],
		['the three largest numbers in 12, 7, 31, 4, 18, 25', '31\n25\n18'],
		['take the numbers 1 to 10, add 5 to each one, then keep those greater than 12 and print them on one line', '13, 14, 15'],
		['take the words apple, kiwi, banana, fig and cherry, keep the ones longer than 4 letters, put them in capitals and sort them', 'APPLE\nBANANA\nCHERRY'],
		['take the words in "one fish two fish red fish blue fish", remove the repeats and join them with dashes', 'one-fish-two-red-blue'],
		['take the numbers 1 to 12, skip the first 3, keep the ones that are not divisible by 2 and print the smallest', '5'],
	];
	const badProgram = [];
	for (const [prompt, want] of PROGRAMS) {
		const plan = SY.parse(prompt, 'javascript');
		let got = 'not read as a plan';
		if (plan) {
			const out = [];
			new Function('console', SY.write(plan, 'javascript').code)({ log: (...a) => out.push(a.join(' ')) }); // eslint-disable-line no-new-func
			got = out.join('\n');
		}
		if (got !== want) badProgram.push(`${prompt} -> ${JSON.stringify(got)}`);
	}
	const pageOut = SY.write(SY.parse('a landing page for a bakery called Sweet Crumbs with a hero, three features, a contact form and a footer', 'html'), 'html');
	const reqOut = SY.write(SY.parse('a PUT request to https://api.example.com/users/42 with a bearer token and a JSON body with name Sam and age 30', 'http'), 'http');
	const synthOk = !badProgram.length && /<title>Sweet Crumbs<\/title>[\s\S]*<form method="post">[\s\S]*<footer>/.test(pageOut.code) && reqOut.code === 'PUT /users/42 HTTP/1.1\r\nHost: api.example.com\r\nAuthorization: Bearer YOUR_TOKEN\r\nContent-Type: application/json\r\nContent-Length: 26\r\nConnection: close\r\n\r\n{"name": "Sam", "age": 30}';
	if (!synthOk) failed++;
	console.log(`${synthOk ? 'PASS' : 'FAIL'} code from a prompt: ${PROGRAMS.length - badProgram.length} of ${PROGRAMS.length} programs read, written and run right; a page and a request composed${badProgram.map((x) => '\n     ' + x).join('')}`);

	// A conversation that uses what is new: steps, the thinking trace, other languages, writing, code, a document.
	Omni.onyx.reset();
	Omni.onyx.settings.reset();
	Omni.onyx.settings.set('internet', 'off');
	const AMAZON = 'The Amazon rainforest is the largest tropical rainforest on Earth. It covers much of the Amazon basin in South America. The forest is home to millions of species of insects, plants, birds and fish. Scientists say the rainforest stores huge amounts of carbon. Deforestation threatens the forest: farms and roads replace the trees. Many groups now work to protect the rainforest and the people who live in it.';
	const SCRIPT_3 = [
		['write a haiku about the sea, then translate it into Spanish', (r) => /^\*\*Haiku: Sea\*\*/.test(r.text) && /\n\nIn Spanish:\n\n/.test(r.text) && r.steps === 2 && r.thinking.some((x) => x.step === 'plan') && r.confidence === 'fair'],
		['how do you say cat in French, German and Japanese', (r) => /le chat[\s\S]*Katze[\s\S]*Japanese: \*\*/.test(r.text) && r.steps === 3],
		['what is the square root of 144, then double it', (r) => /\*\*12\*\*[\s\S]*\*\*24\*\*/.test(r.text) && r.confidence === 'sure'],
		['add 10', /= \*\*34\*\*/],
		['how did you get that?', /^Here is how I got there:\n1\. \*\*Read\*\*: 2 words: a request\n2\. \*\*Skill\*\*: arithmetic/],
		['what is the sum of the numbers from 1 to 100', /= \*\*5,050\*\*/],
		['how many cups in a liter', /4\.22675 US cups/],
		['what does Schmetterling mean in German', /butterfly/],
		['how do you say water in Japanese', /水/],
		['what does acqua mean in Italian', /\*\*water\*\*/],
		['translate casa from Italian to Finnish', /\*\*casa\*\* in Finnish: \*\*/],
		['write a python program that takes the numbers 1 to 20, keeps the even ones, squares them and prints the sum', (r) => /^\*\*A program in Python\*\*, composed from your prompt/.test(r.text) && r.code.lang === 'python' && r.code.text.includes('if n % 2 == 0') && r.plan.length === 4],
		['now in rust', (r) => /^\*\*A program in Rust\*\*/.test(r.text) && /fn main\(\) \{/.test(r.code.text)],
		['explain it', /^It works in 4 steps, and the code follows them in order:\n1\. Start with the numbers 1 to 20\./],
		['make a landing page for a bakery called Sweet Crumbs with a hero, three features, a contact form and a footer', (r) => r.code && r.code.lang === 'html' && /<title>Sweet Crumbs<\/title>/.test(r.code.text)],
		['fizzbuzz in rust', /^\*\*FizzBuzz in Rust\*\*/],
		['write an email to my boss asking for friday off', (r) => r.piece && r.piece.form === 'email' && /\*\*Subject:\*\*/.test(r.text) && /Friday off/.test(r.text)],
		['make it more formal', /Sincerely,/],
		['how many words is that', /^\*\*\d+ words\*\*, \d+ characters/],
		['tell me a story about a shy dragon who wants to sing', (r) => r.piece && r.piece.form === 'story' && r.text.split(/\s+/).length > 120],
		['write a short essay about volcanoes', (r) => r.piece && r.piece.form === 'essay' && /^\*\*Volcanoes\*\*/.test(r.text)],
		['make it longer', (r) => r.piece && r.text.split(/\s+/).length > 60],
		['translate it to italian', /^I have an Italian dictionary but not its grammar[\s\S]* → vulcano/],
		[`Read this: ${AMAZON}`, /^I've read it: 68 words in 6 sentences, about 1 minute of reading\. The words it comes back to most are \*\*rainforest\*\*/],
		['summarize it', /^\*\*The document, in short\*\*\n- The Amazon rainforest is the largest/],
		['what does it say about carbon', /^About \*\*carbon\*\*, it says:\n> Scientists say the rainforest stores huge amounts of carbon\.$/],
		['how many times does it mention forest', /\*\*2 times\*\*/],
		['key words', /^Its key words: \*\*rainforest\*\* \(4\)/],
		['quiz me', /^On what\? I can quiz you on \*\*math\*\*/],
		['i have a quiz tomorrow', (r) => !r.quiz && !/question/.test(r.text)],
		['what can you do', /\*\*Think in steps\*\*[\s\S]*\*\*Code from a prompt\*\*[\s\S]*What I can't do: see images/],
		['who are you', /I'm Onyx 3/],
	];
	let traced = 0;
	for (const [say, expect] of SCRIPT_3) {
		const r = await Omni.onyx.respond(say);
		const ok = !!r && (typeof expect === 'function' ? !!expect(r) : expect.test(r.text));
		if (r && Array.isArray(r.thinking) && r.thinking.length >= 2 && r.thinking[0].step === 'read' && r.thinking[r.thinking.length - 1].step === 'check' && /^(?:sure|fair|unsure)$/.test(r.confidence)) traced++;
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} onyx 3: "${say.slice(0, 70)}" -> ${r ? JSON.stringify(r.text).slice(0, 90) : 'no reply'}`);
	}
	const tracedOk = traced === SCRIPT_3.length;
	if (!tracedOk) failed++;
	console.log(`${tracedOk ? 'PASS' : 'FAIL'} every reply comes with its thinking and a confidence: ${traced} of ${SCRIPT_3.length}`);

	// A math quiz, answered by working each question out here: all right, then one wrong.
	Omni.onyx.reset();
	let q = await Omni.onyx.respond('give me a math quiz with 4 questions');
	const solve = (text) => {
		const m = text.match(/\*\*(\d+)(?: ([+−×÷]) |% of )(\d+)\*\*\?$/);
		return m[2] ? { '+': +m[1] + +m[3], '−': m[1] - m[3], '×': m[1] * m[3], '÷': m[1] / m[3] }[m[2]] : (m[1] * m[3]) / 100;
	};
	let quizOk = q.expect === 'quiz' && /^Math: 4 questions\./.test(q.text);
	for (let i = 0; i < 3 && quizOk; i++) {
		q = await Omni.onyx.respond(String(solve(q.text)));
		quizOk = /^(?:Right!|Correct\.|Yes!|That's it\.|Exactly\.)\n\n\*\*\d\.\*\* What is/.test(q.text);
	}
	q = quizOk ? await Omni.onyx.respond(String(solve(q.text) + 1)) : q;
	quizOk = quizOk && /^Not quite: it's [\d.,]+\.\n\nThat's the quiz: \*\*3 of 4\*\*/.test(q.text) && q.quiz.done;
	// And a vocabulary quiz in another language asks a real question about a real word.
	const vq = await Omni.onyx.respond('quiz me on German with 2 questions');
	const vOk = vq.expect === 'quiz' && /^German vocabulary: 2 questions\.[\s\S]*\*\*1\.\*\* (?:How do you say \*\*\w+\*\* in German\?|What does the German word \*\*\S+\*\* mean in English\?)$/.test(vq.text);
	const stopped = await Omni.onyx.respond('stop');
	if (!quizOk || !vOk || !/^Okay, no quiz\.$/.test(stopped.text)) failed++;
	console.log(`${quizOk && vOk ? 'PASS' : 'FAIL'} quizzes: a math quiz marked right (3 of 4), a German one asked -> ${JSON.stringify(vq.text.split('\n').pop())}`);

	// A file handed over by the host.
	const fileRead = await Omni.onyx.read(AMAZON, 'amazon.txt');
	const fileAsk = await Omni.onyx.respond('what does the document say about roads');
	const fileOk = /^I've read \*\*amazon\.txt\*\*: 68 words/.test(fileRead.text) && /> Deforestation threatens the forest: farms and roads replace the trees\./.test(fileAsk.text);
	if (!fileOk) failed++;
	console.log(`${fileOk ? 'PASS' : 'FAIL'} a document from a file: read, then searched -> ${JSON.stringify(fileAsk.text).slice(0, 90)}`);

	// With the switch on, an essay about something outside the dictionary is built from the article that comes back.
	Omni.onyx.reset();
	delete require.cache[require.resolve('../host/net.js')];
	require('../host/net.js');
	Omni.net.fetch = async (url, init) => {
		fetched.push({ url, init });
		const route = ROUTES.find(([re]) => re.test(url));
		const body = route ? JSON.parse(fs.readFileSync(path.join(FIX, route[1]), 'utf8')) : { title: 'Not found' };
		return { ok: !!route, status: route ? 200 : 404, json: async () => body };
	};
	Omni.onyx.settings.set('internet', 'on');
	fetched.length = 0;
	const essay = await Omni.onyx.respond('write an essay about Ada Lovelace');
	const essayOk = essay.piece && essay.piece.form === 'essay' && /Built from the Wikipedia article/.test(essay.text) && fetched.length > 0 && essay.thinking.some((x) => x.step === 'online') && essay.confidence === 'fair';
	Omni.onyx.settings.set('internet', 'off');
	fetched.length = 0;
	const switchedOff = await Omni.onyx.respond('what is the weather in Austin?');
	const offOk = !fetched.length && !switchedOff.offer;
	if (!essayOk || !offOk) failed++;
	console.log(`${essayOk && offOk ? 'PASS' : 'FAIL'} the internet switch: on, an essay is built from Wikipedia; off, nothing is fetched or offered -> ${JSON.stringify(switchedOff.text).slice(0, 70)}`);
	Omni.net = { enabled: false, ask: async () => null };
	Omni.onyx.settings.reset();

	// Speed: deciding a reply, averaged over the held-out phrasings and the conversation, after the first.
	Omni.onyx.reset();
	const timed = HELD_OUT.map(([t]) => t).concat(SCRIPT.map(([t]) => t), SCRIPT_2.map(([t]) => t)).filter((t) => !/forget|reset|settings|be |stop|you can|no tips|tips/.test(t));
	await Omni.onyx.respond('hi');
	const start = performance.now();
	for (const t of timed) await Omni.onyx.respond(t);
	const each = (performance.now() - start) / timed.length;
	const fast = each < 2;
	if (!fast) failed++;
	console.log(`${fast ? 'PASS' : 'FAIL'} speed: ${each.toFixed(2)} ms per reply on average, over ${timed.length} messages`);
	Omni.store.remove('onyx.memory');
	Omni.store.remove('onyx.settings');

	console.log(failed ? `${failed} failed` : 'all passed');
	process.exitCode = failed ? 1 : 0;
})();
