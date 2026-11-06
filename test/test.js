// Tests Onyx 2 on its own, in Node: intent accuracy on phrasings it was not built with (in English, Spanish and
// French), the neural model, a long conversation, the dictionary's data, the word list, the internet port and speed.
//   node test/test.js
'use strict';
require('../host/host.js');
require('../src/onyx-math.js');
require('../src/onyx-lexicon.js');
require('../src/onyx-dictionary.js');
require('../src/onyx-languages.js');
require('../src/onyx-data.js');
require('../src/onyx-model.js');
require('../src/onyx-weights.js');
require('../src/onyx.js');

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
	['write me a poem', /beyond me/],
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
	['what version are you?', /Onyx 2/],
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

	// The internet port: off by default, consulted only when a host turns it on, and never trusted to answer.
	const offline = await Omni.onyx.respond('what is the weather');
	const portOff = /don't use the internet/.test(offline.text);
	const asked = [];
	Omni.net = { enabled: true, ask: async (req) => (asked.push(req), req.kind === 'weather' ? { text: 'Sunny, 21°C.' } : null) };
	const portOn = (await Omni.onyx.respond('what is the weather')).text === 'Sunny, 21°C.' && asked[0].kind === 'weather';
	const fellBack = /don't know|outside what I know|No idea/.test((await Omni.onyx.respond('who won the world cup in 1998')).text) && asked[1].kind === 'search';
	Omni.net = { enabled: true, ask: async () => { throw new Error('offline'); } };
	const survived = /don't use the internet/.test((await Omni.onyx.respond('what is the weather')).text);
	Omni.net = { enabled: false, ask: async () => ({ text: 'should not be used' }) };
	const stayedOff = /don't use the internet/.test((await Omni.onyx.respond('what is the weather')).text);
	for (const [ok, what] of [[portOff, 'internet port is off by default'], [portOn, 'an enabled port answers weather'], [fellBack, 'an empty port answer falls back to offline'], [survived, 'a failing port falls back to offline'], [stayedOff, 'a disabled port is never asked']]) {
		if (!ok) failed++;
		console.log(`${ok ? 'PASS' : 'FAIL'} ${what}`);
	}
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
