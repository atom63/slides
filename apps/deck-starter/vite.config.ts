import mdx from '@mdx-js/rollup'
import { deckWriteBackPlugin, mdxRawPlugin } from '@atom63/slides/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    mdxRawPlugin(),
    deckWriteBackPlugin({ deckPath: 'src/deck.mdx' }),
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
