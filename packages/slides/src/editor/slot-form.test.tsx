/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { SlotForm } from './slot-form'

test('renders a field per template slot from the registry and emits changes', () => {
  const onChange = vi.fn()
  render(<SlotForm name="CoverSlide" props={{ title: 'Hello' }} onChange={onChange} />)
  const title = screen.getByLabelText('Title') as HTMLInputElement
  expect(title.value).toBe('Hello')
  fireEvent.change(title, { target: { value: 'Bye' } })
  expect(onChange).toHaveBeenCalledWith('title', 'Bye')
})

test('empty prop renders an empty field (not undefined)', () => {
  render(<SlotForm name="CoverSlide" props={{}} onChange={() => {}} />)
  const eyebrow = screen.getByLabelText('Eyebrow') as HTMLInputElement
  expect(eyebrow.value).toBe('')
})

test('richtext slot renders a textarea', () => {
  render(<SlotForm name="CoverSlide" props={{}} onChange={() => {}} />)
  // CoverSlide has subtitle (richtext) and logo (richtext) — subtitle should be a textarea
  const subtitle = screen.getByLabelText('Subtitle') as HTMLTextAreaElement
  expect(subtitle.tagName.toLowerCase()).toBe('textarea')
})

test('list slot renders a textarea', () => {
  render(<SlotForm name="ClosingSlide" props={{}} onChange={() => {}} />)
  // ClosingSlide has handles (list) — should be a textarea
  const handles = screen.getByLabelText('Contact handles') as HTMLTextAreaElement
  expect(handles.tagName.toLowerCase()).toBe('textarea')
})

test('unknown template renders a fallback note', () => {
  render(<SlotForm name="NonExistentSlide" props={{}} onChange={() => {}} />)
  expect(screen.getByText(/unknown template/i)).toBeInTheDocument()
})

test('template with slots renders a read-only note about Source editing', () => {
  render(<SlotForm name="SplitHalf" props={{}} onChange={() => {}} />)
  expect(screen.getByText(/edited in source/i)).toBeInTheDocument()
})
