# @atom63/slides

**Write presentations as MDX — and let a coding agent draft them.**

A deck is just a `.mdx` file: `---`-separated slides built from ~20 composable templates (`CoverSlide`, `StatBento`, `QuoteSlide`, `SplitHalf`, …). Because slides are *code*, a coding agent (Claude Code, Cursor, …) can write the whole thing from a one-line description. Then you **steer it in the browser** — edit any slide as a form, switch its template, restyle the deck with a one-line theme. The MDX stays the source of truth the whole way.

> Status: `0.4.x`. The API may shift before `1.0`.

## How it works

1. **Scaffold** — `npm create @atom63/deck my-talk`
2. **Describe it to your agent** — point your coding agent at `src/deck.mdx` and the [deck-authoring skill](skill); say *"a 6-slide talk on X, confident, dark theme."* It writes the MDX.
3. **Steer in the browser** — `npm run dev`, then Edit: tweak any slide as a **form**, switch its **template**, all while the MDX stays canonical.
4. **Theme in one line** — pick a preset from the in-app **theme picker** (or set `theme: terminal` in frontmatter). The whole deck restyles live.
5. **Present** — full-screen player with keyboard nav, grid overview, and presenter PiP.

## A worked example

> **Prompt:** *Short talk introducing @atom63/slides — write presentations as MDX, let a coding agent draft them, tweak in a GUI, theme in one line; confident, minimal, dark/mono.*

…produces a real 5-slide deck — see [`examples/agent-intro/deck.mdx`](examples/agent-intro/deck.mdx). The opening slide:

```mdx
---
title: "Presentations, written by an agent"
theme: terminal
---
import { CoverSlide } from '@atom63/slides'

<CoverSlide
  eyebrow="@atom63/slides"
  title="Presentations, written by an agent"
  subtitle="You describe the talk. A coding agent writes the MDX. You steer it in the browser."
  credit="a worked example"
/>
```

More reference decks (and their prompts) live in [`examples/`](examples).

## Steer it yourself

The agent gets you a first draft; the browser lets you take over without touching code:

- **Form editing** — edit a slide's fields (title, stats, …) in a panel; the MDX is rewritten in place, byte-for-byte except what you changed.
- **Template switch** — change a slide's layout from a dropdown; matching content carries over.
- **Theme picker** — 5 built-in presets (`dark`, `terminal`, `editorial`, `neon`, `bold`), applied at runtime and written to frontmatter so the deck stays portable.

Anything the form can't safely represent stays editable in the raw-MDX **Source** view — one toggle away.

## Quickstart

```bash
npm create @atom63/deck my-talk
cd my-talk
npm install
npm run dev          # edit src/deck.mdx (or have your agent write it)
```

A Vite + React + Tailwind v4 app wired to the engine, with an example deck and the in-app editor.

## Packages

| Package | Description |
| --- | --- |
| [`@atom63/slides`](packages/slides) | The engine: MDX template grammar, token theming, the player, plus `./vite` (deck Vite plugins), `./editor` (the GUI — `DeckSurface`: Present/Edit/Form modes, theme picker), and `./themes` (runtime theme presets) subpath exports. |
| [`@atom63/create-deck`](packages/create-deck) | Scaffolder — `npm create @atom63/deck` bootstraps a standalone deck project (step 1 of the agent workflow). |

Also in the repo: [`skill/`](skill) — the deck-authoring skill that lets a coding agent write decks against the template grammar; [`examples/`](examples) — reference decks with their prompts; [`apps/deck-starter`](apps/deck-starter) — the reference consumer app (what the scaffold produces).

## Develop

This is a [pnpm](https://pnpm.io) workspace:

```bash
pnpm install
pnpm -r build
pnpm -r test          # + pnpm -r lint / typecheck
```

## License

MIT © You Zhang (ATOM63)
