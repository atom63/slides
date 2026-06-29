---
name: deck-authoring
description: Authors and reviews MDX presentation decks built with the standalone @atom63/slides engine. Use when a user wants to create, author, build, or edit a presentation, deck, talk, or slides with @atom63/slides — scaffolding a new deck project with `npm create @atom63/deck`, writing or editing `src/deck.mdx`, choosing slide templates, or composing Swiss-design slides in MDX.
---

# Deck Authoring with @atom63/slides

**You are the coding agent in the @atom63/slides workflow.** The toolchain's pitch is *write presentations as MDX, and let a coding agent draft them* — your job is to be that agent: take the user's description of a talk and write the deck as MDX. The user then steers your draft in the browser (editing slides as forms, switching templates, theming in one line), but the MDX you write stays the source of truth.

`@atom63/slides` is a host-agnostic MDX presentation engine: an opinionated template grammar plus token theming for building decks in MDX. Each slide renders onto a fixed **1920×1080** canvas, scaled to fit. The look is **Swiss / International Typographic Style**: hard edges, hairline rules as structure, flush-left type, a single signal color used as a solid block (not a tint), tabular numerals, and a four-glyph shape vocabulary (`▲ ■ ◆ ▼`).

This skill targets the **published OSS package** — you import templates from `@atom63/slides`, scaffold with the `@atom63/create-deck` CLI, and preview with Vite. There is no host app to edit.

## 1. Workflow

```bash
npm create @atom63/deck my-talk     # scaffold a standalone deck project (the create-deck CLI)
cd my-talk
npm install
npm run dev                 # Vite dev server — open the printed localhost URL
```

Then the loop is: **edit `src/deck.mdx` → save → the dev server hot-reloads**. Page through with `←` `→`.

The scaffold already wires everything: Vite + the MDX plugin (frontmatter + GFM), Tailwind v4 with `@source "../node_modules/@atom63/slides/dist/**/*.js"` so the engine's utility classes are generated, and both CSS entrypoints (`@atom63/slides/theme-defaults` for the default theme + `@atom63/slides/styles`). **You do not touch the Vite, Tailwind, or CSS wiring** — author the deck content only.

> Other package managers: `pnpm create @atom63/deck my-talk` / `yarn create @atom63/deck my-talk` also work (pass `--pm pnpm`). `npm create @atom63/deck -- --help` lists `--install` / `--no-install` and `--git` / `--no-git`.

## 2. Deck file anatomy

A deck is the single `src/deck.mdx` file. Three ordered sections:

1. **Frontmatter** — YAML metadata.
2. **Imports** — pull templates and content components **from `@atom63/slides`**.
3. **Slides** — JSX/MDX blocks separated by horizontal rules (`---`).

```mdx
---
title: Design System in Code
date: 2026-04-18
description: A practical workshop on keeping design and implementation aligned.
---

import {
  CoverSlide,
  SectionSlide,
  StatementSlide,
  HeroBento,
  StatBento,
  ClosingSlide,
  TalkTrack,
  Section,
  Subtitle,
  Body,
} from '@atom63/slides'

<CoverSlide title="Design System in Code" eyebrow="Workshop · 2026" credit="You Zhang" />
<TalkTrack>The line the presenter reads out loud — written to be spoken.</TalkTrack>

---

<Section>Introduction</Section>

<SectionSlide number="01" title="Why this matters" />
<TalkTrack>Why we're here, in one breath.</TalkTrack>

---

<!-- …more slides… -->
```

Everything the engine exposes — every template, the layout/typography primitives, `TalkTrack`, `Section`, `SlidesPlayer` — is a **named export of `@atom63/slides`**. Import only what each slide uses.

### Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Deck title; shown in the player chrome. |
| `date` | yes | ISO `YYYY-MM-DD`. |
| `description` | no | One line describing the deck. |

### Slide breaks and metadata markers

Three tags carry **no visual output**; they configure the slide DOM:

