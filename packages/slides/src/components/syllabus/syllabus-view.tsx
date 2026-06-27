import { MDXProvider } from '@mdx-js/react'
import { Link, Printer } from 'lucide-react'
import type { ComponentType } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { slideMdxComponents } from '../../content/mdx-components'
import { syllabusMdxComponents } from '../../content/syllabus-mdx-components'
import type { DeckOutline } from '../../hooks/use-deck-outline'
import { SlideRenderModeContext } from '../../stores/render-mode'
import { Button } from '../primitives'
import './syllabus-print.css'

// Null component for suppressing MDX slide-break separators (---) in reading view.
const Null = () => null

// Merged reading-mode component map for the in-app syllabus panel.
// slideMdxComponents covers slide JSX — all template/layout components return
// null in "web-syllabus" mode so they're invisible in the reading view.
// syllabusMdxComponents overrides HTML tags (h1-h6, p, ul, a, …) with
// document-scale styles appropriate for a reading panel.
// hr is null to suppress MDX "---" slide-break separators.
const panelMdxComponents = {
  ...slideMdxComponents,
  ...syllabusMdxComponents,
  hr: Null,
}

const PRINT_CLONE_ID = 'syllabus-print-clone'
const PRESERVE_TAGS = new Set(['STYLE', 'LINK', 'SCRIPT'])

/**
 * Hide all non-essential body children for printing; returns the hidden
 * elements so they can be restored. Mirrors the resume-app strategy —
 * dodges the presentation chrome / transform-stack mess by
 * pulling the printable subtree to `<body>` and blanking out siblings.
 */
function hideBodyChildren(): HTMLElement[] {
  const hidden: HTMLElement[] = []
  for (const child of Array.from(document.body.children) as HTMLElement[]) {
    if (PRESERVE_TAGS.has(child.tagName)) {
      continue
    }
    child.style.setProperty('display', 'none', 'important')
    hidden.push(child)
  }
  return hidden
}

interface SyllabusViewProps {
  content: ComponentType
  contentVersion?: number
  deckDate: string
  deckDescription?: string
  deckTitle: string
  outline: DeckOutline
  shareUrl?: string
}

/**
 * Reading layout for the syllabus. Renders the deck MDX directly in
 * "web-syllabus" mode so all slide templates return null and only
 * <Syllabus> blocks are visible — with full interactivity (links, hover).
 *
 * Previously used a DOM-clone strategy (cloneNode) but JS event listeners
 * don't fire on cloned nodes inside the presentation surface's CSS containment context,
 * breaking all link interactions.
 */
