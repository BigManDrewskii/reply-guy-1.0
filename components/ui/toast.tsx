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
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-destructive/10 border-destructive/30 text-destructive',
  info: 'bg-info/10 border-info/30 text-info',
};

export default function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      className={`fixed left-3 right-3 px-3 py-2.5 rounded-lg border flex items-center gap-2.5 animate-slide-up z-[100] backdrop-blur-sm ${COLORS[toast.type]}`}
      style={{ bottom: `${60 + (toast.index || 0) * 48}px` }}
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0">{ICONS[toast.type]}</span>
      <p className="text-xs flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss toast"
        className="p-0.5 hover:bg-foreground/10 rounded transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}
