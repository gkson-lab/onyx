// Onyx 2.5's translator, between English, Spanish and French. Written for Onyx: a phrasebook, and enough grammar to
// translate simple sentences ("where is the station?", "I want two coffees", "the house is white", "I don't have a
// car") with articles, gender, plurals, adjective order, agreement and the present tense. Words come from the
// hand-written list in onyx-languages.js first, then the large lists in src/translations/ (built from the Open
// Multilingual Wordnet). Anything else is translated word by word, and Onyx says so.
//
//   Omni.onyxTranslate.text('I want two coffees', 'en', 'es')  ->  { text: 'Quiero dos cafés.', how: 'grammar' }
//   Omni.onyxTranslate.word('house', 'en', 'fr')               ->  { said: 'la maison', ... }
(function (root) {
	'use strict';

	const Omni = (root.Omni = root.Omni || {});

	/* ---------- The phrasebook: English|Spanish|French ---------- */

	// Everyday Spanish uses tú; French uses tu between friends and vous with strangers, as people do.
	const PHRASES = `
Hello|Hola|Bonjour
Hi|Hola|Salut
Good morning|Buenos días|Bonjour
Good afternoon|Buenas tardes|Bon après-midi
Good evening|Buenas noches|Bonsoir
Good night|Buenas noches|Bonne nuit
Goodbye|Adiós|Au revoir
Bye|Chao|Salut
See you later|Hasta luego|À plus tard
See you soon|Hasta pronto|À bientôt
See you tomorrow|Hasta mañana|À demain
See you next week|Hasta la semana que viene|À la semaine prochaine
Long time no see|¡Cuánto tiempo!|Ça fait longtemps !
How are you?|¿Cómo estás?|Comment ça va ?
What's up?|¿Qué tal?|Quoi de neuf ?
I'm fine, thank you.|Estoy bien, gracias.|Je vais bien, merci.
Fine, thanks. And you?|Bien, gracias. ¿Y tú?|Bien, merci. Et toi ?
Not bad.|No está mal.|Pas mal.
Thank you|Gracias|Merci
Thank you very much|Muchas gracias|Merci beaucoup
You're welcome|De nada|De rien
Please|Por favor|S'il vous plaît
Excuse me|Disculpe|Excusez-moi
Sorry|Perdón|Pardon
I'm sorry|Lo siento|Je suis désolé
No problem|No hay problema|Pas de problème
Yes|Sí|Oui
No|No|Non
Maybe|Quizás|Peut-être
Of course|Por supuesto|Bien sûr
Okay|Vale|D'accord
Welcome|Bienvenido|Bienvenue
Nice to meet you|Mucho gusto|Enchanté
What's your name?|¿Cómo te llamas?|Comment tu t'appelles ?
Where are you from?|¿De dónde eres?|Tu viens d'où ?
How old are you?|¿Cuántos años tienes?|Quel âge as-tu ?
I don't understand|No entiendo|Je ne comprends pas
I don't know|No lo sé|Je ne sais pas
I understand|Entiendo|Je comprends
Can you repeat that?|¿Puedes repetirlo?|Tu peux répéter ?
Can you speak more slowly?|¿Puedes hablar más despacio?|Tu peux parler plus lentement ?
What does this mean?|¿Qué significa esto?|Qu'est-ce que ça veut dire ?
I love you|Te quiero|Je t'aime
I miss you|Te extraño|Tu me manques
Happy birthday|Feliz cumpleaños|Joyeux anniversaire
Merry Christmas|Feliz Navidad|Joyeux Noël
Happy New Year|Feliz Año Nuevo|Bonne année
Happy holidays|Felices fiestas|Joyeuses fêtes
Congratulations|Felicidades|Félicitations
Good luck|Buena suerte|Bonne chance
Have a nice day|Que tengas un buen día|Bonne journée
Have a good trip|Buen viaje|Bon voyage
Enjoy your meal|Buen provecho|Bon appétit
Cheers|Salud|Santé
Get well soon|Que te mejores pronto|Bon rétablissement
Bless you|Salud|À tes souhaits
Let's go|Vamos|Allons-y
Wait|Espera|Attends
Help!|¡Socorro!|Au secours !
Be careful|Ten cuidado|Fais attention
Call the police|Llame a la policía|Appelez la police
Call an ambulance|Llame a una ambulancia|Appelez une ambulance
Where is the bathroom?|¿Dónde está el baño?|Où sont les toilettes ?
Where is the train station?|¿Dónde está la estación de tren?|Où est la gare ?
Where is the bus stop?|¿Dónde está la parada de autobús?|Où est l'arrêt de bus ?
Where is the airport?|¿Dónde está el aeropuerto?|Où est l'aéroport ?
How much does it cost?|¿Cuánto cuesta?|Combien ça coûte ?
How much is this?|¿Cuánto cuesta esto?|Ça coûte combien ?
The check, please|La cuenta, por favor|L'addition, s'il vous plaît
The bill, please|La cuenta, por favor|L'addition, s'il vous plaît
The menu, please|La carta, por favor|La carte, s'il vous plaît
A table for two, please|Una mesa para dos, por favor|Une table pour deux, s'il vous plaît
Water, please|Agua, por favor|De l'eau, s'il vous plaît
One ticket, please|Un billete, por favor|Un billet, s'il vous plaît
Can I pay by card?|¿Puedo pagar con tarjeta?|Je peux payer par carte ?
I would like to buy this|Quisiera comprar esto|Je voudrais acheter ça
Where can I buy a ticket?|¿Dónde puedo comprar un billete?|Où est-ce que je peux acheter un billet ?
What time is it?|¿Qué hora es?|Quelle heure est-il ?
What day is it today?|¿Qué día es hoy?|Quel jour sommes-nous ?
What's the weather like?|¿Qué tiempo hace?|Quel temps fait-il ?
It's raining|Está lloviendo|Il pleut
It's snowing|Está nevando|Il neige
It's cold|Hace frío|Il fait froid
It's hot|Hace calor|Il fait chaud
It's sunny|Hace sol|Il y a du soleil
It's far|Está lejos|C'est loin
It's near|Está cerca|C'est près
Turn left|Gira a la izquierda|Tourne à gauche
Turn right|Gira a la derecha|Tourne à droite
Go straight ahead|Sigue recto|Va tout droit
I'm learning Spanish|Estoy aprendiendo español|J'apprends l'espagnol
I'm learning French|Estoy aprendiendo francés|J'apprends le français
I'm learning English|Estoy aprendiendo inglés|J'apprends l'anglais
Can you help me?|¿Puedes ayudarme?|Tu peux m'aider ?
Can I help you?|¿Puedo ayudarte?|Je peux t'aider ?
What do you want?|¿Qué quieres?|Qu'est-ce que tu veux ?
What are you doing?|¿Qué haces?|Qu'est-ce que tu fais ?
What happened?|¿Qué pasó?|Qu'est-ce qui s'est passé ?
Where do you live?|¿Dónde vives?|Où habites-tu ?
How was your day?|¿Qué tal tu día?|Comment s'est passée ta journée ?
Have fun|Diviértete|Amuse-toi bien
Sleep well|Que duermas bien|Dors bien
Take care|Cuídate|Prends soin de toi
Me too|Yo también|Moi aussi
Me neither|Yo tampoco|Moi non plus
I agree|Estoy de acuerdo|Je suis d'accord
I think so|Creo que sí|Je pense que oui
I don't think so|No lo creo|Je ne pense pas
That's great|¡Qué bien!|C'est génial
That's too bad|¡Qué pena!|C'est dommage
No way|¡Ni hablar!|Pas question
It doesn't matter|No importa|Ça ne fait rien
Don't worry|No te preocupes|Ne t'inquiète pas
Calm down|Cálmate|Calme-toi
Come here|Ven aquí|Viens ici
Hurry up|Date prisa|Dépêche-toi
Good job|¡Buen trabajo!|Bon travail !
Well done|¡Bien hecho!|Bien joué !
Everything is fine|Todo está bien|Tout va bien
My pleasure|Es un placer|Avec plaisir
After you|Después de usted|Après vous
Sorry I'm late|Perdón por llegar tarde|Désolé d'être en retard
It's my birthday|Es mi cumpleaños|C'est mon anniversaire
What a beautiful day|¡Qué día tan bonito!|Quelle belle journée !
It hurts here|Me duele aquí|J'ai mal ici
I have a headache|Me duele la cabeza|J'ai mal à la tête
I have a cold|Estoy resfriado|J'ai un rhume
I'm allergic to peanuts|Soy alérgico a los cacahuetes|Je suis allergique aux arachides
I'm a vegetarian|Soy vegetariano|Je suis végétarien
I'm going home|Me voy a casa|Je rentre à la maison
Let's eat|Vamos a comer|Allons manger
What is this?|¿Qué es esto?|Qu'est-ce que c'est ?
Who is it?|¿Quién es?|Qui est-ce ?
Why?|¿Por qué?|Pourquoi ?
When?|¿Cuándo?|Quand ?
Where?|¿Dónde?|Où ?
How?|¿Cómo?|Comment ?
Who?|¿Quién?|Qui ?
What?|¿Qué?|Quoi ?
`;

	/* ---------- Text ---------- */

	const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
	const EN_CONTRACTIONS = [[/\bi'm\b/g, 'i am'], [/\byou're\b/g, 'you are'], [/\bwe're\b/g, 'we are'], [/\bthey're\b/g, 'they are'], [/\b(he|she|it|that|what|where|who|there|here)'s\b/g, '$1 is'], [/\bcan't\b/g, 'can not'], [/\bcannot\b/g, 'can not'], [/\bwon't\b/g, 'will not'], [/\b(do|does|did|is|are|was|were|have|has|would|should|could)n't\b/g, '$1 not'], [/\b(i|you|we|they)'ve\b/g, '$1 have'], [/\b(i|you|we|they|he|she)'d\b/g, '$1 would'], [/\b(i|you|we|they|he|she|it)'ll\b/g, '$1 will'], [/\blet's\b/g, 'let us']];
	/** A sentence reduced for matching: lower case, no punctuation; English contractions spelled out; no accents. */
	function norm(text, lang) {
		let t = String(text).toLowerCase().replace(/[’‘]/g, "'").replace(/[¿¡"“”«»]/g, ' ').replace(/[.!?,;:]+/g, ' ');
		if (lang === 'en') for (const [re, to] of EN_CONTRACTIONS) t = t.replace(re, to);
		else t = strip(t);
		return t.replace(/\s+/g, ' ').trim();
	}

	const BOOK = { en: new Map(), es: new Map(), fr: new Map() };
	const ROWS = PHRASES.trim().split('\n').map((line) => {
		const [en, es, fr] = line.split('|');
		return { en, es, fr };
	});
	for (const row of ROWS) for (const lang of ['en', 'es', 'fr']) if (!BOOK[lang].has(norm(row[lang], lang))) BOOK[lang].set(norm(row[lang], lang), row);

	/* ---------- Words ---------- */

	const L = () => Omni.onyxLanguages;
	const D = () => Omni.onyxDictionary;
	const ABBR = { noun: 'n', verb: 'v', adjective: 'adj', adverb: 'adv' };

	// The large lists (src/translations), parsed on first use.
	const big = { es: null, fr: null };
	function lists(lang) {
		const T = Omni.onyxTranslations && Omni.onyxTranslations[lang];
		if (!T) return null;
		if (!big[lang]) {
			const from = new Map();
			for (const line of T.from.split('\n')) {
				const [w, pos, said] = line.split('|');
				if (!said) continue;
				if (!from.has(w)) from.set(w, []);
				from.get(w).push({ pos: { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb' }[pos], said: said.split(';') });
			}
			const to = new Map();
			for (const line of T.to.split('\n')) {
				const [w, en] = line.split('|');
				if (!en) continue;
				for (const k of new Set([w.toLowerCase(), strip(w)])) if (!to.has(k)) to.set(k, en.split(','));
			}
			big[lang] = { from, to, source: T.source };
		}
		return big[lang];
	}

	/** A noun's gender from its ending, or null when the ending doesn't tell. */
	function guessGender(lang, w) {
		const x = w.toLowerCase();
		if (lang === 'es') {
			if (/(?:ción|sión|dad|tad|tud|umbre|itis|sis)$/.test(x)) return 'f';
			if (/^(?:mano|foto|moto|radio|libido)$/.test(x)) return 'f';
			if (/^(?:día|mapa|planeta|sofá|idioma|problema|tema|sistema|programa|clima|poema|drama|esquema|dilema|panorama|síntoma|teorema|cometa|poeta|tranvía)$/.test(x)) return 'm';
			if (/a$/.test(x) && !/ma$/.test(x)) return 'f';
			if (/o$/.test(x) || /(?:aje|ambre)$/.test(x)) return 'm';
			if (/or$/.test(x) && !/^(?:flor|labor)$/.test(x)) return 'm';
			return null;
		}
		if (/^(?:eau|peau|page|plage|image|cage|rage|nage|fin|main|faim|fois|voix|croix|souris|nuit|mer|forêt|clé|clef|cuiller|chair|cour|tour)$/.test(x)) return 'f';
		if (/^(?:été|côté|pâté|comité|traité|député|lycée|musée|silence|murmure|mercure|parapluie|génie|incendie|squelette|lait|vin|pain)$/.test(x)) return 'm';
		if (/(?:tion|sion|xion|té|tié|ette|ance|ence|ise|ière|elle|esse|ude|ure|ée|ie|ade|aison)$/.test(x)) return 'f';
		if (/(?:ment|age|eau|isme|oir|ier|et|at|ail|eil|ou|al|in|on|eur|er)$/.test(x)) return 'm';
		return null;
	}

	/** A translation as written in the hand-written list ("el perro", "l'arbre m", "reservar"), read apart. */
	function readHand(lang, said) {
		const m = lang === 'es' ? said.match(/^(el|la|los|las) (.+)$/) : said.match(/^(le|la|les) (.+)$/) || said.match(/^l'(.+?)(?: ([mf]))?$/);
		if (!m) return { word: said.replace(/ [mf]$/, ''), said };
		if (lang === 'fr' && said.startsWith("l'")) return { word: m[1], gender: m[2] || guessGender('fr', m[1]) || 'm', said };
		return { word: m[2], gender: /^(la|las)$/.test(m[1]) ? 'f' : 'm', plural: /^(los|las|les)$/.test(m[1]), said };
	}

	/** The English word's base forms: [{ base, pos, label }] ("children" -> child, noun, plural). */
	function englishForms(word) {
		const d = D();
		const hits = (d && (d.lookupAll ? d.lookupAll(word) : d.lookup(word))) || [];
		return hits.map((h) => ({ base: h.e.w, pos: h.e.pos, label: h.label, e: h.e }));
	}

	/**
	 * An English word in Spanish or French, as `pos` (or its commonest part of speech): { word, gender?, said, src,
	 * pos } where src is "hand" (written for Onyx) or "list" (the large lists); null if neither has it.
	 */
	function toForeign(en, lang, pos) {
		const T = L() && L().TABLE;
		const keys = pos ? [`${en}.${ABBR[pos]}`, en] : [en, `${en}.n`, `${en}.v`, `${en}.adj`, `${en}.adv`];
		for (const k of keys) {
			const row = T && T.get(k);
			if (!row || !row[lang]) continue;
			// A bare key ("happy") is the word's only part of speech in the hand list; check it fits the one asked for.
			if (pos && k === en) {
				const kinds = new Set(englishForms(en).filter((f) => f.base.toLowerCase() === en.toLowerCase()).map((f) => f.pos));
				if (kinds.size && !kinds.has(pos)) continue;
			}
			return Object.assign(readHand(lang, row[lang]), { src: 'hand', pos: pos || null });
		}
		const big = lists(lang);
		const rows = (big && big.from.get(en.toLowerCase())) || [];
		const row = pos ? rows.find((r) => r.pos === pos) : rows[0];
		if (!row) return null;
		const word = row.said[0];
		const out = { word, said: word, src: 'list', pos: row.pos, alts: row.said.slice(1) };
		if (row.pos === 'noun') {
			out.gender = guessGender(lang, word.split(' ')[0]);
			if (!out.gender) {
				out.gender = 'm';
				out.guessed = true;
			}
		}
		return out;
	}

	/** Dictionary forms of a Spanish or French word to try: the word, its irregular base, and what its endings undo. */
	function foreignBases(lang, word) {
		const Lx = L();
		const w = strip(word);
		const out = [w];
		const irr = Lx && Lx.IRREGULAR[lang][w];
		if (irr) out.push(strip(irr));
		const undo = (x) => {
			for (const [end, rep] of (Lx && Lx.ENDINGS[lang]) || []) if (x.length > end.length + 1 && x.endsWith(end)) out.push(x.slice(0, x.length - end.length) + rep);
		};
		undo(w);
		// Two steps for a feminine plural: "rojas" -> "roja" -> "rojo", "petites" -> "petite" -> "petit".
		if (/s$/.test(w)) undo(w.slice(0, -1));
		return [...new Set(out)];
	}

	let femBack = null;
	const FEM_BACK = () => femBack || (femBack = { es: Object.fromEntries(Object.entries(ES_FEM).map(([m, f]) => [strip(f), m])), fr: Object.fromEntries(Object.entries(FR_FEM).map(([m, f]) => [strip(f), m])) });

	/** A Spanish or French word in English: { en: [...], base, src, plural } or null. */
	function toEnglish(word, lang) {
		const Lx = L();
		const w = String(word).trim().replace(/^[¿¡"'«“]+|[?!.,"'»”]+$/g, '');
		if (!w) return null;
		const sw = strip(w);
		// "blanche" is the feminine of "blanc" (white), not WOLF's half note.
		const masc = FEM_BACK()[lang][sw] || FEM_BACK()[lang][sw.replace(/s$/, '')];
		let hand = Lx ? Lx.findForeign(lang, masc || w) : [];
		if (Lx && !hand.length) for (const b of foreignBases(lang, w).slice(1)) if (!hand.length && Lx.BACK[lang].has(b)) hand = Lx.BACK[lang].get(b);
		// A plural: it ends in -s (or -x), and only its singular is a word ("manzanas", not "paraguas").
		const plural = /[sx]$/.test(sw) && !(Lx && Lx.BACK[lang].has(sw)) && !(lists(lang) && lists(lang).to.has(sw));
		if (hand.length) return { en: [...new Set(hand.map((k) => k.replace(/\.[a-z]+$/, '')))], base: masc || w, src: 'hand', plural };
		const big = lists(lang);
		if (!big) return null;
		for (const b of foreignBases(lang, w.replace(Lx ? Lx.ARTICLE : /^$/, ''))) {
			const en = big.to.get(b);
			if (en) return { en, base: b, src: 'list', plural: plural && b !== sw };
		}
		return null;
	}

	/* ---------- Spanish and French grammar ---------- */

	const VOWEL_START = /^(?:[aeiouyàâäéèêëîïôöùûüœæ]|h(?!a(?:ricot|ine|che|sard|ut|ll|mburger|mster|ndicap)|ibou|ockey|omard|onte|ér|éro|aie|ors|uit))/i;
	const elide = (lang, word, next) => (lang === 'fr' && VOWEL_START.test(next) ? word.replace(/e$|a$/, '') + "'" : word + ' ');
	const join = (lang, a, b) => (a.endsWith("'") ? a + b : (lang === 'fr' && /^(?:le|la|je|ne|de|me|te|se|que)$/.test(a) && VOWEL_START.test(b) ? a.slice(0, -1) + "'" + b : a + ' ' + b));

	function pluralOf(lang, w) {
		if (w.includes(' ')) {
			// "estación de tren" -> "estaciones de tren": the head word changes.
			const [head, ...rest] = w.split(' ');
			return [pluralOf(lang, head), ...rest].join(' ');
		}
		if (lang === 'es') {
			if (/[aeiouáéó]$/i.test(w)) return w + 's';
			if (/z$/.test(w)) return w.slice(0, -1) + 'ces';
			if (/[áéíóú][ns]$/.test(w)) return w.slice(0, -2) + strip(w.slice(-2, -1)) + w.slice(-1) + 'es';
			if (/[^aeiou]s$/.test(w) || (/s$/.test(w) && w.length > 4 && /[aeiou]s$/.test(w) && !/[áéíóú]/.test(w) && (w.match(/[aeiou]+/g) || []).length > 1)) return w;
			return w + 'es';
		}
		if (/[sxz]$/.test(w)) return w;
		if (/(?:eau|au|eu)$/.test(w) && !/^(?:pneu|bleu)$/.test(w)) return w + 'x';
		if (/al$/.test(w) && !/^(?:bal|festival|carnaval|chacal|récital)$/.test(w)) return w.slice(0, -2) + 'aux';
		if (w === 'travail') return 'travaux';
		if (w === 'œil') return 'yeux';
		return w + 's';
	}

	const FR_FEM = { beau: 'belle', nouveau: 'nouvelle', vieux: 'vieille', fou: 'folle', long: 'longue', gros: 'grosse', gentil: 'gentille', frais: 'fraîche', doux: 'douce', faux: 'fausse', blanc: 'blanche', sec: 'sèche', public: 'publique', grec: 'grecque', bas: 'basse', gras: 'grasse', épais: 'épaisse', favori: 'favorite' };
	const FR_BEFORE = new Set(['beau', 'joli', 'jeune', 'vieux', 'nouveau', 'bon', 'mauvais', 'petit', 'grand', 'gros', 'premier', 'dernier', 'autre', 'même', 'haut', 'long', 'vrai', 'meilleur']);
	const FR_BEFORE_VOWEL = { beau: 'bel', nouveau: 'nouvel', vieux: 'vieil' };
	const ES_FEM = { español: 'española', inglés: 'inglesa', francés: 'francesa', alemán: 'alemana', japonés: 'japonesa', portugués: 'portuguesa', holandés: 'holandesa', irlandés: 'irlandesa', escocés: 'escocesa', chino: 'china' };

	/** An adjective agreeing with a noun's gender and number. */
	function agree(lang, adj, gender, plural) {
		const parts = adj.split(' ');
		let a = parts[0];
		if (gender === 'f') {
			if (lang === 'es') a = ES_FEM[a] || (/o$/.test(a) ? a.slice(0, -1) + 'a' : /(?:or|ón|án|ín)$/.test(a) ? strip(a.slice(0, -2)) === a.slice(0, -2).toLowerCase() ? a + 'a' : a.slice(0, -2) + strip(a.slice(-2, -1)) + a.slice(-1) + 'a' : a);
			else a = FR_FEM[a] || (/e$/.test(a) ? a : /eux$/.test(a) ? a.slice(0, -1) + 'se' : /if$/.test(a) ? a.slice(0, -1) + 've' : /er$/.test(a) ? a.slice(0, -2) + 'ère' : /(?:el|eil|en|on|et)$/.test(a) && !/^(?:complet|concret|discret|inquiet|secret)$/.test(a) ? a + a.slice(-1) + 'e' : /(?:complet|concret|discret|inquiet|secret)$/.test(a) ? a.slice(0, -2) + 'ète' : a + 'e');
		}
		if (plural) {
			if (lang === 'es') a = /[aeiouáéó]$/.test(a) ? a + 's' : /z$/.test(a) ? a.slice(0, -1) + 'ces' : /[áéíóú]n$|[áéíóú]s$/.test(a) ? a.slice(0, -2) + strip(a.slice(-2, -1)) + a.slice(-1) + 'es' : a + 'es';
			else a = /[sx]$/.test(a) ? a : /eau$/.test(a) ? a + 'x' : /al$/.test(a) && gender !== 'f' ? a.slice(0, -2) + 'aux' : a + 's';
		}
		return [a, ...parts.slice(1)].join(' ');
	}

	/* Verbs: the present tense, for I, you, he/she/it, we, you (all), they. */
	const ES_VERBS = {
		ser: 'soy eres es somos sois son', estar: 'estoy estás está estamos estáis están', ir: 'voy vas va vamos vais van', tener: 'tengo tienes tiene tenemos tenéis tienen',
		hacer: 'hago haces hace hacemos hacéis hacen', poder: 'puedo puedes puede podemos podéis pueden', querer: 'quiero quieres quiere queremos queréis quieren', saber: 'sé sabes sabe sabemos sabéis saben',
		decir: 'digo dices dice decimos decís dicen', ver: 'veo ves ve vemos veis ven', dar: 'doy das da damos dais dan', venir: 'vengo vienes viene venimos venís vienen',
		salir: 'salgo sales sale salimos salís salen', poner: 'pongo pones pone ponemos ponéis ponen', traer: 'traigo traes trae traemos traéis traen', oír: 'oigo oyes oye oímos oís oyen',
		conocer: 'conozco conoces conoce conocemos conocéis conocen', conducir: 'conduzco conduces conduce conducimos conducís conducen', jugar: 'juego juegas juega jugamos jugáis juegan', haber: 'he has ha hemos habéis han',
		pedir: 'pido pides pide pedimos pedís piden', seguir: 'sigo sigues sigue seguimos seguís siguen', elegir: 'elijo eliges elige elegimos elegís eligen', construir: 'construyo construyes construye construimos construís construyen',
	};
	// Stems that change when stressed: "pienso" from pensar, "duermo" from dormir, "sirvo" from servir.
	const ES_STEM = { pensar: 'ie', empezar: 'ie', comenzar: 'ie', entender: 'ie', preferir: 'ie', sentir: 'ie', cerrar: 'ie', perder: 'ie', despertar: 'ie', defender: 'ie', mentir: 'ie', sentar: 'ie', nevar: 'ie', recomendar: 'ie', dormir: 'ue', volver: 'ue', encontrar: 'ue', costar: 'ue', recordar: 'ue', mostrar: 'ue', contar: 'ue', mover: 'ue', morir: 'ue', probar: 'ue', soñar: 'ue', almorzar: 'ue', volar: 'ue', devolver: 'ue', llover: 'ue', poder: 'ue', servir: 'i', repetir: 'i', vestir: 'i', medir: 'i' };
	const FR_VERBS = {
		être: 'suis es est sommes êtes sont', avoir: 'ai as a avons avez ont', aller: 'vais vas va allons allez vont', faire: 'fais fais fait faisons faites font',
		pouvoir: 'peux peux peut pouvons pouvez peuvent', vouloir: 'veux veux veut voulons voulez veulent', savoir: 'sais sais sait savons savez savent', dire: 'dis dis dit disons dites disent',
		voir: 'vois vois voit voyons voyez voient', prendre: 'prends prends prend prenons prenez prennent', venir: 'viens viens vient venons venez viennent', tenir: 'tiens tiens tient tenons tenez tiennent',
		boire: 'bois bois boit buvons buvez boivent', lire: 'lis lis lit lisons lisez lisent', écrire: 'écris écris écrit écrivons écrivez écrivent', dormir: 'dors dors dort dormons dormez dorment',
		partir: 'pars pars part partons partez partent', sortir: 'sors sors sort sortons sortez sortent', sentir: 'sens sens sent sentons sentez sentent', servir: 'sers sers sert servons servez servent',
		mettre: 'mets mets met mettons mettez mettent', connaître: 'connais connais connaît connaissons connaissez connaissent', croire: 'crois crois croit croyons croyez croient', devoir: 'dois dois doit devons devez doivent',
		recevoir: 'reçois reçois reçoit recevons recevez reçoivent', ouvrir: 'ouvre ouvres ouvre ouvrons ouvrez ouvrent', offrir: 'offre offres offre offrons offrez offrent', courir: 'cours cours court courons courez courent',
		vivre: 'vis vis vit vivons vivez vivent', suivre: 'suis suis suit suivons suivez suivent', envoyer: 'envoie envoies envoie envoyons envoyez envoient', payer: 'paie paies paie payons payez paient',
		acheter: 'achète achètes achète achetons achetez achètent', appeler: 'appelle appelles appelle appelons appelez appellent', préférer: 'préfère préfères préfère préférons préférez préfèrent', répéter: 'répète répètes répète répétons répétez répètent',
		rire: 'ris ris rit rions riez rient', plaire: 'plais plais plaît plaisons plaisez plaisent', falloir: '- - faut - - -', pleuvoir: '- - pleut - - pleuvent',
	};

	/** The present tense of an infinitive for person 0-5 (I, you, he/she, we, you all, they). */
	function conjugate(lang, inf, person) {
		const reflexive = lang === 'es' ? /se$/.test(inf) && inf.length > 4 : /^(?:se |s')/.test(inf);
		const base = lang === 'es' ? inf.replace(/se$/, '') : inf.replace(/^(?:se |s')/, '');
		let form;
		if (lang === 'es') {
			if (ES_VERBS[base]) form = ES_VERBS[base].split(' ')[person];
			else {
				const end = base.slice(-2);
				let stem = base.slice(0, -2);
				const ends = { ar: ['o', 'as', 'a', 'amos', 'áis', 'an'], er: ['o', 'es', 'e', 'emos', 'éis', 'en'], ir: ['o', 'es', 'e', 'imos', 'ís', 'en'], ír: ['o', 'es', 'e', 'imos', 'ís', 'en'] }[end] || ['o', 'as', 'a', 'amos', 'áis', 'an'];
				const change = ES_STEM[base];
				if (change && person !== 3 && person !== 4) {
					const at = Math.max(stem.lastIndexOf(change === 'ue' ? 'o' : 'e'), base === 'jugar' ? stem.lastIndexOf('u') : -1);
					if (at >= 0) stem = stem.slice(0, at) + change + stem.slice(at + 1);
				}
				if (/cer$/.test(base) && person === 0 && /[aeiou]cer$/.test(base)) stem = stem.slice(0, -1) + 'zc';
				form = stem + ends[person];
			}
			if (reflexive) form = ['me', 'te', 'se', 'nos', 'os', 'se'][person] + ' ' + form;
			return form;
		}
		const compound = Object.keys(FR_VERBS).find((v) => base.endsWith(v) && base !== v && /^(?:ap|com|sur|re|dé|de|ob|con|pro|ad|main|sou|par)/.test(base.slice(0, -v.length)) && v.length > 3);
		if (FR_VERBS[base]) form = FR_VERBS[base].split(' ')[person];
		else if (compound) form = base.slice(0, -compound.length) + FR_VERBS[compound].split(' ')[person];
		else if (/er$/.test(base)) {
			const stem = base.slice(0, -2);
			const ends = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
			form = person === 3 && /g$/.test(stem) ? stem + 'eons' : person === 3 && /c$/.test(stem) ? stem.slice(0, -1) + 'çons' : stem + ends[person];
		} else if (/ir$/.test(base)) form = base.slice(0, -2) + ['is', 'is', 'it', 'issons', 'issez', 'issent'][person];
		else if (/re$/.test(base)) form = base.slice(0, -2) + ['s', 's', '', 'ons', 'ez', 'ent'][person];
		else form = base;
		if (reflexive) form = join('fr', ['me', 'te', 'se', 'nous', 'vous', 'se'][person], form);
		return form;
	}

	const SUBJECT = { fr: ['je', 'tu', 'il', 'nous', 'vous', 'ils'], es: ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'] };
	const FR_SUBJECT_F = { 2: 'elle', 5: 'elles' };
	const ES_SUBJECT_F = { 2: 'ella', 5: 'ellas' };

	/** A clause: subject (in French; Spanish leaves out "I", "you" and "we"), verb, negation. */
	function clause(lang, person, verbForm, { negative = false, fem = false, keepSubject = false } = {}) {
		if (lang === 'es') {
			const subj = person === 2 || person === 5 || keepSubject ? (fem && ES_SUBJECT_F[person]) || SUBJECT.es[person] : '';
			return [subj, negative ? 'no' : '', verbForm].filter(Boolean).join(' ');
		}
		const subj = (fem && FR_SUBJECT_F[person]) || SUBJECT.fr[person];
		if (negative) return join('fr', subj, join('fr', 'ne', verbForm)) + ' pas';
		return join('fr', subj, verbForm);
	}

	/* ---------- Noun phrases ---------- */

	const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
	const NUM_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
	const NUM_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'];
	const DETS = new Set(['the', 'a', 'an', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'some', 'any', 'no']);
	const POSS = {
		my: { es: ['mi', 'mi', 'mis', 'mis'], fr: ['mon', 'ma', 'mes', 'mes'] }, your: { es: ['tu', 'tu', 'tus', 'tus'], fr: ['ton', 'ta', 'tes', 'tes'] },
		his: { es: ['su', 'su', 'sus', 'sus'], fr: ['son', 'sa', 'ses', 'ses'] }, her: { es: ['su', 'su', 'sus', 'sus'], fr: ['son', 'sa', 'ses', 'ses'] }, its: { es: ['su', 'su', 'sus', 'sus'], fr: ['son', 'sa', 'ses', 'ses'] },
		our: { es: ['nuestro', 'nuestra', 'nuestros', 'nuestras'], fr: ['notre', 'notre', 'nos', 'nos'] }, their: { es: ['su', 'su', 'sus', 'sus'], fr: ['leur', 'leur', 'leurs', 'leurs'] },
		this: { es: ['este', 'esta', 'estos', 'estas'], fr: ['ce', 'cette', 'ces', 'ces'] }, these: { es: ['estos', 'estas', 'estos', 'estas'], fr: ['ces', 'ces', 'ces', 'ces'] },
		that: { es: ['ese', 'esa', 'esos', 'esas'], fr: ['ce', 'cette', 'ces', 'ces'] }, those: { es: ['esos', 'esas', 'esos', 'esas'], fr: ['ces', 'ces', 'ces', 'ces'] },
	};

	/**
	 * Reads an English noun phrase: { det, num, adjs, noun, plural, proper, text } or null. "the two big red houses" ->
	 * det the, num 2, adjs [big, red], noun house, plural.
	 */
	function parseNP(text) {
		const words = norm(text, 'en').split(' ').filter(Boolean);
		if (!words.length || words.length > 6) return null;
		const np = { det: null, num: null, adjs: [], noun: null, plural: false, proper: false, text };
		if (DETS.has(words[0])) np.det = words.shift();
		if (words.length && (NUMBERS.includes(words[0]) || /^\d+$/.test(words[0]))) np.num = NUMBERS.includes(words[0]) ? NUMBERS.indexOf(words.shift()) : +words.shift();
		if (!words.length) return null;
		const raw = String(text).trim().split(/\s+/);
		// A name: kept as it is ("Paris", "Ana").
		if (!np.det && !np.num && /^[A-Z]/.test(raw[raw.length - words.length] || '') && words.length <= 3 && !englishForms(words.join(' ')).some((f) => f.pos === 'noun' && f.base === words.join(' '))) {
			np.noun = raw.slice(raw.length - words.length).join(' ');
			np.proper = true;
			return np;
		}
		// The noun: the longest ending of the phrase the dictionary knows as a noun ("ice cream", "train station", "cats").
		for (let i = 0; i < words.length; i++) {
			const tail = words.slice(i).join(' ');
			let forms = englishForms(tail).filter((f) => f.pos === 'noun');
			// A phrase is one noun ("ice cream") only if the everyday dictionary or the word list has it: WordNet's
			// "black cat" is a fisher, but "two black cats" are cats.
			if (i < words.length - 1) forms = forms.filter((f) => f.e && f.e.src !== 'full' || (L() && L().TABLE.has(f.base)));
			if (!forms.length) continue;
			const own = forms.find((f) => !f.label) || forms[0];
			np.noun = own.base.toLowerCase() === tail ? tail : own.base;
			np.plural = !!own.label && own.label === 'plural' && !forms.some((f) => !f.label);
			np.adjs = words.slice(0, i);
			if (np.num && np.num > 1) np.plural = true;
			if (/^(?:these|those)$/.test(np.det)) np.plural = true;
			if (np.adjs.every((a) => englishForms(a).some((f) => f.pos === 'adjective' || f.pos === 'noun'))) return np;
		}
		return null;
	}

	const lastWord = (s) => s.split(' ').pop();

	/**
	 * An English noun phrase in Spanish or French: { text, gender, plural, guessed, unknown }. `generic`: things in
	 * general, which take "the" in Spanish and French ("I like cats": me gustan los gatos). `negative`: French turns
	 * "un", "une", "des" into "de" after a negation ("je n'ai pas de voiture").
	 */
	function renderNP(np, lang, { generic = false, negative = false } = {}) {
		if (np.proper) return { text: np.noun, gender: 'm', plural: false, proper: true };
		const n = toForeign(np.noun, lang, 'noun');
		const unknown = [];
		let gender = 'm';
		let noun = np.noun;
		let guessed = false;
		if (n) {
			noun = n.word;
			gender = n.gender || 'm';
			guessed = !!n.guessed;
		} else unknown.push(np.noun);
		const plural = np.plural || (n && n.plural && !np.num);
		if (np.plural && n && !n.plural) noun = pluralOf(lang, noun);
		const before = [];
		const after = [];
		for (const en of np.adjs) {
			const a = toForeign(en, lang, 'adjective');
			if (!a) {
				// A noun used as an adjective ("chocolate cake"): "pastel de chocolate", "gâteau au chocolat" is beyond me; "de".
				const asNoun = toForeign(en, lang, 'noun');
				if (asNoun) after.push(`de ${asNoun.word}`);
				else unknown.push(en);
				continue;
			}
			const w = agree(lang, a.word, gender, plural);
			if (lang === 'fr' && FR_BEFORE.has(a.word)) before.push(!plural && gender === 'm' && FR_BEFORE_VOWEL[a.word] && VOWEL_START.test(noun) ? FR_BEFORE_VOWEL[a.word] : w);
			else after.push(w);
		}
		const body = [...before, noun, ...after].join(' ');
		const first = body.split(' ')[0];
		const g = gender === 'f' ? 1 : 0;
		let det = '';
		const def = lang === 'es' ? (plural ? ['los', 'las'][g] : ['el', 'la'][g]) : plural ? 'les' : ['le', 'la'][g];
		const indef = lang === 'es' ? (plural ? ['unos', 'unas'][g] : ['un', 'una'][g]) : plural ? 'des' : ['un', 'une'][g];
		if (np.num && np.num > 1) det = (lang === 'es' ? NUM_ES : NUM_FR)[np.num] || String(np.num);
		else if (np.num === 1) det = indef;
		else if (np.det === 'the') det = def;
		else if (np.det === 'a' || np.det === 'an') det = negative && lang === 'fr' ? 'de' : indef;
		else if (np.det === 'some' || np.det === 'any') det = lang === 'es' ? (plural ? ['unos', 'unas'][g] : '') : negative ? 'de' : plural ? 'des' : g ? 'de la' : 'du';
		else if (np.det === 'no') det = lang === 'es' ? (plural ? '' : ['ningún', 'ninguna'][g]) : 'aucun';
		else if (POSS[np.det]) {
			const list = POSS[np.det][lang];
			det = list[(plural ? 2 : 0) + g];
			// "mon amie", not "ma amie"; and "cet ami".
			if (lang === 'fr' && !plural && g && VOWEL_START.test(first) && /^(?:ma|ta|sa)$/.test(det)) det = det[0] + 'on';
			if (lang === 'fr' && !plural && !g && det === 'ce' && VOWEL_START.test(first)) det = 'cet';
		} else if (generic) det = def;
		else if (lang === 'fr') det = negative ? 'de' : plural ? 'des' : g ? 'de la' : 'du';
		let text;
		if (!det) text = body;
		else if (lang === 'fr' && /^(?:le|la|de|de la|du)$/.test(det) && VOWEL_START.test(first)) text = (det === 'du' || det === 'de la' ? "de l'" : det.replace(/^(?:le|la)$/, "l'").replace(/^de$/, "d'")) + body;
		else text = `${det} ${body}`;
		return { text, gender, plural, guessed, unknown };
	}

	/** A preposition before a noun phrase, with Spanish and French contractions: a + el = al, à + le = au, de + les = des. */
	function prep(lang, p, np) {
		const t = np.text;
		if (lang === 'es') {
			if (/^el /.test(t) && (p === 'a' || p === 'de')) return (p === 'a' ? 'al ' : 'del ') + t.slice(3);
			return `${p} ${t}`;
		}
		if (p === 'à') {
			if (/^le /.test(t)) return 'au ' + t.slice(3);
			if (/^les /.test(t)) return 'aux ' + t.slice(4);
			return `à ${t}`;
		}
		if (p === 'de') {
			if (/^le /.test(t)) return 'du ' + t.slice(3);
			if (/^les /.test(t)) return 'des ' + t.slice(4);
			if (/^(?:des|du|de la|de l'|de |d')/.test(t)) return t.replace(/^(?:des|du|de la|de l')\s*/, VOWEL_START.test(t.replace(/^(?:des|du|de la|de l')\s*/, '')) ? "d'" : 'de ').replace(/^de (?=\S)/, 'de ');
			return VOWEL_START.test(t) ? "d'" + t : `de ${t}`;
		}
		return `${p} ${t}`;
	}

	/* ---------- English to Spanish or French ---------- */

	const PERSON = { i: 0, you: 1, he: 2, she: 2, it: 2, we: 3, they: 5 };
	// Feelings are states (estar); most other adjectives say what someone is like (ser).
	const ESTAR = new Set(['tired', 'sick', 'ill', 'sad', 'happy', 'angry', 'bored', 'busy', 'ready', 'lost', 'worried', 'nervous', 'excited', 'sure', 'married', 'alone', 'fine', 'well', 'okay', 'full', 'drunk', 'dead', 'alive', 'awake', 'asleep', 'upset', 'scared', 'calm', 'stressed', 'sorry', 'late', 'early', 'free', 'open', 'closed', 'broken', 'clean', 'dirty', 'wet', 'dry', 'empty', 'quiet', 'surprised', 'confused', 'pregnant', 'hurt', 'glad', 'satisfied', 'disappointed', 'embarrassed', 'proud', 'jealous', 'lonely', 'sleepy']);
	// "I'm hungry" is "I have hunger": tengo hambre, j'ai faim.
	const HAVE_IDIOMS = { hungry: ['hambre', 'faim'], thirsty: ['sed', 'soif'], cold: ['frío', 'froid'], hot: ['calor', 'chaud'], scared: ['miedo', 'peur'], afraid: ['miedo', 'peur'], sleepy: ['sueño', 'sommeil'], right: ['razón', 'raison'], lucky: ['suerte', 'de la chance'] };
	const LANGUAGE_NAMES = { english: ['inglés', "l'anglais", 'anglais'], spanish: ['español', "l'espagnol", 'espagnol'], french: ['francés', 'le français', 'français'], german: ['alemán', "l'allemand", 'allemand'], italian: ['italiano', "l'italien", 'italien'], portuguese: ['portugués', 'le portugais', 'portugais'], chinese: ['chino', 'le chinois', 'chinois'], japanese: ['japonés', 'le japonais', 'japonais'], arabic: ['árabe', "l'arabe", 'arabe'], russian: ['ruso', 'le russe', 'russe'] };

	const cap1 = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
	const finish = (lang, s, question) => {
		const t = cap1(s.trim());
		if (question) return lang === 'es' ? `¿${t}?` : lang === 'fr' ? `${t} ?` : `${t}?`;
		return `${t}.`;
	};

	// "Play tennis" is jugar al tenis, jouer au tennis; "play the piano" is tocar el piano, jouer du piano.
	const SPORTS = /^(?:tennis|football|soccer|basketball|baseball|volleyball|golf|hockey|rugby|chess|cards|poker|cricket|badminton|ping-pong|table tennis)$/;
	const INSTRUMENTS = /^(?:piano|guitar|violin|drums?|flute|trumpet|cello|saxophone|harp|clarinet|bass|ukulele|accordion|organ|trombone)$/;

	/** A verb phrase: an English verb (any form) and its object, in `lang`, conjugated for `person`. */
	function verbPhrase(lang, enVerb, person, objectText, { negative = false, generic = false, infinitive = false } = {}) {
		const forms = englishForms(enVerb).filter((f) => f.pos === 'verb');
		const base = forms.length ? forms[0].base : enVerb;
		let v = toForeign(base, lang, 'verb');
		if (!v) return null;
		let obj = '';
		const notes = { guessed: false, unknown: [] };
		if (objectText) {
			const np = parseNP(objectText);
			if (!np) return null;
			const play = base === 'play' && !np.proper && (SPORTS.test(np.noun) ? 'sport' : INSTRUMENTS.test(np.noun) ? 'music' : null);
			if (play === 'music' && lang === 'es') v = { word: 'tocar' };
			const r = renderNP(np, lang, { generic: generic || !!play, negative });
			obj = play ? (play === 'music' && lang === 'es' ? r.text : prep(lang, lang === 'es' ? 'a' : play === 'sport' ? 'à' : 'de', r)) : r.text;
			// "No tengo coche": Spanish drops "un" after no.
			if (lang === 'es' && negative && (np.det === 'a' || np.det === 'an')) obj = obj.replace(/^(?:un|una) /, '');
			notes.guessed = r.guessed;
			notes.unknown = r.unknown;
		}
		const form = infinitive ? v.word : conjugate(lang, v.word, person);
		return { form, obj, notes, inf: v.word };
	}

	/**
	 * Patterns for English sentences, tried in order on the reduced sentence. Each returns { text, guessed, unknown }
	 * or null when its words aren't ones it can translate.
	 */
	const EN_PATTERNS = [
		// My name is Ana. I'm from Spain. I speak French.
		[/^my name is ([a-z' -]+)$/, (m, lang, raw) => ({ text: lang === 'es' ? `Me llamo ${name(raw, m[1])}.` : `Je m'appelle ${name(raw, m[1])}.` })],
		[/^i am from ([a-z' -]+)$/, (m, lang, raw) => ({ text: lang === 'es' ? `Soy de ${name(raw, m[1])}.` : `Je viens de ${name(raw, m[1])}.` })],
		[/^i live in ([a-z' -]+)$/, (m, lang, raw) => ({ text: lang === 'es' ? `Vivo en ${name(raw, m[1])}.` : `J'habite à ${name(raw, m[1])}.` })],
		[/^(do you |i |we )(do not )?speak ([a-z]+)$/, (m, lang) => {
			const l = LANGUAGE_NAMES[m[3]];
			if (!l) return null;
			const person = m[1] === 'do you ' ? 1 : m[1] === 'we ' ? 3 : 0;
			const said = lang === 'es' ? l[0] : l[2];
			return { text: finish(lang, `${clause(lang, person, conjugate(lang, lang === 'es' ? 'hablar' : 'parler', person), { negative: !!m[2] })} ${said}`, person === 1) };
		}],
		// I'm 30 years old.
		[/^(i|you|he|she|we|they) (am|is|are) (\d+|[a-z]+) years? old$/, (m, lang) => {
			const n = /^\d+$/.test(m[3]) ? +m[3] : NUMBERS.indexOf(m[3]);
			if (n < 0) return null;
			const p = PERSON[m[1]];
			return { text: finish(lang, `${clause(lang, p, conjugate(lang, lang === 'es' ? 'tener' : 'avoir', p), { fem: m[1] === 'she' })} ${n} ${lang === 'es' ? (n === 1 ? 'año' : 'años') : n === 1 ? 'an' : 'ans'}`) };
		}],
		// Where is the station? Where are my keys?
		[/^where (is|are) (.+)$/, (m, lang) => {
			const np = parseNP(m[2]);
			if (!np) return null;
			const r = renderNP(np, lang);
			const pl = r.plural || m[1] === 'are';
			return Object.assign(r, { text: lang === 'es' ? `¿Dónde ${pl ? 'están' : 'está'} ${r.text}?` : `Où ${pl ? 'sont' : 'est'} ${r.text} ?` });
		}],
		// How much is the ticket? How much do the apples cost?
		[/^how much (?:is|are|does|do) (.+?)(?: cost)?$/, (m, lang) => {
			const np = parseNP(m[1]);
			if (!np) return null;
			const r = renderNP(np, lang);
			return Object.assign(r, { text: lang === 'es' ? `¿Cuánto ${r.plural ? 'cuestan' : 'cuesta'} ${r.text}?` : `Combien ${r.plural ? 'coûtent' : 'coûte'} ${r.text} ?` });
		}],
		// There is a cat in the garden: there's a cat.
		[/^there (is|are) (.+)$/, (m, lang) => {
			const np = parseNP(m[2]);
			if (!np) return null;
			const r = renderNP(np, lang);
			return Object.assign(r, { text: finish(lang, `${lang === 'es' ? 'hay' : 'il y a'} ${r.text}`) });
		}],
		// I'm hungry, I'm not tired, she is happy, the house is white, I am a teacher.
		[/^(i|you|he|she|it|we|they|the [a-z' -]+|my [a-z' -]+|your [a-z' -]+|this [a-z' -]+|that [a-z' -]+|these [a-z' -]+|those [a-z' -]+) (am|is|are)( not)? (very |really |so |too )?([a-z' -]+)$/, (m, lang) => {
			const [, who, , not, very, rest] = m;
			const negative = !!not;
			// "The cat is on the table": a place, which is estar in Spanish.
			const place = rest.match(new RegExp(`^(${Object.keys(PREPS).join('|')}) (.+)$`));
			if (place && !very) {
				const pp = translatePP(place[1], place[2], lang);
				let person0 = PERSON[who];
				let subj = null;
				if (person0 === undefined) {
					const np0 = parseNP(who);
					if (!np0) return null;
					subj = renderNP(np0, lang);
					person0 = subj.plural ? 5 : 2;
				}
				if (!pp) return null;
				const verb = conjugate(lang, lang === 'es' ? 'estar' : 'être', person0);
				const head = subj ? (lang === 'es' ? `${subj.text} ${negative ? 'no ' : ''}${verb}` : negative ? `${subj.text} ${join('fr', 'ne', verb)} pas` : `${subj.text} ${verb}`) : clause(lang, person0, verb, { negative, fem: who === 'she' });
				return { text: finish(lang, `${head} ${pp.text}`), guessed: (subj && subj.guessed) || pp.guessed, unknown: subj ? subj.unknown : [] };
			}
			if (/\s/.test(rest) && !/^an? /.test(rest)) return null;
			const adv = very ? { 'very ': ['muy', 'très'], 'really ': ['muy', 'vraiment'], 'so ': ['tan', 'si'], 'too ': ['demasiado', 'trop'] }[very][lang === 'es' ? 0 : 1] + ' ' : '';
			let person = PERSON[who];
			let subject = null;
			if (person === undefined) {
				const np = parseNP(who);
				if (!np) return null;
				subject = renderNP(np, lang);
				person = subject.plural ? 5 : 2;
			}
			const fem = who === 'she' || (subject && subject.gender === 'f');
			const plural = person === 3 || person === 5;
			// "I am a teacher": no article in Spanish or French.
			const job = rest.match(/^an? ([a-z' -]+)$/);
			if (job && !very) {
				const n = toForeign(job[1], lang, 'noun');
				if (!n) return null;
				const verb = conjugate(lang, lang === 'es' ? 'ser' : 'être', person);
				const head = subject ? `${subject.text} ${negative ? (lang === 'es' ? 'no ' : '') : ''}${verb}` : clause(lang, person, verb, { negative, fem });
				return { text: finish(lang, lang === 'fr' && subject && negative ? `${subject.text} n'est pas ${n.word}` : `${head} ${n.word}`), guessed: n.guessed };
			}
			if (HAVE_IDIOMS[rest] && !subject && who !== 'it') {
				const idiom = HAVE_IDIOMS[rest][lang === 'es' ? 0 : 1];
				const verb = conjugate(lang, lang === 'es' ? 'tener' : 'avoir', person);
				const muy = very ? (lang === 'es' ? 'mucha ' : 'très ') : '';
				const said = lang === 'es' && very && /^(?:frío|calor|miedo|sueño)$/.test(idiom) ? 'mucho ' + idiom : muy + idiom;
				return { text: finish(lang, `${clause(lang, person, verb, { negative, fem })} ${lang === 'fr' && negative && idiom === 'de la chance' ? 'de chance' : said}`) };
			}
			const a = toForeign(rest, lang, 'adjective');
			if (!a) return null;
			const word = agree(lang, a.word, fem ? 'f' : 'm', plural);
			// Without knowing who "I" or "you" is, give both genders when they differ: cansado/a.
			const other = !subject && (person === 0 || person === 1 || person === 3) ? agree(lang, a.word, 'f', plural) : null;
			const shown = other && other !== word ? `${word} (${lang === 'es' ? 'o' : 'ou'} ${other})` : word;
			const feeling = englishForms(rest).some((f) => f.e && f.e.use === 'feel');
			const verbInf = lang === 'es' ? (ESTAR.has(rest) || feeling ? 'estar' : 'ser') : 'être';
			const verb = conjugate(lang, verbInf, person);
			if (who === 'it' && lang === 'fr') return { text: finish(lang, `${negative ? "ce n'est pas" : "c'est"} ${adv}${a.word}`) };
			if (who === 'it' && lang === 'es') return { text: finish(lang, `${negative ? 'no ' : ''}${conjugate('es', verbInf, 2)} ${adv}${a.word}`) };
			const head = subject ? (lang === 'es' ? `${subject.text} ${negative ? 'no ' : ''}${verb}` : negative ? `${subject.text} ${join('fr', 'ne', verb)} pas` : `${subject.text} ${verb}`) : clause(lang, person, verb, { negative, fem });
			return { text: finish(lang, `${head} ${adv}${shown}`), guessed: subject && subject.guessed, unknown: subject && subject.unknown };
		}],
		// I want to eat, I need to sleep, I have to go, I can swim, I like to read, I'm going to travel.
		[/^(i|you|he|she|we|they) (do not |does not |can not |will not )?(want|wants|need|needs|have|has|like|likes|love|loves|can|am going|is going|are going) to ([a-z]+)(?: (.+))?$|^(i|you|he|she|we|they) (can not |can )([a-z]+)(?: (.+))?$/, (m, lang) => {
			const who = m[1] || m[6];
			const neg = /not/.test(m[2] || m[7] || '');
			const modal = m[1] ? m[3].replace(/s$/, '').replace(/^(am|is|are) going$/, 'go') : 'can';
			const verb = m[4] || m[8];
			const obj = m[5] || m[9];
			const p = PERSON[who];
			const vp = verbPhrase(lang, verb, p, obj, { infinitive: true });
			if (!vp) return null;
			const fem = who === 'she';
			const rest = `${vp.form}${vp.obj ? ' ' + vp.obj : ''}`;
			let head;
			if (lang === 'es') {
				const es = { want: ['querer', ''], need: ['necesitar', ''], have: ['tener', 'que '], can: ['poder', ''], go: ['ir', 'a '] }[modal];
				if (modal === 'like' || modal === 'love') head = `${neg ? 'no ' : ''}${['me', 'te', 'le', 'nos', 'os', 'les'][p]} ${modal === 'like' ? 'gusta' : 'encanta'}`;
				else head = `${clause('es', p, conjugate('es', es[0], p), { negative: neg, fem })}${es[1] ? ' ' + es[1].trim() : ''}`;
			} else {
				const fr = { want: 'vouloir', need: null, have: 'devoir', can: 'pouvoir', go: 'aller', like: 'aimer', love: 'adorer' }[modal];
				head = fr ? clause('fr', p, conjugate('fr', fr, p), { negative: neg, fem }) : `${clause('fr', p, conjugate('fr', 'avoir', p), { negative: neg, fem })} besoin de`;
				if (!fr) return { text: finish(lang, `${head.replace(/ de$/, '')} ${VOWEL_START.test(vp.form) ? "d'" + rest : 'de ' + rest}`), guessed: vp.notes.guessed, unknown: vp.notes.unknown };
			}
			return { text: finish(lang, `${head} ${rest}`, false), guessed: vp.notes.guessed, unknown: vp.notes.unknown };
		}],
		// Do you have a pen? Can I have a coffee, please? Can you help my friend?
		[/^(?:can|could|may) i have (.+?)( please)?$/, (m, lang) => {
			const np = parseNP(m[1]);
			if (!np) return null;
			const r = renderNP(np, lang);
			return Object.assign(r, { text: lang === 'es' ? `¿Me das ${r.text}${m[2] ? ', por favor' : ''}?` : `Je peux avoir ${r.text}${m[2] ? ', s\'il vous plaît' : ''} ?` });
		}],
		[/^do you have (.+)$/, (m, lang) => {
			const np = parseNP(m[1]);
			if (!np) return null;
			const r = renderNP(np, lang);
			return Object.assign(r, { text: lang === 'es' ? `¿Tienes ${r.text}?` : `Tu as ${r.text} ?` });
		}],
		// I'd like a coffee (please). I want two tickets.
		[/^i would like (.+?)( please)?$/, (m, lang) => {
			const np = parseNP(m[1]);
			if (!np) return null;
			const r = renderNP(np, lang);
			return Object.assign(r, { text: `${lang === 'es' ? 'Quisiera' : 'Je voudrais'} ${r.text}${m[2] ? (lang === 'es' ? ', por favor' : ", s'il vous plaît") : ''}.` });
		}],
		// I like cats, I don't like rain, she loves music: things in general take "the".
		[/^(i|you|he|she|we|they) (do not |does not )?(like|likes|love|loves|hate|hates) (.+)$/, (m, lang) => {
			const p = PERSON[m[1]];
			const neg = !!m[2];
			const verb = m[3].replace(/s$/, '');
			const np = parseNP(m[4]);
			if (!np) return null;
			const r = renderNP(np, lang, { generic: true });
			if (lang === 'es') {
				if (verb === 'hate') return Object.assign(r, { text: finish('es', `${clause('es', p, conjugate('es', 'odiar', p), { negative: neg })} ${r.text}`) });
				const pron = ['me', 'te', 'le', 'nos', 'os', 'les'][p];
				return Object.assign(r, { text: finish('es', `${neg ? 'no ' : ''}${pron} ${verb === 'like' ? (r.plural ? 'gustan' : 'gusta') : r.plural ? 'encantan' : 'encanta'} ${r.text}`) });
			}
			const fr = { like: 'aimer', love: 'adorer', hate: 'détester' }[verb];
			return Object.assign(r, { text: finish('fr', `${clause('fr', p, conjugate('fr', fr, p), { negative: neg, fem: m[1] === 'she' })} ${r.text}`) });
		}],
		// I need a doctor. I have a car. I don't have a car. I'm going to the beach.
		[/^(i|you|he|she|we|they) (do not |does not )?(need|needs|have|has|want|wants) (.+)$/, (m, lang) => {
			const p = PERSON[m[1]];
			const neg = !!m[2];
			const verb = m[3].replace(/s$/, '').replace(/^ha$/, 'have');
			const np = parseNP(m[4]);
			if (!np) return null;
			const r = renderNP(np, lang, { negative: neg });
			if (lang === 'es') {
				const inf = { need: 'necesitar', have: 'tener', want: 'querer' }[verb];
				const obj = neg && (np.det === 'a' || np.det === 'an') ? r.text.replace(/^(?:un|una) /, '') : r.text;
				return Object.assign(r, { text: finish('es', `${clause('es', p, conjugate('es', inf, p), { negative: neg, fem: m[1] === 'she' })} ${obj}`) });
			}
			if (verb === 'need') return Object.assign(r, { text: finish('fr', `${clause('fr', p, conjugate('fr', 'avoir', p), { negative: neg, fem: m[1] === 'she' })} besoin ${prep('fr', 'de', r)}`) });
			return Object.assign(r, { text: finish('fr', `${clause('fr', p, conjugate('fr', verb === 'have' ? 'avoir' : 'vouloir', p), { negative: neg, fem: m[1] === 'she' })} ${r.text}`) });
		}],
		[/^(i|you|he|she|we|they) (am|is|are) going to (the [a-z' -]+|[a-z' -]+)$/, (m, lang, raw) => {
			const p = PERSON[m[1]];
			const np = /^the /.test(m[3]) ? parseNP(m[3]) : { proper: true, noun: name(raw, m[3]) };
			if (!np) return null;
			const r = renderNP(np, lang);
			return Object.assign(r, { text: finish(lang, `${clause(lang, p, conjugate(lang, lang === 'es' ? 'ir' : 'aller', p), { fem: m[1] === 'she' })} ${prep(lang, lang === 'es' ? 'a' : 'à', r)}`) });
		}],
		// Any other simple sentence: I eat apples, she reads books, we don't drink coffee, do you play tennis?
		[/^(do |does )?(i|you|he|she|it|we|they) (do not |does not )?([a-z]+)(?: (.+))?$/, (m, lang) => {
			const question = !!m[1];
			const p = PERSON[m[2]];
			const neg = !!m[3];
			const forms = englishForms(m[4]).filter((f) => f.pos === 'verb');
			if (!forms.length) return null;
			if ((p === 2) !== /s$/.test(m[4]) && !forms.some((f) => !f.label) && !m[1] && !m[3]) return null;
			const vp = verbPhrase(lang, m[4], p, m[5], { negative: neg });
			if (!vp) return null;
			const head = clause(lang, p, vp.form, { negative: neg, fem: m[2] === 'she', keepSubject: false });
			return { text: finish(lang, `${head}${vp.obj ? ' ' + vp.obj : ''}`, question), guessed: vp.notes.guessed, unknown: vp.notes.unknown };
		}],
		// The old man reads a book. My sister doesn't eat meat. The children play football.
		[/^((?:the|my|your|his|her|our|their|this|that|these|those|a|an) .+)$/, (m, lang) => {
			const words = m[1].split(' ');
			for (let k = 2; k < words.length && k <= 5; k++) {
				let i = k;
				const neg = /^(?:does|do)$/.test(words[i]) && words[i + 1] === 'not';
				if (neg) i += 2;
				const verb = words[i];
				if (!verb || !englishForms(verb).some((f) => f.pos === 'verb')) continue;
				const np = parseNP(words.slice(0, k).join(' '));
				if (!np || np.proper) continue;
				// The verb must agree: "the man reads", "the men read".
				if (!neg && np.plural === /[^s]s$/.test(verb) && verb !== 'is') continue;
				const subject = renderNP(np, lang);
				const person = subject.plural ? 5 : 2;
				const vp = verbPhrase(lang, verb, person, words.slice(i + 1).join(' ') || null, { negative: neg });
				if (!vp) continue;
				const v = lang === 'es' ? `${neg ? 'no ' : ''}${vp.form}` : neg ? `${join('fr', 'ne', vp.form)} pas` : vp.form;
				return { text: finish(lang, `${subject.text} ${v}${vp.obj ? ' ' + vp.obj : ''}`), guessed: subject.guessed || vp.notes.guessed, unknown: [...subject.unknown, ...vp.notes.unknown] };
			}
			return null;
		}],
		// Just a noun phrase: "the big red house", "two black cats".
		[/^(.+)$/, (m, lang) => {
			const np = parseNP(m[1]);
			if (!np || np.proper) return null;
			const r = renderNP(np, lang);
			return r;
		}],
	];

	// Where things are: "in the garden", "on the table", "next to the bank".
	const PREPS = { 'in front of': ['delante de', 'devant'], 'next to': ['al lado de', 'à côté de'], 'near': ['cerca de', 'près de'], 'behind': ['detrás de', 'derrière'], 'under': ['debajo de', 'sous'], 'on': ['en', 'sur'], 'in': ['en', 'dans'], 'at': ['en', 'à'], 'with': ['con', 'avec'], 'without': ['sin', 'sans'], 'for': ['para', 'pour'], 'from': ['de', 'de'], 'to': ['a', 'à'] };
	const PP = new RegExp(`^(.+?) (${Object.keys(PREPS).join('|')}) ((?:the|my|your|his|her|our|their|this|that|a|an) [a-z' -]+|[a-z]+)$`);

	/** A place or companion at the end of a sentence, in `lang`: "en el jardín", "dans le jardin". */
	function translatePP(p, rest, lang) {
		if (rest === 'home') return { text: { at: ['en casa', 'à la maison'], to: ['a casa', 'à la maison'], from: ['de casa', 'de la maison'] }[p] ? { at: ['en casa', 'à la maison'], to: ['a casa', 'à la maison'], from: ['de casa', 'de la maison'] }[p][lang === 'es' ? 0 : 1] : null };
		const np = parseNP(rest);
		if (!np) return null;
		const r = renderNP(np, lang);
		if (r.unknown && r.unknown.length) return null;
		const said = PREPS[p][lang === 'es' ? 0 : 1];
		// "sans lait", not "sans du lait".
		if (lang === 'fr' && said === 'sans' && !np.det) return { text: `sans ${r.text.replace(/^(?:du|de la|des) |^de l'/, '')}`, guessed: r.guessed };
		const last = said.split(' ').pop();
		const head = said.split(' ').slice(0, -1).join(' ');
		return { text: [head, prep(lang, last, r)].filter(Boolean).join(' '), guessed: r.guessed };
	}

	/** A name as the person wrote it: "ana" in the reduced sentence is "Ana" (or "Léa") in theirs. */
	function name(raw, lowered) {
		const n = lowered.split(' ').length;
		const words = String(raw).replace(/[.!?¿¡]+/g, ' ').trim().split(/\s+/);
		const said = words.length >= n ? words.slice(-n).join(' ') : lowered;
		return said.replace(/(^|[\s-])(\p{Ll})/gu, (m, a, c) => a + c.toUpperCase());
	}

	/* ---------- Spanish or French to English ---------- */

	const BACK_DETS = {
		es: { el: 'the', la: 'the', los: 'the', las: 'the', un: 'a', una: 'a', unos: 'some', unas: 'some', mi: 'my', mis: 'my', tu: 'your', tus: 'your', su: 'his', sus: 'his', nuestro: 'our', nuestra: 'our', nuestros: 'our', nuestras: 'our', este: 'this', esta: 'this', estos: 'these', estas: 'these', ese: 'that', esa: 'that', esos: 'those', esas: 'those' },
		fr: { le: 'the', la: 'the', les: 'the', "l'": 'the', un: 'a', une: 'a', des: 'some', du: 'some', 'de la': 'some', "de l'": 'some', de: '', "d'": '', mon: 'my', ma: 'my', mes: 'my', ton: 'your', ta: 'your', tes: 'your', son: 'his', sa: 'his', ses: 'his', notre: 'our', nos: 'our', votre: 'your', vos: 'your', leur: 'their', leurs: 'their', ce: 'this', cet: 'this', cette: 'this', ces: 'these' },
	};
	const PLURAL_DETS = new Set(['los', 'las', 'unos', 'unas', 'mis', 'tus', 'sus', 'nuestros', 'nuestras', 'estos', 'estas', 'esos', 'esas', 'les', 'des', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'ces']);
	const a_ = (w) => (/^[aeiou]/i.test(w) && !/^(?:u[nst]i|use|usu|eu|one)/i.test(w) ? 'an' : 'a');

	/** A Spanish or French noun phrase in English: { text, plural, unknown } or null. */
	function backNP(lang, text) {
		let t = strip(text).replace(/^(?:a |à |de |en )?/, '').trim();
		t = t.replace(/^(al|del|au|aux)\s+/, (x, w) => ({ al: 'el ', del: 'el ', au: 'le ', aux: 'les ' })[w]);
		let det = null;
		const m = t.match(/^(de la|de l'|l'|d'|[a-z]+)\s*(.*)$/);
		const dets = BACK_DETS[lang];
		const stripped = Object.fromEntries(Object.entries(dets).map(([k, v]) => [strip(k), [k, v]]));
		let rest = t;
		if (m && stripped[m[1]] && m[2]) {
			det = stripped[m[1]][0];
			rest = m[2];
		}
		const words = rest.split(/\s+/).filter(Boolean);
		if (!words.length || words.length > 5) return null;
		const nums = (lang === 'es' ? NUM_ES : NUM_FR).map(strip);
		let num = null;
		if (nums.includes(words[0]) && words.length > 1) num = nums.indexOf(words.shift());
		else if (/^\d+$/.test(words[0]) && words.length > 1) num = +words.shift();
		const unknown = [];
		let noun = null;
		let plural = det ? PLURAL_DETS.has(det) : false;
		const adjs = [];
		// What each word is, by the everyday dictionary: "petit" is small (an adjective), whatever WordNet's rarer
		// senses say ("the small of the back").
		const everyday = (en) => new Set(((D() && D().lookup(en)) || []).map((h) => h.e.pos));
		const found = words.map((w) => ({ w, f: toEnglish(w, lang) }));
		for (const { w, f } of found) if (!f) unknown.push(w);
		const known = found.filter((x) => x.f);
		const pick = (f, pos) => f.en.find((x) => everyday(x).has(pos));
		let head = known.find((x) => pick(x.f, 'noun') && !(pick(x.f, 'adjective') && known.length > 1 && known.some((y) => y !== x && pick(y.f, 'noun') && !pick(y.f, 'adjective'))));
		if (!head) head = known.find((x) => pick(x.f, 'noun')) || known[0];
		for (const x of known) {
			if (x === head) {
				noun = pick(x.f, 'noun') || x.f.en[0];
				if (x.f.plural) plural = true;
			} else adjs.push(pick(x.f, 'adjective') || x.f.en[0]);
		}
		if (num && num > 1) plural = true;
		if (!noun) return unknown.length ? { text: words.join(' '), plural, unknown } : null;
		const d = D();
		const nounWord = plural && d ? (() => {
			const e = englishForms(noun).find((f) => f.pos === 'noun');
			return e && e.e ? d.forms.plural(e.e) : noun + 's';
		})() : noun;
		const body = [...adjs, nounWord].join(' ');
		let en = det ? dets[det] : '';
		if (num) en = num > 1 ? NUMBERS[num] || String(num) : 'one';
		else if (en === 'a') en = a_(body);
		else if (en === 'some' && !plural) en = 'some';
		const mass = !plural && englishForms(noun).some((f) => f.pos === 'noun' && f.e && f.e.mass);
		return { text: en ? `${en} ${body}` : body, plural, unknown, bare: !det && !num, mass };
	}

	/** "car" after "I have" or "I need" is "a car"; "water" and "apples" stay as they are. */
	const someOrA = (r) => (r.bare && !r.plural && !r.mass ? `${a_(r.text)} ${r.text}` : r.text);

	const EN_BE = ['am', 'are', 'is', 'are', 'are', 'are'];
	const EN_SUBJ = ['I', 'you', 'he', 'we', 'you', 'they'];
	const FR_PERSON = { je: 0, "j'": 0, tu: 1, il: 2, elle: 2, on: 3, nous: 3, vous: 4, ils: 5, elles: 5 };
	const ES_PERSON = { yo: 0, tu: 1, el: 2, ella: 2, usted: 2, nosotros: 3, nosotras: 3, vosotros: 4, ellos: 5, ellas: 5, ustedes: 5 };

	/** Person (0-5) and infinitive of a conjugated Spanish or French verb, by looking it up in the tables. */
	function readVerb(lang, word) {
		const w = strip(word);
		const table = lang === 'es' ? ES_VERBS : FR_VERBS;
		for (const [inf, forms] of Object.entries(table)) {
			const i = forms.split(' ').map(strip).indexOf(w);
			if (i >= 0) return { inf, person: i };
		}
		const ends = lang === 'es' ? [['amos', 3, 'ar'], ['emos', 3, 'er'], ['imos', 3, 'ir'], ['ais', 4, 'ar'], ['eis', 4, 'er'], ['is', 4, 'ir'], ['an', 5, 'ar'], ['en', 5, 'er'], ['en', 5, 'ir'], ['as', 1, 'ar'], ['es', 1, 'er'], ['es', 1, 'ir'], ['o', 0, 'ar'], ['o', 0, 'er'], ['o', 0, 'ir'], ['a', 2, 'ar'], ['e', 2, 'er'], ['e', 2, 'ir']] : [['ons', 3, 'er'], ['ez', 4, 'er'], ['ent', 5, 'er'], ['issons', 3, 'ir'], ['issez', 4, 'ir'], ['issent', 5, 'ir'], ['es', 1, 'er'], ['e', 0, 'er'], ['is', 0, 'ir'], ['it', 2, 'ir'], ['s', 0, 're'], ['', 2, 're']];
		for (const [end, person, inf] of ends) {
			if (!w.endsWith(end) || w.length - end.length < 2) continue;
			let stem = w.slice(0, w.length - end.length);
			// Undo a stem change: "duerm" -> "dorm", "piens" -> "pens".
			const tries = [stem];
			if (lang === 'es') tries.push(stem.replace(/ue(?=[^aeiou]*$)/, 'o'), stem.replace(/ie(?=[^aeiou]*$)/, 'e'), stem.replace(/i(?=[^aeiou]*$)/, 'e'), stem.replace(/zc$/, 'c'), stem.replace(/ue(?=[^aeiou]*$)/, 'u'));
			for (const s of tries) {
				const candidate = s + inf;
				const en = toEnglish(candidate, lang);
				if (en && englishForms(en.en[0]).some((f) => f.pos === 'verb')) return { inf: candidate, person, en: en.en.find((x) => englishForms(x).some((f) => f.pos === 'verb')) };
			}
		}
		return null;
	}

	/** An English verb for person 0-5 in the present: "eat", "eats". */
	function englishVerb(en, person, negative) {
		if (en === 'be') return (negative ? EN_BE[person] + ' not' : EN_BE[person]);
		const d = D();
		const e = (englishForms(en).find((f) => f.pos === 'verb') || {}).e;
		if (negative) return `${person === 2 ? 'does' : 'do'} not ${en}`;
		return person === 2 ? (d && e && e.src !== 'full' ? d.forms.third(e) : en.replace(/(s|sh|ch|x|z|o)$/, '$1e').replace(/([^aeiou])y$/, '$1ie') + 's') : en;
	}

	const BACK_PATTERNS = {
		es: [
			[/^me llamo (.+)$/, (m, raw) => `My name is ${name(raw, m[1])}.`],
			[/^soy de (.+)$/, (m, raw) => `I am from ${name(raw, m[1])}.`],
			[/^vivo en (.+)$/, (m, raw) => `I live in ${name(raw, m[1])}.`],
			[/^donde (esta|estan) (.+)$/, (m) => np('Where', m[2], (r) => `${r.plural || m[1] === 'estan' ? 'are' : 'is'} ${r.text}?`, 'es')],
			[/^cuanto (cuesta|cuestan) (.+)$/, (m) => np('How much', m[2], (r) => `${r.plural || m[1] === 'cuestan' ? 'do' : 'does'} ${r.text} cost?`, 'es')],
			[/^hay (.+)$/, (m) => np('There', m[1], (r) => `${r.plural ? 'are' : 'is'} ${r.text}.`, 'es')],
			[/^(no )?(me|te|le|nos|les) (gusta|gustan|encanta|encantan) (.+)$/, (m) => np(['I', 'you', 'he', 'we', 'you', 'they'][['me', 'te', 'le', 'nos', 'os', 'les'].indexOf(m[2])], m[4], (r) => `${m[1] ? (m[2] === 'le' ? 'does not ' : 'do not ') : ''}${/encanta/.test(m[3]) ? 'love' : 'like'}${m[2] === 'le' && !m[1] ? 's' : ''} ${r.text.replace(/^the /, '')}.`, 'es')],
			[/^tengo (\d+|[a-z]+) anos$/, (m) => `I am ${/^\d+$/.test(m[1]) ? m[1] : NUM_ES.map(strip).indexOf(m[1])} years old.`],
			[/^(no )?tengo (hambre|sed|frio|calor|miedo|sueno|razon|suerte)$/, (m) => `I am ${m[1] ? 'not ' : ''}${{ hambre: 'hungry', sed: 'thirsty', frio: 'cold', calor: 'hot', miedo: 'scared', sueno: 'sleepy', razon: 'right', suerte: 'lucky' }[m[2]]}.`],
			[/^(no )?(quiero|quisiera|necesito|tengo) (.+)$/, (m) => np('I', m[3], (r) => `${m[2] === 'quisiera' ? 'would like' : `${m[1] ? 'do not ' : ''}${{ quiero: 'want', necesito: 'need', tengo: 'have' }[m[2]]}`} ${someOrA(r)}.`, 'es')],
			[/^(no )?(estoy|soy|eres|estas|es|esta|somos|estamos|son|estan) (muy )?([a-z]+)$/, (m) => be('es', m)],
			[/^(.+?) (no )?(es|esta|son|estan) (muy )?([a-z]+)$/, (m) => np('', m[1], (r) => `${r.text} ${r.plural || /n$/.test(m[3]) ? 'are' : 'is'}${m[2] ? ' not' : ''} ${m[4] ? 'very ' : ''}${adjective(m[5], 'es')}.`, 'es', true)],
		],
		fr: [
			[/^je m'appelle (.+)$/, (m, raw) => `My name is ${name(raw, m[1])}.`],
			[/^je viens d(?:e |')(.+)$/, (m, raw) => `I am from ${name(raw, m[1])}.`],
			[/^j'habite (?:a|en|au) (.+)$/, (m, raw) => `I live in ${name(raw, m[1])}.`],
			[/^ou (est|sont) (.+)$/, (m) => np('Where', m[2], (r) => `${r.plural || m[1] === 'sont' ? 'are' : 'is'} ${r.text}?`, 'fr')],
			[/^combien (coute|coutent) (.+)$/, (m) => np('How much', m[2], (r) => `${r.plural || m[1] === 'coutent' ? 'do' : 'does'} ${r.text} cost?`, 'fr')],
			[/^il y a (.+)$/, (m) => np('There', m[1], (r) => `${r.plural ? 'are' : 'is'} ${r.text}.`, 'fr')],
			[/^j'ai (\d+|[a-z-]+) ans$/, (m) => `I am ${/^\d+$/.test(m[1]) ? m[1] : NUM_FR.map(strip).indexOf(m[1])} years old.`],
			[/^(?:je n'ai pas|j'ai) (faim|soif|froid|chaud|peur|sommeil|raison)$/, (m, raw) => `I am ${/n'ai pas/.test(strip(raw)) ? 'not ' : ''}${{ faim: 'hungry', soif: 'thirsty', froid: 'cold', chaud: 'hot', peur: 'scared', sommeil: 'sleepy', raison: 'right' }[m[1]]}.`],
			[/^j'ai besoin d(?:e |')(.+)$/, (m) => np('I', m[1], (r) => `need ${someOrA(r)}.`, 'fr')],
			[/^je voudrais (.+)$/, (m) => np('I', m[1], (r) => `would like ${r.text}.`, 'fr')],
			[/^(je (?:ne )?veux|j'ai|je n'ai)(?: pas)? (.+)$/, (m, raw) => np('I', m[2], (r) => `${/ne |n'ai/.test(m[1]) ? 'do not ' : ''}${/veux/.test(m[1]) ? 'want' : 'have'} ${r.text.replace(/^(?:some )?/, /ne |n'ai/.test(m[1]) && !r.plural ? 'a ' : '')}.`, 'fr')],
			[/^(?:j'aime|j'adore|je n'aime pas) (.+)$/, (m, raw) => np('I', m[1], (r) => `${/n'aime pas/.test(strip(raw)) ? 'do not like' : /adore/.test(strip(raw)) ? 'love' : 'like'} ${r.text.replace(/^the /, '')}.`, 'fr')],
			[/^(je|tu|il|elle|nous|vous|ils|elles) (?:ne )?(suis|es|est|sommes|etes|sont)(?: pas)? (tres )?([a-z]+)$/, (m, raw) => be('fr', m, /\bne\b|n'/.test(strip(raw)))],
			[/^(.+?) (?:n')?(est|sont)( pas)? (tres )?([a-z]+)$/, (m) => np('', m[1], (r) => `${r.text} ${r.plural || m[2] === 'sont' ? 'are' : 'is'}${m[3] ? ' not' : ''} ${m[4] ? 'very ' : ''}${adjective(m[5], 'fr')}.`, 'fr', true)],
		],
	};

	function np(head, text, tail, lang, capital) {
		const r = backNP(lang, text);
		if (!r || r.unknown.length) return null;
		const out = `${head ? head + ' ' : ''}${tail(r)}`;
		return capital ? cap1(out) : out;
	}

	/** A Spanish or French adjective in English, preferring an English adjective among its meanings. */
	function adjective(word, lang) {
		const a = toEnglish(word, lang);
		if (!a) return word;
		return a.en.find((x) => englishForms(x).some((f) => f.pos === 'adjective')) || a.en[0];
	}

	/** "Estoy cansado", "je suis fatiguée", "es alto" in English. */
	function be(lang, m, negFr) {
		if (lang === 'es') {
			const verb = m[2];
			const person = { estoy: 0, soy: 0, eres: 1, estas: 1, es: 2, esta: 2, somos: 3, estamos: 3, son: 5, estan: 5 }[verb];
			const a = toEnglish(m[4], 'es');
			if (!a) return null;
			const adj = a.en.find((x) => englishForms(x).some((f) => f.pos === 'adjective')) || a.en[0];
			return `${cap1(EN_SUBJ[person] === 'he' ? 'he' : EN_SUBJ[person])} ${EN_BE[person]}${m[1] ? ' not' : ''} ${m[3] ? 'very ' : ''}${adj}.`;
		}
		const person = FR_PERSON[m[1]];
		const a = toEnglish(m[4], 'fr');
		if (!a) return null;
		const adj = a.en.find((x) => englishForms(x).some((f) => f.pos === 'adjective')) || a.en[0];
		const subj = m[1] === 'elle' ? 'she' : m[1] === 'elles' ? 'they' : EN_SUBJ[person];
		return `${cap1(subj)} ${EN_BE[person]}${negFr ? ' not' : ''} ${m[3] ? 'very ' : ''}${adj}.`;
	}

	/** A simple Spanish or French sentence in English, from its subject, verb and object; null if it isn't one. */
	function backClause(lang, t, raw) {
		const words = t.split(' ');
		let person = null;
		let negative = false;
		let i = 0;
		const table = lang === 'es' ? ES_PERSON : FR_PERSON;
		let fem = false;
		if (table[words[0]] !== undefined) {
			person = table[words[0]];
			fem = /^(?:ella|ellas|elle|elles)$/.test(words[0]);
			i = 1;
		} else if (lang === 'fr' && /^j'/.test(words[0])) {
			person = 0;
			words[0] = words[0].slice(2);
		}
		if (words[i] === 'no' || words[i] === 'ne' || /^n'/.test(words[i] || '')) {
			negative = true;
			if (/^n'/.test(words[i])) words[i] = words[i].slice(2);
			else i++;
		}
		let v = words[i] && readVerb(lang, words[i]);
		let subjectNP = null;
		// A noun for a subject: "mi hermano juega al fútbol", "les enfants jouent au football".
		if (person === null && !negative && (!v || i === 0)) {
			for (let k = 1; k <= 4 && k < words.length; k++) {
				const neg = words[k] === 'no' || words[k] === 'ne' || /^n'/.test(words[k]);
				const at = neg ? k + 1 : k;
				const form = neg && /^n'/.test(words[k]) ? words[k].slice(2) : words[at];
				const vv = form && readVerb(lang, form);
				if (!vv || (vv.person !== 2 && vv.person !== 5)) continue;
				const s = backNP(lang, words.slice(0, k).join(' '));
				if (!s || s.unknown.length || s.plural !== (vv.person === 5)) continue;
				subjectNP = s;
				v = vv;
				person = vv.person;
				negative = neg;
				i = neg && !/^n'/.test(words[k]) ? at : k;
				break;
			}
		}
		if (!v || (person !== null && v.person !== person && !(person === 2 && v.person === 2))) return null;
		if (person === null) {
			if (lang === 'fr') return null;
			person = v.person;
		}
		let rest = words.slice(i + 1);
		if (lang === 'fr' && rest[0] === 'pas') {
			negative = true;
			rest = rest.slice(1);
		}
		let en = v.en || (toEnglish(v.inf, lang) || { en: [] }).en[0];
		if (!en) return null;
		let obj = '';
		if (rest.length) {
			const r = backNP(lang, rest.join(' '));
			if (!r || r.unknown.length) return null;
			obj = ' ' + r.text.replace(/^some /, r.plural ? '' : 'some ');
			// "Hablo francés" is "I speak French"; "juega al fútbol" is "plays football".
			if (/^(?: the)? (?:english|spanish|french|german|italian|portuguese|chinese|japanese|arabic|russian)$/i.test(obj) && /^(?:talk|speak)$/.test(en)) {
				en = 'speak';
				obj = ' ' + cap1(obj.trim().replace(/^the /, ''));
			}
			if (en === 'play') obj = obj.replace(/^ the /, ' ');
		}
		if (subjectNP) return `${cap1(subjectNP.text)} ${englishVerb(en, person, negative)}${obj}.`;
		const subj = person === 2 ? (fem ? 'she' : 'he') : person === 5 ? 'they' : EN_SUBJ[person];
		const question = /\?\s*$/.test(raw) || /^¿/.test(raw.trim());
		if (question) return `${person === 2 ? 'Does' : 'Do'} ${subj} ${negative ? 'not ' : ''}${en}${obj}?`;
		return `${cap1(subj)} ${englishVerb(en, person, negative)}${obj}.`;
	}

	/* ---------- Word by word, when nothing else fits ---------- */

	const EN_SMALL = { es: { the: ['el', 'la'], a: ['un', 'una'], and: 'y', or: 'o', but: 'pero', with: 'con', without: 'sin', for: 'para', to: 'a', of: 'de', in: 'en', on: 'en', at: 'en', from: 'de', is: 'es', are: 'son', am: 'soy', i: 'yo', you: 'tú', he: 'él', she: 'ella', we: 'nosotros', they: 'ellos', it: 'eso', not: 'no', very: 'muy', and_: 'y' }, fr: { the: ['le', 'la'], a: ['un', 'une'], and: 'et', or: 'ou', but: 'mais', with: 'avec', without: 'sans', for: 'pour', to: 'à', of: 'de', in: 'dans', on: 'sur', at: 'à', from: 'de', is: 'est', are: 'sont', am: 'suis', i: 'je', you: 'tu', he: 'il', she: 'elle', we: 'nous', they: 'ils', it: 'ça', not: 'pas', very: 'très' } };
	const SMALL_BACK = { es: { y: 'and', o: 'or', pero: 'but', con: 'with', sin: 'without', para: 'for', por: 'for', a: 'to', de: 'of', en: 'in', que: 'that', muy: 'very', no: 'not', el: 'the', la: 'the', los: 'the', las: 'the', un: 'a', una: 'a', es: 'is', son: 'are', yo: 'I', tu: 'you', ella: 'she', nosotros: 'we', ellos: 'they', al: 'to the', del: 'of the', mi: 'my', su: 'his/her' }, fr: { et: 'and', ou: 'or', mais: 'but', avec: 'with', sans: 'without', pour: 'for', a: 'to', de: 'of', dans: 'in', sur: 'on', que: 'that', tres: 'very', pas: 'not', ne: '', le: 'the', la: 'the', les: 'the', un: 'a', une: 'a', des: 'some', du: 'some', est: 'is', sont: 'are', je: 'I', tu: 'you', il: 'he', elle: 'she', nous: 'we', vous: 'you', ils: 'they', au: 'to the', aux: 'to the', mon: 'my', ma: 'my', son: 'his/her', sa: 'his/her' } };

	function wordByWord(text, from, to) {
		const words = norm(text, from).split(' ').filter(Boolean);
		const out = [];
		const unknown = [];
		for (const w of words) {
			if (from === 'en') {
				const small = EN_SMALL[to][w];
				if (small) {
					out.push(Array.isArray(small) ? small[0] : small);
					continue;
				}
				const f = englishForms(w)[0];
				const t = f && toForeign(f.base, to, f.pos);
				if (t) out.push(f.pos === 'noun' && f.label === 'plural' && !t.plural ? pluralOf(to, t.word) : t.word);
				else {
					out.push(w);
					unknown.push(w);
				}
			} else if (to === 'en' || from !== 'en') {
				const small = SMALL_BACK[from][w];
				if (small !== undefined) {
					if (small) out.push(small);
					continue;
				}
				const e = toEnglish(w, from);
				const target = to === 'en' ? e && e.en[0] : e && (toForeign(e.en[0], to) || {}).word;
				if (target) out.push(target);
				else {
					out.push(w);
					unknown.push(w);
				}
			}
		}
		return { text: out.join(' '), unknown };
	}

	/* ---------- Translating a piece of text ---------- */

	/**
	 * Translates `text` from one language to another: { text, how, unknown, guessed } where how is "phrasebook",
	 * "grammar" (a sentence pattern) or "words" (word by word, rough). From Spanish to French, through English.
	 */
	function text(input, from, to) {
		const raw = String(input).trim();
		if (!raw || from === to) return null;
		const key = norm(raw, from);
		const row = BOOK[from].get(key) || BOOK[from].get(key.replace(/ please$/, ''));
		if (row) {
			const said = row[to];
			const please = !BOOK[from].get(key) && / please$/.test(key) ? { en: ', please', es: ', por favor', fr: ", s'il vous plaît" }[to] : '';
			return { text: please ? said.replace(/([?!.]?)$/, please + '$1') : said, how: 'phrasebook', unknown: [] };
		}
		if (from === 'en') {
			const tryPatterns = (k) => {
				for (const [re, make] of EN_PATTERNS) {
					const m = k.match(re);
					if (!m) continue;
					const r = make(m, to, raw);
					if (r && r.text && !(r.unknown && r.unknown.length)) return r;
				}
				return null;
			};
			let r = tryPatterns(key);
			// A sentence that ends with where or with whom: translate the rest, then the place ("in the garden").
			const pp = !r && key.match(PP);
			if (pp) {
				const main = tryPatterns(pp[1]);
				const place = main && translatePP(pp[2], pp[3], to);
				if (main && place) r = { text: main.text.replace(/(\s?[?.])$/, ` ${place.text}$1`), guessed: main.guessed || place.guessed };
			}
			if (r) return { text: r.text, how: 'grammar', unknown: [], guessed: !!r.guessed };
			const w = wordByWord(raw, 'en', to);
			return { text: w.text, how: 'words', unknown: w.unknown };
		}
		if (to === 'en') {
			for (const [re, make] of BACK_PATTERNS[from]) {
				const m = key.match(re);
				if (!m) continue;
				const r = make(m, raw);
				if (r) return { text: r, how: 'grammar', unknown: [] };
			}
			const c = backClause(from, key, raw);
			if (c) return { text: c, how: 'grammar', unknown: [] };
			// Just a noun phrase: "el perro negro", "les chats noirs".
			const n = backNP(from, key);
			if (n && !n.unknown.length && key.split(' ').length > 1) return { text: n.text, how: 'grammar', unknown: [] };
			const w = wordByWord(raw, from, 'en');
			return { text: cap1(w.text), how: 'words', unknown: w.unknown };
		}
		// Spanish <-> French goes through English.
		const en = text(raw, from, 'en');
		if (!en) return null;
		const out = text(en.text, 'en', to);
		return out && { text: out.text, how: en.how === 'words' || out.how === 'words' ? 'words' : out.how === 'phrasebook' && en.how === 'phrasebook' ? 'phrasebook' : 'grammar', unknown: [...en.unknown, ...out.unknown], via: en.text };
	}

	/** One word, either way: { said, word, gender, src, en } (see toForeign and toEnglish). */
	function word(w, from, to) {
		if (from === 'en') {
			const forms = englishForms(w);
			const base = forms.length ? forms[0].base : w;
			return toForeign(base, to, forms.length ? forms[0].pos : null) || toForeign(w, to);
		}
		const e = toEnglish(w, from);
		if (!e) return null;
		if (to === 'en') return e;
		return toForeign(e.en[0], to);
	}

	/** How many English words each large list covers, and where it comes from. */
	function coverage() {
		const out = {};
		for (const lang of ['es', 'fr']) {
			const b = lists(lang);
			out[lang] = b ? { words: b.from.size, back: b.to.size, source: b.source } : null;
		}
		return out;
	}

	Omni.onyxTranslate = { text, word, toForeign, toEnglish, conjugate, agree, pluralOf, guessGender, parseNP, renderNP, coverage, PHRASES: ROWS };
})(typeof window !== 'undefined' ? window : globalThis);
