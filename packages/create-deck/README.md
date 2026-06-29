# @atom63/create-deck

**Step 1 of the agent workflow.** Scaffold a standalone presentation deck powered by the [`@atom63/slides`](https://www.npmjs.com/package/@atom63/slides) engine — the project your coding agent then fills in.

The pitch: write presentations as MDX and let a coding agent draft them. This CLI lays down the project; you point your agent at `src/deck.mdx` (and the [deck-authoring skill](https://github.com/atom63/slides/tree/main/skill)), describe your talk, and it writes the slides. Then you steer the result in the browser — edit any slide as a form, switch templates, theme in one line.

```bash
npm create @atom63/deck@latest my-deck
# or
pnpm create @atom63/deck my-deck
```

Then:

```bash
cd my-deck
npm install
npm run dev
```

From here the loop is: describe the talk to your coding agent → it drafts `src/deck.mdx` → `npm run dev` and steer in Edit mode → pick a theme → present. The freshly-scaffolded deck's own README walks through it.

## Options

```
npm create @atom63/deck <project-name> -- [options]

  --pm npm|pnpm|yarn       Package manager for install + instructions (default: npm)
  --install / --no-install Install dependencies after scaffolding
  --git / --no-git         Initialize a git repository
  -h, --help               Show help
```

The generated project depends only on the published `@atom63/slides` package — no
private workspace packages, no host design system. Edit `src/deck.mdx` and go.