- `---` (a literal horizontal rule on its own line) — **the only slide break.** Don't use blank lines or comments to separate slides.
- `<Section>Chapter name</Section>` — sets the folio section label (top-left watermark) for **this slide and every slide after it** until another `<Section>` overrides. Place it *before* the slide it belongs to.
- `<TalkTrack>…</TalkTrack>` — the script the presenter reads aloud. Hidden on stage; surfaced in the talk-track panel. **Write one per slide**, for spoken delivery — no stage directions, build cues, or "remember to mention…". Place it *after* the slide content.

### Markdown shorthand

Plain markdown inside a slide renders through the engine's prose mapping with the same tokens as the JSX primitives — use it for prose-heavy slides:

| Markdown | Renders as | Notes |
|---|---|---|
| `# Heading` | Headline (128px) | One per slide max. |
| `## Heading` | Title (72px) | Usually let a template render the title. |
| `### Heading` | Subtitle (44px) | Cell head inside a bento. |
| `paragraph` | Body (28px, secondary) | |
| `- item` | dash list | |
| `1. item` | numbered list | Renders `01, 02, …` in tabular mono. |
| `**bold**` | strong (foreground, semibold) | |
| `> quote` | serif italic blockquote | For a full-slide pull quote use `<QuoteSlide>`. |
| `` `code` `` | inline mono | |

## 3. Choosing templates

**See [`TEMPLATES.md`](./TEMPLATES.md) for the full catalog** — all 20 templates with every prop, compound-slot schema (`name · min..max · props`), and a minimal MDX example each. It's generated from the live registry, so it never drifts. Pick the **smallest template that fits the content shape**; the template encodes the 12-column alignment and chrome for free.

Quick map (template names link to their entry in `TEMPLATES.md`):

| Need | Template(s) |
|---|---|
| **Cover** / title slide | `CoverSlide` (type-only), `FullBleedCoverSlide` (photo) |
| **Section** divider / chapter break | `SectionSlide` (giant margin numeral; add `imageSrc` for a split) |
| **Statement** / one-line thesis | `StatementSlide` |
| **Quote** | `QuoteSlide`, `QuoteWithMedia` (quote + image) |
| **Bento** content (text + media cards) | `HeroBento`, `MediaTrio`, `TextLead`, `SplitHalf` |
| **Stats** / numbers | `StatBento` (1–6 stats), `SplitWithStat` (text+media+stat strip) |
| **Timeline** / process steps | `TimelineBento` |
| **Media** / imagery | `ImageSlide`, `ImageDuoSlide`, `ImageTrioSlide`, `Collage`, `FullBleedSlide`, `FullBleedGallery` |
| **Closing** / contact | `ClosingSlide` (`website`/`email` auto-link) |

Compound templates use a **slot API**: children like `<HeroBento.Card>` are matched by identity, so order doesn't matter and extra children are ignored. Stay within each slot's `min..max` (see `TEMPLATES.md`).

When no template fits a custom bento, compose on the `Grid` + `Cell` primitives (both exported from `@atom63/slides`) with explicit `colStart`/`colSpan`/`rowStart`/`rowSpan` on a `cols={12} rows={8}` grid. Never reach for a raw `<div className="grid grid-cols-…">` at the slide root.

## 4. Design voice (Swiss / International Typographic Style)

The primitives already encode these defaults — you usually don't fight them:

