# @atom63/slides

A host-agnostic **MDX slide presentation engine** — write decks in MDX against an opinionated **template grammar**, and re-theme them with CSS custom-property **tokens**. The same engine powers the Slides app in [OS63](https://os.atom63.io) and runs standalone anywhere React + Vite + Tailwind v4 do.

- **Templates, not div soup** — ~20 composable slide templates (`CoverSlide`, `StatBento`, `HeroBento`, `SplitHalf`, `QuoteSlide`, `FullBleedSlide`, …) plus low-level primitives.
- **Token theming** — every surface reads `--theme-slide-*` (and base) custom properties; swap a token set to restyle a whole deck.
- **Batteries-included player** — keyboard nav, grid overview, presenter PiP, mobile layout, optional source view and password gate.
- **Introspectable** — a machine-readable `templateRegistry` describes every template's content slots (for tooling, editors, and agents).

> Status: `0.1.x`, extracted from a monorepo. The API may shift before `1.0`.

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

**Swap to the built-in dark theme** — one extra `@import`, *after* `theme-defaults`, in your Tailwind entry CSS:

```css
@import "tailwindcss";
@import "@atom63/slides/theme-defaults";
@import "@atom63/slides/themes/dark";   /* flips the whole deck to dark */
@import "@atom63/slides/styles";
```

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

### `@atom63/slides/editor` — live deck editor

A GUI deck editor with a live, runtime-compiled preview (no bundler in the loop), a registry-driven template palette, and a light/dark preview toggle. Import its chrome stylesheet as a side effect.

```tsx
import { DeckEditor } from '@atom63/slides/editor'
import '@atom63/slides/editor/styles'

<DeckEditor source={deckMdxSource} onChange={setSource} />
```

## License

MIT © You Zhang (ATOM63)
