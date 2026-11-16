# Onyx Agents

Onyx Agents, by GK Labs, is Onyx rebuilt as a system of AI agents that run on your own PC. The models are real
open-weight **Qwen** models served locally by [Ollama](https://ollama.com); "Onyx" is the name and the look. Kimi
(Moonshot AI) is an optional cloud model, off unless you turn it on.

This folder is separate from the Onyx 3 site at the top of the repository, which is unchanged.

**Status:** built: the model layer, the agent runtime with subagents, tools, reminders, MCP connectors, the web
app, WhatsApp, SMS, sign-in and push notifications. iMessage is not planned: it needs a Mac.

## Run it

You need [Node 22.13 or newer](https://nodejs.org), [pnpm](https://pnpm.io) and [Ollama](https://ollama.com).

```bash
# 1. The models (about 36 GB of downloads in all; start with the first two if you want to try it sooner)
ollama pull qwen3:4b
ollama pull qwen3:8b
ollama pull qwen3:14b
ollama pull qwen3:30b

# 2. Onyx
cd agents
pnpm install
cp .env.example .env
pnpm models:sync     # checks every model in config/tiers.yaml against what Ollama really has
pnpm build           # builds the web app (once, and again after pulling changes)
pnpm start           # the server and the app, on http://127.0.0.1:8787
pnpm onyx chat       # or talk to it in the terminal
pnpm test            # 45 tests, no model or network needed
```

Optional: `ollama pull qwen3-embedding:0.6b` lets Memory recall by meaning, not only by matching words. The Coder's
sandbox needs [Docker Desktop](https://www.docker.com/products/docker-desktop/) running; without it the Coder says
the code was not run.

Onyx only runs while this PC is on and Ollama is running.

## Tiers

`config/tiers.yaml` maps each tier to a model. Edit it to swap models; no code changes.

| Tier | Used for | Default model |
|---|---|---|
| Lite | routing, quick replies, formatting | `qwen3:4b` |
| Standard | normal chat, summaries | `qwen3:8b` |
| Pro | coding, tool use, planning | `qwen3:14b` |
| Max | hardest reasoning, with thinking on | `qwen3:30b` |

On a PC with 32 GB of memory all four fit, one at a time. Without a graphics card the larger two are slow: expect
a wait of many seconds before `qwen3:30b` starts answering. If that is too slow, point Max at `qwen3:14b`.

- **Router.** The Lite model reads each message and picks a tier through a tool call. The decision and its reason
  are logged and shown. Start a message with `/lite`, `/standard`, `/pro`, `/max` or `/think` to choose yourself.
- **Fallbacks.** A failed call is retried, then the next model in the tier is tried, then the tier below. Each step
  is logged and printed. If nothing answers, you get an error listing everything that was tried.
- **No limits.** Everything is local, so every tier is open and tokens are only counted (Usage screen).
- **Billing, if you ever charge.** Set `billing: { enabled: true }` in `tiers.yaml` and each account's plan decides
  its tiers and daily tokens (Free: Lite and Standard; Pro adds Pro; Max: all four). `GET /api/billing` reports what
  each account used this month and what it cost you; `PUT /api/billing/users/:id` sets a plan. Taking payment is not
  built: point a payment provider's webhook at that route when you need it.
- **Cost.** Local models cost nothing per call. A model with `price: null` is logged with no cost, not a guess.

### Kimi, if you want it

Set `ONYX_CLOUD=on` and `MOONSHOT_API_KEY` in `.env`. Pro and Max then try Kimi first and fall back to local Qwen.
The Kimi model IDs and prices in `tiers.yaml` came from third-party pages, not from Moonshot: run
`pnpm models:sync` to check the IDs, and check the prices against Moonshot's pricing page.

## Agents

Onyx Core receives every message. The Lite model routes it; Core answers quick things itself and hands the rest to
specialists, several at once when the task has parts. Every agent runs the same loop: ask the model, run the tools
it calls, show it the results, repeat.

| Agent | Tier | Tools |
|---|---|---|
| Onyx Core | set by the router | delegate, memory search, calculate |
| Researcher | Pro | web search, web fetch |
| Coder | Pro | run code in a sandbox |
| Scheduler | Standard | create, list and cancel reminders |
| Messenger | Lite | fit a message to a channel |
| Memory | Lite | save and recall facts about you |

Limits that are enforced, not advisory: a cap on steps (the last step gets no tools, so the agent must answer), a
token budget shared down the tree, a time budget, three levels of subagents, and a stop button that reaches every
child. Edit any agent, or add your own, on the Agents screen.

- **Web search** uses Brave Search when `BRAVE_API_KEY` is set. Without a key it reads DuckDuckGo's HTML page, which
  needs no account but can change or refuse without notice.
- **Code** runs in a Docker container with no network, a read-only filesystem, no access to this PC's files, 256 MB
  and 30 seconds.
- **Reminders** fire through your preferred channel. If the PC was off when one was due, it is sent when the PC is
  back, marked late; a repeating one then moves to its next time in the future.
- **Connectors** are MCP servers listed in `config/connectors.yaml`. GitHub is there, switched off: set
  `enabled: true`, put a fine-grained token in `GITHUB_MCP_TOKEN`, and tick `connector:github` in an agent's tools.
  It uses GitHub's read-only address by default.

## From your phone

- **WhatsApp** (Meta's official Cloud API) and **SMS** (Twilio): see `SETUP_WHATSAPP.md` and `SETUP_SMS.md`. Both
  need a tunnel to this PC, because the providers deliver your texts to a public address.
- **Who gets in.** Only numbers on the allowlist, and only after the number is linked: Onyx shows a six-digit code
  and you text it from that phone. Everyone else is ignored without a reply. Every webhook is checked against the
  provider's signature first, and one number can send at most 20 messages in five minutes.
- **Onyx texting first.** Reminders go to your preferred channels in order and end with the app. On WhatsApp,
  outside 24 hours of your last message, only an approved template can be sent.
- **The app on your phone.** Open your tunnel's address, sign in, and add it to the Home Screen. Settings has a
  button to turn notifications on for that device.
- **Sign-in.** From this PC the app needs no password. Anything arriving through a tunnel needs `ONYX_PASSWORD`;
  with no password set, the server refuses everything that isn't this PC.

## The app

Nine screens: Chat, Agent graph, Runs, Agents, Channels, Connectors, Models, Usage, Settings. Everything shown is
read from the database or the live event stream; there is no sample data. The server listens on this PC only
(127.0.0.1); a tunnel running on this PC is what makes it reachable from your phone.

The look is defined in one file, `apps/web/app/tokens.css`, with the reason for each decision. It follows the
[antislop UI rules](https://github.com/miqdadbadjuber/anti-slop): one accent, no gradients, glow, blur or shadows,
flat rows instead of nested cards, motion only for real state, and empty states that say what to do next.

## What has and hasn't been tested

The tests replace the model with a scripted stand-in, so they prove the logic: routing, retries, provider and tier
fallback, plan and limit enforcement, streaming, tool-call assembly, the agent loop, delegation, budgets, the kill
switch, reminders, delivery fallback, connectors and the API. The app was driven in a browser against the real
server with a stand-in model, at desktop and phone sizes.

**Nothing here has yet been run against a real Qwen model, a real Docker sandbox, a live web search, a real MCP
server, Meta, Twilio or a real push service**: the machine this was written on has none of them. The first run on your PC is that test. The part most
likely to need adjusting is how reliably the smaller Qwen models call tools.

## Files

```
config/tiers.yaml             providers, models, tiers, plans, fallback settings
config/connectors.yaml        MCP servers agents can use
packages/shared/              types shared across the system (zod schemas)
apps/server/src/config.ts     reads tiers.yaml and .env
apps/server/src/db.ts         the database (SQLite now; the queries also run on Postgres)
apps/server/src/models/       provider client, gateway (fallbacks, limits, cost), router
apps/server/src/agents/       the runtime (loop, subagents, budgets, kill switch) and the built-in agents
apps/server/src/tools/        built-in tools, the tool registry, MCP connectors
apps/server/src/channels/     channel adapters (web, WhatsApp, SMS), delivery with fallback, formatting
apps/server/src/push.ts       push notifications for the installed app
apps/server/src/scheduler.ts  fires reminders
apps/server/src/bus.ts        the event stream
apps/server/src/index.ts      the server: API, WebSocket, and the built app
apps/server/src/cli/onyx.ts   terminal: chat, models, tiers
apps/server/test/             tests with a scripted stand-in for the models
apps/web/                     the app (Next.js, exported as static files the server serves)
apps/web/app/tokens.css       the design tokens
```
