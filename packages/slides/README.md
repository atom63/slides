# @atom63/slides

**Write presentations as MDX — and let a coding agent draft them.**

A deck is a `.mdx` file: `---`-separated slides built from ~20 templates. Describe your talk to your coding agent; it writes the MDX — content, layout, and template choice. You restyle the whole deck with a one-line `theme:`, then present. The MDX stays the source of truth the whole way.

The same host-agnostic engine powers the Slides app in [OS63](https://os.atom63.io) and runs standalone anywhere React + Vite + Tailwind v4 do.

### The workflow

1. **Scaffold** — `npm create @atom63/deck my-talk` lays down a standalone deck project.
2. **Author with your agent** — point your coding agent at `src/deck.mdx` and the [deck-authoring skill](#author-with-a-coding-agent), describe the talk; it writes the MDX — content, layout, and template choice.
3. **Theme in one line** — set `theme:` in frontmatter to restyle the whole deck.
4. **Present** — `npm run dev`, then keyboard nav, grid overview, presenter PiP.

Because a deck is just code, the parts machines are good at — layout, alignment, template choice — are an agent's job; the parts you care about — the argument, the words — stay yours. An optional [browser editor](#atom63slideseditor--optional-live-deck-editor) lets you nudge a slide by hand, but it's not the main path.

- **Templates, not div soup** — ~20 composable slide templates (`CoverSlide`, `StatBento`, `HeroBento`, `SplitHalf`, `QuoteSlide`, `FullBleedSlide`, …) plus low-level primitives.
- **Token theming** — every surface reads `--theme-slide-*` (and base) custom properties; swap a token set to restyle a whole deck.
- **Batteries-included player** — keyboard nav, grid overview, presenter PiP, mobile layout, optional source view and password gate.
- **Introspectable** — a machine-readable `templateRegistry` describes every template's content slots, so coding agents, editors, and tooling know exactly what each slide accepts.

> Status: `0.4.x`, extracted from a monorepo. The API may shift before `1.0`.

## Author with a coding agent

Step 2 of the workflow is the point of the whole toolchain: **you don't hand-write JSX, you describe the talk.** A deck is plain MDX — `---`-separated slides importing templates from `@atom63/slides` — which is exactly the shape a coding agent (Claude Code, Cursor, …) writes well.

The **[deck-authoring skill](https://github.com/atom63/slides/tree/main/skill)** ([`skill/SKILL.md`](https://github.com/atom63/slides/tree/main/skill/SKILL.md)) packages everything the agent needs: the deck-file anatomy, the full template catalog with every prop and slot, the Swiss-design voice, and the anti-patterns to avoid. Point your agent at it (copy `SKILL.md` + `TEMPLATES.md` into your skills folder, or reference it directly), describe your talk, and it drafts `src/deck.mdx`. Then open the dev server, set `theme:` to taste, and present — the MDX stays the source of truth. (An [optional browser editor](#atom63slideseditor--optional-live-deck-editor) is there for hand-nudging a slide, but it's not the main path.)

## Install

```bash
npm i @atom63/slides
```

Peer dependencies you must also install:

```bash
npm i react react-dom sonner
```

You also need **Tailwind CSS v4** in the consuming app (the engine ships utility classes, not a pre-compiled stylesheet — see [Styling](#styling)).

## Quick start

A single-deck app needs four things: compile an `.mdx` deck, build a `SlideDeckItem`, render `<SlidesPlayer>`, and wire up styles. (A complete reference app lives at [`apps/deck-starter`](../../apps/deck-starter) in the repo.)

**`vite.config.ts`** — compile MDX with a frontmatter export:

```ts
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      providerImportSource: '@mdx-js/react',
    }) },
    react({ include: /\.(mdx|tsx|jsx)$/ }),
    tailwindcss(),
  ],
})
```

**`app.tsx`** — the player provides the slide components internally; just pass the compiled deck:

```tsx
import { SlidesPlayer } from '@atom63/slides'
import type { SlideDeckItem, SlideDeckMeta } from '@atom63/slides'
import Deck, { frontmatter } from './deck.mdx'

const deck: SlideDeckItem = {
  slug: 'my-talk',
  meta: frontmatter as unknown as SlideDeckMeta,
  content: Deck,
}

export function App() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <SlidesPlayer deck={deck} onBack={() => {}} />
    </div>
  )
}
```

**`deck.mdx`** — frontmatter, then `---`-separated slides:

```mdx
---
title: "My Talk"
date: "2026-01-01"
description: "An example deck."
---

import { CoverSlide, StatementSlide } from "@atom63/slides";

<CoverSlide eyebrow="2026" title="My Talk" credit="You" />

---

<StatementSlide kicker="The point" title="One idea per slide." />

---

## Bare markdown works too

- it renders through the engine's prose components
- including inline `code`
```

## Styling

The engine uses Tailwind v4 utility classes. In your **Tailwind entry CSS**, import its stylesheets and point `@source` at its built classes:

```css
@import "tailwindcss";
@import "@atom63/slides/theme-defaults";   /* tokens + Tailwind @theme color mappings */
@import "@atom63/slides/styles";           /* slide reveal animations */

/* Generate the utility classes the engine uses. */
@source "../node_modules/@atom63/slides/dist/**/*.js";
```

> Import the engine CSS with **CSS `@import`** (in the Tailwind entry), **not** a JS `import` — `theme-defaults` ships a Tailwind `@theme` block that maps the palette into utilities like `text-foreground`/`bg-primary`, and `@theme` is only processed when the file is part of the Tailwind build.

- `@atom63/slides/theme-defaults` — self-contained default values for every token the player reads + the `@theme` color mappings, so it renders out-of-the-box. A host that ships its own design tokens (e.g. via a token package) can skip this import.
- `@atom63/slides/styles` — the slide reveal animation keyframes.

## Theming

Everything is driven by CSS custom properties, so you restyle a deck without touching components. The default is light (`theme-defaults`).

**Swap to a built-in theme** — one extra `@import`, *after* `theme-defaults`, in your Tailwind entry CSS:

```css
@import "tailwindcss";
@import "@atom63/slides/theme-defaults";
@import "@atom63/slides/themes/dark";   /* flips the whole deck to dark */
@import "@atom63/slides/styles";
```

Five themes ship in the box — each is one line, swapped for the `dark` line above:

| Theme | Import | Look |
|---|---|---|
| `dark` | `@import "@atom63/slides/themes/dark";` | Neutral dark, blue signal. |
| `terminal` | `@import "@atom63/slides/themes/terminal";` | Dark monospace; phosphor-green on GitHub-dark greys. |
| `editorial` | `@import "@atom63/slides/themes/editorial";` | Light paper & ink; Cormorant serif, editorial red. |
| `neon` | `@import "@atom63/slides/themes/neon";` | Dark cyber; cyan/magenta on navy. |
| `bold` | `@import "@atom63/slides/themes/bold";` | Dark, charcoal + bright orange, strong Archivo sans. |

> Theme palettes adapted from [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) (MIT).

### Theme contract

A theme is **only** a `:root` override of documented CSS custom properties — a palette, the three font tokens (`--font-sans` for headings/body, `--font-mono` for labels/code, `--font-serif` for quotes), and a few `--theme-slide-*` polish tokens — plus an optional `@import url(...)` for a webfont. **There is no per-theme component code.** This is the controllable surface: to restyle a deck you set or override these tokens, you do **not** write freeform CSS or bespoke components. The complete token set lives in [`src/styles/theme-defaults.css`](./src/styles/theme-defaults.css) — that file is the contract; every built-in theme is just a subset of it overridden. Model a new theme on any of the shipped files in [`src/styles/themes/`](./src/styles/themes/).

**Write your own theme** — override the tokens in your CSS. Most surfaces derive from the base palette via `color-mix`, so a handful of overrides restyle the whole deck:

```css
:root {
  /* base palette — drives slides AND chrome */
  --background: #0b0b10;
  --foreground: #f2f2f5;
  --border: #3a3a42;          /* control / panel borders */
  --primary: #7c5cff;         /* the signal color */

  /* slide-specific knobs (optional) */
  --theme-slide-accent: var(--primary);
  --theme-slide-rule-color: color-mix(in oklch, var(--foreground) 25%, transparent);
  --theme-slide-surface: #1a1a20;   /* card / bento surfaces */
  --theme-slide-quote-color: #d8d8de;
}
```

Key tokens: **base palette** — `--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--primary`, `--primary-foreground`, `--accent`; **slides** — `--theme-slide-bg`, `--theme-slide-accent`, `--theme-slide-rule-color`, `--theme-slide-rule-width`, `--theme-slide-surface`, `--theme-slide-muted`, `--theme-slide-code-bg`, `--theme-slide-quote-color`, `--theme-slide-stage-bg`. The full set lives in [`src/styles/theme-defaults.css`](./src/styles/theme-defaults.css) — copy it as a starting point for a custom theme.

> Runtime light/dark toggle: import `themes/dark` is a hard swap. For a toggle, copy `dark.css` and re-scope its `:root` to e.g. `[data-slides-theme="dark"]`, then set that attribute on a wrapper.

### `theme:` frontmatter and runtime presets

Set `theme:` in frontmatter to any of the five built-in names and the deck restyles at runtime — your agent writes this line, or you change it by hand:

```mdx
---
title: "My Talk"
theme: terminal
---
```

Load the runtime presets once, with a CSS **`@import`** in your Tailwind entry (the same place you import `theme-defaults` and `styles` — a JS import will **not** deliver it):

```css
@import "tailwindcss";
@import "@atom63/slides/theme-defaults";
@import "@atom63/slides/themes";          /* all presets, switched at runtime */
@import "@atom63/slides/styles";
```

`DeckSurface` then reads `meta.theme` at runtime and sets `data-slides-theme="<name>"` on the surface wrapper, so the matching `[data-slides-theme]` rule activates — **no build step required**; the deck restyles live as the `theme:` line changes.

**Present-only consumer path** — if you embed a bare `<SlidesPlayer>` without `DeckSurface`, keep the same `@import "@atom63/slides/themes"` above and set the attribute on a wrapper around the player yourself:

```tsx
import { resolveTheme } from "@atom63/slides"

<div data-slides-theme={resolveTheme(deck.meta)}>
  <SlidesPlayer deck={deck} onBack={onBack} />
</div>
```

The per-theme `:root` imports (`@atom63/slides/themes/dark`, etc.) remain available for a static **build-time hard-swap** where you want a single theme locked in at compile time, without the runtime bundle.

## Authoring

See the reference deck for the full template catalog and slot APIs, and inspect templates programmatically:

```ts
import { templateRegistry, getTemplate, listTemplates } from '@atom63/slides'

getTemplate('StatBento')
// → { name, label, category, props: [...], slots: [{ name: 'Stat', min: 0, max: 6, props: [...] }, ...] }
```

## Subpath exports

Beyond the engine entry (`@atom63/slides`) and the style sheets (`@atom63/slides/styles`, `@atom63/slides/theme-defaults`), two optional subpaths ship in the same package.

### `@atom63/slides/vite` — build-time Vite plugins

For multi-deck apps, the Vite plugins extract MDX frontmatter into a static manifest (so decks code-split into lazy chunks) and make `*.mdx?raw` imports resolve to source even when `@mdx-js/rollup` is active. `vite` is an optional peer dependency — install it only if you use this subpath.

```ts
// vite.config.ts
import { mdxManifestPlugin, mdxRawPlugin } from '@atom63/slides/vite'

export default defineConfig({
  plugins: [mdxManifestPlugin(), mdxRawPlugin() /* …mdx(), react(), tailwindcss() */],
})
```

### `@atom63/slides/editor` — optional live deck editor

> **Optional / experimental.** The main path is agent-authored MDX (see [Author with a coding agent](#author-with-a-coding-agent)); this GUI is a hand-steering escape hatch, not a required part of the workflow, and its API is the least stable in the package.

A GUI deck editor with a live, runtime-compiled preview (no bundler in the loop) and a registry-driven template palette. Import its chrome stylesheet as a side effect.

```tsx
import { DeckEditor } from '@atom63/slides/editor'
import '@atom63/slides/editor/styles'

<DeckEditor source={deckMdxSource} onChange={setSource} />
```

## License

MIT © You Zhang (ATOM63)
