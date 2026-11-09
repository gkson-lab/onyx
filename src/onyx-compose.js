// Onyx 3's composer: longer writing from a prompt. Essays and articles, stories, emails and letters, speeches and
// toasts, product descriptions. It isn't a language model. It reads the prompt for what to write, who and what it is
// about and how it should sound; plans the piece (its parts, in order); then writes each part from sentence patterns
// written for Onyx, filled with what the prompt said and with what Onyx knows: its dictionary (what a thing is, its
// kinds, its parts, how the word is used) and, when the person allows it, the Wikipedia article on the subject.
//
//   Omni.onyxCompose.parse('write an essay about volcanoes')          -> { form: 'essay', topic: 'volcanoes', ... }
//   Omni.onyxCompose.write(job)                                       -> { title, text, plan, form }
//   Omni.onyxCompose.fromArticle(job, { title, extract, text, url })  -> an essay built from an article
(function (root) {
	'use strict';

	const Omni = (root.Omni = root.Omni || {});
	const D = () => Omni.onyxDictionary;
	const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
	const list = (xs, and = 'and') => (xs.length > 2 ? `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}` : xs.join(` ${and} `));
	const a = (w) => (D() ? D().a(w) : (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w);
	const pickFrom = (rand) => (xs) => xs[Math.floor(rand() * xs.length)];
	const period = (s) => (/[.!?]["']?$/.test(s.trim()) ? s.trim() : s.trim() + '.');
	const lower1 = (s) => (s && !/^[A-Z][A-Z]|^I\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

	/* ---------- Reading the prompt ---------- */

	const ASK = '(?:please |can you |could you |would you |will you |i want |i need |i would like |i\'d like )?(?:you to )?(?:write|compose|draft|make|give|create|generate|type|prepare|do)(?: me| us| up)?\\s+';
	const SIZE = '(?:(?:a|an|the|another|one|some|my)\\s+)?((?:(?:very |really )?(?:short|brief|quick|little|small|long|longer|detailed|full|simple|formal|informal|casual|friendly|polite|professional|funny|kind|warm|five[- ]paragraph|three[- ]paragraph|one[- ]paragraph)\\s+)*)';
	const FORMS = [
		['essay', /^(?:essays?|articles?|reports?|blog ?posts?|papers?|compositions?|write-?ups?|paragraphs?|texts?|pieces?|overviews?|explanations?|introductions?)\b/],
		['story', /^(?:(?:bedtime |fairy |short )?stor(?:y|ies)|tales?|fables?|adventures?)\b/],
		['email', /^(?:e-?mails?|letters?|messages?|notes?|memos?)\b/],
		['speech', /^(?:speech(?:es)?|toasts?|talks?)\b/],
		['product', /^(?:product descriptions?|descriptions? (?:of|for) (?:a |an |my |our |the )?(?:product|item)|ads?|adverts?|advertisements?|sales pitch(?:es)?|listings?|blurbs?|taglines?)\b/],
	];
	// What an email is for, by how people say it. [intent, pattern]; the rest of the sentence is the details.
	const PURPOSES = [
		['thank', /\b(?:thank(?:ing|s)?|to thank|say(?:ing)? thanks?)\b(?: (?:him|her|them|you))?(?: for)?/],
		['apologize', /\b(?:apologi[sz](?:e|ing)|to apologi[sz]e|say(?:ing)? sorry)\b(?: (?:to (?:him|her|them)))?(?: for)?/],
		['invite', /\b(?:invit(?:e|ing)|to invite)\b(?: (?:him|her|them|everyone))?(?: to)?/],
		['complain', /\b(?:complain(?:ing)?|to complain|a complaint)\b(?: about)?/],
		['followup', /\b(?:follow(?:ing)? up|to follow up|check(?:ing)? in)\b(?: on| about)?/],
		['resign', /\b(?:resign(?:ing|ation)?|quit(?:ting)?|two weeks'? notice|giving notice)\b/],
		['congratulate', /\b(?:congratulat(?:e|ing|ions))\b(?: (?:him|her|them))?(?: on| for)?/],
		['request', /\b(?:ask(?:ing)?|request(?:ing)?|to ask|to request)\b(?: (?:him|her|them|if (?:he|she|they) (?:can|could)))?(?: (?:to|for|if i (?:can|could|may)|about))?/],
		['inform', /\b(?:tell(?:ing)?|let(?:ting)? (?:him|her|them) know|inform(?:ing)?|announc(?:e|ing)|remind(?:ing)?|about|saying|that says)\b(?: (?:him|her|them))?(?: (?:that|about|of))?/],
	];
	const FORMAL = /\b(?:boss|manager|supervisor|landlord|landlady|professor|teacher|principal|doctor|dentist|lawyer|customer service|support|company|bank|airline|hotel|hr|human resources|recruiter|hiring manager|client|customer|director|ceo|council|office|team|department|school|university|insurance|store|shop)\b/;

	/**
	 * Reads a request for a longer piece: { form, topic, size, tone, ... } or null. Short pieces (haiku, poems,
	 * acrostics, card messages) belong to onyx-write.js and are left alone.
	 */
	function parse(text) {
		const raw = String(text).trim().replace(/[.!?]+$/, '');
		const t = raw.toLowerCase().replace(/[’]/g, "'");
		const m = t.match(new RegExp(`^${ASK}${SIZE}(.+)$`)) || t.match(new RegExp(`^(?:i need |i want |how about |an? )${SIZE}(.+)$`));
		if (!m) return null;
		const style = (m[1] || '').trim();
		const rest = m[2];
		const form = FORMS.find(([, re]) => re.test(rest));
		if (!form) return null;
		const after = rest.replace(form[1], '').trim();
		const original = raw.slice(raw.length - after.length);
		const job = { form: form[0], size: /\b(?:long|longer|detailed|full|five)/.test(style) ? 'long' : /\b(?:short|brief|quick|little|small|one|three)/.test(style) || /^paragraph/.test(rest) ? 'short' : 'medium', tone: /\b(?:formal|professional|polite)\b/.test(style) ? 'formal' : /\b(?:informal|casual|friendly|funny|warm|kind)\b/.test(style) ? 'casual' : null, prompt: raw };
		if (/^paragraph/.test(rest)) job.size = 'paragraph';
		if (job.form === 'essay' || job.form === 'speech' && !/\b(?:wedding|birthday|retirement|graduation|anniversary|farewell|funeral|toast)\b/.test(t)) {
			const topic = original.replace(/^(?:about|on|of|explaining|describing|that explains|regarding|for)\s+/i, '').replace(/^(?:what|how|why) (?:is|are|does|do) /i, '').trim();
			if (!topic || /^(it|that|this|them)$/i.test(topic)) return Object.assign(job, { topic: null });
			return Object.assign(job, { topic });
		}
		if (job.form === 'story') {
			// Card-sized stories stay with the short writer unless the prompt gives it something to work with.
			const about = original.replace(/^(?:about|of|with|featuring|where|in which)\s+/i, '').trim();
			return Object.assign(job, story(about, original));
		}
		if (job.form === 'email') {
			// "A birthday message for my mom" is a card (onyx-write.js); an email or a letter has a recipient and a purpose.
			if (/^(?:messages?|notes?)\b/.test(rest) && !/\b(?:asking|to ask|apologi|complain|invit|follow|resign|request|tell|inform|remind|let .* know)\b/.test(after)) return null;
			return Object.assign(job, email(after, original, /^letters?/.test(rest) ? 'letter' : 'email'));
		}
		if (job.form === 'speech') return Object.assign(job, speech(after, original), { toast: /^toasts?/.test(rest) });
		if (job.form === 'product') return Object.assign(job, product(after, original));
		return null;
	}

	/** A story prompt: who it's about, what they want or what happens, and where. */
	function story(about, original) {
		let s = original.replace(/^(?:about|of|with|featuring|where|in which)\s+/i, '').trim();
		const out = { hero: null, name: null, quest: null, questKind: 'adventure', setting: null, rich: false };
		const place = s.match(/\s+(?:(?:set |that takes place |living |who lives? )?(in|on|at|under|inside|near|by) ((?:the |a |an )?[A-Za-z' -]{2,30}?))$/);
		if (place && !/\b(?:love|trouble|time|search|need|danger)\b/i.test(place[2])) {
			out.setting = `${place[1].toLowerCase()} ${place[2]}`;
			s = s.slice(0, place.index).trim();
		}
		const quest = s.match(/\s+(?:who|that|which)\s+(.+)$/i) || s.match(/\s+(looking for|searching for|trying to|learning to|afraid of)\s+(.+)$/i);
		if (quest) {
			out.quest = (quest[2] ? `${quest[1]} ${quest[2]}` : quest[1]).trim();
			s = s.slice(0, quest.index).trim();
		}
		const named = s.match(/^(.*?)\s*(?:named|called)\s+([A-Z][\w'-]*)$/) || s.match(/^()([A-Z][a-z'-]+)$/);
		if (named) {
			out.name = named[2];
			s = named[1].trim();
		}
		out.hero = s.replace(/^(?:a|an|the|some)\s+/i, '').trim() || null;
		const q = (out.quest || '').toLowerCase();
		const kinds = [['learn', /^(?:learns?|is learning|learning|wants? to learn|tries to learn)(?: how)? to (.+)$/], ['afraid', /^(?:is|was|are) (?:afraid|scared|frightened|terrified) of (.+)$|^afraid of (.+)$|^fears? (.+)$/], ['lose', /^(?:loses?|lost|has lost|can't find|cannot find|misplaces?) (.+)$/], ['find', /^(?:finds?|found|discovers?|stumbles (?:up)?on|looking for|searching for|is looking for|looks for|searches for) (.+)$/], ['want', /^(?:wants?|wishes|dreams? of|longs?|hopes?|would like|tries|trying|is trying)(?: to)? (.+)$/], ['become', /^(?:becomes?|turns into|wants to (?:be|become)) (.+)$/], ['help', /^(?:helps?|saves?|rescues?|befriends?|meets?) (.+)$/]];
		for (const [kind, re] of kinds) {
			const k = q.match(re);
			if (k) {
				out.questKind = kind;
				out.object = (k[1] || k[2] || k[3] || '').trim();
				break;
			}
		}
		out.rich = !!(out.quest || out.setting || out.name);
		return out;
	}

	/** An email or letter prompt: who it's to, what it's for, and the details. */
	function email(after, original, kind) {
		const out = { kind, to: null, purpose: 'inform', details: '', formal: false };
		let s = original.trim();
		const purposeAt = PURPOSES.map(([p, re]) => ({ p, m: s.toLowerCase().match(re) })).filter((x) => x.m).sort((x, y) => x.m.index - y.m.index)[0];
		const to = s.match(/^(?:to|for)\s+((?:my |our |the |a )?[A-Za-z' ]+?)(?=\s+(?:asking|to |thanking|apologi|inviting|complaining|about|saying|telling|that|following|requesting|letting|congratulat|informing|reminding|resign|announcing)|$)/i);
		if (to) out.to = to[1].trim();
		if (purposeAt) {
			out.purpose = purposeAt.p;
			out.details = s.slice(purposeAt.m.index + purposeAt.m[0].length).trim();
			if (!out.to) {
				const late = out.details.match(/\s+to\s+((?:my |our |the )?[A-Za-z' ]+)$/i);
				if (late && purposeAt.p !== 'invite') {
					out.to = late[1].trim();
					out.details = out.details.slice(0, late.index).trim();
				}
			}
		} else out.details = s.replace(/^(?:to|for)\s+(?:my |our |the |a )?[A-Za-z' ]+?\s*/i, '').trim();
		// From their point of view to the reader's: "asking him to fix his heater" is "could you fix your heater".
		out.details = out.details.replace(/\b(?:his|her|their)\b/gi, 'your').replace(/\b(?:he|she|they)\b/gi, 'you').replace(/\b(?:him|them)\b/gi, 'you').replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
		out.formal = FORMAL.test((out.to || '').toLowerCase()) || out.purpose === 'resign' || out.purpose === 'complain';
		return out;
	}

	/** A speech or toast prompt: the occasion and who it's for. */
	function speech(after, original) {
		const t = original.toLowerCase();
		const occasion = (t.match(/\b(wedding|birthday|retirement|graduation|anniversary|farewell|going[- ]away|engagement|baby shower|promotion)\b/) || [])[1] || 'celebration';
		const who = original.match(/\b(?:for|to|at|about)\s+((?:my |our )?[A-Za-z' ]+?)(?:'s|\s+(?:and|who|on|at)\b|$)/i);
		const person = who ? who[1].replace(new RegExp(`\\s*\\b${occasion}\\b.*$`, 'i'), '').replace(/^(?:a|an|the)\s+/i, '').trim() : null;
		return { occasion, person: person && !/^(?:wedding|birthday|retirement|graduation|anniversary|toast|speech)$/i.test(person) ? person : null, toast: /\btoast\b/.test(t) };
	}

	/** A product prompt: what it is, what it's called, and the words that describe it. */
	function product(after, original) {
		let s = original.replace(/^(?:for|of|about)\s+/i, '').trim();
		const out = { name: null, thing: null, traits: [], audience: null };
		const called = s.match(/\s+(?:called|named)\s+["']?([A-Z][\w' -]*?)["']?$/);
		if (called) {
			out.name = called[1].trim();
			s = s.slice(0, called.index).trim();
		}
		const aud = s.match(/\s+for\s+((?:busy |young |new )?[a-z ]+)$/i);
		if (aud) {
			out.audience = aud[1].trim();
			s = s.slice(0, aud.index).trim();
		}
		const words = s.replace(/^(?:a|an|the|my|our)\s+/i, '').split(/\s+/).filter(Boolean);
		// The thing is the last noun; what comes before it describes it ("a waterproof hiking backpack").
		out.thing = words.slice(-1)[0] || 'product';
		const d = D();
		if (words.length >= 2 && d && d.lookup(words.slice(-2).join(' '))) out.thing = words.slice(-2).join(' ');
		out.traits = words.slice(0, words.length - out.thing.split(' ').length);
		return out;
	}

	/* ---------- What Onyx knows about a subject ---------- */

	/**
	 * Everything the dictionary can say about a subject, for an essay: { word, known, def, senses, isa, kinds, parts,
	 * partOf, similar, opposite, examples, plural }. `known` is false when the dictionary doesn't have it.
	 */
	function know(topic) {
		const d = D();
		const clean = String(topic).toLowerCase().replace(/^(?:the|a|an|some)\s+/, '').trim();
		const k = { topic: clean, hadThe: /^the\s/i.test(String(topic).trim()), word: clean, known: false, senses: [], isa: [], kinds: [], parts: [], partOf: [], similar: [], opposite: [], examples: [] };
		if (!d) return k;
		const hits = (d.lookupAll ? d.lookupAll(clean) : d.lookup(clean)) || [];
		if (!hits.length) return k;
		const entries = hits.map((h) => h.e);
		const main = entries.find((e) => e.pos === 'noun') || entries[0];
		k.known = true;
		k.word = main.w;
		// The full dictionary doesn't say what can be counted: animals, things, people and places can; ideas and
		// sciences ("physics", "friendship") are spoken of without "a".
		k.mass = !!main.mass || main.pos !== 'noun' || (main.src === 'full' && !['animal', 'thing', 'person', 'nature', 'place', 'body', 'food'].includes(main.kind));
		k.plural = main.pos === 'noun' && !k.mass && d.forms ? d.forms.plural(main) : null;
		k.proper = /^[A-Z]/.test(main.w);
		k.pos = main.pos;
		k.def = main.def;
		k.kind = main.kind || null;
		k.senses = entries.filter((e) => e !== main && e.def && e.def !== main.def).slice(0, 3).map((e) => ({ pos: e.pos, def: e.def }));
		// The family tree is told only when it agrees with the definition: WordNet files a volcano under "crack", but
		// Onyx's definition calls it a mountain, and the essay shouldn't argue with itself.
		const tree = main.isa || [];
		const head = main.def.toLowerCase().replace(/^(?:an?|the)\s+/, '').split(/\s+(?:with|that|which|who|of|for|in|on|used|where|from|to)\b|[,;(]/)[0];
		const agrees = !/^(?:an?|the)\s/.test(main.def) || tree.slice(0, 6).some((x) => x.split(' ').some((w) => w.length > 3 && head.includes(w.toLowerCase().replace(/s$/, ''))));
		k.isa = agrees ? tree.slice(0, 4) : [];
		k.parts = (main.has || []).slice(0, 6);
		k.partOf = (main.partof || []).slice(0, 3);
		k.similar = (main.syn || []).slice(0, 4);
		k.opposite = (main.ant || []).slice(0, 2);
		if (main.pos === 'noun' && d.kinds) {
			const kinds = d.kinds(main.w, 8);
			k.kinds = kinds.total >= 2 ? kinds.words.filter((w) => w.toLowerCase() !== main.w.toLowerCase()).slice(0, 7) : [];
		}
		// How the word is used: its own example, and other entries' examples that use it.
		const uses = new Set();
		if (main.ex && /[.!?]$/.test(main.ex)) uses.add(main.ex);
		const re = new RegExp(`\\b${main.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s|es)?\\b`, 'i');
		for (const e of d.WORDS) {
			if (uses.size >= 4) break;
			if (e !== main && e.ex && /[.!?]$/.test(e.ex) && re.test(e.ex) && e.ex.length < 110) uses.add(e.ex);
		}
		k.examples = [...uses];
		// What its parts and kinds are, in a few words, so the essay can say more than their names.
		const brief = (w) => {
			const e = ((d.lookupAll ? d.lookupAll(w) : d.lookup(w)) || []).map((h) => h.e).find((x) => x.pos === 'noun');
			return e && e.def && e.def.length < 120 ? e.def.replace(/;.*$/, '') : null;
		};
		k.partDefs = k.parts.map((w) => [w, brief(w)]).filter((x) => x[1]).slice(0, 3);
		k.kindDefs = k.kinds.map((w) => [w, brief(w)]).filter((x) => x[1]).slice(0, 3);
		return k;
	}

	/* ---------- Essays ---------- */

	const HOOKS = [
		(k) => `Most people could point to ${k.the} without being able to say exactly what ${k.it} ${k.is}.`,
		(k) => `${cap(k.subject)} ${k.verbIs} easy to take for granted.`,
		(k) => `It is worth stopping, now and then, to look closely at something as familiar as ${k.the}.`,
		(k) => `Ask what ${k.the} ${k.is}, and the answer turns out to be richer than it first seems.`,
	];
	const TRANSITIONS = ['To begin with,', 'Beyond that,', 'It is also worth knowing that', 'On top of this,', 'Just as importantly,', 'There is more:'];

	/** The words an essay uses for its subject: "a volcano", "volcanoes", "it"/"they". */
	function subjectWords(k) {
		const plural = k.plural && !k.proper && !k.mass;
		// "The French Revolution" keeps the "the" it was asked about with.
		const proper = k.proper && k.hadThe ? `the ${k.word}` : k.word;
		return { subject: k.proper ? proper : plural ? k.plural : k.word, the: k.proper ? proper : k.mass ? k.word : a(k.word), it: 'it', is: 'is', verbIs: plural ? 'are' : 'is', singular: k.proper ? proper : k.mass ? k.word : a(k.word) };
	}

	/** An essay from the dictionary: a plan, then a paragraph for each part of it. */
	function essay(job, rand = Math.random) {
		const pick = pickFrom(rand);
		const k = Object.assign(know(job.topic), {});
		if (!k.known) return null;
		Object.assign(k, subjectWords(k));
		const plan = ['what it is'];
		const paras = [];
		// 1. Opening: a hook, then the definition.
		const also = k.similar.length ? ` Other words for it are ${list(k.similar.map((s) => `"${s}"`), 'and')}.` : '';
		paras.push(`${pick(HOOKS)(k)} At its simplest, ${k.singular} is ${lower1(k.def.replace(/;.*$/, ''))}.${k.def.includes(';') ? ` More fully: ${lower1(k.def.split(';').slice(1).join(';').trim())}.` : ''}${also}`);
		// 2. Where it belongs, and its kinds.
		if (k.isa.length || k.kinds.length) {
			plan.push('where it belongs');
			const chain = k.isa.length ? `${cap(k.singular)} is a kind of ${k.isa[0]}${k.isa[1] ? `, which is in turn a kind of ${k.isa[1]}` : ''}${k.isa[2] ? `, and so, in the end, ${a(k.isa[2])}` : ''}. That family tells us what to expect of ${k.it}: whatever is true of ${k.isa[0].endsWith('s') ? k.isa[0] : a(k.isa[0])} in general is true here too.` : '';
			const kinds = k.kinds.length ? ` ${chain ? 'Within its own family there is variety as well' : `There is more than one kind of ${k.word}`}: ${list(k.kinds)}.${k.kindDefs.length ? ` ${cap(a(k.kindDefs[0][0]))}, for instance, is ${lower1(k.kindDefs[0][1])}${k.kindDefs[1] ? `, while ${a(k.kindDefs[1][0])} is ${lower1(k.kindDefs[1][1])}` : ''}.` : ''}` : '';
			paras.push((chain + kinds).trim());
		}
		// 3. Its parts, and what it is part of.
		if (job.size !== 'short' && (k.parts.length || k.partOf.length)) {
			plan.push('what it is made of');
			const parts = k.parts.length ? `Look closer and ${k.singular} turns out to have parts: ${list(k.parts)}.${k.partDefs.length ? ` ${cap(a(k.partDefs[0][0]))} is ${lower1(k.partDefs[0][1])}${k.partDefs[1] ? `; ${a(k.partDefs[1][0])} is ${lower1(k.partDefs[1][1])}` : ''}. Each has its job, and the whole depends on all of them.` : ''}` : '';
			const whole = k.partOf.length ? ` ${parts ? 'In the other direction' : 'Seen from further away'}, ${k.singular} is itself part of something larger: ${list(k.partOf.map((w) => (/^[A-Z]/.test(w) ? w : a(w))))}.` : '';
			paras.push((parts + whole).trim());
		}
		// 4. The word in use.
		if (job.size !== 'short' && (k.examples.length || k.senses.length || k.opposite.length)) {
			plan.push('how we talk about it');
			const uses = k.examples.length ? `We meet ${k.proper ? 'the name' : 'the word'} in ordinary sentences: ${k.examples.slice(0, job.size === 'long' ? 3 : 2).map((x) => `"${x}"`).join(' ')} Sentences like these show what people expect of ${k.the}.` : '';
			const senses = k.senses.length ? ` The word has other lives too: ${k.senses.slice(0, 2).map((s) => `as ${a(s.pos)}, it can mean ${lower1(s.def.replace(/;.*$/, ''))}`).join('; ')}.` : '';
			const opp = k.opposite.length ? ` Its opposite is ${list(k.opposite.map((s) => `"${s}"`), 'or')}, and it is partly by that contrast that we understand it.` : '';
			paras.push((uses + senses + opp).trim());
		}
		// 5. Closing.
		plan.push('why it matters');
		const facts = [k.isa[0] && `a kind of ${k.isa[0]}`, k.parts.length && `made of ${list(k.parts.slice(0, 3))}`, k.kinds.length && `found in forms as different as ${list(k.kinds.slice(0, 2))}`].filter(Boolean);
		paras.push(`${pick(['In short,', 'To sum up,', 'Taken together,'])} ${k.singular} is ${lower1(k.def.replace(/;.*$/, ''))}${facts.length ? `: ${list(facts)}` : ''}. ${pick([`The more closely we look at ${k.the}, the more there is to see.`, `Knowing this much is a good start, and a reason to look at ${k.the} a little differently next time.`, `That is a lot to hold in one small word.`])}`);
		const shown = job.size === 'paragraph' ? [paras[0] + ' ' + paras[paras.length - 1]] : paras;
		return { form: 'essay', title: cap(k.proper ? k.word : k.plural && !k.mass ? k.plural : k.word), text: shown.join('\n\n'), plan: job.size === 'paragraph' ? ['what it is', 'why it matters'] : plan, from: 'dictionary' };
	}

	/**
	 * An essay from an article (Wikipedia's, fetched with permission): its opening, then its most telling sentences
	 * grouped into paragraphs in the article's order, then a close. The facts and most of the words are the article's.
	 */
	function fromArticle(job, article) {
		const W = Omni.onyxWrite;
		if (!W || !article || !article.extract) return null;
		const size = job.size === 'long' ? 9 : job.size === 'short' || job.size === 'paragraph' ? 3 : 6;
		const intro = W.sentencesOf(article.extract).slice(0, job.size === 'paragraph' ? 2 : 3);
		const body = article.text ? W.summarize(article.text, size, intro) : [];
		const paras = [intro.join(' ')];
		const per = job.size === 'long' ? 3 : 2;
		for (let i = 0; i < body.length && job.size !== 'paragraph'; i += per) {
			const chunk = body.slice(i, i + per);
			paras.push(`${TRANSITIONS[(i / per) % TRANSITIONS.length]} ${lower1(chunk[0])}${chunk.length > 1 ? ' ' + chunk.slice(1).join(' ') : ''}`);
		}
		if (job.size === 'paragraph') paras[0] += body.length ? ' ' + body[0] : '';
		else paras.push(`In short, ${lower1(article.title)}${article.description ? `, ${lower1(article.description)},` : ''} rewards a closer look, and the points above are only where the subject begins.`);
		return { form: 'essay', title: article.title, text: paras.join('\n\n'), plan: ['the opening of the article', ...(job.size === 'paragraph' ? [] : [`its ${body.length} most telling sentences, in order`, 'a close'])], from: 'article', url: article.url };
	}

	/* ---------- Stories ---------- */

	const TRAITS = ['curious', 'quiet', 'stubborn', 'cheerful', 'careful', 'restless', 'gentle', 'bold', 'shy', 'clever'];
	const HELPERS = ['an old owl', 'a patient tortoise', 'a talkative crow', 'a girl with a red scarf', 'a baker who never slept', 'a lighthouse keeper', 'a small gray cat', 'a fisherman mending his nets', 'a gardener with muddy boots'];
	const PLACES = ['at the edge of a pine forest', 'in a village by the sea', 'on a hill above a sleepy town', 'in a house with a crooked chimney', 'beside a slow green river'];
	const ing = (verbPhrase) => {
		const [v, ...rest] = verbPhrase.split(' ');
		const d = D();
		const e = d && ((d.lookup(v) || []).map((h) => h.e).find((x) => x.pos === 'verb'));
		const g = e && d.forms ? d.forms.ing(e) : /e$/.test(v) && !/ee$/.test(v) ? v.slice(0, -1) + 'ing' : v + 'ing';
		return [g, ...rest].join(' ');
	};

	/** A story from a prompt: five parts (who and where, the wish or trouble, the first try, the help, the ending). */
	function tale(job, rand = Math.random) {
		const pick = pickFrom(rand);
		const hero = job.hero || (job.name ? null : 'traveler');
		const name = job.name;
		const first = name || `the ${hero}`;
		const Hero = cap(first);
		const trait = pick(TRAITS);
		const intro = name ? (hero ? `${a(hero)} named ${name}` : name) : a(`${trait} ${hero}`);
		const place = job.setting || pick(PLACES);
		const helper = pick(HELPERS);
		const obj = job.object || '';
		const P = {
			learn: {
				want: `More than anything, ${first} wanted to learn to ${obj}. Everyone else seemed to manage it without thinking, which only made it harder.`,
				try: `The first try went badly. So did the second. ${Hero} sat down, quite sure that ${ing(obj)} was for other people.`,
				help: `That was when ${helper} stopped and watched for a while. "Nobody starts out good at it," ${helper.replace(/^an? /, 'the ')} said. "Do it badly ten times. The eleventh will surprise you."`,
				end: `So ${first} did it badly, and then a little less badly. On the eleventh try something changed. It was not perfect, but it was real ${ing(obj)}, and it belonged to ${name || 'them'}.`,
				last: `After that, whenever anyone said they could never learn to ${obj}, ${first} would smile and say, "Come and do it badly with me."`,
			},
			afraid: {
				want: `There was only one trouble: ${first} was afraid of ${obj}. Not a little afraid. The kind of afraid that makes you plan your whole day around it.`,
				try: `${Hero} tried pretending the fear wasn't there, which worked until it didn't. One evening there was no way around it.`,
				help: `${cap(helper)} happened to be nearby. "You don't have to stop being afraid," ${helper.replace(/^an? /, 'the ')} said. "You only have to take one step while you are."`,
				end: `${Hero} took one step. Then, since nothing terrible happened, another. ${cap(obj)} turned out to be smaller up close than it had been from far away.`,
				last: `The fear never went away entirely. But it learned to walk a few steps behind, and ${first} learned not to wait for it.`,
			},
			lose: {
				want: `One morning ${first} woke to find that ${obj} was gone. It was not under the bed, nor behind the door, nor in any of the places lost things usually wait.`,
				try: `${Hero} searched all day, asking everyone, and came home with tired feet and nothing else.`,
				help: `"Where did you last feel happy with it?" asked ${helper}, which seemed a strange question. But ${first} thought about it, and remembered.`,
				end: `And there it was, exactly where the happy afternoon had left it, a little dusty and none the worse. ${Hero} held ${obj.replace(/^(?:his|her|their|its|a|an|the) /, 'the ')} for a long moment before going home.`,
				last: `From then on ${first} kept it close, but not too close. Some things, it turns out, like to be looked for now and then.`,
			},
			find: {
				want: `One day, quite by accident, ${first} found ${obj}. It was not the sort of thing anyone expects to find, and for a moment ${first} only stared.`,
				try: `The trouble with finding ${obj} is deciding what to do next. ${Hero} tried hiding it, then tried forgetting it, and could do neither.`,
				help: `In the end ${first} showed it to ${helper}, who looked at it for a long time. "Things like this choose who finds them," ${helper.replace(/^an? /, 'the ')} said. "The question is what you'll do about being chosen."`,
				end: `So ${first} stopped hiding ${obj.replace(/^(?:a|an) /, 'the ')} and started looking after it instead, and that made all the difference.`,
				last: `People still ask how it happened. ${Hero} just says, "I was looking at the ground that day. You'd be surprised what's down there."`,
			},
			want: {
				want: `What ${first} wanted, more than anything, was to ${obj}. It was the first thought in the morning and the last one at night.`,
				try: `Wanting, though, is not the same as doing. The first attempt ended almost before it began, and ${first} came home discouraged.`,
				help: `"You're trying to do all of it at once," said ${helper}. "Do the first small part. Then see if the second part looks any different."`,
				end: `The first small part took a week. The second took a day. And one bright morning, without any fuss at all, ${first} did ${/^(?:be|become)\b/.test(obj) ? 'it' : `get to ${obj}`}.`,
				last: `It was everything ${first} had hoped, and also quite different, which is how you can tell a wish from a plan.`,
			},
			become: {
				want: `What ${first} wanted was to become ${obj}. Everyone said it couldn't be done, which is what everyone always says.`,
				try: `${Hero} practiced in secret, and got it wrong in every way there is to get it wrong.`,
				help: `It was ${helper} who noticed. "You're already halfway there," ${helper.replace(/^an? /, 'the ')} said. "You just keep stopping to check."`,
				end: `So ${first} stopped checking. And somewhere between one ordinary day and the next, it happened: ${first} was ${obj}, as if it had always been so.`,
				last: `Nobody could say exactly when the change came. Least of all ${first}, who had been too busy to notice.`,
			},
			help: {
				want: `One gray afternoon, ${first} came across ${obj.replace(/^(?:a|an) /, (m) => m)}${/^(?:a|an|the|some|his|her|their)\b/.test(obj) ? '' : ''}, in more trouble than one creature should have to carry alone.`,
				try: `${Hero} was not sure what to do. Helping is harder than it looks, and the first attempt only made a muddle.`,
				help: `${cap(helper)}, passing by, gave one piece of advice: "Don't fix it for them. Stay with them while they fix it."`,
				end: `So ${first} stayed. It took the rest of the day and a good part of the night, and by morning the trouble was the size troubles ought to be.`,
				last: `They were friends after that, the kind who don't need to say much, and ${first} never passed that spot again without slowing down.`,
			},
			adventure: {
				want: `Nothing much ever happened there, and ${first} had begun to think nothing ever would. Then, one windy morning, a door that had always been locked stood open.`,
				try: `Beyond it was a path ${first} had never seen. ${Hero} followed it past the last familiar tree, and got thoroughly, wonderfully lost.`,
				help: `It was ${helper} who pointed the way. "Everyone who comes down this path is looking for something," ${helper.replace(/^an? /, 'the ')} said. "Most find something else, and like it better."`,
				end: `At the end of the path there was no treasure, only a view of home from a side ${first} had never seen. It looked smaller from there, and kinder.`,
				last: `${Hero} walked back in time for supper, and told no one. But the door stayed unlocked after that, in case.`,
			},
		}[job.questKind] || null;
		if (!P) return null;
		const open = `Once there was ${intro} who lived ${place}. ${cap(name || first)} was ${name ? `${a(trait)} sort of ${hero || 'person'}, ` : ''}the kind who notices things other people walk past.`;
		const parts = job.size === 'short' ? [open, P.want, P.end] : job.size === 'long' ? [open, P.want, P.try, `Days went by. ${Hero} thought about giving up, and did give up, twice, and both times found that giving up was duller than trying.`, P.help, P.end, P.last] : [open, P.want, P.try, P.help, P.end, P.last];
		const thing = obj.replace(/^(?:an?|the|his|her|their|its|some)\s+/, '').replace(/\b[a-z]/g, (c) => c.toUpperCase());
		const who = name ? (hero && !/^(?:girl|boy|man|woman|child|kid|person|lady)$/.test(hero) ? `${name} the ${cap(hero)}` : name) : `The ${cap(hero)}`;
		const title = ['find', 'lose', 'help'].includes(job.questKind) && thing ? `${who} and the ${thing}` : job.questKind === 'learn' ? `${who}${name ? ', Who' : ' Who'} Learned to ${cap(obj.split(' ')[0])}` : who;
		return { form: 'story', title, text: parts.join('\n\n'), plan: ['who and where', job.questKind === 'adventure' ? 'something changes' : `the ${{ learn: 'wish to learn', afraid: 'fear', lose: 'loss', find: 'discovery', want: 'wish', become: 'wish to change', help: 'meeting' }[job.questKind]}`, ...(job.size === 'short' ? [] : ['a first try that fails', 'help from someone']), 'how it ends'], from: 'prompt' };
	}

	/* ---------- Emails and letters ---------- */

	const SUBJECTS = { request: (d) => `Request: ${d}`, thank: (d) => `Thank you${d ? ` for ${d}` : ''}`, apologize: (d) => `My apologies${d ? ` for ${d}` : ''}`, invite: (d) => `You're invited${d ? `: ${d}` : ''}`, complain: (d) => `Complaint${d ? ` about ${d}` : ''}`, followup: (d) => `Following up${d ? ` on ${d}` : ''}`, resign: () => 'Resignation', congratulate: (d) => `Congratulations${d ? ` on ${d}` : ''}`, inform: (d) => cap(d || 'An update') };

	function letter(job, rand = Math.random, me) {
		const pick = pickFrom(rand);
		const formal = job.tone ? job.tone === 'formal' : job.formal;
		const d = job.details;
		const D1 = d ? d.replace(/^(?:to|for|about|on|that)\s+/, '') : '';
		const to = job.to ? job.to.replace(/^(?:my|our|the|a)\s+/i, '') : null;
		const named = to && /^[A-Z]/.test(job.to || '') && !FORMAL.test(to.toLowerCase());
		const greet = named ? `${formal ? 'Dear' : 'Hi'} ${to},` : formal ? (to ? `Dear ${to},` : 'Hello,') : to && /^(?:mom|mum|dad|grandma|grandpa|everyone|all|team|friends)$/i.test(to) ? `Hi ${/^(?:everyone|all|team|friends)$/i.test(to) ? to.toLowerCase() : cap(to)},` : 'Hi,';
		const sign = `${formal ? pick(['Kind regards,', 'Sincerely,', 'Best regards,']) : pick(['Thanks,', 'Best,', 'Talk soon,'])}\n${me || '[Your name]'}`;
		const verbish = /^(?:to\s+)?[a-z]+\b/.test(d) && !/^(?:the|a|an|my|your|our|this|that|friday|monday|tuesday|wednesday|thursday|saturday|sunday|tomorrow|next|more|some|\d)/.test(D1);
		let body;
		switch (job.purpose) {
			case 'request':
				body = [`${formal ? 'I hope you are well. I am writing to ask' : "I hope you're doing well. I wanted to ask"} ${verbish ? `whether you could ${D1}` : D1 ? `${/^about\b/.test(d) ? 'about' : 'for'} ${D1}` : 'for your help with something'}.`, `${formal ? 'I would be grateful if this could be arranged' : "It would really help me out"}, and I'm happy to ${formal ? 'provide any further details you need' : 'work around whatever suits you'}.`, formal ? 'Thank you for your time and consideration.' : 'Thanks so much in advance!'];
				break;
			case 'thank':
				body = [`${formal ? 'I am writing to thank you' : 'I just wanted to say thank you'}${D1 ? ` for ${D1}` : ''}.`, `${formal ? 'It was generous of you, and it made a real difference' : 'It meant a lot to me, and it really made a difference'}.`, formal ? 'I am very grateful, and I hope I can return the kindness.' : "I owe you one, and I won't forget it."];
				break;
			case 'apologize':
				body = [`${formal ? 'I would like to apologize' : "I'm really sorry"}${D1 ? ` for ${D1}` : ''}.`, `${formal ? 'I understand the trouble this caused, and I take responsibility for it' : "I know it wasn't okay, and that's on me"}.`, formal ? 'I will make sure it does not happen again, and I would welcome the chance to put it right.' : "It won't happen again, and I'd like to make it up to you."];
				break;
			case 'invite':
				body = [`${formal ? 'I would like to invite you' : "I'd love for you to come"}${D1 ? ` to ${D1.replace(/^to\s+/, '')}` : ' to a get-together'}.`, formal ? 'It would be a pleasure to have you there.' : "It won't be the same without you!", `${formal ? 'Please let me know whether you can attend' : 'Let me know if you can make it'}, and if there's anything you'd like me to know beforehand.`];
				break;
			case 'complain':
				body = [`I am writing about ${D1 || 'a problem I have had'}.`, 'This has caused real inconvenience, and it is not the standard I expected.', 'I would like to know how you plan to resolve it, and I would appreciate a reply within the next few days.'];
				break;
			case 'followup':
				body = [`${formal ? 'I am writing to follow up' : 'I just wanted to follow up'}${D1 ? ` on ${D1}` : ''}.`, `${formal ? 'I remain very interested, and I wondered whether there is any news' : "I'm still very interested, and wondered if there's any news"}.`, formal ? 'Please let me know if I can provide anything further.' : 'Happy to send anything else you need.'];
				break;
			case 'resign':
				body = ['Please accept this letter as formal notice of my resignation. My last day will be two weeks from today.', 'I am grateful for the opportunities I have had here and for everything I have learned.', 'I will do all I can to make the handover a smooth one. Thank you for your support.'];
				break;
			case 'congratulate':
				body = [`${formal ? 'Please accept my congratulations' : 'Congratulations'}${D1 ? ` on ${D1}` : ''}!`, formal ? 'It is thoroughly deserved, and I was delighted to hear the news.' : "You've earned it, and I couldn't be happier for you.", formal ? 'I wish you every success in what comes next.' : "Can't wait to celebrate properly!"];
				break;
			default:
				body = [`${formal ? 'I am writing to let you know' : 'I wanted to let you know'} ${/^(?:that|about)\b/.test(d) ? d : D1 ? (verbish || /\b(?:is|are|was|will|has|have)\b/.test(D1) ? `that ${D1}` : `about ${D1}`) : 'about something'}.`, formal ? 'Please let me know if you have any questions.' : 'Let me know if you have any questions!'];
		}
		const subject = SUBJECTS[job.purpose](D1.replace(/^(?:whether you could|if you could)\s+/, '').slice(0, 60)).replace(/\s+/g, ' ');
		const text = `${job.kind === 'email' ? `**Subject:** ${subject}\n\n` : ''}${greet}\n\n${body.join(job.size === 'short' ? ' ' : '\n\n')}\n\n${sign}`;
		return { form: 'email', title: `${cap(job.kind)}${to ? ` to ${job.to}` : ''}`, text, plan: ['greeting', { request: 'the request', thank: 'the thanks', apologize: 'the apology', invite: 'the invitation', complain: 'the problem', followup: 'the reminder', resign: 'the notice', congratulate: 'the good wishes', inform: 'the news' }[job.purpose], 'what happens next', 'sign-off'], from: 'prompt' };
	}

	/* ---------- Speeches and toasts ---------- */

	function talk(job, rand = Math.random) {
		const pick = pickFrom(rand);
		const who = job.person ? job.person.replace(/^(?:my|our)\s+/i, (m) => m.toLowerCase()) : 'our guest of honor';
		const Who = /^(?:my|our)\b/.test(who) ? cap(who) : who;
		const O = {
			wedding: [`Good evening, everyone. For those who don't know me, I've had the good luck to know ${who} for a long time.`, `Over the years I've seen ${who} be many things: stubborn, generous, late, and funnier than anyone gives them credit for. But I have never seen them as happy as they are today.`, 'A good marriage, they say, is two people each convinced they got the better deal. Looking at these two, I think both of them are right.'],
			birthday: [`Thank you all for coming to celebrate ${who}.`, `Another year older, and somehow ${who} keeps getting better at the things that matter: showing up, making us laugh, and remembering everyone else's birthday.`, 'We are all a little luckier for knowing you.'],
			retirement: [`Today we celebrate ${who}, and more years of work than most of us can imagine.`, `What ${who} built here isn't only the work itself. It's the people who learned how to do it properly because they were shown, patiently, and more than once.`, 'You have earned every slow morning that is coming to you.'],
			graduation: [`Today belongs to ${who}.`, `There were late nights, and days when it would have been easier to stop. ${Who} didn't stop. That, more than any grade, is the thing to be proud of.`, 'Whatever comes next, you have already shown you can finish what you start.'],
			anniversary: [`We're here to celebrate ${who}, and all the years that brought us to this one.`, 'Staying together is not one big decision. It is a thousand small ones: who makes the coffee, who says sorry first, who remembers to laugh.', 'You two have made those small decisions well, and it shows.'],
			farewell: [`It's hard to say goodbye to ${who}.`, `Some people leave a job. ${Who} leaves a gap, the kind you only notice when you turn to ask a question and the chair is empty.`, 'Wherever you are going, they are lucky to have you. Come back and visit.'],
			celebration: [`Thank you all for being here for ${who}.`, `It is not every day we get to stop and say, out loud, how much someone means to us. Today we do.`, 'We are glad of you, and grateful, and we wanted you to hear it.'],
		};
		const key = { 'going-away': 'farewell', 'going away': 'farewell', engagement: 'wedding', promotion: 'celebration', 'baby shower': 'celebration' }[job.occasion] || job.occasion;
		const lines = O[key] || O.celebration;
		const close = job.toast || ['wedding', 'birthday', 'anniversary', 'retirement'].includes(key) ? `So please raise your glasses: to ${who}!` : pick([`Thank you, ${who}.`, 'Thank you.']);
		const parts = job.size === 'short' ? [lines[0], lines[2], close] : [...lines, close];
		return { form: 'speech', title: `${job.toast ? 'A toast' : 'A speech'} for ${job.person ? `${who}'s ${job.occasion}` : `the ${job.occasion}`}`, text: parts.join('\n\n'), plan: ['welcome', ...(job.size === 'short' ? [] : ['who they are']), 'what today means', job.toast ? 'the toast' : 'the close'], from: 'prompt' };
	}

	/* ---------- Product descriptions ---------- */

	function pitch(job, rand = Math.random) {
		const pick = pickFrom(rand);
		const k = know(job.thing);
		const thing = job.thing;
		const traits = job.traits.filter((t) => !/^(?:new|my|our)$/.test(t));
		const name = job.name || `The ${traits.length ? cap(traits[0]) + ' ' : ''}${cap(thing)}`;
		const what = `${traits.length ? traits.join(' ') + ' ' : ''}${thing}`;
		const forWhom = job.audience ? ` for ${job.audience}` : '';
		const p1 = `Meet ${name}: ${a(what)}${forWhom} that ${pick(['does what you need and gets out of the way', 'earns its place from the first day', 'you will reach for without thinking'])}.${k.known && k.def ? ` ${cap(a(thing))} is ${lower1(k.def.replace(/;.*$/, ''))}; this one is made to do that well.` : ''}`;
		const points = [...traits.map((t) => `**${/ing$/.test(t) ? `Made for ${t}` : cap(t)}**: ${pick(['built in from the start, not added on', 'so you can stop thinking about it', 'because the details are where it counts'])}.`), ...(k.parts || []).slice(0, 2).map((p) => `**A better ${p}**: ${pick(['made to last', 'designed around how you actually use it', 'the part people notice first'])}.`)];
		while (points.length < 3) points.push(pick(['**Made to last**: sturdy materials and careful finishing.', '**Simple to use**: nothing to learn, nothing to set up.', '**Good value**: everything you need and nothing you don\'t.']));
		const p3 = `${name}. ${pick([`The ${thing} you'll keep.`, `${cap(a(thing))}, done properly.`, 'Made to be used.'])}`;
		return { form: 'product', title: name, text: `${p1}\n\n${[...new Set(points)].slice(0, 4).map((p) => `- ${p}`).join('\n')}\n\n${p3}`, plan: ['what it is and who it is for', 'what makes it good', 'a line to remember'], from: 'prompt' };
	}

	/**
	 * Writes the piece for a job from parse(): { form, title, text, plan, from } or null when it can't (an essay on
	 * something the dictionary doesn't have: ask Wikipedia with fromArticle()). `me` is the person's name, for signing.
	 */
	function write(job, rand = Math.random, me = null) {
		if (job.form === 'essay' || (job.form === 'speech' && job.topic)) return job.topic ? essay(job, rand) : null;
		if (job.form === 'story') return tale(job, rand);
		if (job.form === 'email') return letter(job, rand, me);
		if (job.form === 'speech') return talk(job, rand);
		if (job.form === 'product') return pitch(job, rand);
		return null;
	}

	Omni.onyxCompose = { parse, write, know, fromArticle, FORMS: FORMS.map((f) => f[0]) };
})(typeof window !== 'undefined' ? window : globalThis);