export function SyllabusView({
  content: Content,
  contentVersion = 0,
  deckTitle,
  deckDescription,
  deckDate,
  outline,
  shareUrl,
}: SyllabusViewProps) {
  const articleRef = useRef<HTMLElement>(null)
  // Set synchronously right before window.print() so this handler only takes
  // over the print when the syllabus initiated it — otherwise another app's
  // print (e.g. the resume) isn't clobbered by the syllabus clone/hide.
  const printRequestedRef = useRef(false)

  // Print pipeline — clone the article into <body> and hide siblings on
  // beforeprint so the browser prints from a flat, untransformed subtree.
  // This sidesteps the presentation overlay's `position:absolute` + transform stack
  // that otherwise confuses paginated layout.
  useEffect(() => {
    let hiddenSiblings: HTMLElement[] = []
    let savedTitle = ''

    const beforePrint = () => {
      // Only own the print when the syllabus's own print button started it.
      if (!printRequestedRef.current) {
        return
      }
      const source = articleRef.current
      if (!source) {
        return
      }
      savedTitle = document.title
      // Chrome / Safari / Firefox use document.title verbatim as the
      // suggested PDF filename, so lead with "Syllabus" to make the
      // file's purpose obvious in the user's downloads folder.
      document.title = `Syllabus — ${deckTitle}`

      const clone = source.cloneNode(true) as HTMLElement
      clone.id = PRINT_CLONE_ID
      // Strip the action button row from the clone — `print:hidden` would
      // also work, but removing the node guarantees no stray spacing on
      // browsers that resolve responsive variants oddly during print.
      for (const el of clone.querySelectorAll<HTMLElement>('[data-syllabus-actions]')) {
        el.remove()
      }
      hiddenSiblings = hideBodyChildren()

      // index.html locks html/body/root to `position:fixed; overflow:hidden`
      // for the SPA chrome. That cap clips printed content to one
      // page. Override here and restore in afterPrint.
      for (const sel of ['html', 'body', '#root']) {
        const el = document.querySelector<HTMLElement>(sel)
        if (!el) {
          continue
        }
        el.style.setProperty('position', 'static', 'important')
        el.style.setProperty('overflow', 'visible', 'important')
        el.style.setProperty('height', 'auto', 'important')
        el.style.setProperty('width', 'auto', 'important')
      }

      document.body.appendChild(clone)
    }

    const afterPrint = () => {
      printRequestedRef.current = false
      const clone = document.getElementById(PRINT_CLONE_ID)
      if (clone) {
        clone.remove()
      }
      for (const el of hiddenSiblings) {
        el.style.removeProperty('display')
      }
      hiddenSiblings = []

      // Restore SPA layout constraints removed in beforePrint.
      for (const sel of ['html', 'body', '#root']) {
        const el = document.querySelector<HTMLElement>(sel)
        if (!el) {
          continue
        }
        el.style.removeProperty('position')
        el.style.removeProperty('overflow')
        el.style.removeProperty('height')
        el.style.removeProperty('width')
      }

      if (savedTitle) {
        document.title = savedTitle
        savedTitle = ''
      }
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [deckTitle])

  const formattedDate = useMemo(() => formatLongDate(deckDate), [deckDate])

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) {
      return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }, [shareUrl])

  const handlePrint = useCallback(() => {
    printRequestedRef.current = true
    window.print()
  }, [])

  return (
    <div
      className="scrollbar-reveal size-full overflow-y-auto bg-muted/25 text-foreground print:bg-white"
      data-syllabus-root
    >
      <article
        className="syllabus-document mx-auto max-w-[40rem] bg-background px-6 py-10 shadow-sm sm:px-8 sm:py-12 print:max-w-none print:bg-white print:px-0 print:py-0 print:shadow-none"
        ref={articleRef}
      >
        <header className="mb-10 border-border/60 border-t-[3px] pt-8 print:mb-8 print:border-t-2 print:pt-6">
          <p className="mb-3 font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-[0.22em]">
            Syllabus
          </p>
          <h1 className="text-balance font-medium text-[1.75rem] text-foreground leading-[1.2] tracking-tight print:text-[1.65rem]">
            {deckTitle}
          </h1>
          {deckDescription && (
            <p className="mt-4 max-w-prose text-pretty text-[0.9375rem] text-muted-foreground leading-[1.65] print:text-[0.9rem]">
              {deckDescription}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground/80 uppercase tracking-wider">
            <span>{formattedDate}</span>
            {outline.totalSlides > 0 && (
              <>
                <span aria-hidden className="text-muted-foreground/40">
                  ·
                </span>
                <span>{outline.totalSlides} slides</span>
              </>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-2 print:hidden" data-syllabus-actions>
            {shareUrl && (
              <Button onClick={handleCopyLink} size="lg" type="button" variant="outline">
                <Link aria-hidden className="size-3.5" />
                Copy link
              </Button>
            )}
            <Button onClick={handlePrint} size="lg" type="button" variant="outline">
              <Printer aria-hidden className="size-3.5" />
              Print
            </Button>
          </div>
        </header>

        <div className="syllabus-prose">
          <SlideRenderModeContext.Provider value="web-syllabus">
            <MDXProvider components={panelMdxComponents}>
              <Content key={contentVersion} />
            </MDXProvider>
          </SlideRenderModeContext.Provider>
        </div>

        <footer className="mt-14 border-border/40 border-t pt-6 text-center text-[11px] text-muted-foreground/55 print:mt-8">
          Designed in Code by You Zhang &copy; ATOM63
        </footer>
      </article>
    </div>
  )
}

function formatLongDate(input: string): string {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) {
    return input
  }
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
