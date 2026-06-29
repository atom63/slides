/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { TemplatePicker } from './template-picker'

/**
 * CoverSlide props:  title, subtitle, eyebrow, credit, logo
 * StatementSlide props: kicker, title, subtitle
 *
 * Shared:  title, subtitle  → carried
 * In current but not next: eyebrow, credit, logo  → candidates for dropped
 * The test passes props={{ title: 'X', credit: 'me' }}, so only 'credit' has a
 * non-empty value that isn't in StatementSlide → dropped = ['credit']
 */

test('switching template carries same-name slots and reports dropped ones', () => {
  const onSwitch = vi.fn()
  render(
    <TemplatePicker name="CoverSlide" props={{ title: 'X', credit: 'me' }} onSwitch={onSwitch} />
  )
  fireEvent.change(screen.getByLabelText('Template'), { target: { value: 'StatementSlide' } })
  expect(onSwitch).toHaveBeenCalledTimes(1)
  const [next, mapped] = onSwitch.mock.calls[0]
  expect(next).toBe('StatementSlide')
  expect(mapped.props.title).toBe('X') // title exists in both → carried
  expect(Array.isArray(mapped.dropped)).toBe(true)
  expect(mapped.dropped).toContain('credit') // credit not in StatementSlide → dropped
})

test('the current template is the selected value', () => {
  render(<TemplatePicker name="CoverSlide" props={{}} onSwitch={() => {}} />)
  expect((screen.getByLabelText('Template') as HTMLSelectElement).value).toBe('CoverSlide')
})

test('switching to a template with no shared props drops all non-empty current keys', () => {
  // CoverSlide → QuoteSlide: QuoteSlide has quote, attribution — neither in CoverSlide
  const onSwitch = vi.fn()
  render(
    <TemplatePicker
      name="CoverSlide"
      props={{ title: 'Hello', credit: 'me', eyebrow: 'tag' }}
      onSwitch={onSwitch}
    />
  )
  fireEvent.change(screen.getByLabelText('Template'), { target: { value: 'QuoteSlide' } })
  expect(onSwitch).toHaveBeenCalledTimes(1)
  const [, mapped] = onSwitch.mock.calls[0]
  // title, credit, eyebrow all non-empty and none exist in QuoteSlide
  expect(mapped.dropped).toContain('title')
  expect(mapped.dropped).toContain('credit')
  expect(mapped.dropped).toContain('eyebrow')
  // carried props should have no old keys
  expect(Object.keys(mapped.props)).not.toContain('title')
  expect(Object.keys(mapped.props)).not.toContain('credit')
})

test('switching to same template does not call onSwitch', () => {
  const onSwitch = vi.fn()
  render(<TemplatePicker name="CoverSlide" props={{ title: 'X' }} onSwitch={onSwitch} />)
  fireEvent.change(screen.getByLabelText('Template'), { target: { value: 'CoverSlide' } })
  expect(onSwitch).not.toHaveBeenCalled()
})

test('loss warning appears after switch with dropped slots', () => {
  render(
    <TemplatePicker name="CoverSlide" props={{ title: 'X', credit: 'me' }} onSwitch={() => {}} />
  )
  fireEvent.change(screen.getByLabelText('Template'), { target: { value: 'StatementSlide' } })
  expect(screen.getByRole('status')).toBeInTheDocument()
  expect(screen.getByRole('status').textContent).toMatch(/credit/)
})

test('dismissing the warning removes it', () => {
  render(
    <TemplatePicker name="CoverSlide" props={{ title: 'X', credit: 'me' }} onSwitch={() => {}} />
  )
  fireEvent.change(screen.getByLabelText('Template'), { target: { value: 'StatementSlide' } })
  const warning = screen.getByRole('status')
  expect(warning).toBeInTheDocument()
  const dismiss = screen.getByRole('button', { name: /dismiss/i })
  fireEvent.click(dismiss)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
