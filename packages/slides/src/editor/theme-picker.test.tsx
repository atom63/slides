import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { ThemePicker } from './theme-picker'

test('reflects current theme and writes the frontmatter line on change', () => {
  const onChange = vi.fn()
  const src = `---\ntitle: T\n---\n\n<CoverSlide title="x" />\n`
  render(<ThemePicker source={src} theme={undefined} onChange={onChange} />)
  expect((screen.getByLabelText('Theme') as HTMLSelectElement).value).toBe('')
  fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'neon' } })
  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange.mock.calls[0][0]).toContain('theme: neon')
})

test('selecting Default removes the theme line', () => {
  const onChange = vi.fn()
  const src = `---\ntitle: T\ntheme: neon\n---\n\n<CoverSlide title="x" />\n`
  render(<ThemePicker source={src} theme="neon" onChange={onChange} />)
  expect((screen.getByLabelText('Theme') as HTMLSelectElement).value).toBe('neon')
  fireEvent.change(screen.getByLabelText('Theme'), { target: { value: '' } })
  expect(onChange.mock.calls[0][0]).not.toContain('theme:')
})

test('lists all builtin themes plus Default', () => {
  render(<ThemePicker source={''} theme={undefined} onChange={() => {}} />)
  const opts = Array.from((screen.getByLabelText('Theme') as HTMLSelectElement).options).map(
    o => o.value
  )
  expect(opts).toEqual(['', 'dark', 'terminal', 'editorial', 'neon', 'bold'])
})
