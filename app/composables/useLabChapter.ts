// Which chapter of the landing page is under the viewport's centre line, and how the
// fixed specimen should look there. Sections opt in with `data-chapter="<id>"`.

export interface ChapterConfig {
  label: string
  dark: boolean
  x: number // viewport NDC: -1 left edge … 1 right edge (ignored when the chapter has an anchor)
  scale: number
  presence: number // 0 hidden … 1 fully visible
}

export const CHAPTERS = {
  hero: { label: 'Specimen', dark: false, x: 0.45, scale: 1.15, presence: 1 },
  thesis: { label: 'Thesis', dark: false, x: -0.5, scale: 0.8, presence: 0.75 },
  anatomy: { label: 'Anatomy', dark: false, x: -0.35, scale: 0.6, presence: 0 },
  lifecycle: { label: 'Lifecycle', dark: true, x: 0.45, scale: 1, presence: 1 },
  selection: { label: 'Selection', dark: true, x: 0, scale: 0.5, presence: 0 },
  neurons: { label: 'Neurons', dark: false, x: 0.45, scale: 0.7, presence: 0 },
  treasury: { label: 'Treasury', dark: false, x: -0.45, scale: 0.6, presence: 0 },
  evolution: { label: 'Evolution', dark: false, x: 0.45, scale: 0.6, presence: 1 }, // only inside its lineage slot
  trust: { label: 'Trust', dark: true, x: 0.45, scale: 0.85, presence: 0.9 },
  boundaries: { label: 'Boundaries', dark: false, x: 0, scale: 0.5, presence: 0 },
  operators: { label: 'Operators', dark: false, x: 0, scale: 0.5, presence: 0 },
  canvas: { label: 'Canvas', dark: true, x: -0.4, scale: 0.7, presence: 0 },
  roadmap: { label: 'Roadmap', dark: false, x: 0, scale: 0.5, presence: 0 },
  faq: { label: 'FAQ', dark: false, x: 0, scale: 0.5, presence: 0 },
  cta: { label: 'Waitlist', dark: true, x: 0.5, scale: 1.0, presence: 1 },
} satisfies Record<string, ChapterConfig>

export type ChapterId = keyof typeof CHAPTERS
export const CHAPTER_IDS = Object.keys(CHAPTERS) as ChapterId[]

export const LIFECYCLE_STAGES = ['Birth', 'Heartbeat', 'Metabolism', 'Escalation', 'Reproduction', 'Death'] as const

export function useLabChapter() {
  return {
    active: useState<ChapterId>('lab-chapter', () => 'hero'),
    /** Lifecycle stage index 0…5 while the sticky lifecycle chapter is on screen. */
    stage: useState<number>('lab-stage', () => 0),
    /** Thesis row being hovered (e.g. 'metabolism'), steers the specimen. */
    focus: useState<string | null>('lab-focus', () => null),
    /** Kill switch demo: specimen flatlines while true. */
    killed: useState<boolean>('lab-killed', () => false),
  }
}

/** One observer for every [data-chapter] section; call from onMounted, returns cleanup. */
export function observeChapters(root: ParentNode = document) {
  const { active } = useLabChapter()
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.chapter as ChapterId | undefined
        if (e.isIntersecting && id && id in CHAPTERS) active.value = id
      }
    },
    { rootMargin: '-50% 0px -50% 0px' },
  )
  root.querySelectorAll('[data-chapter]').forEach((el) => io.observe(el))
  return () => io.disconnect()
}
