import { builtinModules } from 'node:module'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/vite/index.ts', 'src/editor/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'sonner',
    'vite',
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
  ],
  treeshake: true,
})
