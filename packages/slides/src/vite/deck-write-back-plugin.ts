import { writeFile } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import type { Plugin } from 'vite'

export interface DeckWriteBackOptions {
  /** Path (absolute or relative to Vite root) of the deck file to persist to. */
  deckPath?: string
  /** POST endpoint. Default '/__write-deck'. */
  endpoint?: string
}

/** @internal Not part of the public API — use `deckWriteBackPlugin` instead. */
export async function handleWriteBack(
  cfg: { deckPath: string; root: string },
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const abs = isAbsolute(cfg.deckPath) ? cfg.deckPath : resolve(cfg.root, cfg.deckPath)
  const rel = relative(cfg.root, abs)
  if (rel.startsWith('..') || isAbsolute(rel)) {
    return { ok: false, error: 'deck path escapes project root' }
  }
  await writeFile(abs, body, 'utf8')
  return { ok: true }
}

const MAX_BODY = 5_000_000

/** DEV-ONLY plugin: POST <endpoint> writes the request body to the deck file. */
export function deckWriteBackPlugin(options: DeckWriteBackOptions = {}): Plugin {
  const endpoint = options.endpoint ?? '/__write-deck'
  const deckPath = options.deckPath ?? 'src/deck.mdx'
  return {
    name: '@atom63/slides:deck-write-back',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url?.split('?')[0] !== endpoint) return next()
        let body = ''
        for await (const chunk of req) {
          body += chunk
          if (body.length > MAX_BODY) {
            res.statusCode = 413
            res.end()
            return
          }
        }
        const result = await handleWriteBack({ deckPath, root: server.config.root }, body)
        res.statusCode = result.ok ? 200 : 400
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(result))
      })
    },
  }
}
