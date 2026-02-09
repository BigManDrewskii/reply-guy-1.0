import { X, Check, AlertCircle, Info } from '@/lib/icons';
import type { Toast } from './useToast';

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <Check size={14} />,
  error: <AlertCircle size={14} />,
  info: <Info size={14} />,
};

const COLORS = {
  success: 'bg-success-subtle border-success/20 text-success',
  error: 'bg-destructive-subtle border-destructive/20 text-destructive',
  info: 'bg-info-subtle border-info/20 text-info',
};

export default function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      className={`fixed left-3 right-3 px-4 py-3 rounded-xl border flex items-center gap-3 animate-slide-up z-[100] glass shadow-lg ${COLORS[toast.type]}`}
      style={{ bottom: `${64 + (toast.index || 0) * 56}px` }}
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0 opacity-80">{ICONS[toast.type]}</span>
      <p className="text-sm flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss toast"
        className="p-1 hover:bg-foreground/10 rounded-lg transition-colors shrink-0 opacity-60 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
