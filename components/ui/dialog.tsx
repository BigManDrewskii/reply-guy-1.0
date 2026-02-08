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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{description}</p>

          <div className="flex gap-2">
            <Button
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
