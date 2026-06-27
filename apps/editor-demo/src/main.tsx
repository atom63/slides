import '@atom63/slides/theme-defaults'
import '@atom63/slides/styles'
import '@atom63/slides/editor/styles'
import './index.css'
import { DeckEditor } from '@atom63/slides/editor'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const SAMPLE = `---
title: Live Deck Editor
date: 2026-06-26
description: Dogfooding @atom63/slides/editor with a runtime-compiled deck.
---

import { CoverSlide, StatementSlide, StatBento, ClosingSlide } from "@atom63/slides"

<CoverSlide
  title="Live Deck Editor"
  subtitle="Edit the MDX on the right — this preview recompiles at runtime."
  eyebrow="@atom63/slides/editor"
  credit="v0.1"
/>

---

<StatementSlide
  kicker="How it works"
  title="No bundler in the loop."
  subtitle="A browser-safe parser splits frontmatter, imports are stripped, and @mdx-js/mdx evaluates the body with slide components injected via MDX context."
/>

---

<StatBento label="The pipeline" title="Runtime MDX, by the parts">
  <StatBento.Body>
    Bare \`<CoverSlide/>\` resolves with no import because the editor passes
    \`useMDXComponents: () => slideMdxComponents\` to evaluate.
  </StatBento.Body>
  <StatBento.Stat value="1" label="evaluate() call" />
  <StatBento.Stat value="0" label="import resolvers" />
  <StatBento.Stat value="300ms" label="debounce" />
</StatBento>

---

## Plain markdown works too

- Click a template chip to append a new slide
- Toggle the preview theme up top
- Break a tag to see the non-blocking error banner

---

<ClosingSlide
  title="Thanks"
  eyebrow="Q&A"
  website="atom63.io"
  email="hi@atom63.io"
/>
`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ height: '100vh', width: '100vw' }}>
      <DeckEditor source={SAMPLE} />
    </div>
  </StrictMode>
)
