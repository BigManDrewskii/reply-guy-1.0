import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Progress } from '../Progress'

describe('Progress smooth animation', () => {
  it('animates width changes with cubic-bezier', () => {
    render(<Progress value={50} />)
    const progressBar = screen.getByRole('progressbar')
    const innerBar = progressBar.querySelector('div')
    expect(innerBar).toHaveStyle({
      transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    })
  })

  it('has proper ARIA attributes', () => {
    render(<Progress value={75} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '75')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })
})
