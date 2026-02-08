import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check } from '@/lib/icons';

interface EditMessageDialogProps {
  initialMessage: string;
  onSave: (edited: string) => void;
  onClose: () => void;
}

export default function EditMessageDialog({
  initialMessage,
  onSave,
  onClose,
}: EditMessageDialogProps) {
  const [edited, setEdited] = useState(initialMessage);

  const wordCount = edited.split(/\s+/).filter(Boolean).length;
  const isDisabled = !edited.trim() || edited === initialMessage;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <Card className="w-full max-w-md rounded-t-lg animate-slide-up">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Edit Message</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close editor"
            >
              <X size={18} />
            </button>
          </div>

          <textarea
            value={edited}
            onChange={(e) => setEdited(e.target.value)}
            className="w-full h-48 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Edit your message..."
            aria-label="Edit message content"
          />

          <p className="text-xs text-muted-foreground text-right font-numerical">
            {wordCount} words
          </p>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSave(edited)}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isDisabled}
            >
              <Check size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
