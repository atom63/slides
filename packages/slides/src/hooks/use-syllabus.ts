import { type RefObject, useLayoutEffect, useState } from 'react'

export interface SyllabusSnapshot {
  hasSyllabus: boolean
}

const EMPTY: SyllabusSnapshot = { hasSyllabus: false }
const HAS: SyllabusSnapshot = { hasSyllabus: true }

/**
 * Returns whether the deck contains a non-empty `<Syllabus>` block.
 * The actual node cloning is handled by `<SyllabusView>`, which reads from
 * the same `sourceRef`. Keeping this hook cheap means it can drive UI
 * affordances like "hide the syllabus toggle when there's nothing to show"
 * without holding stale DOM references across HMR.
 */
export function useSyllabus(
  sourceRef: RefObject<HTMLDivElement | null>,
  generation = 0
): SyllabusSnapshot {
  const [snapshot, setSnapshot] = useState<SyllabusSnapshot>(EMPTY)

  // biome-ignore lint/correctness/useExhaustiveDependencies: generation is an explicit invalidation trigger
  useLayoutEffect(() => {
    const container = sourceRef.current
    if (!container) {
      return
    }

    const root = container.querySelector('[data-slide-syllabus]')
    const has = root !== null && root.children.length > 0

    setSnapshot(prev => {
      if (prev.hasSyllabus === has) return prev
      return has ? HAS : EMPTY
    })
  }, [sourceRef, generation])

  return snapshot
}