1. **Hard edges.** Square corners by default everywhere (only `Avatar` stays round). No `rounded-xl` on cards, media, or overlays.
2. **Hairlines as structure.** Prefer `Cell variant="rule"` (top hairline) or `"frame"` over filled plates. Avoid `variant="muted"` unless a cell is genuinely data-dense.
3. **Flush-left by default.** `StatementSlide` / `SectionSlide` / `QuoteSlide` default flush-left. Pass `axis="centered"` only as a deliberate axial beat (a thesis, a silence).
4. **One signal color, used as a solid block — not a tint.** `variant="accent"` resolves to a solid `bg-primary` block with inverted text. Don't introduce `bg-primary/10` washes or `border-primary/20`; for a ghost tone use `text-foreground/XX`. Reserve the signal color for the thing that matters; section numerals and watermark glyphs use `text-foreground/XX`.
5. **Weight contrast > size contrast.** Hierarchy inside a shared size (light vs medium vs semibold) reads more Swiss than bumping `size`. `Title`, `Subtitle`, `Body`, `Display` all take a `weight` prop.
6. **Tabular numerals.** `Display`, `Mono`, `Label`, numbered lists, and stat values are already `tabular-nums`. Don't override — it's what makes stat rows align column-to-column.
7. **One `<Title>` (72px) per slide.** Bento cell heads use `<Subtitle>` (44px) so they don't outcompete the slide title.
8. **Four-glyph shape vocabulary.** `▲` cover/opening · `■` section/content/default · `◆` quote/aside · `▼` closing/fin. Don't mix in `§ ¶` or other glyphs.

### Theming

Theming is **token-driven and controllable** — never hand-write component CSS to restyle a deck. To re-theme, either `@import` one of the built-in themes (after `theme-defaults`, in the Tailwind entry CSS) or override the documented tokens (palette + the three font tokens + `--theme-slide-*`) in your own `:root`. A theme is *only* a `:root` token override; there is no per-theme component code.

```css
@import "@atom63/slides/themes/dark";       /* or: terminal | editorial | neon | bold */
```

## 5. Structure

A deck should read as one authored object, not loose artboards:

1. **Cover** (`CoverSlide` / `FullBleedCoverSlide`).
2. **Section dividers** (`SectionSlide`) opening each chapter; precede them with `<Section>`.
3. **Content** — bentos and splits (`HeroBento`, `StatBento`, `SplitHalf`, `TextLead`, `TimelineBento`).
4. **A quote** (`QuoteSlide`) as a change of pace.
5. **Closing** (`ClosingSlide`).

Rules of thumb: **one idea per slide**; pick the smallest template that fits; write **one `<TalkTrack>` per slide** for spoken delivery; reuse one placeholder asset for every media slot until you have final art, with a clear `alt` like `"Placeholder — replace"`.

## 6. Authoring loop

1. **Outline first** in plain markdown — headlines + one talk-track sentence each, no JSX. This forces thinking in slides, not screens. (For a heavier plan, the `deck-content-brief` skill produces a template-keyed brief that maps mechanically to this MDX.)
2. **Pick templates** per slide from `TEMPLATES.md`.
3. **Drop in placeholder media**, one shared asset for every slot.
4. **Write talk tracks**, one per slide, spoken-voice.
5. **Preview** with `npm run dev`; page through with `←` `→`. Watch for: content crowding the trim/register marks, stat columns not aligning, sections updating in the top-left watermark.
6. **Polish** — tighten kickers, swap placeholders, cut anything that isn't one idea per slide.

## 7. Anti-patterns (don't reintroduce)

- `rounded-xl` on cards, media, or overlays — hard edges are the default.
- `bg-primary/10` / `border-primary/20` tinted signal color — use solid accent or hairline frames.
- `bg-black/45 backdrop-blur-xl` full-bleed overlays — use a solid black plate.
- Center-aligning `StatementSlide` / `SectionSlide` / `QuoteSlide` by default — flush-left is Swiss.
- `<Title>` inside a bento cell, or multiple `<Title>`s on one slide — use `<Subtitle>`.
- Raw `<div className="grid grid-cols-…">` at the slide root — use the `Grid` primitive or a template.
- Hardcoded `px-10 py-12` on slide wrappers — padding is config-driven via `padding`/`gap` props.
- `<TalkTrack>` with stage directions or build cues — write only what the presenter says aloud.
- Importing from internal/host paths — **always import from `@atom63/slides`**.

## Reference

- [`TEMPLATES.md`](./TEMPLATES.md) — the full, generated template catalog (props + slots + examples). Regenerate with `npm run gen`.
