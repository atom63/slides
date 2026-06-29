# deck

A standalone presentation deck powered by the [`@atom63/slides`](https://www.npmjs.com/package/@atom63/slides) engine — a host-agnostic MDX slide runtime with built-in layout templates, prose styling, reveal animations, and token theming.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Running `npm run dev` opens the deck in Present mode. Press **`e`** (or click the Edit button) to open the live MDX editor — edit slides, click template chips, then **Save** (or Cmd/Ctrl-S) to write changes back to `src/deck.mdx`. Production builds (`npm run build`) are present-only; the editor and write-back endpoint are excluded automatically.

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

Set a deck theme in frontmatter (`theme: terminal`, or `dark` / `editorial` / `neon` / `bold`) or pick one live via the in-app Edit → Theme picker.

## Learn more

- `@atom63/slides` on npm: <https://www.npmjs.com/package/@atom63/slides>
- Vite: <https://vite.dev>
- MDX: <https://mdxjs.com>
