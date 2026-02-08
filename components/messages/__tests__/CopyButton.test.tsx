import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CopyButton from '../CopyButton'

describe('CopyButton feedback', () => {
  const clipboardMock = {
    writeText: vi.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    // Mock navigator.clipboard.writeText
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboardMock,
      writable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows checkmark for 1s after copy', async () => {
    render(<CopyButton text="test" />)
    const button = screen.getByRole('button')

    // Click to copy
    fireEvent.click(button)

    // Wait for copied state to appear
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })

    // Wait for 1 second timeout to clear
    await waitFor(
      () => {
        expect(screen.queryByText('Copied')).not.toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })

  it('copies text to clipboard', async () => {
    render(<CopyButton text="test content" />)
    const button = screen.getByRole('button')

    await fireEvent.click(button)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content')
  })

  it('calls onCopy callback when provided', async () => {
    const onCopy = vi.fn()
    render(<CopyButton text="test" onCopy={onCopy} />)
    const button = screen.getByRole('button')

    await fireEvent.click(button)

    expect(onCopy).toHaveBeenCalled()
  })
})
