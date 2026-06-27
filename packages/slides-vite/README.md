# @atom63/slides-vite

Vite plugins for [`@atom63/slides`](https://github.com/atom63/slides/tree/main/packages/slides) decks. Two small, focused plugins that make MDX-authored slide decks build cleanly:

- **`mdxManifestPlugin`** — scans one or more content directories for `.mdx`
  files, extracts their [gray-matter](https://github.com/jonschlinkert/gray-matter)
  frontmatter, and writes a typed `manifest.gen.ts`. This decouples deck
  _metadata_ from MDX module loading, so the bundler can code-split each deck
  into its own lazy chunk and the deck picker can list decks without importing
  them. In dev it regenerates the manifest when a deck `.mdx` is added or edited.
- **`mdxRawPlugin`** — a `pre` plugin that makes `import src from './deck.mdx?raw'`
  return the raw MDX source string. Vite's built-in `?raw` doesn't work here
  because `@mdx-js/rollup` strips the query and compiles every `.mdx` to a
  component; this plugin routes `*.mdx?raw` through a virtual module so you get
  the source text (handy for a "view source" panel).

## Install

```sh
pnpm add -D @atom63/slides-vite
```

`vite` is a peer dependency (`^5 || ^6 || ^7`).

## Usage

In a multi-deck app's `vite.config.ts`:

```ts
import mdx from "@mdx-js/rollup";
import { mdxManifestPlugin, mdxRawPlugin } from "@atom63/slides-vite";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Generate a typed manifest from deck frontmatter. Defaults to
    // src/content/slides → src/content/slides/manifest.gen.ts; pass an
    // array of { contentDir, outputPath } to scan multiple content roots.
    mdxManifestPlugin([
      {
        contentDir: "src/content/slides",
        outputPath: "src/content/slides/manifest.gen.ts",
      },
    ]),
    // Must come before the MDX plugin so it can intercept `*.mdx?raw`.
    mdxRawPlugin(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      providerImportSource: "@mdx-js/react",
    }),
    react(),
  ],
});
```

### `mdxManifestPlugin(configs?)`

| Option       | Type     | Description                                         |
| ------------ | -------- | --------------------------------------------------- |
| `contentDir` | `string` | Content directory, relative to the project root.    |
| `outputPath` | `string` | Manifest file to write, relative to the root.       |

Each `contentDir` is scanned at the top level and one level of subdirectories,
so you can group decks into folders. The generated manifest maps each deck's
slug to its frontmatter object and is committed as the build input. Defaults to
a single slides config when called with no arguments.

### `mdxRawPlugin()`

No options. Register it with `enforce: "pre"` behavior (built in) ahead of your
MDX plugin.

## License

MIT
