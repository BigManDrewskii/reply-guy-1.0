import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button on mount (safe default)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Keyboard handler: Escape to close, Tab to trap focus
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Simple focus trap between cancel and confirm
      if (e.key === 'Tab') {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="w-full max-w-sm rounded-xl bg-card border border-border/60 shadow-lg animate-slide-up">
        <div className="p-4 space-y-3">
          <h3 id="dialog-title" className="text-sm font-semibold text-foreground">
            {title}
          </h3>

          <p id="dialog-description" className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              {cancelLabel}
            </Button>
            <Button
              ref={confirmRef}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              className="flex-1"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
