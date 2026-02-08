import { X, Check, AlertCircle, Info } from '@/lib/icons'
import { Toast } from './useToast'

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const icons = {
    success: <Check size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />
  }

  const colors = {
    success: 'bg-success/10 border-success text-success',
    error: 'bg-destructive/10 border-destructive text-destructive',
    info: 'bg-accent/10 border-accent text-accent'
  }

  return (
    <div
      className={`fixed bottom-14 left-2 right-2 p-3 rounded-lg border flex items-center gap-3 animate-slide-up ${colors[toast.type]}`}
      style={{ zIndex: 100 }}
    >
      {icons[toast.type]}
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
