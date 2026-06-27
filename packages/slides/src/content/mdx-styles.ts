/**
 * MDX STYLES - Consolidated style definitions
 * Extracted to separate file to avoid circular dependencies
 *
 * IMPORTANT: Two styling paths exist for MDX elements:
 *
 * 1. Component mapping (mdxComponents) — applies to markdown syntax (e.g. ![alt](src))
 *    and lowercase HTML tags that MDX routes through the provider. Styles live in
 *    `mdxStyles.content.*` and are applied via `cn()` in each component.
 *
 * 2. Root selectors (below) — apply to raw JSX written directly in MDX files
 *    (e.g. <figure><video ... /></figure>). These bypass the component mapping,
 *    so styles must be applied via descendant selectors on the root wrapper.
 *
 * When changing spacing/styles for media or figures, update BOTH paths or the
 * styling will be inconsistent between markdown syntax and raw JSX usage.
 */

export const mdxStyles = {
  // wrapper you put around MDX content container (highly recommended)
  // Note: .not-mdx, .example-container, and .component-preview will opt-out of all typography styles
  root: [
    'mdx text-foreground',
    // Raw JSX figures bypass component mapping — must style via root selectors
    '[&_figure]:my-8 [&_figure:first-child]:mt-0 [&_figure:last-child]:mb-0 sm:[&_figure]:my-10',
    '[&_figure>video]:mt-0 [&_figure>video]:w-full [&_figure>video]:rounded-lg [&_figure>video]:border [&_figure>video]:border-border',
    '[&_figure>img]:mt-0 [&_figure>img]:w-full [&_figure>img]:rounded-lg',
    '[&_figure>iframe]:w-full [&_figure>iframe]:rounded-lg [&_figure>iframe]:border [&_figure>iframe]:border-border',
    '[&_figure>figcaption]:mt-3 [&_figure>figcaption]:text-center [&_figure>figcaption]:text-sm [&_figure>figcaption]:text-muted-foreground [&_figure>figcaption]:leading-relaxed',
    // Reset only the live demo wrapper; rendered components keep their own internal rhythm.
    '[&_.example-container_.not-mdx]:!m-0',
    '[&_.not-mdx:not(.example-container):not(.callout):not(.mdx-page-meta):not(.mdx-page-nav):not([data-media])]:!m-0',
    '[&_.not-mdx>a]:!no-underline',
    '[&>.callout+.callout]:mt-4',
    '[&_.foundation-preview_p]:!m-0 [&_.foundation-preview_p]:![font-size:unset] [&_.foundation-preview_p]:![line-height:unset]',
    // .example-container — MDX typography is suppressed via React Context (useMdxStyle hook),
    // so no CSS overrides are needed here. Components inside control their own styles.
  ].join(' '),

  spacing: {
    component: 'my-5 first:mt-0 last:mb-0',
    media: 'my-8 first:mt-0 last:mb-0 sm:my-10',
    mediaLg: 'my-12 first:mt-0 last:mb-0 sm:my-16',
    mediaSm: 'my-6 first:mt-0 last:mb-0',
  },

  headings: {
    h1: 'text-4xl font-semibold tracking-tight scroll-mt-24 mt-10 first:mt-0 sm:text-5xl',
    h2: 'text-2xl font-semibold tracking-tight scroll-mt-24 mt-10 first:mt-0 sm:text-3xl',
    h3: 'text-xl font-semibold tracking-tight scroll-mt-24 mt-8 first:mt-0 sm:text-2xl',
    h4: 'text-lg font-semibold tracking-tight scroll-mt-24 mt-6 first:mt-0',
    h5: 'text-base font-semibold scroll-mt-24 mt-6 first:mt-0',
    h6: 'text-sm font-semibold text-secondary-foreground scroll-mt-24 mt-6 first:mt-0',
  },

  text: {
    paragraph:
      'text-base text-secondary-foreground leading-relaxed mt-4 first:mt-0 last:mb-0 [&_a]:underline [&_a]:underline-offset-4',
    lead: 'text-lg text-secondary-foreground leading-relaxed mt-4 first:mt-0',
    small: 'text-sm text-secondary-foreground leading-relaxed',
  },

  content: {
    // links
    link: 'font-normal underline underline-offset-4 decoration-2 decoration-foreground/30 hover:decoration-foreground/70 transition-colors',

    // emphasis
    strong: 'font-semibold text-foreground',
    em: 'italic',
    del: 'line-through text-secondary-foreground',
    ins: 'underline decoration-green-500/70',

    // inline code
    inlineCode:
      'rounded-xs bg-muted/50 px-1 py-0.5 font-mono text-xs leading-snug font-medium text-foreground ring-[0.5px] ring-inset ring-accent',

    // code blocks (pre)
    pre: 'overflow-x-auto rounded-lg border border-border bg-card p-4 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:font-normal [&_code]:leading-relaxed [&_code]:ring-0 [&_code]:text-sm',
    code: 'font-mono text-sm leading-relaxed font-normal', // used inside <pre><code>

    // blockquote
    blockquote:
      'mt-6 border-l-4 border-border bg-muted/50 px-4 py-3 text-base italic text-secondary-foreground rounded-r [&_p]:mt-2 [&_p:first-child]:mt-0',

    // lists
    ul: 'mt-4 list-disc space-y-2 pl-4 [&_ul]:mt-2 [&_ul]:space-y-2 [&_ul]:pl-4 [&_a]:underline [&_a]:underline-offset-4',
    ol: 'mt-4 list-decimal space-y-2 pl-4 [&_ol]:mt-2 [&_ol]:space-y-2 [&_ol]:pl-4 [&_a]:underline [&_a]:underline-offset-4',
    li: 'text-base leading-relaxed text-secondary-foreground',

    // hr
    hr: 'my-8 border-t border-border sm:my-10',

    // kbd
    kbd: 'inline-flex h-6 select-none items-center gap-1 rounded-lg border border-border bg-muted px-2 font-mono text-xs font-medium text-secondary-foreground',

    // tables (wrap recommended)
    tableWrapper:
      'mdx-table-wrapper mt-6 w-full overflow-x-auto rounded-lg border border-border bg-background sm:mt-8',
    table: 'w-full border-collapse text-sm [&_code]:text-xs',
    thead: 'bg-muted',
    tbody: '[&_tr:last-child]:border-0',
    tr: 'border-b border-border hover:bg-muted/40 transition-colors',
    th: 'h-9 px-3 text-left align-middle font-semibold text-foreground',
    td: 'px-3 py-2 align-middle text-secondary-foreground',
    caption: 'mt-3 text-xs text-secondary-foreground',

    // media — vertical rhythm aligned with spacing.media / mediaLg tokens
    img: 'my-8 rounded-lg first:mt-0 last:mb-0 sm:my-10',
    figure: 'my-8 first:mt-0 last:mb-0 sm:my-10',
    figcaption: 'mt-3 text-center text-sm text-muted-foreground leading-relaxed',
    iframe: 'my-8 first:mt-0 last:mb-0 w-full rounded-lg border border-border sm:my-10',
    video: 'my-8 first:mt-0 last:mb-0 w-full rounded-lg border border-border sm:my-10',
    audio: 'my-8 first:mt-0 last:mb-0 w-full sm:my-10',

    // details/summary
    details:
      'mt-6 rounded-lg border border-border bg-card p-4 [&>*:first-child:not(summary)]:mt-0 [&>summary+*]:mt-3',
    summary:
      'cursor-pointer select-none font-semibold text-foreground [&::-webkit-details-marker]:hidden',

    // misc semantics
    mark: 'rounded-sm bg-yellow-200 px-1 text-foreground dark:bg-yellow-800/60',
    sub: 'text-xs align-sub',
    sup: 'text-xs align-super',
    abbr: 'cursor-help border-b border-dotted border-secondary-foreground',
    cite: 'italic text-secondary-foreground',
    dfn: 'font-semibold',
    time: 'text-secondary-foreground',
    var: 'font-mono italic',
    samp: 'rounded-lg bg-muted px-1 font-mono text-xs',
    output: 'rounded-lg border border-border bg-muted px-2 py-1 font-mono text-xs',
  },

  layout: {
    callout: {
      base: 'my-4 rounded-lg border p-4 first:mt-0 last:mb-0 sm:my-5 [&_p]:mt-2 [&_p]:text-base [&_p]:leading-relaxed [&_p:first-child]:mt-0',
      info: 'border-blue-500/40 bg-blue-50/60 text-blue-950 dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-50',
      warning:
        'border-yellow-500/40 bg-yellow-50/60 text-yellow-950 dark:border-yellow-500/40 dark:bg-yellow-950/40 dark:text-yellow-50',
      error:
        'border-red-500/40 bg-red-50/60 text-red-950 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-50',
      success:
        'border-green-500/40 bg-green-50/60 text-green-950 dark:border-green-500/40 dark:bg-green-950/40 dark:text-green-50',
    },
  },
} as const

export type CalloutType = 'info' | 'warning' | 'error' | 'success'
