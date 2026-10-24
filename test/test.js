// Tests Onyx on its own, in Node: intent accuracy on phrasings it was not built with, and a short conversation.
//   node test/test.js
'use strict';
require('../host/host.js');
require('../src/onyx-math.js');
require('../src/onyx-dictionary.js');
require('../src/onyx-data.js');
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
	['write a poem about cats', 'limits'], ['can you write some python code', 'limits'], ['search google for cats', 'limits'], ['translate hello to french', 'limits'],
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
	['hola', /only understand English/],
	['i want to die', /988/],
	['forget me', (r) => r.offer && r.offer.kind === 'forget'],
	['yes', /forgotten your name/],
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
	console.log(failed ? `${failed} failed` : 'all passed');
	process.exitCode = failed ? 1 : 0;
})();
