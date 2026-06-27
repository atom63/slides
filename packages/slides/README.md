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

The engine uses Tailwind v4 utility classes, so your app's Tailwind build must **scan the engine's classes**, and you import its two stylesheets:

**Your main CSS:**

```css
@import "tailwindcss";

/* Generate the utility classes the engine uses. */
@source "../node_modules/@atom63/slides/dist/**/*.js";
```

**Your entry (`main.tsx`), import order matters — defaults first, then the host can override:**

```ts
import './index.css'
import '@atom63/slides/theme-defaults' // standalone default tokens (light)
import '@atom63/slides/styles'         // reveal animations
```

- `@atom63/slides/theme-defaults` — self-contained default values for every token the player reads, so it renders out-of-the-box. A host that ships its own design tokens (e.g. via a token package) overrides these via later cascade; in that case you can skip this import.
- `@atom63/slides/styles` — the slide reveal animation keyframes.

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
