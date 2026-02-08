import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '../useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds toast to queue', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: 'Test', type: 'success' })
    })
    expect(result.current.toasts).toHaveLength(1)
  })

  it('removes toast after timeout', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: 'Test', type: 'success' })
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.toasts).toHaveLength(0)
  })

  it('stacks up to 3 toasts', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: '1', type: 'success' })
      result.current.toast({ message: '2', type: 'info' })
      result.current.toast({ message: '3', type: 'success' })
      result.current.toast({ message: '4', type: 'error' })
    })
    expect(result.current.toasts).toHaveLength(3)
    expect(result.current.toasts[0].message).toBe('2') // First dropped
  })
})
