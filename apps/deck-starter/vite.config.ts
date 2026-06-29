import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'

// Present-first config: compile deck.mdx (with a frontmatter export) and render it.
// The optional in-app editor needs two extra plugins from '@atom63/slides/vite'
// (mdxRawPlugin + deckWriteBackPlugin) — see the create-deck starter README.
export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({ include: /\.(mdx|tsx|jsx)$/ }),
    tailwindcss(),
  ],
})
