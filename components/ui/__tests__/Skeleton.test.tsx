import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Skeleton from '../Skeleton'

describe('Skeleton', () => {
  it('renders pulse variant by default', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toHaveClass('bg-muted')
  })

  it('renders avatar variant with rounded-full', () => {
    render(<Skeleton variant="avatar" />)
    expect(screen.getByRole('status')).toHaveClass('rounded-full')
  })

  it('renders text variant with varying widths', () => {
    render(<Skeleton variant="text" />)
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-full')
  })
})
