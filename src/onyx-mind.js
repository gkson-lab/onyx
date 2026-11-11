// Onyx 3's mind: the part that decides how to go about a message before any skill answers it. It works in four
// stages, and each one leaves a line in a trace that is returned with the reply, so the thinking can be followed:
//
//   1. read     what kind of message this is: its length, whether it asks or tells, what it points back to
//   2. plan     one step, or several: "write a haiku about the sea, then translate it into Spanish" is two, and
//               "how do you say cat in French, German and Japanese" is three
//   3. act      each step goes to the skill that fits it (onyx.js); a step may work on the result of the one before
//   4. check    how far the answer can be trusted, and what was assumed along the way
//
// Nothing here answers anything: it is all reading and planning, with no state, so it can be tested alone.
//
//   Omni.onyxMind.plan('define serendipity and translate it to French')
//     ->  { kind: 'chain', steps: ['define serendipity', 'translate it to French'] }
//   Omni.onyxMind.operation('make it shorter')   ->  { op: 'shorten' }
(function (root) {
	'use strict';

	const Omni = (root.Omni = root.Omni || {});
	const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

	/* ---------- 1. Reading ---------- */

	const REQUEST = /^(?:please |can you |could you |would you |will you |i need you to |i want you to |i'd like you to |go ahead and |now |then |and |also )*(?:write|compose|draft|make|create|generate|give|tell|show|define|translate|say|spell|convert|calculate|compute|work out|find|look up|search|research|summari[sz]e|shorten|explain|describe|list|name|count|sort|read|quiz|test|pick|choose|roll|open|set|turn|put|print|build|finish|complete|continue|predict|solve|add|subtract|multiply|divide|double|halve|triple|square|repeat|remember|forget|check|compare|rewrite)\b/i;
	const QUESTION = /^(?:who|what|when|where|why|how|which|whose|is|are|am|was|were|do|does|did|can|could|will|would|should|shall|may|have|has)\b|\?\s*$/i;
	const POINTS_BACK = /\b(?:it|that|this|them|those|these|the (?:result|answer|output|poem|haiku|story|essay|summary|text|code|program|page|email|letter|speech|translation|last one|same(?: thing)?))\b/i;

	/** What kind of message this is: { words, sentences, kind, pointsBack, script, summary }. */
	function perceive(text) {
		const t = String(text).trim();
		const words = (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
		const sentences = Math.max(1, (t.match(/[.!?。！？]+(?:\s|$)/g) || []).length);
		// "A python program that ...", "fizzbuzz in rust": a thing named is a thing asked for.
		const named = /^(?:an? |the |some )?(?:\S+ ){0,3}(?:programs?|scripts?|functions?|pages?|websites?|requests?|quiz|essays?|stor(?:y|ies)|poems?|haikus?|emails?|letters?|speech|toast|class|struct)\b/i.test(t) || /\bin (?:python|javascript|rust|c\+\+|c#|c|html)[.!?]*$/i.test(t);
		const kind = REQUEST.test(t) ? 'a request' : QUESTION.test(t) ? 'a question' : named ? 'a request, named by what it wants' : words <= 3 ? 'a short remark' : 'a statement';
		const script = /[぀-ヿ一-鿿]/.test(t) ? 'Chinese or Japanese writing' : /[Ѐ-ӿ]/.test(t) ? 'Cyrillic writing' : /[֐-׿]/.test(t) ? 'Hebrew writing' : /[؀-ۿ]/.test(t) ? 'Arabic writing' : /[฀-๿]/.test(t) ? 'Thai writing' : /[Ͱ-Ͽ]/.test(t) ? 'Greek writing' : null;
		const pointsBack = words <= 14 && POINTS_BACK.test(t);
		return { words, sentences, kind, pointsBack, script, summary: `${count(words, 'word')}${sentences > 1 ? ` in ${sentences} sentences` : ''}: ${kind}${script ? `, in ${script}` : ''}${pointsBack ? ', pointing back at something said before' : ''}` };
	}

	/* ---------- 2. Planning ---------- */

	const L = () => (Omni.onyxTongues ? Omni.onyxTongues.PATTERN : 'spanish|french|english');
	const THING = '(?:it|that|this|them|those|the (?:result|answer|output|poem|haiku|story|essay|summary|text|piece|message|paragraph|sentence|translation|definition|last one|first one|whole thing)|what you (?:just )?(?:wrote|said))';

	/**
	 * Reads a message as something to do to the last result: { op, ... } or null.
	 *   translate { to }   summarize   shorten   lengthen   count { what }   upper   lower   explain   speak
	 *   tone { tone }      again
	 */
	function operation(text) {
		const t = String(text).trim().replace(/[’]/g, "'").replace(/^(?:ok(?:ay)?,? |great,? |nice,? |thanks,? |cool,? |and |now |then |also |please |can you |could you |would you )+/i, '').replace(/[.!?]+$/, '').replace(/ please$/i, '').trim();
		let m;
		if ((m = t.match(new RegExp(`^(?:translate|put|say|turn|convert|write|rewrite|give me) ${THING} (?:in|into|to) (${L()})$`, 'i'))) || (m = t.match(new RegExp(`^(?:what(?:'s| is) (?:it|that|this) |how (?:do|would) you say (?:it|that|this) |what about |how about |and |same )?in (${L()})$`, 'i')))) return { op: 'translate', to: m[1].toLowerCase() };
		if (new RegExp(`^(?:summari[sz]e|sum up|condense|boil down|give me (?:a |the )?(?:summary|gist|short version) of|tl;?dr(?: of)?) ${THING}$`, 'i').test(t)) return { op: 'summarize' };
		if (new RegExp(`^(?:shorten ${THING}|make ${THING} (?:shorter|briefer|more concise|smaller)|cut ${THING} down|(?:a )?shorter(?: one| version)?|too long)$`, 'i').test(t)) return { op: 'shorten' };
		if (new RegExp(`^(?:lengthen ${THING}|make ${THING} (?:longer|more detailed|fuller)|expand(?: on)? ${THING}|(?:a )?longer(?: one| version)?|more detail|too short)$`, 'i').test(t)) return { op: 'lengthen' };
		if ((m = t.match(new RegExp(`^(?:make ${THING} |rewrite ${THING} (?:to be |so it's )?|(?:a )?)(?:(?:a bit |a little |much )?more )?(formal|professional|polite|casual|informal|friendly|friendlier|relaxed)(?: version| one)?$`, 'i')))) return { op: 'tone', tone: /formal|professional|polite/i.test(m[1]) && !/informal/i.test(m[1]) ? 'formal' : 'casual' };
		if ((m = t.match(new RegExp(`^(?:how many (words|characters|letters|sentences|lines) (?:is|are|was|does|in|long is) ${THING}(?: have| long)?|count (?:the |its )?(words|characters|letters|sentences|lines)(?: (?:in|of) ${THING})?|how long is ${THING}|(?:what(?:'s| is) )?(?:the|its) (word|character) count(?: of ${THING})?)$`, 'i')))) return { op: 'count', what: (m[1] || m[2] || m[3] || 'words').toLowerCase().replace(/s$/, '').replace('letter', 'character') };
		if (new RegExp(`^(?:(?:make|put|write|show) ${THING} (?:in|into|as) (?:all )?(?:capitals|caps|upper ?case|capital letters)|shout ${THING}|capitali[sz]e ${THING}|upper ?case ${THING})$`, 'i').test(t)) return { op: 'upper' };
		if (new RegExp(`^(?:(?:make|put|write|show) ${THING} (?:in|into|as) (?:all )?(?:lower ?case|small letters)|lower ?case ${THING})$`, 'i').test(t)) return { op: 'lower' };
		if (new RegExp(`^(?:explain ${THING}(?: to me)?|how does ${THING} work|what does ${THING} do|walk me through ${THING}|why does ${THING} work)$`, 'i').test(t)) return { op: 'explain' };
		if (new RegExp(`^(?:read ${THING}(?: out)?(?: aloud| out loud| to me)?|say ${THING} (?:aloud|out loud)|speak ${THING}|read (?:aloud|out loud))$`, 'i').test(t)) return { op: 'speak' };
		return null;
	}

	// The joints a message can be cut at: "X, then Y", "X and then Y", "X. After that, Y".
	const JOINT = /\s*[,;.]?\s+(?:and then|then|after that|afterwards|and after that|and finally|finally|and next|next)[,]?\s+/i;
	const CODE = /\b(?:programs?|scripts?|code|functions?|python|javascript|rust|c\+\+|c#|html|http)\b/i;
	// What may follow a program in the same breath without being part of the program.
	const AFTER_CODE = /^(?:show|write|do|translate|convert|port|rewrite|give me|explain|put)\b.*\b(?:it|that)\b|^explain\b|^(?:now )?in (?:python|javascript|js|rust|c\+\+|c#|c)\b/i;

	/**
	 * Splits a message into the steps it asks for: { kind: 'chain' | 'each', steps: [text, ...] }, or null when it is
	 * one thing. A chain runs in order, each step free to use the one before; "each" is the same request made of
	 * several things at once (three languages, four words to define).
	 */
	function plan(text) {
		const raw = String(text).trim();
		if (raw.length > 600 || raw.length < 8) return null;
		// Quoted text is material, not instructions.
		const kept = [];
		const t = raw.replace(/"[^"]{2,}"|“[^”]{2,}”|`[^`]+`/g, (m) => `\u0001${kept.push(m) - 1}\u0001`);
		const back = (s) => s.replace(/\u0001(\d+)\u0001/g, (m, i) => kept[+i]).trim();

		// The same request for several languages: "how do you say cat in French, German and Japanese".
		const lang = `(?:${L()})`;
		const many = t.match(new RegExp(`^(.*\\b(?:in|into|to)\\s+)(${lang}(?:(?:\\s*,\\s*(?:and\\s+)?|\\s+and\\s+|\\s+or\\s+)${lang})+)\\s*([?.!]*)$`, 'i'));
		if (many && !CODE.test(many[1])) {
			const names = many[2].split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s+or\s+/i).filter(Boolean).slice(0, 8);
			if (names.length >= 2) return { kind: 'each', steps: names.map((n) => back(`${many[1]}${n}${many[3] || ''}`)), of: 'languages' };
		}
		// The same request for several words: "define brave, kind and curious", "synonyms for big and small".
		const several = t.match(/^((?:please )?(?:define|spell|(?:give me )?(?:synonyms?|antonyms?|opposites?|rhymes?|another word) (?:for|of|with)|what rhymes with|how many syllables (?:in|are in|does)|what does))\s+([a-z'-]+(?:\s*,\s*[a-z'-]+)*,?\s+and\s+[a-z'-]+)((?: mean| have)?[?.!]*)$/i);
		if (several) {
			const words = several[2].split(/\s*,\s*(?:and\s+)?|\s+and\s+/i).filter(Boolean).slice(0, 8);
			if (words.length >= 2) return { kind: 'each', steps: words.map((w) => `${several[1]} ${w}${(several[3] || '').replace(/[?.!]+$/, '')}`), of: 'words' };
		}

		// A chain said with "then": cut at each joint, as long as what follows is a request of its own.
		const steps = [];
		let rest = t;
		for (let guard = 0; guard < 6; guard++) {
			const m = rest.match(JOINT);
			if (!m) break;
			const head = rest.slice(0, m.index).trim();
			const tail = rest.slice(m.index + m[0].length).trim();
			const code = CODE.test(steps.length ? steps[steps.length - 1] : head) || CODE.test(head);
			const own = code ? AFTER_CODE.test(tail) : !!operation(tail.split(JOINT)[0]) || REQUEST.test(tail) || QUESTION.test(tail);
			if (!head || !tail || !own) {
				// Not a joint after all ("add 5 to each one, then keep those above 12" is one program): look past it.
				const skipTo = m.index + m[0].length;
				const again = rest.slice(skipTo).match(JOINT);
				if (!again) break;
				const head2 = rest.slice(0, skipTo + again.index).trim();
				const tail2 = rest.slice(skipTo + again.index + again[0].length).trim();
				if (!(code ? AFTER_CODE.test(tail2) : !!operation(tail2.split(JOINT)[0]) || REQUEST.test(tail2))) break;
				steps.push(head2);
				rest = tail2;
				continue;
			}
			steps.push(head);
			rest = tail;
		}
		if (steps.length) {
			steps.push(rest);
			return { kind: 'chain', steps: steps.map(back) };
		}
		// A chain said with "and": only when the second half works on the first ("... and translate it to French").
		const and = [...t.matchAll(/,?\s+and\s+(?:also\s+)?/gi)];
		for (let i = and.length - 1; i >= 0; i--) {
			const head = t.slice(0, and[i].index).trim();
			const tail = t.slice(and[i].index + and[i][0].length).trim();
			if (head.split(/\s+/).length >= 2 && operation(tail) && !(CODE.test(head) && !AFTER_CODE.test(tail))) return { kind: 'chain', steps: [back(head), back(tail)] };
		}
		// Two requests joined by "and": "tell me a joke and tell me a fact", "what is 12 times 12 and what is 5 plus 5".
		const START = /^(?:what(?:'s| is| are| does)|how (?:do|many|much|long|old)|who (?:is|was)|when (?:is|was)|tell me|give me|write|define|translate|show me|make|convert)\b/i;
		for (const j of and) {
			const head = t.slice(0, j.index).trim();
			const tail = t.slice(j.index + j[0].length).trim();
			if (START.test(head) && START.test(tail) && head.split(/\s+/).length >= 3 && tail.split(/\s+/).length >= 3 && !CODE.test(t) && !/\b(?:difference|between|compare)\b/i.test(head)) return { kind: 'chain', steps: [back(head), back(tail)] };
		}
		return null;
	}

	/* ---------- Things done to a text ---------- */

	const plain = (s) => String(s || '').replace(/```[a-z]*\n?/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2').replace(/`([^`]+)`/g, '$1').replace(/^[-•]\s+/gm, '').trim();

	/** Counts of a text: { words, characters, sentences, lines }. */
	function measure(text) {
		const t = plain(text);
		return { word: (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length, character: [...t].length, sentence: Math.max(t ? 1 : 0, (t.match(/[.!?。！？]+(?:\s|$)/g) || []).length), line: t ? t.split('\n').filter((l) => l.trim()).length : 0 };
	}

	/* ---------- 4. Checking ---------- */

	/**
	 * How far a reply can be trusted, from what happened on the way to it: { level: 'sure' | 'fair' | 'unsure', why }.
	 * `trace` is the list of steps taken; `r` the reply.
	 */
	function reflect(trace, r) {
		const steps = trace.map((s) => s.step);
		const detail = (step) => (trace.find((s) => s.step === step) || {}).detail || '';
		if (!r || !r.text) return r && r.command ? { level: 'sure', why: 'a tool does this one exactly' } : { level: 'unsure', why: 'nothing answered' };
		if (r.miss || steps.includes('miss')) return { level: 'unsure', why: 'no skill recognized the message' };
		if (steps.includes('failed')) return { level: 'unsure', why: detail('failed') };
		if (steps.includes('rough')) return { level: 'fair', why: detail('rough') };
		if (steps.includes('assumed')) return { level: 'fair', why: detail('assumed') };
		if (steps.includes('online')) return { level: 'fair', why: 'it comes from a source online, which I pass on without being able to check it' };
		if (steps.includes('generated')) return { level: 'fair', why: detail('generated') };
		const match = trace.find((s) => s.step === 'understood');
		if (match && match.score != null) return match.score >= 0.75 ? { level: 'sure', why: 'the message closely matches things I know how to answer' } : { level: 'fair', why: 'the message only loosely matches what I know how to answer' };
		if (steps.includes('exact')) return { level: 'sure', why: detail('exact') };
		return { level: 'sure', why: 'a skill recognized the message outright' };
	}

	/** The trace as text, for "how did you get that?": one numbered line per step. */
	function explain(thinking) {
		if (!thinking || !thinking.length) return '';
		const LABEL = { read: 'Read', plan: 'Plan', step: 'Step', skill: 'Skill', understood: 'Understood', recall: 'Memory', online: 'Internet', offline: 'Internet', exact: 'Exact', rough: 'Caveat', assumed: 'Assumed', generated: 'Caveat', failed: 'Problem', miss: 'No match', check: 'Check', result: 'Result', language: 'Language', time: 'Time' };
		return thinking.map((s, i) => `${i + 1}. **${LABEL[s.step] || s.step}**: ${s.detail}`).join('\n');
	}

	Omni.onyxMind = { perceive, plan, operation, measure, plain, reflect, explain };
})(typeof window !== 'undefined' ? window : globalThis);
