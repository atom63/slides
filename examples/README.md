# Examples

Reference decks for [`@atom63/slides`](../packages/slides). Each is a complete, rendering `deck.mdx` — the kind of thing a coding agent drafts when you describe a talk. To run one, scaffold a project (`npm create @atom63/deck my-talk`) and drop the example's `deck.mdx` into `src/deck.mdx`, then `npm run dev`.

They double as prompts: the one-line description under each is roughly what you'd say to your coding agent to get that deck.

## Decks

### `agent-intro`

A short talk introducing the toolchain itself — the agent-authored MDX workflow.

- **Prompt:** *Short talk introducing @atom63/slides — write presentations as MDX, let a coding agent draft them, tweak in a GUI, theme in one line; confident, minimal, dark/mono.*
- **Theme:** `terminal` (dark monospace; phosphor-green on GitHub-dark greys).
- **File:** [`agent-intro/deck.mdx`](./agent-intro/deck.mdx)

Run it to see it live — `terminal` is a dark, monospace, phosphor-green look; the whole deck (and the player chrome) restyles from the single `theme: terminal` frontmatter line.
