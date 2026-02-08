import { X, Check, AlertCircle, Info } from '@/lib/icons'
import type { Toast } from './useToast'

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ICONS = {
  success: <Check size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />
}

const COLORS = {
  success: 'bg-success/10 border-success text-success',
  error: 'bg-destructive/10 border-destructive text-destructive',
  info: 'bg-accent/10 border-accent text-accent'
}

export default function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      className={`fixed left-2 right-2 p-3 rounded-lg border flex items-center gap-3 animate-slide-up z-[100] ${COLORS[toast.type]}`}
      style={{ bottom: `${56 + (toast.index || 0) * 60}px` }}
    >
      {ICONS[toast.type]}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss toast"
        className="p-1 hover:bg-black/10 rounded"
      >
        <X size={14} />
      </button>
    </div>
  )
}
