import { useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from '@/lib/icons';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button on mount (safe default)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Keyboard handler: Escape to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

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
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <Card
        ref={dialogRef}
        className="w-full max-w-sm animate-in zoom-in-95 duration-150"
      >
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 id="dialog-title" className="text-base font-semibold text-foreground">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <p id="dialog-description" className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="flex gap-2">
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="md"
              className="flex-1"
            >
              {confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
