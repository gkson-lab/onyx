# Onyx Agents

Onyx Agents, by GK Labs, is Onyx rebuilt as a system of AI agents that run on your own PC. The models are real
open-weight **Qwen** models served locally by [Ollama](https://ollama.com); "Onyx" is the name and the look. Kimi
(Moonshot AI) is an optional cloud model, off unless you turn it on.

This folder is separate from the Onyx 3 site at the top of the repository, which is unchanged.

**Status: milestone (a) of six.** What exists today is the model layer: tiers, the router, fallbacks, plans and
limits, cost and usage logging, a terminal chat and a small server. Agents, the web app, WhatsApp, SMS and
connectors come in the next milestones. iMessage is not planned: it needs a Mac.

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
pnpm onyx chat       # talk to it in the terminal
pnpm dev             # or run the server on http://127.0.0.1:8787
pnpm test            # 21 tests, no model or network needed
```

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
- **Plans.** Free has Lite and Standard; Pro adds Pro; Max has all four. Each has a daily token limit, enforced on
  the server. `ONYX_PLAN` in `.env` sets the plan of the owner account.
- **Cost.** Local models cost nothing per call. A model with `price: null` is logged with no cost, not a guess.

### Kimi, if you want it

Set `ONYX_CLOUD=on` and `MOONSHOT_API_KEY` in `.env`. Pro and Max then try Kimi first and fall back to local Qwen.
The Kimi model IDs and prices in `tiers.yaml` came from third-party pages, not from Moonshot: run
`pnpm models:sync` to check the IDs, and check the prices against Moonshot's pricing page.

## What has and hasn't been tested

The tests replace the model with a scripted stand-in, so they prove the logic: routing, retries, provider and tier
fallback, plan and limit enforcement, streaming, tool-call assembly. **Nothing here has yet been run against a real
Qwen model**: the machine this was written on cannot install Ollama. The first run on your PC is that test.

## Files

```
config/tiers.yaml            providers, models, tiers, plans, fallback settings
packages/shared/             types shared across the system (zod schemas)
apps/server/src/config.ts    reads tiers.yaml and .env
apps/server/src/db.ts        the database (SQLite now; the queries also run on Postgres)
apps/server/src/models/      provider client, gateway (fallbacks, limits, cost), router
apps/server/src/cli/onyx.ts  terminal: chat, models, tiers
apps/server/src/index.ts     the server
apps/server/test/            tests with a scripted stand-in for the providers
```
