# @atom63/slides toolchain

An opinionated **MDX slide engine** and **agent-native toolchain** for building presentation decks. Write slides in MDX against a small, composable **template grammar** (`CoverSlide`, `StatBento`, `HeroBento`, `SplitHalf`, `QuoteSlide`, …), re-theme them with CSS custom-property **tokens**, and present with a batteries-included player (keyboard nav, grid overview, presenter PiP, mobile layout). Every template is introspectable through a machine-readable registry, so editors and AI agents can author decks mechanically — the same engine that powers the Slides app in [OS63](https://os.atom63.io) runs standalone anywhere React + Vite + Tailwind v4 do.

> Status: `0.1.x`. The API may shift before `1.0`.

## Quickstart

Scaffold a standalone deck project:

```bash
npm create @atom63/deck my-talk
cd my-talk
npm install
npm run dev
```

That gives you a Vite + React + Tailwind v4 app wired to the engine, with an example deck you can edit in `src/deck.mdx`.

## Packages

| Package | Description |
| --- | --- |
| [`@atom63/slides`](packages/slides) | Host-agnostic MDX slide presentation engine — template grammar, token theming, and the player. Ships `./vite` (deck Vite plugins — MDX frontmatter manifest + `?raw` virtual module) and `./editor` (GUI deck editor — live MDX preview, template palette, theme toggle) subpath exports. |
| [`@atom63/create-deck`](packages/create-deck) | Scaffolder: `npm create @atom63/deck` bootstraps a standalone deck project. |

The repo also ships reference apps: [`apps/deck-starter`](apps/deck-starter) demonstrates the engine end-to-end against a single MDX deck, and [`apps/editor-demo`](apps/editor-demo) exercises the `@atom63/slides/editor` GUI. The [`skill/`](skill) folder holds the AI-agent skill source for authoring decks against the template grammar (repo docs — not published to npm).

## Develop

This is a [pnpm](https://pnpm.io) workspace. From the repo root:

```bash
pnpm install
pnpm -r build
pnpm -r test
```

`pnpm -r lint` and `pnpm -r typecheck` round out the checks. `pnpm -r` runs in topological dependency order, so the engine builds before its dependents.

## License

MIT © You Zhang (ATOM63)
