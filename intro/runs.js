// The six runs filmed for the trailer, exactly as the app recorded them: each message, the router's decision, every
// model call (with the ones that failed), every tool call and the answer. Times are seconds from the moment the message
// arrived (a fallback is shown at the failure it answered; the app logs it once the retry returns, kept as
// "logged"). They ran on a 4-core processor with no graphics card, which is why they are slow; the page replays them
// faster and says how much faster. Taken from the app's database by a script, not written by hand.
// Together: 6,681 tokens, $0 on the PC, $0.0014 if the same calls had run on a paid host.
export const RUNS = [
	{
		"id": "sam",
		"message": "Remind me to call Sam tomorrow at 9am, and remember that I take my coffee black.",
		"attachment": null,
		"seconds": 330.32,
		"tier": "standard",
		"model": "qwen3:8b",
		"agents": [
			"Onyx Core",
			"Scheduler",
			"Memory"
		],
		"tokens": 3436,
		"hosted": 0.000756,
		"events": [
			{
				"t": 0,
				"kind": "message"
			},
			{
				"kind": "route",
				"start": 0.01,
				"t": 10.55,
				"agent": "router",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 482,
				"chose": "standard",
				"reason": "Adding a simple reminder with a specific time and a personal habit."
			},
			{
				"kind": "call",
				"start": 10.61,
				"t": 41.93,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": false,
				"tokens": 0,
				"error": "its tool call was lost with thinking switched off"
			},
			{
				"kind": "fallback",
				"t": 41.94,
				"agent": "core",
				"type": "retry",
				"from": "ollama/qwen3:8b",
				"to": "ollama/qwen3:8b",
				"reason": "its tool call was lost with thinking off; asked again with thinking on",
				"logged": 250.57
			},
			{
				"kind": "call",
				"start": 41.95,
				"t": 139.71,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": false,
				"tokens": 0,
				"error": "the stream ended with thinking but no answer"
			},
			{
				"kind": "fallback",
				"t": 139.72,
				"agent": "core",
				"type": "retry",
				"from": "ollama/qwen3:8b",
				"to": "ollama/qwen3:8b",
				"reason": "the stream ended with thinking but no answer; try 2 of 3",
				"logged": 250.58
			},
			{
				"kind": "call",
				"start": 140.22,
				"t": 250.53,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 903
			},
			{
				"kind": "delegate",
				"t": 250.6,
				"agent": "core",
				"tasks": [
					{
						"agent": "scheduler",
						"task": "Set reminder for 'Call Sam' at 2026-11-18T09:00:00Z"
					},
					{
						"agent": "memory",
						"task": "Save fact: 'user prefers coffee black'"
					}
				]
			},
			{
				"kind": "start",
				"t": 250.62,
				"agent": "memory",
				"task": "Save fact: 'user prefers coffee black'"
			},
			{
				"kind": "start",
				"t": 250.62,
				"agent": "scheduler",
				"task": "Set reminder for 'Call Sam' at 2026-11-18T09:00:00Z"
			},
			{
				"kind": "call",
				"start": 250.63,
				"t": 286.42,
				"agent": "scheduler",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 525
			},
			{
				"kind": "tool",
				"t": 286.43,
				"agent": "scheduler",
				"tool": "schedule_create",
				"args": {
					"text": "Call Sam",
					"at": "2026-11-18T09:00:00Z",
					"repeat": "none"
				}
			},
			{
				"kind": "result",
				"t": 286.44,
				"agent": "scheduler",
				"tool": "schedule_create",
				"ok": true,
				"result": "Created reminder #6: \"Call Sam\" for Wed, Nov 18, 9:00 AM UTC.",
				"ms": 9
			},
			{
				"kind": "call",
				"start": 286.43,
				"t": 297.5,
				"agent": "memory",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 330
			},
			{
				"kind": "tool",
				"t": 297.51,
				"agent": "memory",
				"tool": "memory_save",
				"args": {
					"fact": "Prefers coffee black"
				}
			},
			{
				"kind": "result",
				"t": 297.53,
				"agent": "memory",
				"tool": "memory_save",
				"ok": true,
				"result": "Saved: Prefers coffee black (stored without an embedding: the embedding model did not answer, so recall for this fact matches words only)",
				"ms": 22
			},
			{
				"kind": "call",
				"start": 297.51,
				"t": 311.07,
				"agent": "scheduler",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 585
			},
			{
				"kind": "done",
				"t": 311.08,
				"agent": "scheduler",
				"output": "Your reminder \"Call Sam\" has been set for Wed, Nov 18, 9:00 AM UTC (UTC).",
				"tokens": 1110
			},
			{
				"kind": "call",
				"start": 311.07,
				"t": 313.53,
				"agent": "memory",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 375
			},
			{
				"kind": "done",
				"t": 313.55,
				"agent": "memory",
				"output": "Prefers coffee black",
				"tokens": 705
			},
			{
				"kind": "call",
				"start": 313.58,
				"t": 330.31,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 718
			},
			{
				"kind": "answer",
				"t": 330.32,
				"text": "Your reminder to call Sam has been set for tomorrow at 9:00 AM. I’ve also noted that you prefer coffee black."
			}
		]
	},
	{
		"id": "pdf",
		"message": "Summarise this in two bullets.",
		"attachment": {
			"name": "Q3-update.pdf",
			"pages": 1,
			"excerpt": "Rua Café, Lisbon: third-quarter update July to September 2026 Sales Revenue was €84,200, up 12% on the second quarter. Saturdays were the busiest day, and pastéis de nata the best seller, at 9,400 sold. Costs"
		},
		"seconds": 58.68,
		"tier": "standard",
		"model": "qwen3:8b",
		"agents": [
			"Onyx Core"
		],
		"tokens": 771,
		"hosted": 0.000186,
		"events": [
			{
				"t": 0,
				"kind": "message"
			},
			{
				"kind": "route",
				"start": 0.01,
				"t": 13.58,
				"agent": "router",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 478,
				"chose": "standard",
				"reason": "Summarizing a one-page document is a standard task requiring minimal complexity."
			},
			{
				"kind": "call",
				"start": 13.6,
				"t": 58.67,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 771
			},
			{
				"kind": "answer",
				"t": 58.68,
				"text": "- **Sales**: Revenue increased by 12% to €84,200, with Saturdays being the busiest day and pastéis de nata the top-selling item at 9,400 units.  \n- **Costs & Expansion**: Costs decreased by 3% due to supplier changes, and a second counter will open at the Ribeira market in November, along with hiring an additional barista for weekends."
			}
		]
	},
	{
		"id": "chickpeas",
		"message": "Three quick dinner ideas with chickpeas",
		"attachment": null,
		"seconds": 93.89,
		"tier": "lite",
		"model": "qwen3:4b-instruct",
		"agents": [
			"Onyx Core"
		],
		"tokens": 828,
		"hosted": 2.5e-05,
		"events": [
			{
				"t": 0,
				"kind": "message"
			},
			{
				"kind": "route",
				"start": 0.01,
				"t": 9.03,
				"agent": "router",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 483,
				"chose": "standard",
				"reason": "The user is asking for simple, quick dinner ideas involving chickpeas, which is a straightforward request that does not require complex reasoning or tools."
			},
			{
				"kind": "call",
				"start": 9.04,
				"t": 26.55,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": false,
				"tokens": 0,
				"error": "the stream ended with nothing in it"
			},
			{
				"kind": "fallback",
				"t": 26.56,
				"agent": "core",
				"type": "retry",
				"from": "ollama/qwen3:8b",
				"to": "ollama/qwen3:8b",
				"reason": "the stream ended with nothing in it; try 2 of 3",
				"logged": 93.82
			},
			{
				"kind": "call",
				"start": 27.05,
				"t": 32.18,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": false,
				"tokens": 0,
				"error": "the stream ended with nothing in it"
			},
			{
				"kind": "fallback",
				"t": 32.19,
				"agent": "core",
				"type": "retry",
				"from": "ollama/qwen3:8b",
				"to": "ollama/qwen3:8b",
				"reason": "the stream ended with nothing in it; try 3 of 3",
				"logged": 93.84
			},
			{
				"kind": "call",
				"start": 33.18,
				"t": 47.6,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": false,
				"tokens": 0,
				"error": "the stream ended with nothing in it"
			},
			{
				"kind": "fallback",
				"t": 47.61,
				"agent": "core",
				"type": "tier",
				"from": "standard",
				"to": "lite",
				"reason": "every model in the standard tier failed",
				"logged": 93.86
			},
			{
				"kind": "call",
				"start": 47.6,
				"t": 93.78,
				"agent": "core",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 828
			},
			{
				"kind": "answer",
				"t": 93.89,
				"text": "Here are three quick dinner ideas with chickpeas:\n\n1. **Chickpea and Veggie Stir-Fry**  \n   Sauté chopped vegetables (like bell peppers, onions, and broccoli) with garlic and a touch of olive oil. Add cooked chickpeas and a splash of soy sauce. Serve over rice or noodles.\n\n2. **Spiced Chickpea and Sweet Potato Bowl**  \n   Roast cubed sweet potatoes and chickpeas with cumin, paprika, and a touch of cayenne. Toss with a drizzle of tahini and lemon juice. Serve with a side of greens or a grain like quinoa.\n\n3. **Chickpea and Spinach Curry**  \n   Sauté onions, garlic, and spinach in a pan. Add canned chickpeas, curry powder, and a bit of coconut milk. Simmer for 5 minutes. Serve with warm bread or over a bed of rice.\n\nThese recipes are simple, nutritious, and use minimal prep time. Let me know if you'd like a version with specific dietary needs (e.g., gluten-free, low-carb)."
			}
		]
	},
	{
		"id": "sunday",
		"message": "Plan a cosy rainy Sunday at home: a slow breakfast, something creative, and an easy dinner.",
		"attachment": null,
		"seconds": 55.78,
		"tier": "standard",
		"model": "qwen3:8b",
		"agents": [
			"Onyx Core"
		],
		"tokens": 664,
		"hosted": 0.000179,
		"events": [
			{
				"t": 0,
				"kind": "message"
			},
			{
				"kind": "route",
				"start": 0.0,
				"t": 12.08,
				"agent": "router",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 486,
				"chose": "standard",
				"reason": "Planning a cozy, simple weekend activity is a standard conversational task requiring no tools or complex reasoning."
			},
			{
				"kind": "call",
				"start": 12.11,
				"t": 55.75,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 664
			},
			{
				"kind": "answer",
				"t": 55.78,
				"text": "Here's a cosy rainy Sunday at home plan:\n\n**Breakfast:**  \n- Slow-cooked eggs with toast and avocado.  \n- Fresh fruit salad with a drizzle of honey.  \n- A warm cup of coffee or tea.  \n\n**Creative Activity:**  \n- Try a new craft or DIY project, like painting, knitting, or building a small garden.  \n\n**Dinner:**  \n- Comforting bowl of creamy tomato soup with crusty bread.  \n- A simple grilled cheese sandwich with a side of roasted vegetables.  \n\nEnjoy the rain and relax!"
			}
		]
	},
	{
		"id": "heat-pump",
		"message": "Explain how a heat pump works, in plain words",
		"attachment": null,
		"seconds": 73.59,
		"tier": "standard",
		"model": "qwen3:8b",
		"agents": [
			"Onyx Core"
		],
		"tokens": 748,
		"hosted": 0.000242,
		"events": [
			{
				"t": 0,
				"kind": "message"
			},
			{
				"kind": "route",
				"start": 0.0,
				"t": 14.83,
				"agent": "router",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 481,
				"chose": "standard",
				"reason": "Explaining a basic concept like how a heat pump works requires a simple, clear explanation without needing tools or deep analysis."
			},
			{
				"kind": "call",
				"start": 14.87,
				"t": 73.58,
				"agent": "core",
				"model": "qwen3:8b",
				"tier": "standard",
				"ok": true,
				"tokens": 748
			},
			{
				"kind": "answer",
				"t": 73.59,
				"text": "A heat pump works by moving heat from one place to another using a refrigerant, which is a special substance that can change between liquid and gas states. Here's a simple breakdown:\n\n1. **Absorbing Heat**: The heat pump absorbs heat from a cooler area, like the outside air in winter or the inside air in summer.\n2. **Refrigerant Cycle**: The refrigerant, in a liquid state, absorbs the heat and turns into a gas. This process happens in a coil outside the building.\n3. **Compressing the Gas**: The gas is then compressed, which increases its temperature. This is done by a compressor.\n4. **Releasing Heat**: The hot gas releases its heat into the warmer area, like the inside of a building in winter or the outside in summer. The refrigerant then cools down and turns back into a liquid.\n5. **Cycling**: The process repeats, continuously moving heat from one place to another without generating heat directly, making it energy-efficient."
			}
		]
	},
	{
		"id": "thank-you",
		"message": "Write a short thank-you note to my neighbour for watering my plants",
		"attachment": null,
		"seconds": 26.72,
		"tier": "lite",
		"model": "qwen3:4b-instruct",
		"agents": [
			"Onyx Core"
		],
		"tokens": 234,
		"hosted": 7e-06,
		"events": [
			{
				"t": 0,
				"kind": "message"
			},
			{
				"kind": "route",
				"start": -0.0,
				"t": 18.26,
				"agent": "router",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 478,
				"chose": "lite",
				"reason": "A simple thank-you note is a short, polite message that requires no tools or complex reasoning."
			},
			{
				"kind": "call",
				"start": 18.28,
				"t": 26.65,
				"agent": "core",
				"model": "qwen3:4b-instruct",
				"tier": "lite",
				"ok": true,
				"tokens": 234
			},
			{
				"kind": "answer",
				"t": 26.72,
				"text": "Dear [Neighbour's Name],\n\nThank you so much for watering my plants while I was away. I truly appreciate your kindness and the care you've shown—my plants are looking much better thanks to you!\n\nWarm regards,  \n[Your Name]"
			}
		]
	}
];
