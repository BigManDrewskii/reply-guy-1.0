import { useState, useCallback, useRef } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const toast = useCallback(({ message, type }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11)
    const newToast = { id, message, type }

    setToasts(prev => [...prev.slice(-2), newToast])

    const duration = type === 'error' ? 0 : (type === 'info' ? 2000 : 3000)
    if (duration > 0) {
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        timeoutsRef.current.delete(id)
      }, duration)
      timeoutsRef.current.set(id, timeout)
    }
  }, [])

  const remove = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, remove }
}
