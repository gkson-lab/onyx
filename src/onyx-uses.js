// More things Onyx 3 can be used for, each a small tool of its own with no state, so they can be tested alone:
//
//   Omni.onyxUses.convert('how many cups in a liter')      ->  { text: '1 liter = **4.22675 US cups**.', value }
//   Omni.onyxUses.dates('how many days until christmas')   ->  { text: 'Christmas is in **44 days**: Friday, December 25, 2026.' }
//   Omni.onyxUses.series('sum of the numbers from 1 to 100')  ->  { text: '... = **5,050**', value: 5050 }
//   Omni.onyxUses.document(text)                           ->  { words, sentences, minutes, keywords, find(), count(), ... }
//   Omni.onyxUses.quiz.start('quiz me on German')          ->  { kind: 'vocab', lang: 'de', total: 5 }
//
// The quiz writes its questions here and leaves the keeping of the score to onyx.js.
(function (root) {
	'use strict';

	const Omni = (root.Omni = root.Omni || {});
	const fmt = (x, digits = 6) => {
		if (!Number.isFinite(x)) return String(x);
		if (x !== 0 && (Math.abs(x) >= 1e15 || Math.abs(x) < 1e-6)) return x.toExponential(digits - 1).replace(/\.?0+e/, 'e').replace('e+', ' × 10^').replace('e-', ' × 10^-');
		return Number(x.toPrecision(digits)).toLocaleString('en-US', { maximumFractionDigits: 10 });
	};
	const NUM = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, thirty: 30, fifty: 50, hundred: 100, 'a hundred': 100, thousand: 1000, 'a thousand': 1000, half: 0.5, 'half a': 0.5, 'a half': 0.5, 'a quarter': 0.25, 'a dozen': 12, 'a million': 1e6 };
	const NUMBER = '(-?\\d[\\d,]*(?:\\.\\d+)?|-?\\.\\d+|half an?|a half|a quarter|a dozen|a hundred|a thousand|a million|an?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|fifty|hundred|thousand)';
	const number = (s) => {
		const t = String(s).toLowerCase().trim();
		if (/^half an?$/.test(t)) return 0.5;
		return t in NUM ? NUM[t] : Number(t.replace(/,/g, ''));
	};

	/* ---------- Units ---------- */

	// kind: { unit: [size in the kind's base unit, plural, ...other names] }. US measures for the kitchen ones.
	const UNITS = {
		length: { meter: [1, 'meters', 'm', 'metre', 'metres'], kilometer: [1000, 'kilometers', 'km', 'kms', 'kilometre', 'kilometres', 'klicks'], centimeter: [0.01, 'centimeters', 'cm', 'centimetre', 'centimetres'], millimeter: [0.001, 'millimeters', 'mm', 'millimetre', 'millimetres'], micrometer: [1e-6, 'micrometers', 'micron', 'microns', 'µm'], nanometer: [1e-9, 'nanometers', 'nm'], mile: [1609.344, 'miles', 'mi'], yard: [0.9144, 'yards', 'yd', 'yds'], foot: [0.3048, 'feet', 'ft'], inch: [0.0254, 'inches', 'in', '"'], 'nautical mile': [1852, 'nautical miles', 'nmi'], 'light year': [9.4607304725808e15, 'light years', 'light-year', 'light-years', 'ly'] },
		mass: { kilogram: [1, 'kilograms', 'kg', 'kgs', 'kilo', 'kilos'], gram: [0.001, 'grams', 'g', 'gramme', 'grammes'], milligram: [1e-6, 'milligrams', 'mg'], tonne: [1000, 'tonnes', 'metric ton', 'metric tons', 't'], pound: [0.45359237, 'pounds', 'lb', 'lbs'], ounce: [0.028349523125, 'ounces', 'oz'], stone: [6.35029318, 'stone', 'stones', 'st'], 'US ton': [907.18474, 'US tons', 'ton', 'tons', 'short ton', 'short tons'] },
		volume: { liter: [1, 'liters', 'l', 'litre', 'litres'], milliliter: [0.001, 'milliliters', 'ml', 'millilitre', 'millilitres'], 'cubic meter': [1000, 'cubic meters', 'm3', 'm³', 'cubic metre', 'cubic metres'], 'US gallon': [3.785411784, 'US gallons', 'gallon', 'gallons', 'gal'], 'US quart': [0.946352946, 'US quarts', 'quart', 'quarts', 'qt'], 'US pint': [0.473176473, 'US pints', 'pint', 'pints', 'pt'], 'US cup': [0.2365882365, 'US cups', 'cup', 'cups'], 'US fluid ounce': [0.0295735295625, 'US fluid ounces', 'fluid ounce', 'fluid ounces', 'fl oz', 'floz'], tablespoon: [0.01478676478125, 'tablespoons', 'tbsp', 'tbs'], teaspoon: [0.00492892159375, 'teaspoons', 'tsp'] },
		area: { 'square meter': [1, 'square meters', 'm2', 'm²', 'sq m', 'square metre', 'square metres'], 'square kilometer': [1e6, 'square kilometers', 'km2', 'km²', 'sq km', 'square kilometres'], hectare: [1e4, 'hectares', 'ha'], acre: [4046.8564224, 'acres'], 'square foot': [0.09290304, 'square feet', 'sq ft', 'sqft', 'ft2', 'ft²'], 'square inch': [0.00064516, 'square inches', 'sq in'], 'square yard': [0.83612736, 'square yards', 'sq yd'], 'square mile': [2589988.110336, 'square miles', 'sq mi'] },
		speed: { 'meter per second': [1, 'meters per second', 'm/s', 'mps'], 'kilometer per hour': [1 / 3.6, 'kilometers per hour', 'km/h', 'kph', 'kmh', 'kmph'], 'mile per hour': [0.44704, 'miles per hour', 'mph'], knot: [1852 / 3600, 'knots', 'kn', 'kt'], 'foot per second': [0.3048, 'feet per second', 'ft/s', 'fps'] },
		time: { second: [1, 'seconds', 's', 'sec', 'secs'], millisecond: [0.001, 'milliseconds', 'ms'], minute: [60, 'minutes', 'min', 'mins'], hour: [3600, 'hours', 'h', 'hr', 'hrs'], day: [86400, 'days', 'd'], week: [604800, 'weeks', 'wk', 'wks'], fortnight: [1209600, 'fortnights'], month: [2629800, 'months'], year: [31557600, 'years', 'yr', 'yrs'], decade: [315576000, 'decades'], century: [3155760000, 'centuries'] },
		data: { byte: [1, 'bytes', 'b'], bit: [0.125, 'bits'], kilobyte: [1e3, 'kilobytes', 'kb'], megabyte: [1e6, 'megabytes', 'mb', 'megs'], gigabyte: [1e9, 'gigabytes', 'gb', 'gigs'], terabyte: [1e12, 'terabytes', 'tb'], kibibyte: [1024, 'kibibytes', 'kib'], mebibyte: [1048576, 'mebibytes', 'mib'], gibibyte: [1073741824, 'gibibytes', 'gib'] },
		energy: { joule: [1, 'joules', 'j'], kilojoule: [1000, 'kilojoules', 'kj'], calorie: [4.184, 'calories', 'cal'], kilocalorie: [4184, 'kilocalories', 'kcal', 'food calories'], 'kilowatt hour': [3.6e6, 'kilowatt hours', 'kwh', 'kilowatt-hour', 'kilowatt-hours'] },
		temperature: { 'degree Celsius': [1, 'degrees Celsius', 'c', '°c', 'celsius', 'centigrade', 'degrees c'], 'degree Fahrenheit': [1, 'degrees Fahrenheit', 'f', '°f', 'fahrenheit', 'degrees f'], kelvin: [1, 'kelvin', 'k', 'kelvins'] },
	};
	const UNIT_OF = new Map();
	for (const [kind, table] of Object.entries(UNITS)) for (const [name, [size, plural, ...more]] of Object.entries(table)) for (const alias of [name, plural, ...more]) if (!UNIT_OF.has(alias.toLowerCase())) UNIT_OF.set(alias.toLowerCase(), { kind, name, plural, size });
	const UNIT = `(${[...UNIT_OF.keys()].sort((a, b) => b.length - a.length).map((u) => u.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|')})`;
	const unit = (s) => UNIT_OF.get(String(s).toLowerCase().replace(/\s+/g, ' ').trim());
	const toKelvin = { 'degree Celsius': (x) => x + 273.15, 'degree Fahrenheit': (x) => ((x - 32) * 5) / 9 + 273.15, kelvin: (x) => x };
	const fromKelvin = { 'degree Celsius': (k) => k - 273.15, 'degree Fahrenheit': (k) => ((k - 273.15) * 9) / 5 + 32, kelvin: (k) => k };
	const CONVERT = [
		new RegExp(`^(?:please )?(?:convert|change|turn|what(?:'s| is| are)|how much (?:is|are)|how many \\w+(?: \\w+)? (?:is|are|in))?\\s*${NUMBER}\\s*${UNIT}\\s+(?:to|in|into|as|equals? how many)\\s+${UNIT}[?.!]*$`, 'i'),
		new RegExp(`^how many ${UNIT} (?:are |is )?(?:there )?(?:in|to|make(?: up)?|per) ${NUMBER}\\s*${UNIT}[?.!]*$`, 'i'),
	];

	/** A unit conversion asked in words: { text, value, unit } or null. Units of different kinds get an explanation. */
	function convert(text) {
		const t = String(text).trim().replace(/[’]/g, "'");
		let m = t.match(CONVERT[0]);
		let n;
		let from;
		let to;
		if (m) [n, from, to] = [number(m[1]), unit(m[2]), unit(m[3])];
		else if ((m = t.match(CONVERT[1]))) [n, from, to] = [number(m[2]), unit(m[3]), unit(m[1])];
		if (!m || !from || !to || !Number.isFinite(n)) return null;
		// "in" is inches only where a length is wanted: "5 km in miles" has no inches in it.
		if (from.kind !== to.kind) return { text: `I can't turn ${from.plural} into ${to.plural}: one measures ${from.kind} and the other ${to.kind}.`, mismatch: true };
		const value = from.kind === 'temperature' ? fromKelvin[to.name](toKelvin[from.name](n)) : (n * from.size) / to.size;
		const name = (u, x) => (Math.abs(x) === 1 ? u.name : u.plural);
		return { text: `${fmt(n)} ${name(from, n)} = **${fmt(value)} ${name(to, value)}**.`, value, unit: to.name };
	}

	/* ---------- Sums of runs of numbers ---------- */

	/** "The sum of the numbers from 1 to 100", "the product of 1 to 6", "add up the odd numbers up to 99": { text, value } or null. */
	function series(text) {
		const t = String(text).toLowerCase().replace(/[?.!]+$/, '').replace(/,(?=\d{3}\b)/g, '').trim();
		const m = t.match(/^(?:what(?:'s| is) |find |calculate |compute |work out )?(?:the )?(sum|total|product|average|mean)(?: of)?(?: all)?(?: the)?\s*(even |odd )?(?:whole |natural |counting )?(?:numbers?|integers?)?\s*(?:from |between )?(-?\d+) (?:to|through|and|up to|until) (-?\d+)(?: inclusive)?$/) || t.match(/^(?:what(?:'s| is) |find )?(?:the )?(sum|total|product|average|mean) of (?:the )?first (\d+) ()?(?:even |odd )?(?:whole |natural |counting |positive )?(?:numbers?|integers?)$/) || t.match(/^(add|multiply)(?: up)?(?: all)?(?: the)?\s*(even |odd )?(?:whole |natural )?(?:numbers?|integers?)\s*(?:from |between )?(-?\d+) (?:to|through|and|up to|until) (-?\d+)(?: together)?$/);
		if (!m) return null;
		const what = { total: 'sum', mean: 'average', add: 'sum', multiply: 'product' }[m[1]] || m[1];
		const first = /first/.test(t) && m[3] === '' || (m.length === 4 && /first/.test(t));
		let a = first ? 1 : +m[3];
		let b = first ? +m[2] : +m[4];
		const parity = first ? ((t.match(/first \d+ (even|odd)/) || [])[1] || '') : (m[2] || '').trim();
		if (first && parity) {
			// The first n even numbers are 2, 4 ... 2n; the first n odd ones are 1, 3 ... 2n - 1.
			[a, b] = parity === 'even' ? [2, 2 * b] : [1, 2 * b - 1];
		}
		if (!(a <= b) || b - a > 1e7) return null;
		if (parity) {
			if ((Math.abs(a) % 2 === 0) !== (parity === 'even')) a++;
			if ((Math.abs(b) % 2 === 0) !== (parity === 'even')) b--;
			if (a > b) return { text: `There are no ${parity} numbers in that range.`, value: 0 };
		}
		const step = parity ? 2 : 1;
		const count = (b - a) / step + 1;
		const shown = count <= 6 ? Array.from({ length: count }, (_, i) => a + i * step).join(what === 'product' ? ' × ' : ' + ') : `${a} ${what === 'product' ? '×' : '+'} ${a + step} ${what === 'product' ? '×' : '+'} … ${what === 'product' ? '×' : '+'} ${b}`;
		if (what === 'product') {
			if (count > 170) return { text: 'That product is too large for me to write out.', value: Infinity };
			let p = 1;
			for (let i = a; i <= b; i += step) p *= i;
			return { text: `${shown} = **${fmt(p, 15)}**${p > Number.MAX_SAFE_INTEGER ? ' (rounded)' : ''}`, value: p };
		}
		const sum = ((a + b) * count) / 2;
		if (what === 'average') return { text: `The ${count} numbers from ${a} to ${b}${parity ? `, ${parity} ones only,` : ''} average **${fmt(sum / count, 12)}**: evenly spaced numbers average to the middle of the first and last.`, value: sum / count };
		return { text: `${shown} = **${fmt(sum, 15)}**${count > 6 ? ` (${fmt(count)} numbers; first plus last, times how many, halved)` : ''}`, value: sum };
	}

	/* ---------- Dates ---------- */

	const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
	const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
	const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const HOLIDAYS = { christmas: [12, 25, 'Christmas'], 'christmas day': [12, 25, 'Christmas'], xmas: [12, 25, 'Christmas'], 'christmas eve': [12, 24, 'Christmas Eve'], "new year's day": [1, 1, "New Year's Day"], 'new years day': [1, 1, "New Year's Day"], 'new year': [1, 1, "New Year's Day"], "new year's": [1, 1, "New Year's Day"], 'new years': [1, 1, "New Year's Day"], "new year's eve": [12, 31, "New Year's Eve"], 'new years eve': [12, 31, "New Year's Eve"], halloween: [10, 31, 'Halloween'], "valentine's day": [2, 14, "Valentine's Day"], 'valentines day': [2, 14, "Valentine's Day"], "valentine's": [2, 14, "Valentine's Day"], "st patrick's day": [3, 17, "St Patrick's Day"], 'st patricks day': [3, 17, "St Patrick's Day"], 'pi day': [3, 14, 'Pi Day'], 'earth day': [4, 22, 'Earth Day'], "april fools' day": [4, 1, "April Fools' Day"], 'april fools': [4, 1, "April Fools' Day"], 'the end of the year': [12, 31, 'The end of the year'] };
	const day = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
	const valid = (y, m, d) => {
		const x = day(y, m, d);
		return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d ? x : null;
	};
	const today = (now) => day(now.getFullYear(), now.getMonth() + 1, now.getDate());
	const long = (d) => `${DAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()][0].toUpperCase()}${MONTHS[d.getUTCMonth()].slice(1)} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
	const between = (a, b) => Math.round((b - a) / 86400000);
	const plural = (n, word) => `${fmt(Math.abs(n))} ${word}${Math.abs(n) === 1 ? '' : 's'}`;

	/**
	 * Reads a date: { date, name?, yearGiven }. With no year, a date that has passed this year means next year's when
	 * `forward` is set ("days until March 5"). Null if it isn't one.
	 */
	function readDate(s, now, forward) {
		const t = String(s).toLowerCase().replace(/[?.!]+$/, '').replace(/[’]/g, "'").replace(/^(?:the |on )+/, '').trim();
		const base = today(now);
		const Y = base.getUTCFullYear();
		const rolling = (m, d, name) => {
			let x = valid(Y, m, d);
			if (!x) return null;
			if (forward && x < base) x = valid(Y + 1, m, d) || x;
			return { date: x, name, yearGiven: false };
		};
		if (t === 'today' || t === 'now') return { date: base, name: 'today', yearGiven: true };
		if (t === 'tomorrow') return { date: new Date(+base + 86400000), name: 'tomorrow', yearGiven: true };
		if (t === 'yesterday') return { date: new Date(+base - 86400000), name: 'yesterday', yearGiven: true };
		const h = t.match(/^(.+?)(?: (\d{4}))?$/);
		if (h && HOLIDAYS[h[1]]) {
			const [m, d, name] = HOLIDAYS[h[1]];
			return h[2] ? { date: valid(+h[2], m, d), name, yearGiven: true } : rolling(m, d, name);
		}
		let m;
		if ((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return valid(+m[1], +m[2], +m[3]) && { date: valid(+m[1], +m[2], +m[3]), yearGiven: true };
		const mon = (x) => MONTHS.findIndex((n) => n.startsWith(x.slice(0, 3))) + 1;
		if ((m = t.match(new RegExp(`^${MONTH}\\.? (\\d{1,2})(?:st|nd|rd|th)?(?:,? (\\d{4}))?$`))) || ((m = t.match(new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?(?: of)? ${MONTH}\\.?(?:,? (\\d{4}))?$`))) && (m = [m[0], m[2], m[1], m[3]]))) {
			if (m[3]) return valid(+m[3], mon(m[1]), +m[2]) && { date: valid(+m[3], mon(m[1]), +m[2]), yearGiven: true };
			return rolling(mon(m[1]), +m[2]);
		}
		if ((m = t.match(/^(\d{4})$/)) && +m[1] > 1000) return { date: day(+m[1], 1, 1), name: `the start of ${m[1]}`, yearGiven: true };
		return null;
	}

	/** Questions about dates: days until or since, between two dates, the weekday of a date, a date some days away, leap years, ages. */
	function dates(text, now = new Date()) {
		const t = String(text).trim().replace(/[’]/g, "'").replace(/[?.!]+$/, '');
		const base = today(now);
		let m;
		if ((m = t.match(/^(?:how (?:many|long)|number of) (days|weeks|months|sleeps)?\s*(?:are there |is it |do we have |are left |left )?(?:until|till|til|to|before|'til) (.+)$/i))) {
			const d = readDate(m[2].replace(/^it(?:'s| is) /i, ''), now, true);
			if (!d || !d.date) return null;
			const n = between(base, d.date);
			const name = d.name ? `${d.name[0].toUpperCase()}${d.name.slice(1)}` : long(d.date);
			if (n === 0) return { text: `That's today: ${long(d.date)}.`, value: 0 };
			if (n < 0) return { text: `${name} was **${plural(n, 'day')} ago**${d.name ? `: ${long(d.date)}` : ''}.`, value: n };
			const unit = /week/i.test(m[1] || '') ? `${fmt(Math.floor(n / 7))} week${Math.floor(n / 7) === 1 ? '' : 's'}${n % 7 ? ` and ${plural(n % 7, 'day')}` : ''}` : /month/i.test(m[1] || '') ? `about ${fmt(n / 30.4375, 2)} months (${plural(n, 'day')})` : plural(n, /sleeps/i.test(m[1] || '') ? 'sleep' : 'day');
			return { text: `${name} is in **${unit}**${d.name ? `: ${long(d.date)}` : ''}.`, value: n };
		}
		if ((m = t.match(/^how (?:many|long) (days|weeks|months|years)?\s*(?:has it been |have passed |is it |ago was |)?since (.+)$/i))) {
			const d = readDate(m[2], now, false);
			if (!d || !d.date) return null;
			const n = between(d.date, base);
			if (n < 0) return { text: `That hasn't happened yet: ${long(d.date)} is in ${plural(n, 'day')}.`, value: n };
			const years = /year/i.test(m[1] || '') ? ` (about ${fmt(n / 365.25, 3)} years)` : /week/i.test(m[1] || '') ? ` (${fmt(Math.floor(n / 7))} weeks${n % 7 ? ` and ${plural(n % 7, 'day')}` : ''})` : '';
			return { text: `It has been **${plural(n, 'day')}**${years} since ${long(d.date)}.`, value: n };
		}
		if ((m = t.match(/^how many (days|weeks) (?:are there |is it )?(?:between|from) (.+?) (?:and|to|until) (.+)$/i))) {
			const a = readDate(m[2], now, false);
			const b = readDate(m[3], now, false);
			if (!a || !b || !a.date || !b.date) return null;
			const n = Math.abs(between(a.date, b.date));
			return { text: `From ${long(a.date)} to ${long(b.date)} is **${plural(n, 'day')}**${n >= 14 ? ` (${fmt(Math.floor(n / 7))} weeks${n % 7 ? ` and ${plural(n % 7, 'day')}` : ''})` : ''}.`, value: n };
		}
		if ((m = t.match(/^(?:what|which) day(?: of the week)? (is|was|will|does|did)(?: be)? (.+?)(?: fall on| be| land on)?$/i)) && !/^(?:it|today|this|that)$/i.test(m[2].trim())) {
			const d = readDate(m[2], now, /will|does/i.test(m[1]));
			if (!d || !d.date) return null;
			const tense = d.date < base ? 'was' : d.date > base ? 'will be' : 'is';
			return { text: `${d.name ? `${d.name[0].toUpperCase()}${d.name.slice(1)}, ` : ''}${long(d.date).replace(/^\w+, /, '')} ${tense} a **${DAYS[d.date.getUTCDay()]}**.`, value: DAYS[d.date.getUTCDay()] };
		}
		if ((m = t.match(new RegExp(`^(?:what(?:'s| is| will be| was) the date |what date (?:is|will it be|was it) |when is )?(?:in )?${NUMBER} (day|week|month|year)s? (from now|from today|ago|later|time|before today)$`, 'i'))) || (m = t.match(new RegExp(`^(?:what(?:'s| is| will be) the date|what date (?:is|will it be)|when is) in ${NUMBER} (day|week|month|year)s?()$`, 'i')))) {
			const n = number(m[1]) * (/ago|before/.test(m[3]) ? -1 : 1);
			if (!Number.isFinite(n) || Math.abs(n) > 100000) return null;
			const d = new Date(+base);
			if (/day/i.test(m[2])) d.setUTCDate(d.getUTCDate() + n);
			else if (/week/i.test(m[2])) d.setUTCDate(d.getUTCDate() + 7 * n);
			else if (/month/i.test(m[2])) d.setUTCMonth(d.getUTCMonth() + n);
			else d.setUTCFullYear(d.getUTCFullYear() + n);
			return { text: `${plural(n, m[2].toLowerCase())} ${n < 0 ? 'ago was' : 'from today is'} **${long(d)}**.`, value: d.toISOString().slice(0, 10) };
		}
		if ((m = t.match(/^(?:is|was|will) (\d{3,4})(?: be)? a leap year$/i))) {
			const y = +m[1];
			const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
			return { text: leap ? `Yes: ${y} is a leap year, with a February 29.` : `No: ${y} isn't a leap year. ${y % 100 === 0 ? 'Century years are leap years only when 400 divides them.' : `The next one after it is ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => y + i).find((x) => (x % 4 === 0 && x % 100 !== 0) || x % 400 === 0)}.`}`, value: leap };
		}
		if ((m = t.match(/^how old (?:is|am|are|would|will) (?:someone|a person|somebody|i|you|people|anyone)(?: be)?(?: who (?:was|were)| if (?:i|they|you) (?:was|were))? born (?:in|on) (.+?)(?: be)?$/i))) {
			const d = readDate(m[1], now, false);
			if (!d || !d.date || d.date > base) return null;
			const yearOnly = /^\d{4}$/.test(m[1].trim());
			let age = base.getUTCFullYear() - d.date.getUTCFullYear();
			if (!yearOnly && (base.getUTCMonth() < d.date.getUTCMonth() || (base.getUTCMonth() === d.date.getUTCMonth() && base.getUTCDate() < d.date.getUTCDate()))) age--;
			return { text: yearOnly ? `**${age - 1} or ${age}**: ${age} once this year's birthday has passed.` : `**${age}** years old, ${fmt(between(d.date, base))} days in all.`, value: age };
		}
		return null;
	}

	/* ---------- Reading a document ---------- */

	const STOP = new Set('a an the and or but if then else so than that this these those there here it its is are was were be been being am do does did done have has had having i you he she we they me him her us them my your his our their mine yours of in on at to from by for with about as into over under after before between through during without within up down out off again further not no nor only own same too very can will just should would could may might must shall also more most some such any each few other all both how what when where which who whom why one two said says say like get got make made much many new now even still back well way use used also however because while per via s t d ll re ve m'.split(' '));
	const wordsOf = (text) => String(text).toLowerCase().match(/[a-zà-ÿ][a-zà-ÿ'’-]*[a-zà-ÿ]|[a-zà-ÿ]/g) || [];
	const stemOf = (w) => w.replace(/[’']s$/, '').replace(/(?:ies)$/, 'y').replace(/(?:sses)$/, 'ss').replace(/([^aeiou]{2}|[aeiou][^aeiou])(?:es|s)$/, '$1').replace(/(.{4,})(?:ing|ed)$/, '$1');

	/**
	 * What a text is, measured: its words, sentences and paragraphs, how long it takes to read, its key words, and ways
	 * to look inside it. `name` is the file's name, if it came from one.
	 */
	function document(text, name) {
		const body = String(text).replace(/\r\n?/g, '\n').trim();
		const W = Omni.onyxWrite;
		const sentences = (W ? W.sentencesOf(body.replace(/\n+/g, ' ')) : body.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/)).map((s) => s.trim()).filter(Boolean);
		const words = wordsOf(body);
		const counts = new Map();
		const shown = new Map();
		for (const w of words) {
			if (w.length < 3 || STOP.has(w)) continue;
			const s = stemOf(w);
			counts.set(s, (counts.get(s) || 0) + 1);
			if (!shown.has(s) || w.length < shown.get(s).length) shown.set(s, w);
		}
		// Words written with a capital in the middle of a sentence are names: shown the way they were written.
		const names = new Map();
		for (const m of body.matchAll(/(?<![.!?]\s|^|\n)\b([A-Z][a-zà-ÿ]+(?:\s[A-Z][a-zà-ÿ]+)*)\b/g)) names.set(m[1].toLowerCase(), m[1]);
		const keywords = [...counts.entries()].filter(([, c]) => c >= (words.length > 150 ? 2 : 1)).sort((a, b) => b[1] * Math.min(8, b[0].length) - a[1] * Math.min(8, a[0].length)).slice(0, 8).map(([s, c]) => ({ word: names.get(shown.get(s)) || shown.get(s), count: c }));
		const has = (sentence, stems) => {
			const ws = new Set(wordsOf(sentence).map(stemOf));
			return stems.filter((s) => ws.has(s)).length;
		};
		const terms = (q) => wordsOf(q).filter((w) => !STOP.has(w)).map(stemOf);
		return {
			name: name || null, text: body, sentences, keywords,
			words: words.length, characters: body.length, paragraphs: body.split(/\n\s*\n/).filter((p) => p.trim()).length,
			// At 230 words a minute, an ordinary reading pace.
			minutes: Math.max(1, Math.round(words.length / 230)),
			/** The sentences that say most about `query`, best first: [{ sentence, at }]. */
			find(query, n = 3) {
				const stems = terms(query);
				if (!stems.length) return [];
				return sentences.map((sentence, at) => ({ sentence, at, score: has(sentence, stems) / stems.length })).filter((x) => x.score >= (stems.length > 2 ? 0.5 : 1)).sort((a, b) => b.score - a.score || a.at - b.at).slice(0, n).sort((a, b) => a.at - b.at);
			},
			/** How many times a word or phrase appears, whatever its ending or capitals. */
			count(query) {
				const q = String(query).toLowerCase().trim();
				if (/\s/.test(q)) return (body.toLowerCase().match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'g')) || []).length;
				const s = stemOf(q);
				return words.filter((w) => stemOf(w) === s).length;
			},
			summary: (n = 3) => (W ? W.summarize(body.replace(/\n+/g, ' '), n) : sentences.slice(0, n)),
		};
	}

	/* ---------- Quizzes ---------- */

	// Everyday words that every one of the dictionaries is likely to have, for vocabulary questions.
	const VOCAB = 'dog cat house water bread milk book sun moon tree flower friend school city car door window table chair hand head eye heart mother father brother sister child man woman day night year week morning winter summer rain snow fire sea river mountain bird fish horse apple egg cheese coffee tea salt sugar red blue green white black big small new old good bad hot cold happy sad love time name word street country king money music letter key bridge garden kitchen bed shoe shirt hat ear nose mouth foot arm leg tooth hair star sky wind cloud stone gold iron glass paper pen number game song door'.split(' ').filter((w, i, a) => a.indexOf(w) === i);
	// Words for the meanings quiz: common, with a definition that doesn't give the word away.
	const MEANINGS = 'ocean bridge candle compass harvest island lantern meadow orchard pebble quilt riddle saddle thunder umbrella valley whisper anchor blanket canyon desert echo feather glacier harbor journal kettle ladder mirror needle oasis pillow rainbow shadow tunnel village window blossom cradle dawn ember fountain garden horizon jungle kite library market nest orbit puzzle rocket statue telescope volcano'.split(' ');
	const START = /^(?:(?:can|could|will) you |please |let's (?:do|have|play|try) |lets (?:do|have|play|try) |i (?:want|would like|'d like) (?:to take |to do |to try )?|give me |start |do |play |make me )?(?:(?:an? |the |another )?(?:(.+?) )?(?:quiz|test)(?: me)?(?: (?:on|in|about|with) (.+?))?|(?:quiz|test) me(?: (?:on|in|about|with) (.+?))?|(?:quiz|test) my (.+?)|practi[cs]e (?:my )?(.+?)(?: with me)?)[.!?]*$/i;

	const quiz = {
		/** Reads a request for a quiz: { kind: 'vocab', lang } | { kind: 'math' } | { kind: 'words' } | { kind: null } (which one?), or null. */
		start(text) {
			const t = String(text).trim().replace(/[’]/g, "'");
			const m = t.match(START);
			if (!m) return null;
			let total = 5;
			// "I have a quiz tomorrow", "the test is on Friday": about a quiz, not a request for one.
			if (/\b(?:i|my|we|our|have|has|had|is|was|were|took|take|taking|failed|passed|got|there|tomorrow|today)\b/i.test(m[1] || '')) return null;
			if (/\btest\b/i.test(t) && !/\bquiz\b/i.test(t) && !/\btest (?:me|my)\b/i.test(t) && !/^(?:(?:can|could|will) you |please |let's |lets |give me |start )/i.test(t)) return null;
			const subject = [m[1], m[2], m[3], m[4], m[5]].filter(Boolean).join(' ').toLowerCase().replace(/\b(?:with )?(\d+)[- ]questions?\b/, (x, a) => ((total = Math.max(1, Math.min(20, +a))), '')).replace(/\b(?:quick|short|little|some|my|a|an|the|vocabulary|vocab|words?|skills?|with)\b/g, ' ').replace(/\s+/g, ' ').trim();
			const G = Omni.onyxTongues;
			if (/^(?:math|maths|mathematics|arithmetic|numbers|sums|multiplication|times tables?|addition|mental math)$/.test(subject)) return { kind: 'math', total, only: /multiplication|times/.test(subject) ? '×' : /addition|sums/.test(subject) ? '+' : null };
			if (/^(?:english|meanings?|definitions?|dictionary)$/.test(subject) || (subject === '' && /\b(?:vocabulary|vocab|word|meanings?|definitions?)\b/i.test(t))) return { kind: 'words', total };
			const lang = G && subject && G.codeOf(subject);
			if (lang && lang !== 'en') return { kind: 'vocab', lang, total };
			return subject ? { kind: null, unknown: subject, total } : { kind: null, total };
		},
		/** A math question: { ask, answers, show }. Harder as `level` (the number right so far) grows. */
		math(rand, level = 0, only = null) {
			const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
			const op = only || ['+', '−', '×', '÷', '%'][int(0, level >= 2 ? 4 : 3)];
			const size = 10 + level * 8;
			let a;
			let b;
			let v;
			if (op === '+') [a, b] = [int(3, size * 3), int(3, size * 3)], (v = a + b);
			else if (op === '−') (a = int(10, size * 3)), (b = int(2, a)), (v = a - b);
			else if (op === '×') [a, b] = [int(2, 9 + level), int(2, 12)], (v = a * b);
			else if (op === '÷') (b = int(2, 9 + level)), (v = int(2, 12)), (a = b * v);
			else (a = [10, 20, 25, 50, 5, 75][int(0, 5)]), (b = int(1, 12) * 20), (v = (a * b) / 100);
			return { ask: op === '%' ? `What is **${a}% of ${b}**?` : `What is **${a} ${op} ${b}**?`, answers: [String(v)], show: fmt(v), number: v };
		},
		/** A word-meaning question with three choices: { ask, answers, show }. */
		words(rand) {
			const D = Omni.onyxDictionary;
			if (!D) return null;
			const pool = MEANINGS.filter((w) => (D.lookup(w) || [])[0]);
			if (pool.length < 3) return null;
			const picks = [];
			while (picks.length < 3) {
				const w = pool[Math.floor(rand() * pool.length)];
				if (!picks.includes(w)) picks.push(w);
			}
			const right = picks[0];
			const order = picks.slice().sort(() => rand() - 0.5);
			const letter = 'ABC'[order.indexOf(right)];
			const def = D.lookup(right)[0].e.def;
			return { ask: `Which word means "${def}"?\n**A** ${order[0]}   **B** ${order[1]}   **C** ${order[2]}`, answers: [right, letter.toLowerCase()], show: `${letter}, **${right}**` };
		},
		/** A vocabulary question for a language whose dictionary is loaded: { ask, answers, show } or null. */
		vocab(rand, lang, asked = []) {
			const T = Omni.onyxTranslate;
			const G = Omni.onyxTongues;
			if (!T || !G) return null;
			const name = G.nameOf(lang);
			for (let tries = 0; tries < 40; tries++) {
				const en = VOCAB[Math.floor(rand() * VOCAB.length)];
				if (asked.includes(en)) continue;
				const f = T.toForeign(en, lang);
				if (!f || !f.word || f.word.toLowerCase() === en) continue;
				// Scripts that are hard to type are only asked towards English.
				const typed = !/^(?:ja|zh|th|ar|he|el|bg)$/.test(lang) && rand() < 0.5;
				if (typed) return { en, ask: `How do you say **${en}** in ${name}?`, answers: [f.word, f.said, ...(f.alts || [])].filter(Boolean), show: `**${f.said || f.word}**`, loose: true };
				const back = T.toEnglish(f.word, lang);
				return { en, ask: `What does the ${name} word **${f.word}** mean in English?`, answers: [en, ...((back && back.en) || [])], show: `**${en}**`, loose: true };
			}
			return null;
		},
		/** Whether `said` is one of the answers: capitals, accents, articles and "it's" in front don't count against it. */
		check(question, said) {
			const flat = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.!?,;:"'“”’]/g, '').replace(/^(?:it(?:'?s| is| means)|is it|i think(?: it'?s)?|maybe|that'?s|the answer is|to)\s+/g, '').replace(/^(?:the|a|an|el|la|los|las|un|una|le|les|l|der|die|das|ein|eine|il|lo|o|os|as|de|het|een)\s+/, '').replace(/\s+/g, ' ').trim();
			const x = flat(said);
			if (!x) return false;
			if (question.number != null) return Math.abs(Number(x.replace(/,/g, '').replace(/^(?:equals?|=)\s*/, '')) - question.number) < 1e-9;
			return question.answers.some((a) => flat(a) === x);
		},
	};

	Omni.onyxUses = { convert, series, dates, readDate, document, quiz, fmt, UNITS, STOP };
})(typeof window !== 'undefined' ? window : globalThis);
