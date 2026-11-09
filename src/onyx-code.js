// Onyx 2.5's code writer: small, complete programs in Python, JavaScript, Rust, C, C#, C++, HTML and raw HTTP, for
// about two dozen everyday tasks (hello world, loops, FizzBuzz, functions, strings, lists, files, classes and structs,
// HTTP requests, a tiny web server, web pages and forms). It isn't a language model: each task is written for Onyx in
// each language and filled in with what was asked ("count from 5 to 50", "a class Book with title, author and price",
// "a GET request to https://..."). Every program it can write is compiled and run by tools/check-code.js.
//
//   Omni.onyxCode.parse('fizzbuzz in rust')  ->  { task: 'fizzbuzz', lang: 'rust', params: { n: 100 } }
//   Omni.onyxCode.write(job)                 ->  { lang, code, file, run, title, note }
(function (root) {
	'use strict';

	/* ---------- Languages ---------- */

	const LANGS = {
		python: { name: 'Python', file: 'main.py', fence: 'python', run: 'python3 main.py' },
		javascript: { name: 'JavaScript', file: 'main.js', fence: 'javascript', run: 'node main.js' },
		rust: { name: 'Rust', file: 'main.rs', fence: 'rust', run: 'rustc main.rs && ./main' },
		c: { name: 'C', file: 'main.c', fence: 'c', run: 'gcc main.c -o main && ./main' },
		csharp: { name: 'C#', file: 'Program.cs', fence: 'csharp', run: 'dotnet run', project: 'Make a project with `dotnet new console -o app`, put this in `app/Program.cs`, then run `dotnet run --project app`.' },
		cpp: { name: 'C++', file: 'main.cpp', fence: 'cpp', run: 'g++ -std=c++17 main.cpp -o main && ./main' },
		html: { name: 'HTML', file: 'index.html', fence: 'html', run: 'save it as index.html and open it in a browser' },
		http: { name: 'HTTP', file: 'request.http', fence: 'http', run: 'send it with any HTTP client, or use the curl command below' },
	};
	const ORDER = ['python', 'javascript', 'rust', 'c', 'csharp', 'cpp', 'html', 'http'];

	/** The language a message names, or null. "in C" is C; "C++" and "C#" come first so they aren't. */
	function langOf(text) {
		const t = ` ${String(text).toLowerCase()} `;
		const found = [];
		const add = (lang, re) => {
			const m = t.match(re);
			if (m) found.push({ lang, at: m.index });
		};
		add('cpp', /c\+\+|\bcpp\b|\bcplusplus\b/);
		add('csharp', /c#|\bc ?sharp\b|\bcsharp\b|\bdotnet\b|\.net\b/);
		add('javascript', /\bjavascript\b|\bjs\b|\bnode(?:\.?js)?\b|\becmascript\b/);
		add('python', /\bpython3?\b|\bpy\b/);
		add('rust', /\brust\b|\brustlang\b/);
		add('html', /\bhtml5?\b|\bweb ?page\b|\bwebsite\b/);
		add('http', /\b(?:raw )?http\b/);
		add('c', /(?:\b(?:in|using|with|write|a|an|the|plain|pure|ansi)\s+c\b|\bc (?:program|code|function|language|version|file|source)\b|^\s*c\s*$|\bin c[.!?]?\s*$)(?![+#])/);
		if (!found.length) return null;
		// "an HTTP request in Python" is Python: HTTP and HTML give way to a programming language named with them.
		const real = found.filter((f) => f.lang !== 'http' && f.lang !== 'html');
		const pool = real.length ? real : found;
		const after = pool.filter((f) => /\b(?:in|using|with|to)\s*$/.test(t.slice(0, f.at)));
		return (after.length ? after : pool).sort((a, b) => a.at - b.at)[0].lang;
	}

	/* ---------- Helpers ---------- */

	const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
	const words = (s) => String(s).trim().replace(/[^A-Za-z0-9_ ]+/g, ' ').trim().split(/\s+|_/).filter(Boolean);
	const snake = (s) => words(s).map((w) => w.toLowerCase()).join('_') || 'value';
	const camel = (s) => words(s).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join('') || 'value';
	const pascal = (s) => words(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('') || 'Value';
	const q = (s) => JSON.stringify(String(s));
	// C-family string literals: JSON's escaping is valid in all of them for printable text.
	const cq = q;
	const pyq = (s) => (String(s).includes("'") ? q(s) : `'${String(s).replace(/\\/g, '\\\\')}'`);
	const num = (n) => (Number.isInteger(n) ? String(n) : String(n));
	const fl = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));
	const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	/** What type a field holds, from its name: "age" an integer, "price" a decimal, "is_active" a yes or no. */
	function typeOf(field) {
		const f = field.toLowerCase();
		if (/^(?:is|has|can)[ _]|\b(?:active|enabled|done|completed|available|verified|visible|paid|admin)\b/.test(f)) return 'bool';
		if (/\b(?:price|cost|amount|total|balance|salary|height|weight|score|rating|temperature|temp|latitude|longitude|lat|lng|lon|distance|speed|percent|percentage|average|width|length|depth|area|volume)\b/.test(f)) return 'float';
		if (/\b(?:age|id|count|quantity|qty|year|years|number|num|pages|stock|size|level|rank|floor|population|points|votes|likes|minutes|seconds|hours|days|duration)\b/.test(f)) return 'int';
		return 'str';
	}
	/** An example value for a field, so the program prints something real. */
	function sample(field, type) {
		const f = field.toLowerCase();
		if (type === 'bool') return true;
		if (type === 'int') return /\bage\b/.test(f) ? 30 : /year/.test(f) ? 2026 : /id/.test(f) ? 1 : /pages/.test(f) ? 320 : /quantity|qty|stock/.test(f) ? 5 : 3;
		if (type === 'float') return /price|cost|amount|total|balance/.test(f) ? 9.99 : /height/.test(f) ? 1.75 : /weight/.test(f) ? 70.5 : /temp/.test(f) ? 21.5 : /score|rating/.test(f) ? 4.5 : 1.5;
		if (/email/.test(f)) return 'sam@example.com';
		if (/^(?:first ?name|name|full ?name|username|user ?name)$/.test(f)) return /user/.test(f) ? 'sam' : 'Sam';
		if (/last ?name|surname/.test(f)) return 'Rivera';
		if (/city|town/.test(f)) return 'Austin';
		if (/country/.test(f)) return 'USA';
		if (/title/.test(f)) return 'Dune';
		if (/author/.test(f)) return 'Frank Herbert';
		if (/phone/.test(f)) return '555-0100';
		if (/color|colour/.test(f)) return 'blue';
		if (/address|street/.test(f)) return '1 Main St';
		if (/description|message|text|body|content|note|bio/.test(f)) return 'Hello there';
		if (/url|website|link/.test(f)) return 'https://example.com';
		if (/brand|make/.test(f)) return 'Acme';
		if (/model/.test(f)) return 'X1';
		if (/breed/.test(f)) return 'beagle';
		if (/species|kind|type|category/.test(f)) return 'general';
		if (/genre/.test(f)) return 'science fiction';
		if (/date|birthday/.test(f)) return '2026-01-01';
		if (/status/.test(f)) return 'open';
		return 'example';
	}
	const fieldsOf = (list) => list.map((f) => {
		const type = typeOf(f);
		return { name: f, type, value: sample(f, type) };
	});
	const TYPES = {
		python: { str: 'str', int: 'int', float: 'float', bool: 'bool' }, rust: { str: 'String', int: 'i32', float: 'f64', bool: 'bool' },
		c: { str: 'const char *', int: 'int', float: 'double', bool: 'bool' }, csharp: { str: 'string', int: 'int', float: 'double', bool: 'bool' },
		cpp: { str: 'std::string', int: 'int', float: 'double', bool: 'bool' },
	};
	/** A value as a literal in a language. */
	function lit(lang, v, type) {
		if (type === 'bool') return lang === 'python' ? (v ? 'True' : 'False') : v ? 'true' : 'false';
		if (type === 'float') return lang === 'python' || lang === 'javascript' ? num(v) : fl(v);
		if (type === 'int') return String(v);
		if (lang === 'python') return pyq(v);
		if (lang === 'rust') return `String::from(${q(v)})`;
		return q(v);
	}
	const jsonOf = (fields) => '{' + fields.map((f) => `${q(f.name.replace(/\s+/g, '_'))}: ${f.type === 'str' ? q(f.value) : f.type === 'bool' ? String(f.value) : num(f.value)}`).join(', ') + '}';
	const listLit = (lang, nums) => {
		const xs = nums.map(num).join(', ');
		return { python: `[${xs}]`, javascript: `[${xs}]`, rust: `vec![${xs}]`, c: `{${xs}}`, csharp: `{ ${xs} }`, cpp: `{${xs}}` }[lang];
	};
	const allInts = (nums) => nums.every((n) => Number.isInteger(n));

	/** Parses a URL into the parts an HTTP request needs. */
	function urlParts(u) {
		const m = String(u).match(/^(https?):\/\/([^/:?#]+)(?::(\d+))?([^#]*)$/i);
		if (!m) return { scheme: 'https', host: 'example.com', port: null, path: '/' };
		return { scheme: m[1].toLowerCase(), host: m[2], port: m[3] || null, path: m[4] || '/' };
	}

	/* ---------- The tasks ---------- */

	// Each task: title, a sentence on what the program does, and a function per language that writes it from params.
	const TASKS = {
		hello: {
			title: 'Hello, world',
			about: (p) => `prints "${p.msg}"`,
			python: (p) => `print(${pyq(p.msg)})\n`,
			javascript: (p) => `console.log(${q(p.msg)});\n`,
			rust: (p) => `fn main() {\n    println!(${/[{}]/.test(p.msg) ? `"{}", ${q(p.msg)}` : q(p.msg)});\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    printf("%s\\n", ${cq(p.msg)});\n    return 0;\n}\n`,
			csharp: (p) => `using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine(${q(p.msg)});\n    }\n}\n`,
			cpp: (p) => `#include <iostream>\n\nint main() {\n    std::cout << ${cq(p.msg)} << std::endl;\n    return 0;\n}\n`,
			html: (p) => page(p.msg, `  <h1>${escHtml(p.msg)}</h1>\n`),
			http: (p) => {
				const body = p.msg + '\n';
				return { code: `HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: ${utf8Length(body)}\r\n\r\n${body}`, note: 'An HTTP response: the status line, the headers, a blank line, then the body. Content-Length counts the body\'s bytes.' };
			},
			defaults: { msg: 'Hello, world!' },
		},
		count: {
			title: 'Counting',
			about: (p) => `prints the numbers from ${p.from} to ${p.to}`,
			python: (p) => `for i in range(${p.from}, ${p.to + 1}):\n    print(i)\n`,
			javascript: (p) => `for (let i = ${p.from}; i <= ${p.to}; i++) {\n  console.log(i);\n}\n`,
			rust: (p) => `fn main() {\n    for i in ${p.from}..=${p.to} {\n        println!("{}", i);\n    }\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    for (int i = ${p.from}; i <= ${p.to}; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}\n`,
			csharp: (p) => main('csharp', `for (int i = ${p.from}; i <= ${p.to}; i++)\n{\n    Console.WriteLine(i);\n}`),
			cpp: (p) => `#include <iostream>\n\nint main() {\n    for (int i = ${p.from}; i <= ${p.to}; i++) {\n        std::cout << i << std::endl;\n    }\n    return 0;\n}\n`,
			html: (p) => (p.to - p.from > 200 ? null : page('Numbers', `  <ol start="${p.from}">\n${Array.from({ length: p.to - p.from + 1 }, (_, i) => `    <li>${p.from + i}</li>`).join('\n')}\n  </ol>\n`)),
			defaults: { from: 1, to: 10 },
		},
		fizzbuzz: {
			title: 'FizzBuzz',
			about: (p) => `prints the numbers 1 to ${p.n}, with Fizz for multiples of 3, Buzz for multiples of 5 and FizzBuzz for both`,
			python: (p) => `for i in range(1, ${p.n + 1}):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)\n`,
			javascript: (p) => `for (let i = 1; i <= ${p.n}; i++) {\n  if (i % 15 === 0) console.log('FizzBuzz');\n  else if (i % 3 === 0) console.log('Fizz');\n  else if (i % 5 === 0) console.log('Buzz');\n  else console.log(i);\n}\n`,
			rust: (p) => `fn main() {\n    for i in 1..=${p.n} {\n        match (i % 3, i % 5) {\n            (0, 0) => println!("FizzBuzz"),\n            (0, _) => println!("Fizz"),\n            (_, 0) => println!("Buzz"),\n            _ => println!("{}", i),\n        }\n    }\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    for (int i = 1; i <= ${p.n}; i++) {\n        if (i % 15 == 0) printf("FizzBuzz\\n");\n        else if (i % 3 == 0) printf("Fizz\\n");\n        else if (i % 5 == 0) printf("Buzz\\n");\n        else printf("%d\\n", i);\n    }\n    return 0;\n}\n`,
			csharp: (p) => main('csharp', `for (int i = 1; i <= ${p.n}; i++)\n{\n    if (i % 15 == 0) Console.WriteLine("FizzBuzz");\n    else if (i % 3 == 0) Console.WriteLine("Fizz");\n    else if (i % 5 == 0) Console.WriteLine("Buzz");\n    else Console.WriteLine(i);\n}`),
			cpp: (p) => `#include <iostream>\n\nint main() {\n    for (int i = 1; i <= ${p.n}; i++) {\n        if (i % 15 == 0) std::cout << "FizzBuzz\\n";\n        else if (i % 3 == 0) std::cout << "Fizz\\n";\n        else if (i % 5 == 0) std::cout << "Buzz\\n";\n        else std::cout << i << "\\n";\n    }\n    return 0;\n}\n`,
			defaults: { n: 100 },
		},
		func: {
			title: 'A function',
			about: (p) => `defines ${p.name}(${p.args.join(', ')}), which returns ${p.expr}, and prints ${p.name}(${p.example.join(', ')})`,
			python: (p) => `def ${snake(p.name)}(${p.args.join(', ')}):\n    return ${p.expr}\n\n\nprint(${snake(p.name)}(${p.example.join(', ')}))\n`,
			javascript: (p) => `function ${camel(p.name)}(${p.args.join(', ')}) {\n  return ${p.expr};\n}\n\nconsole.log(${camel(p.name)}(${p.example.join(', ')}));\n`,
			rust: (p) => `fn ${snake(p.name)}(${p.args.map((a) => `${a}: f64`).join(', ')}) -> f64 {\n    ${rustExpr(p.expr)}\n}\n\nfn main() {\n    println!("{}", ${snake(p.name)}(${p.example.map(fl).join(', ')}));\n}\n`,
			c: (p) => `#include <stdio.h>\n\ndouble ${snake(p.name)}(${p.args.map((a) => `double ${a}`).join(', ')}) {\n    return ${p.expr};\n}\n\nint main(void) {\n    printf("%g\\n", ${snake(p.name)}(${p.example.map(fl).join(', ')}));\n    return 0;\n}\n`,
			csharp: (p) => `using System;\n\nclass Program\n{\n    static double ${pascal(p.name)}(${p.args.map((a) => `double ${a}`).join(', ')})\n    {\n        return ${p.expr};\n    }\n\n    static void Main()\n    {\n        Console.WriteLine(${pascal(p.name)}(${p.example.map(fl).join(', ')}));\n    }\n}\n`,
			cpp: (p) => `#include <iostream>\n\ndouble ${camel(p.name)}(${p.args.map((a) => `double ${a}`).join(', ')}) {\n    return ${p.expr};\n}\n\nint main() {\n    std::cout << ${camel(p.name)}(${p.example.map(fl).join(', ')}) << std::endl;\n    return 0;\n}\n`,
			defaults: { name: 'add', args: ['a', 'b'], expr: 'a + b', example: [2, 3] },
		},
		reverse: {
			title: 'Reversing a string',
			about: (p) => `reverses "${p.text}"`,
			python: (p) => `text = ${pyq(p.text)}\nprint(text[::-1])\n`,
			javascript: (p) => `const text = ${q(p.text)};\nconsole.log([...text].reverse().join(''));\n`,
			rust: (p) => `fn main() {\n    let text = ${q(p.text)};\n    let reversed: String = text.chars().rev().collect();\n    println!("{}", reversed);\n}\n`,
			c: (p) => `#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char text[] = ${cq(p.text)};\n    size_t n = strlen(text);\n    for (size_t i = 0; i < n / 2; i++) {\n        char t = text[i];\n        text[i] = text[n - 1 - i];\n        text[n - 1 - i] = t;\n    }\n    printf("%s\\n", text);\n    return 0;\n}\n`,
			csharp: (p) => main('csharp', `string text = ${q(p.text)};\nchar[] chars = text.ToCharArray();\nArray.Reverse(chars);\nConsole.WriteLine(new string(chars));`),
			cpp: (p) => `#include <algorithm>\n#include <iostream>\n#include <string>\n\nint main() {\n    std::string text = ${cq(p.text)};\n    std::reverse(text.begin(), text.end());\n    std::cout << text << std::endl;\n    return 0;\n}\n`,
			ascii: true,
			defaults: { text: 'hello' },
		},
		palindrome: {
			title: 'Checking for a palindrome',
			about: (p) => `checks whether "${p.text}" reads the same backwards, ignoring case`,
			python: (p) => `def is_palindrome(text):\n    s = text.lower()\n    return s == s[::-1]\n\n\nprint(is_palindrome(${pyq(p.text)}))\n`,
			javascript: (p) => `function isPalindrome(text) {\n  const s = text.toLowerCase();\n  return s === [...s].reverse().join('');\n}\n\nconsole.log(isPalindrome(${q(p.text)}));\n`,
			rust: (p) => `fn is_palindrome(text: &str) -> bool {\n    let s: Vec<char> = text.to_lowercase().chars().collect();\n    s.iter().eq(s.iter().rev())\n}\n\nfn main() {\n    println!("{}", is_palindrome(${q(p.text)}));\n}\n`,
			c: (p) => `#include <ctype.h>\n#include <stdbool.h>\n#include <stdio.h>\n#include <string.h>\n\nbool is_palindrome(const char *text) {\n    size_t n = strlen(text);\n    for (size_t i = 0; i < n / 2; i++) {\n        if (tolower((unsigned char)text[i]) != tolower((unsigned char)text[n - 1 - i])) return false;\n    }\n    return true;\n}\n\nint main(void) {\n    printf("%s\\n", is_palindrome(${cq(p.text)}) ? "true" : "false");\n    return 0;\n}\n`,
			csharp: (p) => `using System;\nusing System.Linq;\n\nclass Program\n{\n    static bool IsPalindrome(string text)\n    {\n        string s = text.ToLower();\n        return s.SequenceEqual(s.Reverse());\n    }\n\n    static void Main()\n    {\n        Console.WriteLine(IsPalindrome(${q(p.text)}));\n    }\n}\n`,
			cpp: (p) => `#include <algorithm>\n#include <cctype>\n#include <iostream>\n#include <string>\n\nbool isPalindrome(std::string text) {\n    std::transform(text.begin(), text.end(), text.begin(), [](unsigned char c) { return std::tolower(c); });\n    return std::equal(text.begin(), text.begin() + text.size() / 2, text.rbegin());\n}\n\nint main() {\n    std::cout << std::boolalpha << isPalindrome(${cq(p.text)}) << std::endl;\n    return 0;\n}\n`,
			ascii: true,
			defaults: { text: 'Racecar' },
		},
		factorial: {
			title: 'Factorial',
			about: (p) => `computes ${p.n}! (${p.n} factorial)`,
			python: (p) => `def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\n\nprint(factorial(${p.n}))\n`,
			javascript: (p) => `function factorial(n) {\n  let result = 1n;\n  for (let i = 2n; i <= BigInt(n); i++) result *= i;\n  return result;\n}\n\nconsole.log(factorial(${p.n}).toString());\n`,
			rust: (p) => `fn factorial(n: u64) -> u128 {\n    (1..=n as u128).product()\n}\n\nfn main() {\n    println!("{}", factorial(${p.n}));\n}\n`,
			c: (p) => `#include <stdio.h>\n\nunsigned long long factorial(int n) {\n    unsigned long long result = 1;\n    for (int i = 2; i <= n; i++) result *= i;\n    return result;\n}\n\nint main(void) {\n    printf("%llu\\n", factorial(${p.n}));\n    return 0;\n}\n`,
			csharp: (p) => `using System;\nusing System.Numerics;\n\nclass Program\n{\n    static BigInteger Factorial(int n)\n    {\n        BigInteger result = 1;\n        for (int i = 2; i <= n; i++) result *= i;\n        return result;\n    }\n\n    static void Main()\n    {\n        Console.WriteLine(Factorial(${p.n}));\n    }\n}\n`,
			cpp: (p) => `#include <iostream>\n\nunsigned long long factorial(int n) {\n    unsigned long long result = 1;\n    for (int i = 2; i <= n; i++) result *= i;\n    return result;\n}\n\nint main() {\n    std::cout << factorial(${p.n}) << std::endl;\n    return 0;\n}\n`,
			defaults: { n: 5 },
			limit: (p) => (p.n > 20 ? 'C and C++ use 64-bit integers here, which hold factorials up to 20!.' : null),
		},
		fibonacci: {
			title: 'Fibonacci numbers',
			about: (p) => `prints the first ${p.n} Fibonacci numbers`,
			python: (p) => `a, b = 0, 1\nfor _ in range(${p.n}):\n    print(a)\n    a, b = b, a + b\n`,
			javascript: (p) => `let a = 0n;\nlet b = 1n;\nfor (let i = 0; i < ${p.n}; i++) {\n  console.log(a.toString());\n  [a, b] = [b, a + b];\n}\n`,
			rust: (p) => `fn main() {\n    let (mut a, mut b): (u128, u128) = (0, 1);\n    for _ in 0..${p.n} {\n        println!("{}", a);\n        let next = a + b;\n        a = b;\n        b = next;\n    }\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    unsigned long long a = 0, b = 1;\n    for (int i = 0; i < ${p.n}; i++) {\n        printf("%llu\\n", a);\n        unsigned long long next = a + b;\n        a = b;\n        b = next;\n    }\n    return 0;\n}\n`,
			csharp: (p) => main('csharp', `long a = 0, b = 1;\nfor (int i = 0; i < ${p.n}; i++)\n{\n    Console.WriteLine(a);\n    long next = a + b;\n    a = b;\n    b = next;\n}`),
			cpp: (p) => `#include <iostream>\n\nint main() {\n    unsigned long long a = 0, b = 1;\n    for (int i = 0; i < ${p.n}; i++) {\n        std::cout << a << std::endl;\n        unsigned long long next = a + b;\n        a = b;\n        b = next;\n    }\n    return 0;\n}\n`,
			defaults: { n: 10 },
			limit: (p) => (p.n > 90 ? 'Past the 90th number the C, C++ and C# versions overflow 64-bit integers.' : null),
		},
		prime: {
			title: 'Prime numbers',
			about: (p) => `checks whether ${p.n} is prime`,
			python: (p) => `def is_prime(n):\n    if n < 2:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True\n\n\nprint(is_prime(${p.n}))\n`,
			javascript: (p) => `function isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i * i <= n; i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}\n\nconsole.log(isPrime(${p.n}));\n`,
			rust: (p) => `fn is_prime(n: u64) -> bool {\n    if n < 2 {\n        return false;\n    }\n    let mut i = 2;\n    while i * i <= n {\n        if n % i == 0 {\n            return false;\n        }\n        i += 1;\n    }\n    true\n}\n\nfn main() {\n    println!("{}", is_prime(${p.n}));\n}\n`,
			c: (p) => `#include <stdbool.h>\n#include <stdio.h>\n\nbool is_prime(long long n) {\n    if (n < 2) return false;\n    for (long long i = 2; i * i <= n; i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main(void) {\n    printf("%s\\n", is_prime(${p.n}) ? "true" : "false");\n    return 0;\n}\n`,
			csharp: (p) => `using System;\n\nclass Program\n{\n    static bool IsPrime(long n)\n    {\n        if (n < 2) return false;\n        for (long i = 2; i * i <= n; i++)\n        {\n            if (n % i == 0) return false;\n        }\n        return true;\n    }\n\n    static void Main()\n    {\n        Console.WriteLine(IsPrime(${p.n}));\n    }\n}\n`,
			cpp: (p) => `#include <iostream>\n\nbool isPrime(long long n) {\n    if (n < 2) return false;\n    for (long long i = 2; i * i <= n; i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    std::cout << std::boolalpha << isPrime(${p.n}) << std::endl;\n    return 0;\n}\n`,
			defaults: { n: 29 },
		},
		sort: {
			title: 'Sorting a list',
			about: (p) => `sorts ${p.nums.join(', ')} ${p.desc ? 'from largest to smallest' : 'from smallest to largest'}`,
			python: (p) => `numbers = ${listLit('python', p.nums)}\nnumbers.sort(${p.desc ? 'reverse=True' : ''})\nprint(numbers)\n`,
			javascript: (p) => `const numbers = ${listLit('javascript', p.nums)};\nnumbers.sort((a, b) => ${p.desc ? 'b - a' : 'a - b'});\nconsole.log(numbers);\n`,
			rust: (p) => (allInts(p.nums) ? `fn main() {\n    let mut numbers = ${listLit('rust', p.nums)};\n    numbers.sort();\n${p.desc ? '    numbers.reverse();\n' : ''}    println!("{:?}", numbers);\n}\n` : `fn main() {\n    let mut numbers: Vec<f64> = vec![${p.nums.map(fl).join(', ')}];\n    numbers.sort_by(|a, b| ${p.desc ? 'b.partial_cmp(a)' : 'a.partial_cmp(b)'}.unwrap());\n    println!("{:?}", numbers);\n}\n`),
			c: (p) => {
				const t = allInts(p.nums) ? 'int' : 'double';
				return `#include <stdio.h>\n#include <stdlib.h>\n\nint compare(const void *a, const void *b) {\n    ${t} x = *(const ${t} *)a, y = *(const ${t} *)b;\n    return ${p.desc ? '(x < y) - (x > y)' : '(x > y) - (x < y)'};\n}\n\nint main(void) {\n    ${t} numbers[] = ${t === 'int' ? listLit('c', p.nums) : `{${p.nums.map(fl).join(', ')}}`};\n    size_t n = sizeof numbers / sizeof numbers[0];\n    qsort(numbers, n, sizeof numbers[0], compare);\n    for (size_t i = 0; i < n; i++) printf(${t === 'int' ? '"%d "' : '"%g "'}, numbers[i]);\n    printf("\\n");\n    return 0;\n}\n`;
			},
			csharp: (p) => `using System;\n\nclass Program\n{\n    static void Main()\n    {\n        ${allInts(p.nums) ? 'int' : 'double'}[] numbers = ${allInts(p.nums) ? listLit('csharp', p.nums) : `{ ${p.nums.map(fl).join(', ')} }`};\n        Array.Sort(numbers);\n${p.desc ? '        Array.Reverse(numbers);\n' : ''}        Console.WriteLine(string.Join(", ", numbers));\n    }\n}\n`,
			cpp: (p) => `#include <algorithm>\n#include <functional>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<${allInts(p.nums) ? 'int' : 'double'}> numbers = ${allInts(p.nums) ? listLit('cpp', p.nums) : `{${p.nums.map(fl).join(', ')}}`};\n    std::sort(numbers.begin(), numbers.end()${p.desc ? ', std::greater<>()' : ''});\n    for (auto n : numbers) std::cout << n << " ";\n    std::cout << std::endl;\n    return 0;\n}\n`,
			defaults: { nums: [5, 3, 8, 1, 9, 2], desc: false },
		},
		stats: {
			title: 'Sum, average, largest and smallest',
			about: (p) => `prints the sum, average, largest and smallest of ${p.nums.join(', ')}`,
			python: (p) => `numbers = ${listLit('python', p.nums)}\nprint('Sum:', sum(numbers))\nprint('Average:', sum(numbers) / len(numbers))\nprint('Largest:', max(numbers))\nprint('Smallest:', min(numbers))\n`,
			javascript: (p) => `const numbers = ${listLit('javascript', p.nums)};\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconsole.log('Sum:', sum);\nconsole.log('Average:', sum / numbers.length);\nconsole.log('Largest:', Math.max(...numbers));\nconsole.log('Smallest:', Math.min(...numbers));\n`,
			rust: (p) => `fn main() {\n    let numbers: Vec<f64> = vec![${p.nums.map(fl).join(', ')}];\n    let sum: f64 = numbers.iter().sum();\n    let largest = numbers.iter().cloned().fold(f64::MIN, f64::max);\n    let smallest = numbers.iter().cloned().fold(f64::MAX, f64::min);\n    println!("Sum: {}", sum);\n    println!("Average: {}", sum / numbers.len() as f64);\n    println!("Largest: {}", largest);\n    println!("Smallest: {}", smallest);\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    double numbers[] = {${p.nums.map(fl).join(', ')}};\n    int n = sizeof numbers / sizeof numbers[0];\n    double sum = 0, largest = numbers[0], smallest = numbers[0];\n    for (int i = 0; i < n; i++) {\n        sum += numbers[i];\n        if (numbers[i] > largest) largest = numbers[i];\n        if (numbers[i] < smallest) smallest = numbers[i];\n    }\n    printf("Sum: %g\\n", sum);\n    printf("Average: %g\\n", sum / n);\n    printf("Largest: %g\\n", largest);\n    printf("Smallest: %g\\n", smallest);\n    return 0;\n}\n`,
			csharp: (p) => `using System;\nusing System.Linq;\n\nclass Program\n{\n    static void Main()\n    {\n        double[] numbers = { ${p.nums.map(fl).join(', ')} };\n        Console.WriteLine("Sum: " + numbers.Sum());\n        Console.WriteLine("Average: " + numbers.Average());\n        Console.WriteLine("Largest: " + numbers.Max());\n        Console.WriteLine("Smallest: " + numbers.Min());\n    }\n}\n`,
			cpp: (p) => `#include <algorithm>\n#include <iostream>\n#include <numeric>\n#include <vector>\n\nint main() {\n    std::vector<double> numbers = {${p.nums.map(fl).join(', ')}};\n    double sum = std::accumulate(numbers.begin(), numbers.end(), 0.0);\n    std::cout << "Sum: " << sum << std::endl;\n    std::cout << "Average: " << sum / numbers.size() << std::endl;\n    std::cout << "Largest: " << *std::max_element(numbers.begin(), numbers.end()) << std::endl;\n    std::cout << "Smallest: " << *std::min_element(numbers.begin(), numbers.end()) << std::endl;\n    return 0;\n}\n`,
			defaults: { nums: [4, 8, 15, 16, 23, 42] },
		},
		loop: {
			title: 'Looping over a list',
			about: (p) => `prints each item of a list: ${p.items.join(', ')}`,
			python: (p) => `items = [${p.items.map(pyq).join(', ')}]\nfor item in items:\n    print(item)\n`,
			javascript: (p) => `const items = [${p.items.map(q).join(', ')}];\nfor (const item of items) {\n  console.log(item);\n}\n`,
			rust: (p) => `fn main() {\n    let items = [${p.items.map(q).join(', ')}];\n    for item in items.iter() {\n        println!("{}", item);\n    }\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    const char *items[] = {${p.items.map(cq).join(', ')}};\n    int n = sizeof items / sizeof items[0];\n    for (int i = 0; i < n; i++) {\n        printf("%s\\n", items[i]);\n    }\n    return 0;\n}\n`,
			csharp: (p) => main('csharp', `string[] items = { ${p.items.map(q).join(', ')} };\nforeach (string item in items)\n{\n    Console.WriteLine(item);\n}`),
			cpp: (p) => `#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::string> items = {${p.items.map(cq).join(', ')}};\n    for (const auto &item : items) {\n        std::cout << item << std::endl;\n    }\n    return 0;\n}\n`,
			html: (p) => page('List', `  <ul>\n${p.items.map((x) => `    <li>${escHtml(x)}</li>`).join('\n')}\n  </ul>\n`),
			defaults: { items: ['apples', 'bread', 'milk'] },
		},
		readfile: {
			title: 'Reading a file',
			about: (p) => `reads ${p.file} and prints it`,
			python: (p) => `with open(${pyq(p.file)}, encoding='utf-8') as f:\n    print(f.read())\n`,
			javascript: (p) => `const fs = require('fs');\n\nconst text = fs.readFileSync(${q(p.file)}, 'utf8');\nconsole.log(text);\n`,
			rust: (p) => `use std::fs;\n\nfn main() {\n    let text = fs::read_to_string(${q(p.file)}).expect("couldn't read the file");\n    println!("{}", text);\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    FILE *f = fopen(${cq(p.file)}, "r");\n    if (!f) {\n        perror(${cq(p.file)});\n        return 1;\n    }\n    char line[1024];\n    while (fgets(line, sizeof line, f)) {\n        fputs(line, stdout);\n    }\n    fclose(f);\n    return 0;\n}\n`,
			csharp: (p) => `using System;\nusing System.IO;\n\nclass Program\n{\n    static void Main()\n    {\n        string text = File.ReadAllText(${q(p.file)});\n        Console.WriteLine(text);\n    }\n}\n`,
			cpp: (p) => `#include <fstream>\n#include <iostream>\n#include <string>\n\nint main() {\n    std::ifstream file(${cq(p.file)});\n    if (!file) {\n        std::cerr << "couldn't open " << ${cq(p.file)} << std::endl;\n        return 1;\n    }\n    std::string line;\n    while (std::getline(file, line)) {\n        std::cout << line << std::endl;\n    }\n    return 0;\n}\n`,
			defaults: { file: 'input.txt' },
		},
		writefile: {
			title: 'Writing a file',
			about: (p) => `writes "${p.text}" to ${p.file}`,
			python: (p) => `with open(${pyq(p.file)}, 'w', encoding='utf-8') as f:\n    f.write(${pyq(p.text)} + '\\n')\n`,
			javascript: (p) => `const fs = require('fs');\n\nfs.writeFileSync(${q(p.file)}, ${q(p.text + '\n')});\n`,
			rust: (p) => `use std::fs;\n\nfn main() {\n    fs::write(${q(p.file)}, ${q(p.text + '\n')}).expect("couldn't write the file");\n}\n`,
			c: (p) => `#include <stdio.h>\n\nint main(void) {\n    FILE *f = fopen(${cq(p.file)}, "w");\n    if (!f) {\n        perror(${cq(p.file)});\n        return 1;\n    }\n    fprintf(f, "%s\\n", ${cq(p.text)});\n    fclose(f);\n    return 0;\n}\n`,
			csharp: (p) => `using System.IO;\n\nclass Program\n{\n    static void Main()\n    {\n        File.WriteAllText(${q(p.file)}, ${q(p.text + '\n')});\n    }\n}\n`,
			cpp: (p) => `#include <fstream>\n\nint main() {\n    std::ofstream file(${cq(p.file)});\n    file << ${cq(p.text)} << std::endl;\n    return 0;\n}\n`,
			defaults: { file: 'output.txt', text: 'Hello, file!' },
		},
		wordcount: {
			title: 'Counting words',
			about: (p) => `counts the words in "${p.text}", and how often each one appears`,
			python: (p) => `from collections import Counter\n\ntext = ${pyq(p.text)}\nwords = text.lower().split()\nprint('Words:', len(words))\nfor word, count in sorted(Counter(words).items()):\n    print(word, count)\n`,
			javascript: (p) => `const text = ${q(p.text)};\nconst words = text.toLowerCase().split(/\\s+/).filter(Boolean);\nconsole.log('Words:', words.length);\nconst counts = new Map();\nfor (const w of words) counts.set(w, (counts.get(w) || 0) + 1);\nfor (const [word, count] of [...counts].sort()) console.log(word, count);\n`,
			rust: (p) => `use std::collections::BTreeMap;\n\nfn main() {\n    let text = ${q(p.text)};\n    let lower = text.to_lowercase();\n    let words: Vec<&str> = lower.split_whitespace().collect();\n    println!("Words: {}", words.len());\n    let mut counts = BTreeMap::new();\n    for w in &words {\n        *counts.entry(*w).or_insert(0) += 1;\n    }\n    for (word, count) in &counts {\n        println!("{} {}", word, count);\n    }\n}\n`,
			c: (p) => `#include <ctype.h>\n#include <stdio.h>\n\nint main(void) {\n    const char *text = ${cq(p.text)};\n    int words = 0, in_word = 0;\n    for (const char *c = text; *c; c++) {\n        if (isspace((unsigned char)*c)) in_word = 0;\n        else if (!in_word) {\n            in_word = 1;\n            words++;\n        }\n    }\n    printf("Words: %d\\n", words);\n    return 0;\n}\n`,
			csharp: (p) => `using System;\nusing System.Linq;\n\nclass Program\n{\n    static void Main()\n    {\n        string text = ${q(p.text)};\n        string[] words = text.ToLower().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);\n        Console.WriteLine("Words: " + words.Length);\n        foreach (var g in words.GroupBy(w => w).OrderBy(g => g.Key, StringComparer.Ordinal))\n        {\n            Console.WriteLine(g.Key + " " + g.Count());\n        }\n    }\n}\n`,
			cpp: (p) => `#include <algorithm>\n#include <cctype>\n#include <iostream>\n#include <map>\n#include <sstream>\n#include <string>\n\nint main() {\n    std::string text = ${cq(p.text)};\n    std::transform(text.begin(), text.end(), text.begin(), [](unsigned char c) { return std::tolower(c); });\n    std::istringstream in(text);\n    std::map<std::string, int> counts;\n    std::string word;\n    int total = 0;\n    while (in >> word) {\n        counts[word]++;\n        total++;\n    }\n    std::cout << "Words: " << total << std::endl;\n    for (const auto &[w, n] : counts) {\n        std::cout << w << " " << n << std::endl;\n    }\n    return 0;\n}\n`,
			note: { c: 'C has no built-in map, so the C version only counts the words; the others also count each word.' },
			defaults: { text: 'the cat and the hat' },
		},
		cls: {
			title: 'A class',
			about: (p) => `defines ${pascal(p.name)} with ${andList(p.fields.map((f) => `${f.name} (${{ str: 'text', int: 'a whole number', float: 'a decimal', bool: 'true or false' }[f.type]})`))}, makes one and prints it`,
			python: (p) => `from dataclasses import dataclass\n\n\n@dataclass\nclass ${pascal(p.name)}:\n${p.fields.map((f) => `    ${snake(f.name)}: ${TYPES.python[f.type]}`).join('\n')}\n\n\n${snake(p.name)} = ${pascal(p.name)}(${p.fields.map((f) => lit('python', f.value, f.type)).join(', ')})\nprint(${snake(p.name)})\n`,
			javascript: (p) => `class ${pascal(p.name)} {\n  constructor(${p.fields.map((f) => camel(f.name)).join(', ')}) {\n${p.fields.map((f) => `    this.${camel(f.name)} = ${camel(f.name)};`).join('\n')}\n  }\n}\n\nconst ${camel(p.name)} = new ${pascal(p.name)}(${p.fields.map((f) => lit('javascript', f.value, f.type)).join(', ')});\nconsole.log(${camel(p.name)});\n`,
			rust: (p) => `struct ${pascal(p.name)} {\n${p.fields.map((f) => `    ${snake(f.name)}: ${TYPES.rust[f.type]},`).join('\n')}\n}\n\nfn main() {\n    let ${snake(p.name)} = ${pascal(p.name)} {\n${p.fields.map((f) => `        ${snake(f.name)}: ${lit('rust', f.value, f.type)},`).join('\n')}\n    };\n    println!(\n        "${p.fields.map((f) => `${snake(f.name)}: {}`).join(', ')}",\n${p.fields.map((f) => `        ${snake(p.name)}.${snake(f.name)}`).join(',\n')}\n    );\n}\n`,
			c: (p) => {
				const fmt = { str: '%s', int: '%d', float: '%g', bool: '%s' };
				const arg = (f) => (f.type === 'bool' ? `${snake(p.name)}.${snake(f.name)} ? "true" : "false"` : `${snake(p.name)}.${snake(f.name)}`);
				return `#include <stdbool.h>\n#include <stdio.h>\n\nstruct ${snake(p.name)} {\n${p.fields.map((f) => `    ${TYPES.c[f.type]}${f.type === 'str' ? '' : ' '}${snake(f.name)};`).join('\n')}\n};\n\nint main(void) {\n    struct ${snake(p.name)} ${snake(p.name)} = {${p.fields.map((f) => lit('c', f.value, f.type)).join(', ')}};\n    printf("${p.fields.map((f) => `${snake(f.name)}: ${fmt[f.type]}`).join(', ')}\\n", ${p.fields.map(arg).join(', ')});\n    return 0;\n}\n`;
			},
			csharp: (p) => `using System;\n\nclass ${pascal(p.name)}\n{\n${p.fields.map((f) => `    public ${TYPES.csharp[f.type]} ${pascal(f.name)} { get; set; }`).join('\n')}\n\n    public ${pascal(p.name)}(${p.fields.map((f) => `${TYPES.csharp[f.type]} ${camel(f.name)}`).join(', ')})\n    {\n${p.fields.map((f) => `        ${pascal(f.name)} = ${camel(f.name)};`).join('\n')}\n    }\n\n    public override string ToString()\n    {\n        return $"${pascal(p.name)} {{ ${p.fields.map((f) => `${pascal(f.name)} = {${pascal(f.name)}}`).join(', ')} }}";\n    }\n}\n\nclass Program\n{\n    static void Main()\n    {\n        var ${camel(p.name)} = new ${pascal(p.name)}(${p.fields.map((f) => lit('csharp', f.value, f.type)).join(', ')});\n        Console.WriteLine(${camel(p.name)});\n    }\n}\n`,
			cpp: (p) => `#include <iostream>\n#include <string>\n\nstruct ${pascal(p.name)} {\n${p.fields.map((f) => `    ${TYPES.cpp[f.type]} ${snake(f.name)};`).join('\n')}\n};\n\nint main() {\n    ${pascal(p.name)} ${snake(p.name)}{${p.fields.map((f) => lit('cpp', f.value, f.type)).join(', ')}};\n    std::cout << std::boolalpha${p.fields.map((f, i) => ` << "${i ? ', ' : ''}${snake(f.name)}: " << ${snake(p.name)}.${snake(f.name)}`).join('')} << std::endl;\n    return 0;\n}\n`,
			html: (p) => form(p.name, p.fields),
			http: (p) => post({ url: `https://api.example.com/${snake(p.name)}s`, fields: p.fields }),
			defaults: { name: 'Person', fields: ['name', 'age'] },
		},
		get: {
			title: 'An HTTP GET request',
			about: (p) => `fetches ${p.url} and prints the response`,
			python: (p) => `import urllib.request\n\nwith urllib.request.urlopen(${pyq(p.url)}) as response:\n    print(response.status)\n    print(response.read().decode('utf-8'))\n`,
			javascript: (p) => `// Node 18 or later, or a browser.\nfetch(${q(p.url)})\n  .then((response) => {\n    console.log(response.status);\n    return response.text();\n  })\n  .then((text) => console.log(text))\n  .catch((error) => console.error(error));\n`,
			rust: (p) => ({ code: `// Cargo.toml: reqwest = { version = "0.12", features = ["blocking"] }\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n    let response = reqwest::blocking::get(${q(p.url)})?;\n    println!("{}", response.status());\n    println!("{}", response.text()?);\n    Ok(())\n}\n`, deps: 'reqwest' }),
			c: (p) => ({ code: `// Uses libcurl: gcc main.c -o main -lcurl\n#include <curl/curl.h>\n#include <stdio.h>\n\nint main(void) {\n    CURL *curl = curl_easy_init();\n    if (!curl) return 1;\n    curl_easy_setopt(curl, CURLOPT_URL, ${cq(p.url)});\n    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);\n    CURLcode res = curl_easy_perform(curl);\n    if (res != CURLE_OK) fprintf(stderr, "%s\\n", curl_easy_strerror(res));\n    curl_easy_cleanup(curl);\n    return res == CURLE_OK ? 0 : 1;\n}\n`, run: 'gcc main.c -o main -lcurl && ./main' }),
			csharp: (p) => `using System;\nusing System.Net.Http;\nusing System.Threading.Tasks;\n\nclass Program\n{\n    static void Main() => Run().GetAwaiter().GetResult();\n\n    static async Task Run()\n    {\n        using (var client = new HttpClient())\n        {\n            var response = await client.GetAsync(${q(p.url)});\n            Console.WriteLine((int)response.StatusCode);\n            Console.WriteLine(await response.Content.ReadAsStringAsync());\n        }\n    }\n}\n`,
			cpp: (p) => ({ code: `// Uses libcurl: g++ -std=c++17 main.cpp -o main -lcurl\n#include <curl/curl.h>\n#include <iostream>\n#include <string>\n\nstatic size_t collect(char *data, size_t size, size_t count, void *out) {\n    static_cast<std::string *>(out)->append(data, size * count);\n    return size * count;\n}\n\nint main() {\n    CURL *curl = curl_easy_init();\n    if (!curl) return 1;\n    std::string body;\n    curl_easy_setopt(curl, CURLOPT_URL, ${cq(p.url)});\n    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);\n    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, collect);\n    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &body);\n    CURLcode res = curl_easy_perform(curl);\n    if (res == CURLE_OK) std::cout << body << std::endl;\n    else std::cerr << curl_easy_strerror(res) << std::endl;\n    curl_easy_cleanup(curl);\n    return res == CURLE_OK ? 0 : 1;\n}\n`, run: 'g++ -std=c++17 main.cpp -o main -lcurl && ./main' }),
			html: (p) => page('Fetch', `  <button id="load">Load</button>\n  <pre id="out"></pre>\n  <script>\n    document.getElementById('load').addEventListener('click', async () => {\n      const response = await fetch(${q(p.url)});\n      document.getElementById('out').textContent = await response.text();\n    });\n  </script>\n`),
			http: (p) => {
				const u = urlParts(p.url);
				return { code: `GET ${u.path} HTTP/1.1\r\nHost: ${u.host}${u.port ? ':' + u.port : ''}\r\nAccept: */*\r\nConnection: close\r\n\r\n`, note: `The request line, the headers, then a blank line. Same thing with curl: \`curl -i ${p.url}\`` };
			},
			defaults: { url: 'https://example.com/' },
		},
		post: {
			title: 'An HTTP POST with JSON',
			about: (p) => `sends ${jsonOf(p.fields)} as JSON to ${p.url} and prints the response`,
			python: (p) => `import json\nimport urllib.request\n\ndata = json.dumps(${pyJson(p.fields)}).encode('utf-8')\nrequest = urllib.request.Request(${pyq(p.url)}, data=data, headers={'Content-Type': 'application/json'}, method='POST')\nwith urllib.request.urlopen(request) as response:\n    print(response.status)\n    print(response.read().decode('utf-8'))\n`,
			javascript: (p) => `// Node 18 or later, or a browser.\nfetch(${q(p.url)}, {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(${jsJson(p.fields)}),\n})\n  .then((response) => {\n    console.log(response.status);\n    return response.text();\n  })\n  .then((text) => console.log(text))\n  .catch((error) => console.error(error));\n`,
			rust: (p) => ({ code: `// Cargo.toml: reqwest = { version = "0.12", features = ["blocking", "json"] }, serde_json = "1"\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n    let body = serde_json::json!(${jsJson(p.fields, true)});\n    let response = reqwest::blocking::Client::new().post(${q(p.url)}).json(&body).send()?;\n    println!("{}", response.status());\n    println!("{}", response.text()?);\n    Ok(())\n}\n`, deps: 'reqwest+json' }),
			c: (p) => ({ code: `// Uses libcurl: gcc main.c -o main -lcurl\n#include <curl/curl.h>\n#include <stdio.h>\n\nint main(void) {\n    CURL *curl = curl_easy_init();\n    if (!curl) return 1;\n    struct curl_slist *headers = curl_slist_append(NULL, "Content-Type: application/json");\n    curl_easy_setopt(curl, CURLOPT_URL, ${cq(p.url)});\n    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);\n    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, ${cq(jsonOf(p.fields))});\n    CURLcode res = curl_easy_perform(curl);\n    if (res != CURLE_OK) fprintf(stderr, "%s\\n", curl_easy_strerror(res));\n    curl_slist_free_all(headers);\n    curl_easy_cleanup(curl);\n    return res == CURLE_OK ? 0 : 1;\n}\n`, run: 'gcc main.c -o main -lcurl && ./main' }),
			csharp: (p) => `using System;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\n\nclass Program\n{\n    static void Main() => Run().GetAwaiter().GetResult();\n\n    static async Task Run()\n    {\n        using (var client = new HttpClient())\n        {\n            var json = ${q(jsonOf(p.fields))};\n            var content = new StringContent(json, Encoding.UTF8, "application/json");\n            var response = await client.PostAsync(${q(p.url)}, content);\n            Console.WriteLine((int)response.StatusCode);\n            Console.WriteLine(await response.Content.ReadAsStringAsync());\n        }\n    }\n}\n`,
			cpp: (p) => ({ code: `// Uses libcurl: g++ -std=c++17 main.cpp -o main -lcurl\n#include <curl/curl.h>\n#include <iostream>\n#include <string>\n\nint main() {\n    CURL *curl = curl_easy_init();\n    if (!curl) return 1;\n    std::string json = ${cq(jsonOf(p.fields))};\n    struct curl_slist *headers = curl_slist_append(nullptr, "Content-Type: application/json");\n    curl_easy_setopt(curl, CURLOPT_URL, ${cq(p.url)});\n    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);\n    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json.c_str());\n    CURLcode res = curl_easy_perform(curl);\n    if (res != CURLE_OK) std::cerr << curl_easy_strerror(res) << std::endl;\n    curl_slist_free_all(headers);\n    curl_easy_cleanup(curl);\n    return res == CURLE_OK ? 0 : 1;\n}\n`, run: 'g++ -std=c++17 main.cpp -o main -lcurl && ./main' }),
			html: (p) => form('Send', p.fields, p.url),
			http: (p) => post(p),
			defaults: { url: 'https://api.example.com/users', fields: ['name', 'age'] },
		},
		server: {
			title: 'A tiny web server',
			about: (p) => `serves "Hello from the server!" at http://localhost:${p.port}/`,
			python: (p) => `from http.server import BaseHTTPRequestHandler, HTTPServer\n\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        body = 'Hello from the server!\\n'.encode('utf-8')\n        self.send_response(200)\n        self.send_header('Content-Type', 'text/plain; charset=utf-8')\n        self.send_header('Content-Length', str(len(body)))\n        self.end_headers()\n        self.wfile.write(body)\n\n\nprint('Listening on http://localhost:${p.port}/')\nHTTPServer(('', ${p.port}), Handler).serve_forever()\n`,
			javascript: (p) => `const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });\n  res.end('Hello from the server!\\n');\n});\n\nserver.listen(${p.port}, () => console.log('Listening on http://localhost:${p.port}/'));\n`,
			rust: (p) => `use std::io::{Read, Write};\nuse std::net::TcpListener;\n\nfn main() {\n    let listener = TcpListener::bind("0.0.0.0:${p.port}").expect("couldn't bind the port");\n    println!("Listening on http://localhost:${p.port}/");\n    for stream in listener.incoming() {\n        let mut stream = match stream {\n            Ok(s) => s,\n            Err(_) => continue,\n        };\n        let mut buffer = [0u8; 1024];\n        let _ = stream.read(&mut buffer);\n        let body = "Hello from the server!\\n";\n        let response = format!(\n            "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain; charset=utf-8\\r\\nContent-Length: {}\\r\\nConnection: close\\r\\n\\r\\n{}",\n            body.len(),\n            body\n        );\n        let _ = stream.write_all(response.as_bytes());\n    }\n}\n`,
			c: (p) => ({ code: `// POSIX (Linux, macOS): gcc main.c -o main && ./main\n#include <netinet/in.h>\n#include <stdio.h>\n#include <string.h>\n#include <sys/socket.h>\n#include <unistd.h>\n\nint main(void) {\n    int server = socket(AF_INET, SOCK_STREAM, 0);\n    int yes = 1;\n    setsockopt(server, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof yes);\n    struct sockaddr_in addr = {0};\n    addr.sin_family = AF_INET;\n    addr.sin_addr.s_addr = htonl(INADDR_ANY);\n    addr.sin_port = htons(${p.port});\n    if (bind(server, (struct sockaddr *)&addr, sizeof addr) < 0 || listen(server, 10) < 0) {\n        perror("server");\n        return 1;\n    }\n    printf("Listening on http://localhost:${p.port}/\\n");\n    fflush(stdout);\n    const char *body = "Hello from the server!\\n";\n    char response[256];\n    snprintf(response, sizeof response, "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain; charset=utf-8\\r\\nContent-Length: %zu\\r\\nConnection: close\\r\\n\\r\\n%s", strlen(body), body);\n    for (;;) {\n        int client = accept(server, NULL, NULL);\n        if (client < 0) continue;\n        char request[1024];\n        recv(client, request, sizeof request, 0);\n        send(client, response, strlen(response), 0);\n        close(client);\n    }\n}\n` }),
			csharp: (p) => `using System;\nusing System.Net;\nusing System.Text;\n\nclass Program\n{\n    static void Main()\n    {\n        var listener = new HttpListener();\n        listener.Prefixes.Add("http://localhost:${p.port}/");\n        listener.Start();\n        Console.WriteLine("Listening on http://localhost:${p.port}/");\n        while (true)\n        {\n            var context = listener.GetContext();\n            byte[] body = Encoding.UTF8.GetBytes("Hello from the server!\\n");\n            context.Response.ContentType = "text/plain; charset=utf-8";\n            context.Response.ContentLength64 = body.Length;\n            context.Response.OutputStream.Write(body, 0, body.Length);\n            context.Response.Close();\n        }\n    }\n}\n`,
			cpp: (p) => ({ code: `// POSIX (Linux, macOS): g++ -std=c++17 main.cpp -o main && ./main\n#include <netinet/in.h>\n#include <sys/socket.h>\n#include <unistd.h>\n\n#include <iostream>\n#include <string>\n\nint main() {\n    int server = socket(AF_INET, SOCK_STREAM, 0);\n    int yes = 1;\n    setsockopt(server, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof yes);\n    sockaddr_in addr{};\n    addr.sin_family = AF_INET;\n    addr.sin_addr.s_addr = htonl(INADDR_ANY);\n    addr.sin_port = htons(${p.port});\n    if (bind(server, reinterpret_cast<sockaddr *>(&addr), sizeof addr) < 0 || listen(server, 10) < 0) {\n        std::perror("server");\n        return 1;\n    }\n    std::cout << "Listening on http://localhost:${p.port}/" << std::endl;\n    const std::string body = "Hello from the server!\\n";\n    const std::string response = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain; charset=utf-8\\r\\nContent-Length: " + std::to_string(body.size()) + "\\r\\nConnection: close\\r\\n\\r\\n" + body;\n    for (;;) {\n        int client = accept(server, nullptr, nullptr);\n        if (client < 0) continue;\n        char request[1024];\n        recv(client, request, sizeof request, 0);\n        send(client, response.data(), response.size(), 0);\n        close(client);\n    }\n}\n` }),
			http: () => TASKS.hello.http({ msg: 'Hello from the server!' }),
			defaults: { port: 8080 },
		},
		greet: {
			title: 'Asking for a name',
			about: () => 'asks for your name and says hello',
			python: () => `name = input('What is your name? ')\nprint(f'Hello, {name}!')\n`,
			javascript: () => `const readline = require('readline');\n\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.question('What is your name? ', (name) => {\n  console.log(\`Hello, \${name}!\`);\n  rl.close();\n});\n`,
			rust: () => `use std::io::{self, Write};\n\nfn main() {\n    print!("What is your name? ");\n    io::stdout().flush().unwrap();\n    let mut name = String::new();\n    io::stdin().read_line(&mut name).expect("couldn't read a line");\n    println!("Hello, {}!", name.trim());\n}\n`,
			c: () => `#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char name[100];\n    printf("What is your name? ");\n    if (!fgets(name, sizeof name, stdin)) return 1;\n    name[strcspn(name, "\\n")] = '\\0';\n    printf("Hello, %s!\\n", name);\n    return 0;\n}\n`,
			csharp: () => main('csharp', `Console.Write("What is your name? ");\nstring name = Console.ReadLine();\nConsole.WriteLine($"Hello, {name}!");`),
			cpp: () => `#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "What is your name? ";\n    std::getline(std::cin, name);\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}\n`,
			html: () => page('Hello', `  <label>What is your name? <input id="name"></label>\n  <button id="hello">Say hello</button>\n  <p id="out"></p>\n  <script>\n    document.getElementById('hello').addEventListener('click', () => {\n      const name = document.getElementById('name').value;\n      document.getElementById('out').textContent = \`Hello, \${name}!\`;\n    });\n  </script>\n`),
			defaults: {},
		},
		guess: {
			title: 'A number guessing game',
			about: (p) => `picks a number from 1 to ${p.max} and tells you higher or lower until you guess it`,
			python: (p) => `import random\n\nsecret = random.randint(1, ${p.max})\ntries = 0\nwhile True:\n    guess = int(input('Guess a number from 1 to ${p.max}: '))\n    tries += 1\n    if guess < secret:\n        print('Higher!')\n    elif guess > secret:\n        print('Lower!')\n    else:\n        print(f'You got it in {tries} tries!')\n        break\n`,
			javascript: (p) => `const readline = require('readline');\n\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nconst secret = Math.floor(Math.random() * ${p.max}) + 1;\nlet tries = 0;\n\nfunction ask() {\n  rl.question('Guess a number from 1 to ${p.max}: ', (answer) => {\n    const guess = Number(answer);\n    tries++;\n    if (guess < secret) console.log('Higher!');\n    else if (guess > secret) console.log('Lower!');\n    else {\n      console.log(\`You got it in \${tries} tries!\`);\n      rl.close();\n      return;\n    }\n    ask();\n  });\n}\n\nask();\n`,
			rust: (p) => `use std::io::{self, Write};\nuse std::time::{SystemTime, UNIX_EPOCH};\n\nfn main() {\n    // A simple random number from the clock, so there's nothing to install.\n    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().subsec_nanos();\n    let secret = nanos % ${p.max} + 1;\n    let mut tries = 0;\n    loop {\n        print!("Guess a number from 1 to ${p.max}: ");\n        io::stdout().flush().unwrap();\n        let mut line = String::new();\n        if io::stdin().read_line(&mut line).unwrap() == 0 {\n            break;\n        }\n        let guess: u32 = match line.trim().parse() {\n            Ok(n) => n,\n            Err(_) => continue,\n        };\n        tries += 1;\n        if guess < secret {\n            println!("Higher!");\n        } else if guess > secret {\n            println!("Lower!");\n        } else {\n            println!("You got it in {} tries!", tries);\n            break;\n        }\n    }\n}\n`,
			c: (p) => `#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n\nint main(void) {\n    srand((unsigned)time(NULL));\n    int secret = rand() % ${p.max} + 1, guess, tries = 0;\n    for (;;) {\n        printf("Guess a number from 1 to ${p.max}: ");\n        if (scanf("%d", &guess) != 1) return 1;\n        tries++;\n        if (guess < secret) printf("Higher!\\n");\n        else if (guess > secret) printf("Lower!\\n");\n        else {\n            printf("You got it in %d tries!\\n", tries);\n            return 0;\n        }\n    }\n}\n`,
			csharp: (p) => main('csharp', `int secret = new Random().Next(1, ${p.max + 1});\nint tries = 0;\nwhile (true)\n{\n    Console.Write("Guess a number from 1 to ${p.max}: ");\n    if (!int.TryParse(Console.ReadLine(), out int guess)) continue;\n    tries++;\n    if (guess < secret) Console.WriteLine("Higher!");\n    else if (guess > secret) Console.WriteLine("Lower!");\n    else\n    {\n        Console.WriteLine($"You got it in {tries} tries!");\n        break;\n    }\n}`),
			cpp: (p) => `#include <iostream>\n#include <random>\n\nint main() {\n    std::random_device rd;\n    std::uniform_int_distribution<int> pick(1, ${p.max});\n    int secret = pick(rd), guess, tries = 0;\n    while (std::cout << "Guess a number from 1 to ${p.max}: " && std::cin >> guess) {\n        tries++;\n        if (guess < secret) std::cout << "Higher!" << std::endl;\n        else if (guess > secret) std::cout << "Lower!" << std::endl;\n        else {\n            std::cout << "You got it in " << tries << " tries!" << std::endl;\n            return 0;\n        }\n    }\n    return 1;\n}\n`,
			defaults: { max: 100 },
		},
		temperature: {
			title: 'Converting temperatures',
			about: (p) => (p.toC ? `converts ${p.value}°F to Celsius` : `converts ${p.value}°C to Fahrenheit`),
			python: (p) => (p.toC ? `def fahrenheit_to_celsius(f):\n    return (f - 32) * 5 / 9\n\n\nprint(fahrenheit_to_celsius(${p.value}))\n` : `def celsius_to_fahrenheit(c):\n    return c * 9 / 5 + 32\n\n\nprint(celsius_to_fahrenheit(${p.value}))\n`),
			javascript: (p) => (p.toC ? `function fahrenheitToCelsius(f) {\n  return (f - 32) * 5 / 9;\n}\n\nconsole.log(fahrenheitToCelsius(${p.value}));\n` : `function celsiusToFahrenheit(c) {\n  return c * 9 / 5 + 32;\n}\n\nconsole.log(celsiusToFahrenheit(${p.value}));\n`),
			rust: (p) => (p.toC ? `fn fahrenheit_to_celsius(f: f64) -> f64 {\n    (f - 32.0) * 5.0 / 9.0\n}\n\nfn main() {\n    println!("{}", fahrenheit_to_celsius(${fl(p.value)}));\n}\n` : `fn celsius_to_fahrenheit(c: f64) -> f64 {\n    c * 9.0 / 5.0 + 32.0\n}\n\nfn main() {\n    println!("{}", celsius_to_fahrenheit(${fl(p.value)}));\n}\n`),
			c: (p) => `#include <stdio.h>\n\ndouble ${p.toC ? 'fahrenheit_to_celsius(double f) {\n    return (f - 32) * 5 / 9;' : 'celsius_to_fahrenheit(double c) {\n    return c * 9 / 5 + 32;'}\n}\n\nint main(void) {\n    printf("%g\\n", ${p.toC ? 'fahrenheit_to_celsius' : 'celsius_to_fahrenheit'}(${fl(p.value)}));\n    return 0;\n}\n`,
			csharp: (p) => `using System;\n\nclass Program\n{\n    static double ${p.toC ? 'FahrenheitToCelsius(double f)\n    {\n        return (f - 32) * 5 / 9;' : 'CelsiusToFahrenheit(double c)\n    {\n        return c * 9 / 5 + 32;'}\n    }\n\n    static void Main()\n    {\n        Console.WriteLine(${p.toC ? 'FahrenheitToCelsius' : 'CelsiusToFahrenheit'}(${fl(p.value)}));\n    }\n}\n`,
			cpp: (p) => `#include <iostream>\n\ndouble ${p.toC ? 'fahrenheitToCelsius(double f) {\n    return (f - 32) * 5 / 9;' : 'celsiusToFahrenheit(double c) {\n    return c * 9 / 5 + 32;'}\n}\n\nint main() {\n    std::cout << ${p.toC ? 'fahrenheitToCelsius' : 'celsiusToFahrenheit'}(${fl(p.value)}) << std::endl;\n    return 0;\n}\n`,
			defaults: { value: 100, toC: false },
		},
		htmlpage: {
			title: 'A web page',
			about: (p) => `shows a page titled "${p.title}", with a heading, a paragraph and a little CSS`,
			html: (p) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${escHtml(p.title)}</title>\n  <style>\n    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }\n    h1 { color: #333; }\n  </style>\n</head>\n<body>\n  <h1>${escHtml(p.title)}</h1>\n  <p>Welcome to my page.</p>\n</body>\n</html>\n`,
			defaults: { title: 'My Page' },
		},
		table: {
			title: 'An HTML table',
			about: (p) => `shows a table with the columns ${andList(p.fields.map((f) => f.name))}, and a row of examples`,
			html: (p) => page('Table', `  <table>\n    <thead>\n      <tr>${p.fields.map((f) => `<th>${escHtml(cap(f.name))}</th>`).join('')}</tr>\n    </thead>\n    <tbody>\n      <tr>${p.fields.map((f) => `<td>${escHtml(String(f.value))}</td>`).join('')}</tr>\n    </tbody>\n  </table>\n`, 'table { border-collapse: collapse; }\n    th, td { border: 1px solid #ccc; padding: 0.4rem 0.8rem; text-align: left; }'),
			defaults: { fields: ['name', 'age', 'city'] },
		},
		form: {
			title: 'An HTML form',
			about: (p) => `shows a form with ${andList(p.fields.map((f) => f.name))}`,
			html: (p) => form('Contact', p.fields),
			defaults: { fields: ['name', 'email', 'message'] },
		},
		button: {
			title: 'A button',
			about: (p) => `shows a button that says "${p.label}" and a message when it's clicked`,
			html: (p) => page('Button', `  <button id="go">${escHtml(p.label)}</button>\n  <p id="out"></p>\n  <script>\n    document.getElementById('go').addEventListener('click', () => {\n      document.getElementById('out').textContent = 'You clicked the button!';\n    });\n  </script>\n`),
			javascript: (p) => `// In a page with <button id="go">${escHtml(p.label)}</button>\ndocument.getElementById('go').addEventListener('click', () => {\n  alert('You clicked the button!');\n});\n`,
			defaults: { label: 'Click me' },
		},
	};
	const cap = (s) => s[0].toUpperCase() + s.slice(1);
	const andList = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0] || '');

	function main(lang, body) {
		if (lang === 'csharp') return `using System;\n\nclass Program\n{\n    static void Main()\n    {\n${indent(body, 8)}\n    }\n}\n`;
		return body;
	}
	function page(title, body, css) {
		return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>${escHtml(title)}</title>\n${css ? `  <style>\n    ${css}\n  </style>\n` : ''}</head>\n<body>\n${body}</body>\n</html>\n`;
	}
	function form(name, fields, action) {
		const input = (f) => {
			const id = snake(f.name);
			const label = cap(f.name.replace(/_/g, ' '));
			if (/message|description|comment|bio|note|text|body/.test(f.name)) return `    <label for="${id}">${escHtml(label)}</label>\n    <textarea id="${id}" name="${id}" rows="4"></textarea>`;
			const type = f.type === 'bool' ? 'checkbox' : f.type === 'int' || f.type === 'float' ? 'number' : /email/.test(f.name) ? 'email' : /password/.test(f.name) ? 'password' : /phone/.test(f.name) ? 'tel' : /date|birthday/.test(f.name) ? 'date' : /url|website/.test(f.name) ? 'url' : 'text';
			return `    <label for="${id}">${escHtml(label)}</label>\n    <input id="${id}" name="${id}" type="${type}"${f.type === 'float' ? ' step="any"' : ''}${type === 'checkbox' ? '' : ' required'}>`;
		};
		return page(cap(String(name)), `  <form${action ? ` action="${escHtml(action)}"` : ''} method="post">\n${fields.map(input).join('\n')}\n    <button type="submit">Send</button>\n  </form>\n`, 'form { display: grid; gap: 0.5rem; max-width: 24rem; }');
	}
	function utf8Length(s) {
		let n = 0;
		for (const ch of s) {
			const c = ch.codePointAt(0);
			n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
		}
		return n;
	}
	function post(p) {
		const u = urlParts(p.url);
		const body = jsonOf(p.fields);
		return { code: `POST ${u.path} HTTP/1.1\r\nHost: ${u.host}${u.port ? ':' + u.port : ''}\r\nContent-Type: application/json\r\nContent-Length: ${utf8Length(body)}\r\nConnection: close\r\n\r\n${body}`, note: `The body is JSON, and Content-Length is its size in bytes. Same thing with curl: \`curl -i -X POST ${p.url} -H 'Content-Type: application/json' -d '${body}'\`` };
	}
	const pyJson = (fields) => '{' + fields.map((f) => `${pyq(f.name.replace(/\s+/g, '_'))}: ${lit('python', f.value, f.type)}`).join(', ') + '}';
	const jsJson = (fields, quoted) => '{ ' + fields.map((f) => `${quoted ? q(f.name.replace(/\s+/g, '_')) : /^[a-z_]\w*$/i.test(f.name) ? f.name : q(f.name)}: ${f.type === 'str' ? (quoted ? q(f.value) : pyq(f.value)) : String(f.value)}`).join(', ') + ' }';
	const rustExpr = (expr) => expr.replace(/(?<![.\d\w])(\d+)(?![.\d])/g, '$1.0');

	/* ---------- Understanding the request ---------- */

	const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, fifty: 50, hundred: 100, 'a hundred': 100, 'one hundred': 100, thousand: 1000 };
	const numberIn = (s) => {
		const m = String(s).match(/-?\d+(?:\.\d+)?/);
		if (m) return +m[0];
		for (const [w, n] of Object.entries(NUMBER_WORDS)) if (new RegExp(`\\b${w}\\b`).test(s)) return n;
		return null;
	};
	/** "name, age and email" -> ['name', 'age', 'email']. */
	const fieldList = (s) => String(s).replace(/\b(?:fields?|properties|attributes|members|columns|inputs?|for)\b/g, ' ').split(/\s*(?:,|\band\b|&|\+)\s*/).map((x) => x.replace(/^(?:a|an|the|their|its|his|her)\s+/, '').replace(/[^a-z0-9 _]/gi, '').trim()).filter((x) => x && x.length <= 30 && x.split(' ').length <= 3);
	const quoted = (s) => (String(s).match(/["“'‘]([^"”'’]+)["”'’]/) || [])[1];
	const numbersIn = (s) => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

	// Arithmetic functions, by what they do.
	const OPS = [
		[/\badd(?:s|ing)?\b|\bsum of two\b|\bplus\b/, 'add', 'a + b'], [/\bsubtract(?:s|ing)?\b|\bminus\b|\bdifference\b/, 'subtract', 'a - b'],
		[/\bmultipl(?:y|ies|ying)\b|\bproduct\b|\btimes\b/, 'multiply', 'a * b'], [/\bdivid(?:e|es|ing)\b|\bquotient\b/, 'divide', 'a / b'],
		[/\bsquare(?:s|d)?\b(?! root)/, 'square', 'x * x'], [/\bcube(?:s|d)?\b/, 'cube', 'x * x * x'], [/\baverage of two\b|\bmean of two\b/, 'average', '(a + b) / 2'],
		[/\barea of (?:a )?rectangle\b/, 'rectangle_area', 'width * height'], [/\barea of (?:a )?circle\b/, 'circle_area', '3.14159 * r * r'],
		[/\bdouble(?:s)?\b/, 'double', 'x * 2'], [/\bhalf\b|\bhalves\b/, 'half', 'x / 2'],
	];
	const ARGS = { add: ['a', 'b'], subtract: ['a', 'b'], multiply: ['a', 'b'], divide: ['a', 'b'], square: ['x'], cube: ['x'], average: ['a', 'b'], rectangle_area: ['width', 'height'], circle_area: ['r'], double: ['x'], half: ['x'] };
	const EXAMPLE = { a: 6, b: 3, x: 4, width: 3, height: 4, r: 2 };

	/** A custom function: "a function called area that takes w and h and returns w * h". */
	function customFunction(t) {
		const m = t.match(/\b(?:function|method)\s+(?:called|named)\s+([a-z_]\w*)\s+(?:that\s+)?(?:takes|accepts|with)\s+([a-z_][\w ,]*?)\s+(?:and\s+)?returns?\s+([a-z0-9_ +\-*/().]+?)\s*$/);
		if (!m) return null;
		const args = fieldList(m[2]).map((a) => snake(a));
		const expr = m[3].trim();
		const names = (expr.match(/[a-z_]\w*/g) || []);
		if (!args.length || args.length > 6 || names.some((n) => !args.includes(n)) || !/^[a-z0-9_ +\-*/().]+$/.test(expr)) return null;
		return { name: m[1], args, expr: expr.replace(/\s+/g, ' '), example: args.map((_, i) => i + 2) };
	}

	// What people ask for, in the order they're tried. Each returns params, or null when it doesn't apply.
	const READ = [
		['fizzbuzz', /\bfizz ?buzz\b/, (t) => ({ n: Math.min(numberIn(t) || 100, 10000) })],
		['hello', /\bhello,? ?world\b|\bsays? hello\b|\bprints? hello\b|\bprint (?:a )?(?:greeting|message)\b/, (t) => ({ msg: quoted(t) || 'Hello, world!' })],
		['guess', /\bguess(?:ing)?(?: the| a)? number\b|\bnumber guessing\b|\bguessing game\b/, (t) => ({ max: numberIn(t) && numberIn(t) > 1 ? Math.min(numberIn(t), 1000000) : 100 })],
		['greet', /\b(?:asks?|reads?|gets?|takes?|inputs?)(?: for| in)? (?:the |a |their |your |my |user'?s? )?name\b|\bgreets? (?:the )?user\b|\buser input\b/, () => ({})],
		['temperature', /\bcelsius\b|\bfahrenheit\b|\btemperature conver/, (t) => ({ value: numberIn(t) == null ? 100 : numberIn(t), toC: /fahrenheit to celsius|f to c\b|from fahrenheit/.test(t) })],
		['factorial', /\bfactorial\b/, (t) => ({ n: Math.min(numberIn(t) == null ? 5 : numberIn(t), 100) })],
		['fibonacci', /\bfibonacci\b|\bfib(?:onacci)? (?:numbers|sequence)\b/, (t) => ({ n: Math.min(numberIn(t) || 10, 150) })],
		['prime', /\bprimes?\b/, (t) => ({ n: numberIn(t) == null ? 29 : Math.min(Math.abs(numberIn(t)), 1e15) })],
		['palindrome', /\bpalindrome\b/, (t, raw) => ({ text: quoted(raw) || 'Racecar' })],
		['reverse', /\brevers(?:e|es|ing)\b.*\b(?:string|word|text|sentence)\b|\b(?:string|word|text) (?:backwards|reversed)\b/, (t, raw) => ({ text: quoted(raw) || 'hello' })],
		['wordcount', /\bcount(?:s|ing)? (?:the |all )?words\b|\bword (?:count|frequenc)|\bhow (?:many|often) (?:each )?words?\b/, (t, raw) => ({ text: quoted(raw) || 'the cat and the hat' })],
		['readfile', /\bread(?:s|ing)? (?:from )?(?:a |the |an? )?(?:text |txt |csv )?file\b|\bread(?:s|ing)? (?:from )?[\w.-]+\.(?:txt|csv|log|md|json|dat)\b|\bopen(?:s|ing)? (?:a |the )?(?:text )?file\b|\bprints? (?:a |the )?file\b/, (t, raw) => ({ file: (raw.match(/[\w.-]+\.(?:txt|csv|log|md|json|dat)\b/i) || [])[0] || 'input.txt' })],
		['writefile', /\bwrit(?:e|es|ing) (?:\S+ )?(?:text |a line |something )?(?:in)?to (?:a |the )?(?:text )?file\b|\bsav(?:e|es|ing) (?:\S+ )?(?:text )?to (?:a |the )?file\b|\bcreat(?:e|es) (?:a )?(?:text )?file\b/, (t, raw) => ({ file: (raw.match(/[\w.-]+\.(?:txt|csv|log|md|json|dat)\b/i) || [])[0] || 'output.txt', text: quoted(raw) || 'Hello, file!' })],
		['server', /\b(?:web ?|http )?server\b|\bserve (?:a )?(?:page|website)\b/, (t) => ({ port: (t.match(/\bport (\d{2,5})\b/) || [])[1] ? +(t.match(/\bport (\d{2,5})\b/) || [])[1] : 8080 })],
		['post', /(?<!blog |a |facebook |instagram )\bpost(?: request)?\b(?! (?:office|card|about))|\bsend(?:s|ing)? (?:json|data)\b|\bsubmit json\b/, (t, raw) => ({ url: (raw.match(/https?:\/\/[^\s'"`]+/) || [])[0] || 'https://api.example.com/users', fields: fieldsOf(withFields(t) || ['name', 'age']) })],
		['get', /\bget request\b|\bhttp get\b|\bfetch(?:es|ing)?\b|\bdownload(?:s|ing)? (?:a |the )?(?:page|url|file|website)\b|\b(?:call|calls|calling) (?:an |the )?api\b|\b(?:make|send|do) (?:an? )?(?:http |web )?request\b|\bhttp request\b|\bget (?:data|json|a page) from\b/, (t, raw) => ({ url: (raw.match(/https?:\/\/[^\s'"`]+/) || [])[0] || 'https://example.com/' })],
		['cls', /\b(?:class|struct|structure|record|object|model|data ?type)\b/, (t, raw) => {
			const m = t.match(/\b(?:class|struct|structure|record|object|model|type)\s+(?:called |named |for (?:an? )?|of (?:an? )?)?(?:an? )?([a-z][a-z_ ]{0,20}?)\s+(?:with|that has|having|containing)\b/) || t.match(/\b(?:an? )?([a-z][a-z_]{0,20})\s+(?:class|struct|record|object|model)\b/);
			const name = m && !/^(?:simple|basic|new|small|little|c|python|rust|java|javascript|js|cpp|html|http)$/.test(m[1].trim()) ? m[1].trim() : (raw.match(/\b(?:class|struct)\s+([A-Z]\w*)/) || [])[1] || 'Person';
			return { name, fields: fieldsOf(withFields(t) || ['name', 'age']) };
		}],
		['table', /\btables?\b/, (t) => ({ fields: fieldsOf(withFields(t) || ['name', 'age', 'city']) })],
		['form', /\bforms?\b/, (t) => ({ fields: fieldsOf(withFields(t) || ['name', 'email', 'message']) })],
		['button', /\bbuttons?\b/, (t, raw) => ({ label: quoted(raw) || 'Click me' })],
		['sort', /\bsort(?:s|ed|ing)?\b/, (t) => ({ nums: numbersIn(t).length >= 2 ? numbersIn(t).slice(0, 50) : [5, 3, 8, 1, 9, 2], desc: /\b(?:desc(?:ending)?|reverse|largest first|biggest first|high(?:est)? to low)\b/.test(t) })],
		['stats', /\b(?:sum|total|average|mean|max(?:imum)?|min(?:imum)?|largest|smallest|biggest)\b.*\b(?:list|array|numbers|values)\b/, (t) => ({ nums: numbersIn(t).length >= 2 ? numbersIn(t).slice(0, 50) : [4, 8, 15, 16, 23, 42] })],
		['count', /\b(?:count(?:s|ing)?|print(?:s|ing)?|list|loop(?:s|ing)?|display)\b.*\b(?:\d+|numbers?)\b/, (t) => {
			const range = t.match(/\b(?:from )?(-?\d+) (?:to|through|thru|until|-) (-?\d+)\b/);
			if (range) return +range[1] <= +range[2] ? { from: +range[1], to: Math.min(+range[2], +range[1] + 100000) } : null;
			const up = t.match(/\b(?:to|up to|until|through) (\d+)\b/);
			return up ? { from: 1, to: Math.min(+up[1], 100000) } : /\bnumbers?\b/.test(t) ? { from: 1, to: 10 } : null;
		}],
		['loop', /\bloop(?:s|ing)? (?:over|through)\b|\bfor each\b|\biterat(?:e|es|ing)\b/, (t, raw) => {
			const m = raw.match(/[:[(]\s*([^\])]+)[\])]?\s*$/);
			const items = m ? fieldList(m[1]) : [];
			return { items: items.length >= 2 ? items.slice(0, 20) : ['apples', 'bread', 'milk'] };
		}],
		['htmlpage', /\b(?:web ?page|website|landing page|home ?page|html page|page|boilerplate|template)\b/, (t, raw) => ({ title: quoted(raw) || ((t.match(/\b(?:called|titled|named|about)\s+([a-z0-9 ]{2,30})$/) || [])[1] || 'My Page').replace(/\b[a-z]/g, (c) => c.toUpperCase()) })],
		['hello', /\b(?:simple|basic|first|starter|hello)\b.*\bprogram\b|\bprogram\b.*\bhello\b/, () => ({ msg: 'Hello, world!' })],
	];

	/** Fields named after "with": "a class Book with title, author and price". */
	function withFields(t) {
		const m = t.match(/\b(?:with|has|having|containing|fields?|columns|inputs) (?:the )?(?:fields? |properties |attributes |columns |inputs )?(?:for )?([a-z][a-z0-9_ ,&+]*?)(?: in [a-z#+]+| using [a-z#+]+)?$/);
		const list = m ? fieldList(m[1]) : [];
		return list.length ? list.slice(0, 12) : null;
	}

	// Signs a message is asking for code, not about numbers or words: "is 29 prime?" is math, "what is a class?" a
	// definition, "what is rust?" a question.
	const ASKS = /\b(?:write|make|create|generate|build|give me|show me|implement|code (?:for|to|that)|program (?:that|to|for)|script (?:that|to|for)|how (?:do|can|would|should) (?:i|you|we)|example of|snippet|can you (?:write|code|make))\b/;
	const CODEY = /\b(?:hello,? ?world|fizz ?buzz|code|program|script|function|method|class|struct|loop|request|server|page|website|form|table|button|file|list|array|string|factorial|fibonacci|primes?|palindrome|sort|guess|fetch|api|json|celsius|fahrenheit)\b/;

	/**
	 * Reads a request for code: { task, lang, params, defaulted } or null. `defaulted` is true when no language was
	 * named (Python is used, or HTML for web pages).
	 */
	function parse(text) {
		const raw = String(text).trim();
		const t = raw.toLowerCase().replace(/[’]/g, "'").replace(/[?!.]+$/, '').replace(/\s+/g, ' ');
		const lang = langOf(t);
		const asks = ASKS.test(t) || /^(?:fizz ?buzz|hello,? ?world)(?: program| code| example)?$/.test(t);
		// Asked for something code-like, or named a language: "fizzbuzz in rust", "reverse a string in c".
		if (!lang && !(asks && CODEY.test(t))) return null;
		// "Write a poem about Python" isn't code: a language named as a topic.
		if (/\b(?:poem|haiku|story|essay|song|limerick|acrostic)\b|\b(?:a|an) (?:birthday |thank you |thank-you )?(?:message|note|letter|card)\b/.test(t) && !/\b(?:code|program|script|function)\b/.test(t)) return null;
		// The task's details without the language: "... returns w * h in rust".
		const tt = t.replace(/\s+(?:in|using|with|for)\s+(?:python3?|javascript|js|node(?:\.?js)?|rust|c\+\+|cpp|c#|c ?sharp|csharp|html5?|http|c)\s*$/, '');
		const fn = customFunction(tt);
		if (fn) return finish('func', lang, fn);
		if (/\b(?:function|method|program|code)\b/.test(t) || lang) {
			for (const [re, name, expr] of OPS) {
				if (!re.test(t)) continue;
				const args = ARGS[name];
				return finish('func', lang, { name, args, expr, example: args.map((a) => EXAMPLE[a]) });
			}
		}
		for (const [task, re, read] of READ) {
			if (!re.test(t)) continue;
			const params = read(tt, raw);
			if (!params) continue;
			return finish(task, lang, params);
		}
		return /\b(?:code|program|script|snippet|function)\b/.test(t) ? { task: null, lang } : null;
	}

	function finish(task, lang, params) {
		const T = TASKS[task];
		let chosen = lang;
		let defaulted = false;
		if (!chosen || !T[chosen]) {
			defaulted = !chosen;
			chosen = chosen && !T[chosen] ? chosen : T.python ? 'python' : T.html ? 'html' : ORDER.find((l) => T[l]);
		}
		return { task, lang: chosen, params: Object.assign({}, T.defaults, params), defaulted };
	}

	/** The languages a task can be written in. */
	const languagesFor = (task) => ORDER.filter((l) => TASKS[task] && TASKS[task][l]);

	/**
	 * Writes the program for a job: { lang, name, code, file, run, title, about, note } or { missing: [languages it
	 * can be written in] } when the task isn't one for that language (a web page in Rust).
	 */
	function write(job) {
		const T = TASKS[job.task];
		if (!T) return null;
		const make = T[job.lang];
		if (!make) return { missing: languagesFor(job.task) };
		const out = make(job.params);
		if (out == null) return { missing: languagesFor(job.task).filter((l) => l !== job.lang) };
		const r = typeof out === 'string' ? { code: out } : out;
		const L = LANGS[job.lang];
		const limit = T.limit && T.limit(job.params);
		return {
			lang: job.lang, name: L.name, fence: L.fence, code: r.code, file: L.file, run: r.run || L.run, project: L.project || null, deps: r.deps || null,
			title: T.title, about: T.about(job.params), note: [r.note, T.note && T.note[job.lang], limit].filter(Boolean).join(' ') || null,
		};
	}

	/** Every task and the languages it can be written in, for help and for tools/check-code.js. */
	const catalog = () => Object.keys(TASKS).map((task) => ({ task, title: TASKS[task].title, languages: languagesFor(task), defaults: TASKS[task].defaults }));

	(root.Omni = root.Omni || {}).onyxCode = { LANGS, ORDER, TASKS, parse, write, langOf, catalog, languagesFor, typeOf };
})(typeof window !== 'undefined' ? window : globalThis);
