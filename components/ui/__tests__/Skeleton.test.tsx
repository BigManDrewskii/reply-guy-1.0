import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Skeleton from '../Skeleton'

describe('Skeleton', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders pulse variant by default', () => {
    render(<Skeleton />)
    const skeleton = screen.getByRole('status')

    expect(skeleton.className).toContain('skeleton-shimmer')
    expect(skeleton.className).toContain('animate-shimmer')
    expect(skeleton.getAttribute('aria-label')).toBe('Loading content')
  })

  it('renders avatar variant with rounded-full', () => {
    render(<Skeleton variant="avatar" />)
    expect(screen.getByRole('status').className).toContain('rounded-full')
  })

  it('renders text variant with varying widths', () => {
    render(<Skeleton variant="text" />)
    const skeleton = screen.getByRole('status')
    expect(skeleton.className).toContain('h-4')
    expect(skeleton.className).toContain('w-full')
  })

  it('merges custom className', () => {
    render(<Skeleton className="w-full" />)
    expect(screen.getByRole('status').className).toContain('w-full')
  })
})
