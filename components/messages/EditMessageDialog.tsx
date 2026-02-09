import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from '@/lib/icons';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = edited.split(/\s+/).filter(Boolean).length;
  const isDisabled = !edited.trim() || edited === initialMessage;

  useEffect(() => {
    // Focus textarea and move cursor to end
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(edited.length, edited.length);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit message"
    >
      <div
        className="w-full bg-card border-t border-border/60 rounded-t-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-2" />

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Edit Message</h3>
            <span className="text-[12px] text-muted-foreground tabular-nums">{wordCount}w</span>
          </div>

          <textarea
            ref={textareaRef}
            value={edited}
            onChange={(e) => setEdited(e.target.value)}
            className="w-full h-40 px-3 py-2.5 rounded-lg bg-background border border-border/60 text-[14px] text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
            placeholder="Edit your message..."
            aria-label="Edit message content"
          />

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSave(edited)}
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={isDisabled}
            >
              <Check size={15} />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
