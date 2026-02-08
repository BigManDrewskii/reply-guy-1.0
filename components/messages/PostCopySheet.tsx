import { useEffect, useState } from 'react';
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
        fixed inset-0 bg-black/50 flex items-end justify-center z-50
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleNotSent}
    >
      <div
        className={`
          w-full max-w-md bg-card border-t border-border rounded-t-lg p-6
          transition-transform duration-300
          ${visible ? 'translate-y-0' : 'translate-y-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-foreground text-center mb-6">
          Did you send this?
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleSent}
            variant="success"
            size="md"
            className="flex-1"
          >
            <Check size={16} className="mr-2" />
            Sent
          </Button>
          <Button
            onClick={handleNotSent}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
