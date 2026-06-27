# @atom63/create-deck

Scaffold a standalone presentation deck powered by the [`@atom63/slides`](https://www.npmjs.com/package/@atom63/slides) engine.

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
