import { useEffect, useState, useCallback } from 'react';
import { Check, X } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface PostCopySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
}

export default function PostCopySheet({ isOpen, onClose, onLogged }: PostCopySheetProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    }
  }, [isOpen]);

  // Keyboard support: Escape to dismiss, Enter to confirm sent
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      handleNotSent();
    } else if (e.key === 'Enter') {
      handleSent();
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const handleSent = () => {
    onLogged();
    setVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleNotSent = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-end justify-center z-50
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleNotSent}
      role="dialog"
      aria-modal="true"
      aria-label="Log conversation"
    >
      <div
        className={`
          w-full max-w-md bg-card border-t border-border rounded-t-xl p-6
          transition-transform duration-300
          ${visible ? 'translate-y-0' : 'translate-y-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

        <p className="text-sm font-medium text-foreground text-center mb-2">
          Message copied!
        </p>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Did you send it? We'll track it in your history.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleSent}
            variant="primary"
            size="md"
            className="flex-1"
          >
            <Check size={16} className="mr-2" />
            Yes, sent it
          </Button>
          <Button
            onClick={handleNotSent}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            <X size={16} className="mr-2" />
            Not yet
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">Enter</kbd> to confirm
          or <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">Esc</kbd> to dismiss
        </p>
      </div>
    </div>
  );
}
