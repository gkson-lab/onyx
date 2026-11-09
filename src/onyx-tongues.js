// Onyx 3's languages: the 32 it has a dictionary for. For each: its code, its name in English, in itself, in Spanish
// and in French, and ten everyday phrases written for Onyx. The dictionaries themselves are in src/translations/, one
// file per language, loaded when a language is first asked for (see Omni.languages in host/host.js).
(function (root) {
	'use strict';

	// code|English name|its own name|Spanish name|French name|other names people use (comma separated)
	const LANGUAGES = `
en|English|English|inglés|anglais|
es|Spanish|español|español|espagnol|castilian,castellano
fr|French|français|francés|français|
de|German|Deutsch|alemán|allemand|deutsch
it|Italian|italiano|italiano|italien|
pt|Portuguese|português|portugués|portugais|brazilian,portugues
nl|Dutch|Nederlands|neerlandés|néerlandais|holandés,hollandais,flemish
ca|Catalan|català|catalán|catalan|catala
gl|Galician|galego|gallego|galicien|
eu|Basque|euskara|vasco|basque|euskera
ro|Romanian|română|rumano|roumain|romana
pl|Polish|polski|polaco|polonais|
sv|Swedish|svenska|sueco|suédois|
da|Danish|dansk|danés|danois|
nb|Norwegian|norsk|noruego|norvégien|bokmål,bokmal
nn|Norwegian Nynorsk|nynorsk|nynorsk|nynorsk|
fi|Finnish|suomi|finlandés|finnois|finés
is|Icelandic|íslenska|islandés|islandais|islenska
lt|Lithuanian|lietuvių|lituano|lituanien|
hr|Croatian|hrvatski|croata|croate|
sl|Slovenian|slovenščina|esloveno|slovène|slovene
sk|Slovak|slovenčina|eslovaco|slovaque|
bg|Bulgarian|български|búlgaro|bulgare|
el|Greek|ελληνικά|griego|grec|
sq|Albanian|shqip|albanés|albanais|
ar|Arabic|العربية|árabe|arabe|
he|Hebrew|עברית|hebreo|hébreu|
zh|Chinese|中文|chino|chinois|mandarin,mandarín
ja|Japanese|日本語|japonés|japonais|
th|Thai|ไทย|tailandés|thaï|
id|Indonesian|Bahasa Indonesia|indonesio|indonésien|bahasa
ms|Malay|Bahasa Melayu|malayo|malais|
`;

	// Ten things people say first, in every language: English key, then code=phrase pairs. Written for Onyx.
	const BASICS = `
Hello|es=hola|fr=bonjour|de=hallo|it=ciao|pt=olá|nl=hallo|ca=hola|gl=ola|eu=kaixo|ro=salut|pl=cześć|sv=hej|da=hej|nb=hei|nn=hei|fi=hei|is=halló|lt=labas|hr=bok|sl=živjo|sk=ahoj|bg=здравей|el=γεια σου|sq=përshëndetje|ar=مرحبا|he=שלום|zh=你好|ja=こんにちは|th=สวัสดี|id=halo|ms=helo
Goodbye|es=adiós|fr=au revoir|de=auf Wiedersehen|it=arrivederci|pt=adeus|nl=tot ziens|ca=adéu|gl=adeus|eu=agur|ro=la revedere|pl=do widzenia|sv=hej då|da=farvel|nb=ha det|nn=ha det|fi=näkemiin|is=bless|lt=viso gero|hr=doviđenja|sl=nasvidenje|sk=dovidenia|bg=довиждане|el=αντίο|sq=mirupafshim|ar=مع السلامة|he=להתראות|zh=再见|ja=さようなら|th=ลาก่อน|id=selamat tinggal|ms=selamat tinggal
Please|es=por favor|fr=s'il vous plaît|de=bitte|it=per favore|pt=por favor|nl=alstublieft|ca=si us plau|gl=por favor|eu=mesedez|ro=vă rog|pl=proszę|sv=snälla|da=vær så venlig|nb=vær så snill|nn=ver så snill|fi=ole hyvä|is=vinsamlegast|lt=prašau|hr=molim|sl=prosim|sk=prosím|bg=моля|el=παρακαλώ|sq=ju lutem|ar=من فضلك|he=בבקשה|zh=请|ja=お願いします|th=กรุณา|id=tolong|ms=tolong
Thank you|es=gracias|fr=merci|de=danke|it=grazie|pt=obrigado|nl=dank je|ca=gràcies|gl=grazas|eu=eskerrik asko|ro=mulțumesc|pl=dziękuję|sv=tack|da=tak|nb=takk|nn=takk|fi=kiitos|is=takk|lt=ačiū|hr=hvala|sl=hvala|sk=ďakujem|bg=благодаря|el=ευχαριστώ|sq=faleminderit|ar=شكرا|he=תודה|zh=谢谢|ja=ありがとう|th=ขอบคุณ|id=terima kasih|ms=terima kasih
Yes|es=sí|fr=oui|de=ja|it=sì|pt=sim|nl=ja|ca=sí|gl=si|eu=bai|ro=da|pl=tak|sv=ja|da=ja|nb=ja|nn=ja|fi=kyllä|is=já|lt=taip|hr=da|sl=da|sk=áno|bg=да|el=ναι|sq=po|ar=نعم|he=כן|zh=是|ja=はい|th=ใช่|id=ya|ms=ya
No|es=no|fr=non|de=nein|it=no|pt=não|nl=nee|ca=no|gl=non|eu=ez|ro=nu|pl=nie|sv=nej|da=nej|nb=nei|nn=nei|fi=ei|is=nei|lt=ne|hr=ne|sl=ne|sk=nie|bg=не|el=όχι|sq=jo|ar=لا|he=לא|zh=不|ja=いいえ|th=ไม่|id=tidak|ms=tidak
Sorry|es=lo siento|fr=désolé|de=Entschuldigung|it=scusa|pt=desculpa|nl=sorry|ca=perdó|gl=perdón|eu=barkatu|ro=scuze|pl=przepraszam|sv=förlåt|da=undskyld|nb=unnskyld|nn=orsak|fi=anteeksi|is=fyrirgefðu|lt=atsiprašau|hr=oprosti|sl=oprosti|sk=prepáč|bg=съжалявам|el=συγγνώμη|sq=më fal|ar=آسف|he=סליחה|zh=对不起|ja=ごめんなさい|th=ขอโทษ|id=maaf|ms=maaf
Good morning|es=buenos días|fr=bonjour|de=guten Morgen|it=buongiorno|pt=bom dia|nl=goedemorgen|ca=bon dia|gl=bos días|eu=egun on|ro=bună dimineața|pl=dzień dobry|sv=god morgon|da=godmorgen|nb=god morgen|nn=god morgon|fi=hyvää huomenta|is=góðan daginn|lt=labas rytas|hr=dobro jutro|sl=dobro jutro|sk=dobré ráno|bg=добро утро|el=καλημέρα|sq=mirëmëngjes|ar=صباح الخير|he=בוקר טוב|zh=早上好|ja=おはようございます|th=สวัสดีตอนเช้า|id=selamat pagi|ms=selamat pagi
Good night|es=buenas noches|fr=bonne nuit|de=gute Nacht|it=buonanotte|pt=boa noite|nl=goedenacht|ca=bona nit|gl=boas noites|eu=gabon|ro=noapte bună|pl=dobranoc|sv=god natt|da=godnat|nb=god natt|nn=god natt|fi=hyvää yötä|is=góða nótt|lt=labanakt|hr=laku noć|sl=lahko noč|sk=dobrú noc|bg=лека нощ|el=καληνύχτα|sq=natën e mirë|ar=تصبح على خير|he=לילה טוב|zh=晚安|ja=おやすみなさい|th=ราตรีสวัสดิ์|id=selamat malam|ms=selamat malam
I love you|es=te quiero|fr=je t'aime|de=ich liebe dich|it=ti amo|pt=eu te amo|nl=ik hou van je|ca=t'estimo|gl=quérote|eu=maite zaitut|ro=te iubesc|pl=kocham cię|sv=jag älskar dig|da=jeg elsker dig|nb=jeg elsker deg|nn=eg elskar deg|fi=minä rakastan sinua|is=ég elska þig|lt=aš tave myliu|hr=volim te|sl=ljubim te|sk=ľúbim ťa|bg=обичам те|el=σ'αγαπώ|sq=të dua|ar=أحبك|he=אני אוהב אותך|zh=我爱你|ja=愛してる|th=ฉันรักคุณ|id=aku cinta kamu|ms=saya cinta kamu
`;

	// Everyday words written for Onyx, for languages whose wordnet misses or mistakes them. They come before the
	// dictionary. German's wordnet (OdeNet) was linked to WordNet automatically, and "drink" came out as "feiern".
	const CORE = {
		de: `the=der|a=ein|and=und|or=oder|but=aber|not=nicht|I=ich|you=du|he=er|she=sie|we=wir|they=sie|is=ist|are=sind|have=haben|be=sein|do=machen|go=gehen|come=kommen|see=sehen|eat=essen|drink=trinken|sleep=schlafen|speak=sprechen|say=sagen|know=wissen|want=wollen|can=können|like=mögen|love=lieben|give=geben|take=nehmen|make=machen|read=lesen|write=schreiben|buy=kaufen|work=arbeiten|play=spielen|learn=lernen|help=helfen|live=leben|think=denken|find=finden|need=brauchen|run=laufen|walk=gehen|open=öffnen|close=schließen|man=Mann|woman=Frau|child=Kind|boy=Junge|girl=Mädchen|friend=Freund|family=Familie|mother=Mutter|father=Vater|brother=Bruder|sister=Schwester|son=Sohn|daughter=Tochter|dog=Hund|cat=Katze|bird=Vogel|fish=Fisch|horse=Pferd|cow=Kuh|house=Haus|home=Zuhause|room=Zimmer|door=Tür|window=Fenster|table=Tisch|chair=Stuhl|bed=Bett|kitchen=Küche|city=Stadt|street=Straße|country=Land|school=Schule|car=Auto|train=Zug|bus=Bus|bicycle=Fahrrad|airplane=Flugzeug|station=Bahnhof|airport=Flughafen|water=Wasser|milk=Milch|coffee=Kaffee|tea=Tee|beer=Bier|wine=Wein|bread=Brot|cheese=Käse|meat=Fleisch|apple=Apfel|egg=Ei|food=Essen|sun=Sonne|moon=Mond|star=Stern|sky=Himmel|rain=Regen|snow=Schnee|wind=Wind|tree=Baum|flower=Blume|sea=Meer|river=Fluss|mountain=Berg|forest=Wald|day=Tag|night=Nacht|morning=Morgen|evening=Abend|week=Woche|month=Monat|year=Jahr|today=heute|tomorrow=morgen|yesterday=gestern|time=Zeit|hour=Stunde|book=Buch|letter=Brief|word=Wort|language=Sprache|name=Name|money=Geld|job=Arbeit|shop=Laden|doctor=Arzt|teacher=Lehrer|hand=Hand|head=Kopf|eye=Auge|heart=Herz|good=gut|bad=schlecht|big=groß|small=klein|new=neu|old=alt|young=jung|beautiful=schön|happy=glücklich|sad=traurig|tired=müde|hungry=hungrig|hot=heiß|cold=kalt|warm=warm|fast=schnell|slow=langsam|easy=einfach|difficult=schwierig|red=rot|blue=blau|green=grün|yellow=gelb|black=schwarz|white=weiß|one=eins|two=zwei|three=drei|four=vier|five=fünf|six=sechs|seven=sieben|eight=acht|nine=neun|ten=zehn|here=hier|there=dort|now=jetzt|always=immer|never=nie|very=sehr|with=mit|without=ohne|for=für|in=in|on=auf|where=wo|what=was|who=wer|why=warum|how=wie|when=wann|butterfly=Schmetterling|computer=Computer|phone=Telefon|music=Musik|world=Welt|life=Leben|love=Liebe|question=Frage|answer=Antwort|problem=Problem|thing=Ding|people=Leute|person=Person|party=Party|birthday=Geburtstag|weather=Wetter|summer=Sommer|winter=Winter|spring=Frühling|autumn=Herbst`,
	};
	const core = {};
	for (const [lang, text] of Object.entries(CORE)) {
		core[lang] = { from: new Map(), to: new Map() };
		for (const pair of text.split('|')) {
			const [en, word] = pair.split('=');
			if (!core[lang].from.has(en.toLowerCase())) core[lang].from.set(en.toLowerCase(), word);
			if (!core[lang].to.has(word.toLowerCase())) core[lang].to.set(word.toLowerCase(), en);
		}
	}

	const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
	const LIST = LANGUAGES.trim().split('\n').map((line) => {
		const [code, name, native, es, fr, more] = line.split('|');
		return { code, name, native, es, fr, aliases: [name, native, es, fr, ...(more ? more.split(',') : [])].map(strip) };
	});
	const BY_CODE = new Map(LIST.map((l) => [l.code, l]));
	const BY_NAME = new Map();
	for (const l of LIST) for (const a of l.aliases) if (!BY_NAME.has(a)) BY_NAME.set(a, l.code);
	// "Norwegian" alone is Bokmål; "nynorsk" is its own.
	BY_NAME.set('norwegian nynorsk', 'nn');

	const PHRASES = BASICS.trim().split('\n').map((line) => {
		const [en, ...rest] = line.split('|');
		const row = { en };
		for (const pair of rest) row[pair.slice(0, pair.indexOf('='))] = pair.slice(pair.indexOf('=') + 1);
		return row;
	});

	/** The code of a language named in any of the ways people name it ("Italian", "italiano", "italien"), or null. */
	const codeOf = (name) => BY_NAME.get(strip(name)) || null;
	/** A language's name: in English, or in Spanish ("es") or French ("fr") for replies in those. */
	const nameOf = (code, inLang) => {
		const l = BY_CODE.get(code);
		return l ? (inLang === 'es' ? l.es : inLang === 'fr' ? l.fr : l.name) : code;
	};
	// Every name, longest first, for finding "in Norwegian Nynorsk" before "in Norwegian".
	const NAMES = [...BY_NAME.keys()].sort((a, b) => b.length - a.length);
	const PATTERN = NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

	(root.Omni = root.Omni || {}).onyxTongues = { LIST, PHRASES, core, codeOf, nameOf, has: (code) => BY_CODE.has(code), PATTERN, strip, codes: LIST.map((l) => l.code) };
})(typeof window !== 'undefined' ? window : globalThis);
