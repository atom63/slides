import { CONFIG_GAP_PX, FRAME_PADDING_PX, useSlideConfig } from '../../stores/config-store'

/**
 * Design layout grid overlay for the 1920×1080 slide viewport.
 *
 * Renders the actual CSS Grid that the `Grid` primitive uses under the hood:
 * 12 columns × 8 rows with the current config's gutter and frame margin.
 * The overlay is live — switching padding in the config panel also resizes
 * this visualization so the guide always matches what the templates render.
 */
const COLUMNS = 12
const ROWS = 8

// Static cells — never change, so created once at module load rather than on
// every render. Parent re-renders (slide navigation) would otherwise allocate
// 96 React elements per frame while the grid overlay is open.
const GRID_CELLS = Array.from({ length: COLUMNS * ROWS }, (_, i) => (
  <div className="bg-info/[0.04]" key={`cell-${String(i)}`} />
))

export function SlideLayoutGrid() {
  const configPadding = useSlideConfig(state => state.padding)
  const { px: marginX, py: marginY } = FRAME_PADDING_PX[configPadding]
  const gutter = CONFIG_GAP_PX[configPadding]

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Margin boundary */}
      <div
        className="absolute border border-info/15 border-dashed"
        style={{
          top: marginY,
          left: marginX,
          right: marginX,
          bottom: marginY,
        }}
      />

      {/* 12 × 8 grid (mirrors the real Grid primitive) */}
      <div
        className="absolute"
        style={{
          top: marginY,
          left: marginX,
          right: marginX,
          bottom: marginY,
          display: 'grid',
          gridTemplateColumns: `repeat(${String(COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(ROWS)}, minmax(0, 1fr))`,
          gap: `${String(gutter)}px`,
        }}
      >
        {GRID_CELLS}
      </div>

      {/* Horizontal center line */}
      <div className="absolute top-1/2 left-0 h-px w-full bg-destructive/15" />

      {/* Vertical center line */}
      <div className="absolute top-0 left-1/2 h-full w-px bg-destructive/15" />

      {/* Horizontal thirds */}
      <div
        className="absolute left-0 h-px w-full bg-destructive/[0.07]"
        style={{ top: '33.333%' }}
      />
      <div
        className="absolute left-0 h-px w-full bg-destructive/[0.07]"
        style={{ top: '66.666%' }}
      />

      {/* Grid label — reflects current config */}
      <div className="absolute top-2 left-3">
        <span className="font-mono text-info/30 text-sm uppercase tracking-widest">
          {`${String(COLUMNS)}×${String(ROWS)} · ${String(gutter)}px gutter · ${String(marginX)}/${String(marginY)}px frame`}
        </span>
      </div>
    </div>
  )
}
