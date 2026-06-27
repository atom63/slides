# @atom63/slides-skill

A repo-local **docs / Claude-Code-plugin source**: an AI-agent skill that teaches an agent to author Swiss-design presentation decks with the standalone [`@atom63/slides`](../packages/slides) engine — the same way a SKILL.md plugin ships authoring guidance to a coding agent.

> This is **not** an npm package. It lives as a top-level `skill/` folder (a private pnpm workspace member only so `scripts/gen-templates.mjs` can resolve `@atom63/slides`). Consume it as docs / a skills-folder source, not via `npm install`.

The skill retargets the internal slide-authoring playbook to the **published OSS package**: agents scaffold a deck with the `@atom63/create-deck` CLI, write `src/deck.mdx` importing templates from `@atom63/slides`, and preview with Vite.

## What's in the box

| File | Purpose |
|---|---|
| `SKILL.md` | The agent skill. YAML frontmatter (`name` + a triggering `description`) plus the authoring playbook: workflow, deck-file anatomy, template selection, Swiss design voice, structure, and anti-patterns. |
| `TEMPLATES.md` | The full template catalog — all 20 templates with every prop, compound-slot schema (`name · min..max · props`), and a minimal MDX example each. **Generated** from the live registry. |
| `scripts/gen-templates.mjs` | Regenerates `TEMPLATES.md` by importing `listTemplates()` from `@atom63/slides`. Keeps the reference accurate and drift-free. |

## Using the skill

Point an agent at `SKILL.md`. Its `description` triggers when a user wants to create, author, or edit a presentation/deck/slides with `@atom63/slides`. The skill links to `TEMPLATES.md` for the full catalog rather than duplicating it inline.

For agent runtimes that load skills from a directory (e.g. Claude Code / Cursor), copy this folder's `SKILL.md` (and the sibling `TEMPLATES.md` it references) into your skills folder.

## Regenerating the template reference

`TEMPLATES.md` is generated from the `@atom63/slides` template registry, so it always matches the published engine:

```bash
npm run gen        # node scripts/gen-templates.mjs → writes TEMPLATES.md
```

Run it whenever the engine adds, removes, or changes a template.

## License

MIT
