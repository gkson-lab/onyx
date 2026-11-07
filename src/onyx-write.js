// Onyx 2's writing: short pieces made from its dictionary, not from a language model. Haiku counted by real syllables
// (from the pronunciations), rhyming poems from the rhyme index, acrostics, short stories, messages for cards, a
// paragraph describing a word, and summaries that pick a text's most telling sentences. Everything is built from
// templates and the dictionary's own knowledge, so it is short, grammatical and a little different every time.
(function (root) {
	'use strict';

	const D = () => root.Omni.onyxDictionary;
	const pickFrom = (rand) => (list) => list[Math.floor(rand() * list.length)];
	const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
	const shuffle = (rand, list) => {
		const a = [...list];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(rand() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	};

	/* ---------- Words to write with ---------- */

	// Images that suit most short poems, all in the dictionary with a pronunciation.
	const IMAGES = 'moon rain snow wind river stone leaf cloud light shadow silence field hill sky star sea frost fog pond grass bell smoke dust shore branch petal garden window candle road morning evening'.split(' ');
	const TIMES = ['dawn', 'dusk', 'noon', 'midnight', 'morning', 'evening', 'twilight', 'nightfall', 'sunrise', 'sunset'];
	const ADJS = 'quiet soft cold warm golden silver gentle lonely bright dark still slow empty misty pale tiny old wild silent sleepy distant hidden patient small bare frozen gray green deep brief tender restless hollow'.split(' ');
	const VERBS = 'drift sleep wait glow fall rise sing dream shine wander rest hum whisper fade settle shiver float turn listen breathe stir gleam sway linger'.split(' ');
	const ADVS = ['slowly', 'softly', 'gently', 'quietly', 'alone', 'at last'];
	// Words a rhyming line can end on: simple, concrete, and good company for each other.
	const END_NOUNS = 'light night day way sky sea tree rain home sun moon star song sound ground air fire snow stone road door shore dawn wind dream hill field heart sand land hand bay flame rose lake bell gate shade grass glass wave cave stream beam breeze trees leaf thread bread bed nest rest coast frost glow snow time rhyme line hour flower tower spring wing ring king sea tea bee key lane plane train rain chain ice dust trust flight kite seed tide side pride sail trail tale'.split(' ');
	const END_ADJS = 'bright light white right slow low new blue true gold old cold bold warm small tall still wide free sweet near clear dear deep kind wild calm soft long strong young green'.split(' ');
	const END_VERBS = 'rest stay play sing ring fly cry sleep keep dream gleam stream glow grow go know shine climb rhyme hide glide rise sigh smile shine fall call wait turn learn burn wander'.split(' ');
	// Concrete, friendly casts and settings for stories.
	const STORY_ANIMALS = 'fox owl rabbit bear mouse cat dog duck hedgehog squirrel turtle goat otter badger deer crow frog sparrow puppy kitten pony lamb penguin'.split(' ');
	const STORY_PLACES = 'village forest meadow lighthouse harbor garden farm island valley cottage library bakery mountain beach pond castle orchard market'.split(' ');
	const STORY_THINGS = 'kite lantern blanket key map ball scarf hat book compass shell feather umbrella bottle ring basket notebook whistle cup marble'.split(' ');
	const PREPS = ['through', 'across', 'beneath', 'above', 'along', 'over', 'under', 'into', 'beyond', 'among'];

	const known = (w) => !!(D() && D().lookup(w));
	const noun = (w) => (D().lookup(w) || []).map((x) => x.e).find((e) => e.pos === 'noun' && e.w.toLowerCase() === w.toLowerCase());

	const sylCache = new Map();
	/** Syllables in a phrase, from the dictionary's pronunciations, or a careful guess for words it doesn't have. */
	function syllables(phrase) {
		let n = 0;
		for (const raw of String(phrase).toLowerCase().split(/[\s-]+/)) {
			const w = raw.replace(/[^a-z']/g, '');
			if (!w) continue;
			if (!sylCache.has(w)) sylCache.set(w, D() ? D().syllables(w).n : (w.match(/[aeiouy]+/g) || [w]).length);
			n += sylCache.get(w);
		}
		return n;
	}

	const third = (w) => D().forms.third({ w });
	const ing = (w) => D().forms.ing({ w });
	const plural = (w) => {
		const e = noun(w);
		return e ? D().forms.plural(e) : /s$/.test(w) ? w : w + 's';
	};
	const a = (w) => (/^[A-Z]/.test(w) ? w : D().a(w));

	/**
	 * What a topic brings to a piece: the word itself as written, whether it's a name, and nouns and adjectives tied to
	 * it (its kinds, parts, what it is a kind of, words from its definition). `extra` adds words, such as nouns from an
	 * article Onyx just read.
	 */
	function topicOf(topic, extra = []) {
		const d = D();
		let t = String(topic || '').trim().replace(/^(?:an?|the|my|our|some)\s+/i, '');
		// Wikipedia writes common things in sentence case ("Black hole", "Theory of relativity"): a capital on the first
		// word only, when that word is an everyday one, is not a name. "Ada Lovelace" and "Eiffel Tower" stay names.
		if (/^[A-Z][a-z]+(?: [a-z][a-z'-]*)+$/.test(t) && !(d.lookup(t) || []).length && known(t.split(' ')[0].toLowerCase())) t = t[0].toLowerCase() + t.slice(1);
		const hit = t && (d.lookup(t) || []).map((x) => x.e);
		const e = hit && (hit.find((x) => x.pos === 'noun') || hit[0]);
		const word = e && e.pos === 'noun' ? e.w : t;
		const nouns = [];
		const adjs = [];
		const add = (list, w) => w && !list.includes(w) && w.length < 14 && !/\s/.test(w) && w.toLowerCase() !== String(t).toLowerCase() && (!e || w !== e.w) && known(w) && list.push(w);
		if (e) {
			(e.has || []).slice(0, 4).forEach((w) => add(nouns, w));
			for (const w of e.def.toLowerCase().match(/[a-z]+/g) || []) {
				const h = (d.lookup(w) || []).map((x) => x.e);
				if (!/^(animal|thing|plant|food|person|people|place|kind|part|thing)$/.test(w) && h.some((x) => x.pos === 'noun' && !x.src && ['nature', 'animal', 'food', 'time'].includes(x.kind))) add(nouns, w);
				else if (h.some((x) => x.pos === 'adjective' && !x.src)) add(adjs, w);
			}
		}
		for (const w of extra) add(nouns, w);
		const kind = e && e.pos === 'noun' ? e.kind : null;
		return { text: word || 'the world', name: /^[A-Z]/.test(word || ''), kind, entry: e, nouns, adjs };
	}

	/* ---------- Haiku: 5, 7 and 5 syllables, counted from real pronunciations ---------- */

	const LINE_1 = ['{A} {T}', 'the {T} {V}', '{A} {N} {V}', 'a {A} {T}', '{T} in the {N}', '{T} at {TIME}', 'one {A} {T}', '{TIME} {N}'];
	const LINE_2 = ['the {T} {V} {P} the {N}', '{A} {N} and {A} {N}', '{VI} {D} {P} the {N}', 'a {T} {V} {P} the {A} {N}', 'the {N} {V} {D}', 'and the {A} {T} {V}', '{P} the {A} {N} it {V}', 'the {A} {N} {V} {D}'];
	const LINE_3 = ['{TIME} {N}', '{A} and {A}', 'the {N} {V}', 'the {T} {V} {D}', 'only the {N}', '{N} on the {N}', 'and then, {N}'];

	function fill(template, t, pick) {
		const nouns = t.nouns.length ? [...t.nouns, ...IMAGES] : IMAGES;
		const adjs = [...t.adjs, ...ADJS];
		const tpl = t.name ? template.replace(/\b(?:the|a|one) \{T\}/g, '{T}') : template;
		return tpl.replace(/\{(\w+)\}/g, (_, slot) => {
			if (slot === 'T') return t.name ? t.text : t.text.toLowerCase();
			if (slot === 'A') return pick(adjs);
			if (slot === 'N') return pick(rand01(pick) < 0.3 && t.nouns.length ? t.nouns : IMAGES);
			if (slot === 'V') return third(pick(VERBS));
			if (slot === 'VI') return ing(pick(VERBS));
			if (slot === 'D') return pick(ADVS);
			if (slot === 'P') return pick(PREPS);
			if (slot === 'TIME') return pick(TIMES);
			return pick(nouns);
		});
	}
	// The picker doubles as a coin: pick() on [0, 1) numbers.
	const COIN = Array.from({ length: 20 }, (_, i) => i / 20);
	const rand01 = (pick) => pick(COIN);

	/** A line of exactly `count` syllables from the templates, or null after many tries. */
	function line(templates, count, t, pick, needTopic) {
		for (let i = 0; i < 600; i++) {
			const tpl = pick(templates);
			// The topic appears in exactly one line.
			if (needTopic !== tpl.includes('{T}')) continue;
			const text = fill(tpl, t, pick).replace(/\b(a) ([aeiou])/g, 'an $2');
			if (syllables(text) === count) return text;
		}
		return null;
	}

	/** A haiku about `topic`: three lines of 5, 7 and 5 syllables. */
	function haiku(topic, rand = Math.random, extra) {
		const t = topicOf(topic, extra);
		const title = cap(t.text);
		// A long name is called by its first word: "Ada Lovelace" is "Ada" in a five-syllable line.
		if (t.name && syllables(t.text) > 3 && t.text.includes(' ')) t.text = t.text.split(' ')[0];
		const pick = pickFrom(rand);
		for (let tries = 0; tries < 20; tries++) {
			const topicFirst = rand() < 0.5 && syllables(t.text) <= 4;
			const l1 = line(LINE_1, 5, t, pick, topicFirst);
			const l2 = line(LINE_2, 7, t, pick, !topicFirst);
			const l3 = line(LINE_3, 5, t, pick, false);
			const words = [l1, l2, l3].join(' ').split(' ').filter((w) => w.length > 3);
			if (l1 && l2 && l3 && new Set(words).size === words.length) return { title, text: [l1, l2, l3].join('\n'), syllables: [5, 7, 5] };
		}
		return null;
	}

	/* ---------- Rhyming poems: two couplets, from the rhyme index ---------- */

	// Lines that end on a word of a given kind; {X} is the rhyming word.
	const ENDS = {
		noun: ['We dream about the {A} {X}', 'Beneath a {A} and quiet {X}', 'We wander home across the {X}', 'There is a song inside the {X}', 'Until the morning finds the {X}', 'We leave a light beside the {X}', 'Somewhere beyond the {A} {X}', 'I keep a little of the {X}'],
		adjective: ['And all the world feels {X}', 'The {N} is soft and {X}', 'And every road seems {X}', 'Our hearts were light and {X}', 'The air is {A} and {X}'],
		verb: ['We stop a while to {X}', 'We find the time to {X}', 'The {N} begins to {X}', 'And still we choose to {X}', "It's time for us to {X}"],
	};
	// Nouns that don't take a plural ("dust", not "dusts"), kept out of lines that need one.
	const MASS = new Set('air dust snow grass rain light sand ice frost fog smoke silence glass bread tea trust time shade fire mist'.split(' '));
	// The first line of a poem names its topic.
	const OPENING = {
		noun: ['The {T} looks up toward the {X}', 'I think about the {T} and the {X}', 'There is a {T} beneath the {X}', 'The {T} is waiting for the {X}'],
		adjective: ['The {T} is {A} and {X}', 'Today the {T} feels {X}', 'The {T} looks soft and {X}'],
		verb: ['The {T} begins to {X}', 'I watch the {T} {X}', 'The {T} would like to {X}'],
	};
	let rhymeWords = null;
	/** Words fit to end a line on, by part of speech: the curated ones that the dictionary can pronounce. */
	function endWords() {
		if (rhymeWords) return rhymeWords;
		const ok = (w) => (D().lookup(w) || []).some((x) => x.e.ipa);
		rhymeWords = { noun: new Set(END_NOUNS.filter(ok)), adjective: new Set(END_ADJS.filter(ok)), verb: new Set(END_VERBS.filter(ok)) };
		return rhymeWords;
	}

	/** Two words of the same part of speech that rhyme, starting from the topic's own words where it can. */
	function rhymePair(t, pick, rand, used) {
		const ends = endWords();
		const kinds = shuffle(rand, ['noun', 'noun', 'adjective', 'verb']);
		for (const kind of kinds) {
			const starts = shuffle(rand, [...ends[kind]]);
			for (const w of starts) {
				if (used.has(w)) continue;
				const r = D().rhymes(w, 400);
				const partners = r ? r.words.filter((x) => ends[kind].has(x) && !used.has(x) && x !== w && !x.endsWith(w) && !w.endsWith(x)) : [];
				if (partners.length) return { kind, words: [w, pick(partners)] };
			}
		}
		return null;
	}

	/** A short rhyming poem about `topic`: two couplets (AABB), each line around eight syllables. */
	function poem(topic, rand = Math.random, extra) {
		const t = topicOf(topic, extra);
		const pick = pickFrom(rand);
		const used = new Set();
		const lines = [];
		for (let c = 0; c < 2; c++) {
			const pair = rhymePair(t, pick, rand, used);
			if (!pair) return null;
			pair.words.forEach((w) => used.add(w));
			for (const end of pair.words) {
				let best = null;
				for (let i = 0; i < 40; i++) {
					const tpl = pick(lines.length === 0 ? OPENING[pair.kind] : ENDS[pair.kind]);
					if (lines.some((l) => l.tpl === tpl)) continue;
					const text = fill(tpl.replace('{X}', end), t, pick).replace(/\b(a) ([aeiou])/gi, (m, art, v) => `${art === 'A' ? 'An' : 'an'} ${v}`);
					const n = syllables(text);
					if (!best || Math.abs(n - 8) < Math.abs(best.n - 8)) best = { text, n, tpl };
					if (n >= 7 && n <= 9) break;
				}
				lines.push(best);
			}
		}
		// Every line starts with a capital; the couplets end in a full stop.
		const text = lines.map((l, i) => cap(l.text) + (i % 2 ? '.' : ',')).join('\n');
		return { title: cap(t.text), text };
	}

	/* ---------- Acrostics ---------- */

	const OPENERS = { a: 'Across the', b: 'Beneath the', c: 'Close to the', d: 'Down by the', e: 'Every', f: 'For the', g: 'Gently, the', h: 'Here, the', i: 'In the', j: 'Just the', k: 'Kind as the', l: 'Like the', m: 'More than the', n: 'Never far from the', o: 'Over the', p: 'Past the', q: 'Quietly, the', r: 'Right by the', s: 'Softly, the', t: 'Through the', u: 'Under the', v: 'Vast as the', w: 'With the', x: 'eXactly like the', y: 'Yes to the', z: 'Zigzagging past the' };
	let byLetter = null;
	/** Everyday adjectives and nouns by first letter, for acrostic lines. */
	function letterWords() {
		if (byLetter) return byLetter;
		byLetter = {};
		for (const e of D().CORE) {
			if (e.w.includes(' ') || /^[A-Z]/.test(e.w) || e.w.length > 10) continue;
			const k = e.w[0];
			byLetter[k] = byLetter[k] || { adj: [], noun: [] };
			if (e.pos === 'adjective' && (e.mood === '+' || ADJS.includes(e.w) || END_ADJS.includes(e.w)) && e.use !== 'feel') byLetter[k].adj.push(e.w);
			if (e.pos === 'noun' && (IMAGES.includes(e.w) || END_NOUNS.includes(e.w) || TIMES.includes(e.w))) byLetter[k].noun.push(e.w);
		}
		return byLetter;
	}

	/** An acrostic for a word or a name: each line starts with its next letter. */
	function acrostic(word, rand = Math.random) {
		const letters = String(word).replace(/[^A-Za-zÀ-ÿ]/g, '');
		if (!letters || letters.length > 14) return null;
		const pick = pickFrom(rand);
		const t = topicOf(word);
		const words = letterWords();
		const lines = [...letters].map((ch) => {
			const k = ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
			const pool = words[k] || { adj: [], noun: [] };
			const nouns = [...t.nouns, ...IMAGES];
			const roll = rand();
			let text;
			const countable = IMAGES.filter((w) => !MASS.has(w));
			const nounsHere = pool.noun.filter((w) => !MASS.has(w) && !TIMES.includes(w));
			if (pool.adj.length && roll < 0.5) text = t.name ? `${pick(pool.adj)} as the ${pick(IMAGES)}` : `${pick(pool.adj)} ${plural(pick(countable))}`;
			else if (nounsHere.length && roll < 0.75) text = `${plural(pick(nounsHere))} ${pick(['and', 'beside', 'beneath', 'over'])} the ${pick(IMAGES)}`;
			else text = `${(OPENERS[k] || 'And the').toLowerCase()} ${pick(ADJS)} ${pick(nouns)}`;
			text = text.replace(/\ba ([aeiou])/g, 'an $1');
			// The line starts with the letter itself, set in bold; an accented letter stands on its own in front.
			if (text[0] === ch.toLowerCase() || (text.startsWith('exactly') && k === 'x')) return `**${ch.toUpperCase()}**${text.slice(text.startsWith('exactly') ? 2 : 1)}`;
			return `**${ch.toUpperCase()}** ${text}`;
		});
		return { title: letters.toUpperCase(), text: lines.join('\n') };
	}

	/* ---------- Short stories ---------- */

	const HERO_ADJS = ['curious', 'brave', 'shy', 'clever', 'gentle', 'restless', 'cheerful', 'patient', 'tiny', 'old'];
	const NAMES = ['Mira', 'Theo', 'Ana', 'Leo', 'Ivy', 'Noor', 'Kai', 'Rosa', 'Felix', 'June'];
	const MORALS = {
		friendship: 'friends make every storm a little smaller',
		courage: 'being brave just means trying anyway',
		patience: 'the best things take their time',
		curiosity: 'there is always more to discover',
		kindness: 'a small kindness can travel a long way',
		home: 'home is wherever someone saves you a seat',
	};

	/**
	 * A short story (five or six sentences) about `topic`. A person or an animal becomes the hero, a place the setting,
	 * a thing what gets lost and found, and an idea ("courage", "friendship") the lesson.
	 */
	function story(topic, rand = Math.random) {
		const d = D();
		const pick = pickFrom(rand);
		const t = topicOf(topic);
		const pool = (kind, extra = (e) => true) => d.CORE.filter((e) => e.pos === 'noun' && e.kind === kind && !e.mass && !e.nogen && !e.rel && !/^[A-Z]/.test(e.w) && !e.w.includes(' ') && extra(e)).map((e) => e);
		const animals = pool('animal', (e) => STORY_ANIMALS.includes(e.w));
		const places = pool('place', (e) => e.at && STORY_PLACES.includes(e.w));
		const things = pool('thing', (e) => STORY_THINGS.includes(e.w));
		const ideaTheme = Object.keys(MORALS).find((k) => t.text.toLowerCase().includes(k)) || (t.kind === 'idea' ? null : null);

		let hero;
		let heroIsName = false;
		const person = t.kind === 'person';
		if (t.kind === 'animal' || (person && !t.entry.rel)) hero = `${pick(HERO_ADJS)} ${t.text.toLowerCase()}`;
		else if (t.name && !t.kind) {
			hero = t.text;
			heroIsName = true;
		} else if (rand() < 0.4) {
			hero = pick(NAMES);
			heroIsName = true;
		} else hero = `${pick(HERO_ADJS)} ${pick(animals).w}`;
		const place = t.kind === 'place' && !t.name ? t.entry : pick(places);
		const placeName = t.kind === 'place' && t.name ? t.text : null;
		const thing = t.kind === 'thing' || t.kind === 'food' ? t.text.toLowerCase() : pick(things).w;
		const helper = pick(animals.filter((e) => !hero.endsWith(e.w))).w;
		const theme = ideaTheme || pick(Object.keys(MORALS));
		const at = (p) => (placeName ? `in ${placeName}` : `${p.at || 'near'} ${a(p.w)}`);
		const The = heroIsName ? hero : `The ${hero.split(' ').pop()}`;
		const the = heroIsName ? hero : `the ${hero.split(' ').pop()}`;
		const they = heroIsName || person ? 'they' : 'it';
		const its = heroIsName || person ? 'their' : 'its';
		const time = pick(['morning', 'evening', 'Sunday', 'spring morning', 'winter night']);
		const s1 = `Once upon a time, ${heroIsName ? hero : a(hero)} lived ${at(place)}.`;
		const plot = pick([
			() => [
				`Every ${pick(['morning', 'evening', 'day'])}, ${the} ${pick(['walked to the edge of the water', 'counted the clouds', 'tidied the same small corner', 'listened for the wind'])}, and kept ${its} favorite ${thing} close by.`,
				`One ${time}, the ${thing} was gone.`,
				`${The} searched high and low, until ${a(helper)} pointed to a gap ${pick(['under the old steps', 'behind a pile of leaves', 'beside the gate', 'in the tall grass'])}.`,
				`The ${thing} was there, a little dusty but safe.`,
				`From then on, ${the} knew that ${MORALS[theme]}.`,
			],
			() => [
				`${The} had heard stories about ${placeName ? 'a hidden garden' : `the ${pick(places.filter((p) => p !== place)).w}`} beyond the hills, but had never been.`,
				`One ${time}, ${they} packed ${a(thing)} and set off.`,
				`On the way, ${the} met ${a(helper)}, who knew a shortcut and talked the whole way there.`,
				`When they finally arrived, it was ${pick(['quieter', 'bigger', 'stranger', 'lovelier'])} than any story had said.`,
				`${The} came home that night tired and happy, sure that ${MORALS[theme]}.`,
			],
			() => [
				`${The} liked things just so: the same path, the same chair, the same ${thing}.`,
				`Then, one ${time}, ${a(helper)} arrived and asked to stay.`,
				`At first ${the} wasn't sure, because ${a(helper)} was noisy and nothing was just so anymore.`,
				`But the ${helper} shared ${pick(['stories', 'snacks', 'songs', 'the warm spot by the window'])}, and slowly the days felt brighter.`,
				`By the end of the year, ${the} couldn't remember why ${they} had ever wanted things just so, and knew that ${MORALS[theme]}.`,
			],
		])();
		const text = [s1, ...plot].join(' ').replace(/\ba ([aeiou])/g, 'an $1');
		return { title: cap(t.text === 'the world' ? 'A story' : t.text), text };
	}

	/* ---------- Messages for cards and notes ---------- */

	const CLOSE = ['With love', 'Warmly', 'Love', 'All the best', 'Cheers'];
	const OCCASIONS = {
		birthday: [(to, about) => `Happy birthday${to.hi}! I hope your day is full of the people and things you love, and that the year ahead is even better than the last.`, (to) => `Happy birthday${to.hi}! Here's to another year of adventures, good food and great company. Enjoy every minute of today.`],
		thanks: [(to, about) => `Thank you${to.hi}${about ? `${to.hi ? ',' : ''} for ${about}` : ''}! It meant more to me than I can say, and I'm lucky to have you.`, (to, about) => `Just a note to say thank you${to.hi}${about ? `${to.hi ? ',' : ''} for ${about}` : ''}. Your kindness made a real difference.`],
		getwell: [(to) => `Get well soon${to.hi}! I'm thinking of you and hoping each day feels a little better than the one before. Rest up, and let me know if you need anything.`, (to) => `Sending you warm wishes${to.hi}. Take all the time you need to rest; we'll be here when you're back on your feet.`],
		congrats: [(to, about) => `Congratulations${to.hi}${about ? `${to.hi ? ',' : ''} on ${about}` : ''}! You worked hard for this, and you deserve every bit of it.`, (to, about) => `Huge congratulations${to.hi}${about ? `${to.hi ? ',' : ''} on ${about}` : ''}! I'm so proud of you. Time to celebrate!`],
		sorry: [(to, about) => `I'm sorry${to.hi}${about ? ` about ${about}` : ''}. I should have done better, and I'd like to make it right. Thank you for hearing me out.`, (to, about) => `${to.hi ? to.hi.slice(2) + ', I' : 'I'}'m really sorry${about ? ` about ${about}` : ''}. You matter to me, and I hope we can talk soon.`],
		invite: [(to, about) => `You're invited${to.hi}! ${about ? `Join us for ${about}.` : 'Join us for an evening of good food and good company.'} It wouldn't be the same without you. Let me know if you can make it.`],
		luck: [(to, about) => `Good luck${to.hi}${about ? `${to.hi ? ',' : ''} with ${about}` : ''}! You're more ready than you think. I'll be cheering for you.`, (to, about) => `Wishing you the best of luck${to.hi}${about ? `${to.hi ? ',' : ''} with ${about}` : ''}. Take a deep breath; you've got this.`],
		farewell: [(to) => `Goodbye and good luck${to.hi}! It won't be the same without you. Keep in touch, and don't forget us.`, (to) => `We'll miss you${to.hi}! Thank you for everything, and best of luck with what comes next.`],
		welcome: [(to) => `Welcome${to.hi}! We're so glad you're here. Make yourself at home, and shout if you need anything.`],
		wedding: [(to) => `Congratulations on your wedding${to.hi}! Wishing you a lifetime of love, laughter and adventures together.`],
		anniversary: [(to) => `Happy anniversary${to.hi}! Here's to all the years behind you and all the good ones still ahead.`],
		baby: [(to) => `Congratulations on your new baby${to.hi}! Wishing your growing family lots of love, cuddles and, with luck, a little sleep.`],
		sympathy: [(to) => `I'm so sorry for your loss${to.hi}. I'm thinking of you, and I'm here whenever you need anything at all.`],
		holiday: [(to, about) => `Happy ${about || 'holidays'}${to.hi}! Wishing you warm days, good food and time with the people you love.`],
		graduation: [(to) => `Congratulations on graduating${to.hi}! All those late nights paid off. The world is lucky to have you; go show it what you can do.`],
		retirement: [(to) => `Happy retirement${to.hi}! You've earned every slow morning ahead. Enjoy it all.`],
		missyou: [(to) => `I miss you${to.hi}! It's been too long. Let's catch up soon; I'll bring the snacks.`],
	};
	const OCCASION_WORDS = [[/birthday/, 'birthday'], [/thank/, 'thanks'], [/get[\s-]?well|feel better|recovery/, 'getwell'], [/congrat/, 'congrats'], [/sorry|apolog/, 'sorry'], [/invit/, 'invite'], [/good luck|luck/, 'luck'], [/goodbye|farewell|leaving/, 'farewell'], [/welcome/, 'welcome'], [/wedding/, 'wedding'], [/anniversary/, 'anniversary'], [/baby/, 'baby'], [/sympathy|condolence|loss/, 'sympathy'], [/christmas|holiday|new year|hanukkah|diwali|eid|easter/, 'holiday'], [/graduat/, 'graduation'], [/retire/, 'retirement'], [/miss you/, 'missyou']];

	/** The occasion a request names: "a birthday card" -> 'birthday'; null if none. */
	const occasionOf = (text) => (OCCASION_WORDS.find(([re]) => re.test(text.toLowerCase())) || [])[1] || null;

	/**
	 * A message for a card or a note. `to` is who it's for ("my mom", "Sam"), `from` who signs it, `about` what it's for
	 * ("your promotion", "the exam"). A parent or grandparent is addressed the way people do: "Happy birthday, Mom!".
	 */
	function message(occasion, { to = '', from = '', about = '', holiday = '' } = {}, rand = Math.random) {
		const pick = pickFrom(rand);
		const kind = OCCASIONS[occasion] ? occasion : occasionOf(occasion);
		if (!kind) return null;
		const who = String(to).trim().replace(/^(?:my|our)\s+/i, '');
		const FAMILY = { mom: 'Mom', mum: 'Mum', mother: 'Mom', dad: 'Dad', father: 'Dad', grandma: 'Grandma', grandmother: 'Grandma', grandpa: 'Grandpa', grandfather: 'Grandpa', nana: 'Nana', nan: 'Nan', granny: 'Granny' };
		const rel = /^(?:my|our)\s+/i.test(to) || (D() && (D().lookup(who) || []).some((x) => x.e.rel || x.e.kind === 'person'));
		const hi = !who ? '' : FAMILY[who.toLowerCase()] ? `, ${FAMILY[who.toLowerCase()]}` : rel ? '' : `, ${who.replace(/\b\w/g, (c) => c.toUpperCase())}`;
		// The message speaks to them: "her promotion" becomes "your promotion".
		const yours = String(about).replace(/^(?:my|our|his|her|their)\s+/i, 'your ').replace(/\b(?:he|she|they) (?:has|have|is|are)\b/gi, (m) => (/(has|have)$/i.test(m) ? 'you have' : 'you are'));
		let text = pick(OCCASIONS[kind])({ hi }, kind === 'holiday' ? holiday || about : yours);
		if (rel && !FAMILY[who.toLowerCase()] && who) text = `To the best ${who.toLowerCase()} anyone could ask for:\n\n${text}`;
		const sign = from ? `\n\n${pick(CLOSE)},\n${from}` : '';
		return { title: kind, text: text + sign };
	}

	/* ---------- Describing a word ---------- */

	/** A paragraph about a word from what the dictionary knows: what it is, what kind of thing, its parts, examples. */
	function describe(word) {
		const d = D();
		const hits = d.lookup(word);
		if (!hits) return null;
		const e = (hits.find((x) => x.e.pos === 'noun') || hits[0]).e;
		const name = /^[A-Z]/.test(e.w) ? e.w : `${cap(a(e.w))}`;
		const def = e.def.replace(/;.*$/, '');
		const out = [];
		if (e.pos === 'noun') out.push(/^(an?|the) /.test(def) ? `${name} is ${def}.` : `${name}: ${def}.`);
		else if (e.pos === 'verb') out.push(`To ${e.w} is to ${def.replace(/^to /, '')}.`);
		else out.push(`${cap(e.w)} means ${def}.`);
		if (e.isa && e.isa.length && ['animal', 'food', 'thing', 'nature', 'vehicle', 'furniture', 'body', 'place'].includes(e.kind)) {
			const everyday = new Set(d.CORE.map((x) => x.w.toLowerCase()));
			const plain = e.isa.find((k) => everyday.has(k.toLowerCase()));
			out.push(/^[A-Z]/.test(e.w) ? `It is ${a(e.isa[0])}.` : plain && plain !== e.isa[0] ? `It is a kind of ${e.isa[0]}, which makes it ${a(plain)}.` : `It is a kind of ${e.isa[0]}.`);
		}
		const kinds = e.pos === 'noun' ? d.kinds(e.w, 5) : { words: [] };
		if (kinds.words.length) out.push(`Kinds of ${e.w} include ${kinds.words.slice(0, 4).join(', ')}.`);
		if (e.has && e.has.length) out.push(`${/^[A-Z]/.test(e.w) ? 'It includes' : 'Its parts include'} ${e.has.slice(0, 4).join(', ')}.`);
		if (e.partof && e.partof.length) out.push(`It is part of ${e.partof.slice(0, 2).map((x) => (/^[A-Z]/.test(x) ? x : a(x))).join(' and ')}.`);
		if (e.syn && e.syn.length) out.push(`Other words for it: ${e.syn.slice(0, 3).join(', ')}.`);
		if (/[.!?]$/.test(e.ex)) out.push(`As in: "${e.ex}"`);
		return { title: e.w, text: out.join(' ') };
	}

	/* ---------- Summaries: the most telling sentences of a text ---------- */

	const STOP = new Set('a an the and or but of to in on at by for with from as is are was were be been being it its this that these those he she they his her their we you i not no also which who whom whose what when where how than then there here such into onto about over after before during while has have had do does did can could would should will may might must one two first known later other more most many some all any each both very only'.split(' '));
	const ABBR = /\b(?:Mr|Mrs|Ms|Dr|St|Jr|Sr|Prof|Gen|Col|Lt|vs|etc|e\.g|i\.e|c|ca|No|Mt|U\.S|U\.K)\.$/i;

	/** A text's sentences, keeping "Dr. Smith" and "e.g. this" whole, and dropping headings and reference lists. */
	function sentencesOf(text) {
		const body = String(text).split(/\n\s*(?:See also|References|Notes|Bibliography|External links|Further reading|Sources|Citations)\s*\n/)[0];
		const out = [];
		for (const block of body.split(/\n+/)) {
			if (!/[.!?]["')\]]?\s*$/.test(block.trim())) continue;
			let buf = '';
			for (const piece of block.split(/(?<=[.!?]["')\]]?)\s+(?=["'(]?[A-Z0-9])/)) {
				buf = buf ? `${buf} ${piece}` : piece;
				if (ABBR.test(buf) || /\b[A-Z]\.$/.test(buf)) continue;
				out.push(buf.trim());
				buf = '';
			}
			if (buf) out.push(buf.trim());
		}
		return out.filter((s) => s.split(/\s+/).length >= 5);
	}

	/**
	 * The `n` most telling sentences of a text, in their original order: each is scored by how often its words appear
	 * across the whole text (a sentence full of the text's main words is about its main point), with a little extra
	 * for coming early. Sentences in `skip` are left out, so key points don't repeat a summary.
	 */
	function summarize(text, n = 3, skip = []) {
		const sents = sentencesOf(text);
		if (!sents.length) return [];
		const words = (s) => (s.toLowerCase().match(/[a-zà-ÿ]+/g) || []).filter((w) => w.length > 2 && !STOP.has(w));
		const freq = new Map();
		sents.forEach((s) => new Set(words(s)).forEach((w) => freq.set(w, (freq.get(w) || 0) + 1)));
		const skipped = new Set(skip.map((s) => s.trim()));
		const scored = sents.map((s, i) => {
			const ws = words(s);
			const len = s.split(/\s+/).length;
			const base = ws.reduce((sum, w) => sum + Math.log(1 + (freq.get(w) || 0)), 0) / Math.max(6, Math.sqrt(ws.length) * 3);
			const position = 1 + 0.6 / (1 + i / 3);
			const fit = len > 45 ? 0.6 : len < 8 ? 0.7 : 1;
			return { s, i, score: base * position * fit };
		}).filter((x) => !skipped.has(x.s) && ![...skipped].some((k) => k.includes(x.s) || x.s.includes(k)));
		return scored.sort((x, y) => y.score - x.score).slice(0, n).sort((x, y) => x.i - y.i).map((x) => x.s);
	}

	(root.Omni = root.Omni || {}).onyxWrite = { haiku, poem, acrostic, story, message, describe, summarize, sentencesOf, occasionOf, syllables, topicOf, OCCASIONS: Object.keys(OCCASIONS) };
})(typeof window !== 'undefined' ? window : globalThis);
