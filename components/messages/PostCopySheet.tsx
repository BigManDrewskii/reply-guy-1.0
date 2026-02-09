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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleNotSent();
      } else if (e.key === 'Enter') {
        handleSent();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const handleSent = () => {
    onLogged();
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const handleNotSent = () => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div
      className={`
        fixed inset-0 bg-background/60 backdrop-blur-sm flex items-end justify-center z-50
        transition-opacity duration-200
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleNotSent}
      role="dialog"
      aria-modal="true"
      aria-label="Log conversation"
    >
      <div
        className={`
          w-full bg-card border-t border-border/60 rounded-t-2xl p-5 pb-6
          transition-transform duration-200 ease-out
          ${visible ? 'translate-y-0' : 'translate-y-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4" />

        <p className="text-sm font-medium text-foreground text-center mb-1">
          Message copied
        </p>
        <p className="text-[11px] text-muted-foreground text-center mb-5">
          Did you send it? We'll track it for you.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleSent}
            variant="primary"
            size="md"
            className="flex-1"
          >
            <Check size={14} />
            Sent it
          </Button>
          <Button
            onClick={handleNotSent}
            variant="ghost"
            size="md"
            className="flex-1"
          >
            Not yet
          </Button>
        </div>
      </div>
    </div>
  );
}
