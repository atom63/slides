import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Demo / dogfooding app for @atom63/slides-editor. The editor compiles deck MDX
// at RUNTIME (via @mdx-js/mdx evaluate), so no @mdx-js/rollup plugin is needed
// here — only React + Tailwind v4.
export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
})
