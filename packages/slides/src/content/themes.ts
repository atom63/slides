export const BUILTIN_THEMES = ['dark', 'terminal', 'editorial', 'neon', 'bold'] as const
export type BuiltinTheme = (typeof BUILTIN_THEMES)[number]

/**
 * Validate and resolve a `theme` value from deck metadata.
 *
 * Returns the theme name if it is one of the {@link BUILTIN_THEMES}, or
 * `undefined` if the value is absent, unknown, or not a string. This is the
 * canonical validation path — use it wherever you'd otherwise write an inline
 * `BUILTIN_THEMES.includes(...)` guard.
 *
 * @example
 * ```ts
 * const theme = resolveTheme(deck.meta)
 * // → 'dark' | 'terminal' | 'editorial' | 'neon' | 'bold' | undefined
 * ```
 */
export function resolveTheme(meta: { theme?: unknown } | undefined): BuiltinTheme | undefined {
  const raw = meta?.theme
  if (typeof raw === 'string' && (BUILTIN_THEMES as readonly string[]).includes(raw)) {
    return raw as BuiltinTheme
  }
  return undefined
}
