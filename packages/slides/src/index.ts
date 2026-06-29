export type { SlideGateProvider } from './components/config/password-gate'
export { Section, TalkTrack } from './content/components'
export { slideMdxComponents } from './content/mdx-components'
export * from './content/primitives'
export { Syllabus } from './content/syllabus'
export { syllabusMdxComponents } from './content/syllabus-mdx-components'
export type {
  SlotDef,
  SlotGroupDef,
  SlotKind,
  TemplateCategory,
  TemplateDef,
  TemplateName,
} from './content/template-registry'
export {
  getTemplate,
  listTemplates,
  templateNames,
  templateRegistry,
} from './content/template-registry'
export * from './content/templates'
export type { BuiltinTheme } from './content/themes'
export { BUILTIN_THEMES, resolveTheme } from './content/themes'
export { SlidesPlayer } from './player/slides-player'
export type { SlidesPlayerProps } from './player/slides-player-types'
export type { SlideConfigPadding, SlideConfigTypographyScale } from './stores/config-store'
export {
  CONFIG_GAP_PX,
  FRAME_PADDING_PX,
  SLIDE_FRAME_WATERMARK_PX,
  SlidePaddingContext,
  TYPOGRAPHY_SCALE_VALUES,
  useSlideConfig,
  useSlidePadding,
} from './stores/config-store'
export type { SlideRenderMode } from './stores/render-mode'
export {
  SlideRenderModeContext,
  SyllabusDetectContext,
  useSlideRenderMode,
} from './stores/render-mode'
export type { ParsedSlide, SlideDeckItem, SlideDeckMeta, SlideLayout } from './types'
