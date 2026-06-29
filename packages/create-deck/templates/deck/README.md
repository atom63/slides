# deck

You just scaffolded a presentation deck powered by the [`@atom63/slides`](https://www.npmjs.com/package/@atom63/slides) engine — a host-agnostic MDX slide runtime with built-in layout templates, prose styling, reveal animations, and token theming.

A deck is a single `.mdx` file (`src/deck.mdx`): `---`-separated slides built from ~20 templates. The intended way to fill it: **describe your talk to a coding agent and let it write the MDX**, set a one-line theme, and present. The MDX stays the source of truth.

## 1. Fill it with your agent

Point your coding agent (Claude Code, Cursor, …) at `src/deck.mdx` and the **[deck-authoring skill](https://github.com/atom63/slides/tree/main/skill)** — it packages the deck-file anatomy, the full template catalog (every prop + slot), and the Swiss-design voice. Describe your talk; the agent drafts the slides. You don't hand-write JSX.

## 2. Run + present

```bash
npm install
npm run dev
```

Open the printed local URL — the deck boots straight into **Present mode**: keyboard navigation, grid overview, and presenter PiP. `npm run build` produces a present-only static bundle. Want to hand-nudge a slide in a GUI? See [Optional: in-app editor](#optional-in-app-editor).

## 3. Theme it

Set the look in one line — add a `theme:` to the deck frontmatter (see [Theming](#theming) below). That's the whole steering surface most decks need.

## Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the Vite dev server with HMR            |
| `npm run build`    | Type-check-free production build into `dist/` |
| `npm run preview`  | Preview the production build locally          |
| `npm run typecheck`| Run `tsc` against the app sources             |

## How it works

- **`src/deck.mdx`** — your slides. Each `---` divider starts a new slide. Import
  layout templates (`CoverSlide`, `StatementSlide`, `StatBento`, `ClosingSlide`, …)
  straight from `@atom63/slides`. Plain markdown between dividers renders too.
- **`src/app.tsx`** — wires the compiled MDX deck into `<SlidesPlayer />`.
- **`src/main.tsx`** — mounts the app and imports the two engine CSS entrypoints:
  `@atom63/slides/theme-defaults` (the default theme) and `@atom63/slides/styles`.
- **`src/index.css`** — imports Tailwind and `@source`s the engine's built classes
  from `node_modules/@atom63/slides/dist` so the utilities the templates use get
  generated.

## Authoring slides

Open `src/deck.mdx` and write MDX. A minimal slide:

```mdx
import { CoverSlide } from '@atom63/slides'

<CoverSlide title="My talk" subtitle="An intro" eyebrow="2026" />

---

## A plain markdown slide

- bullets work
- so does `inline code`
```

## Theming

Set a deck theme in frontmatter (`theme: terminal`, or `dark` / `editorial` / `neon` / `bold`); the deck restyles at runtime. The [optional in-app editor](#optional-in-app-editor) also exposes a live theme picker.

## Optional: in-app editor

The main path is agent-authored MDX — the player is all most decks need. If you want a GUI to hand-nudge a slide (edit it as a form, switch its template, pick a theme live), opt into the editor. It's dev-only and excluded from production builds, and adds no new dependencies (it ships inside `@atom63/slides`).

**1. Enable the editor's Vite plugins** in `vite.config.ts` — add them to the top of `plugins: [ ]`:

```ts
import { deckWriteBackPlugin, mdxRawPlugin } from '@atom63/slides/vite'

// plugins: [
//   mdxRawPlugin(),
//   deckWriteBackPlugin({ deckPath: 'src/deck.mdx' }),
//   ...keep mdx(), react(), tailwindcss()
// ]
```

**2. Swap the app shell** in `src/app.tsx`:

```tsx
import { DeckSurface } from '@atom63/slides/editor'
import '@atom63/slides/editor/styles'
import { useState } from 'react'
import deckRaw from './deck.mdx?raw'

async function persist(next: string) {
  await fetch('/__write-deck', { method: 'POST', body: next }) // dev-only endpoint
}

export function App() {
  const [source, setSource] = useState(deckRaw)
  const editable = import.meta.env.DEV // edit only in dev; production = present-only
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <DeckSurface
        source={source}
        onChange={editable ? setSource : undefined}
        onSave={editable ? persist : undefined}
      />
    </div>
  )
}
```

Now `npm run dev` shows an Edit button: edit any slide as a **Form**, switch its **template**, then **Save** (Cmd/Ctrl-S) to write changes back to `src/deck.mdx`. Production builds stay present-only.

## Learn more

- `@atom63/slides` on npm: <https://www.npmjs.com/package/@atom63/slides>
- Vite: <https://vite.dev>
- MDX: <https://mdxjs.com>
