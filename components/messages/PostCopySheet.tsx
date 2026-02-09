import { useEffect, useState, useCallback } from 'react';
import { Check, X, ExternalLink } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface PostCopySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged: () => void;
  platform?: string;
  username?: string;
}

function getDmUrl(platform?: string, username?: string): string | null {
  if (!username) return null;
  if (platform === 'x') {
    // X DM compose uses the username directly
    return `https://x.com/messages/${username}`;
  }
  if (platform === 'linkedin') {
    return `https://www.linkedin.com/messaging/compose/`;
  }
  return null;
}

export default function PostCopySheet({ isOpen, onClose, onLogged, platform, username }: PostCopySheetProps) {
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

  const dmUrl = getDmUrl(platform, username);

  const handleSent = () => {
    onLogged();
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const handleNotSent = () => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const handleOpenDm = () => {
    if (dmUrl) {
      window.open(dmUrl, '_blank');
    }
    handleSent();
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

        {/* Success indicator */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mb-2">
            <Check size={18} className="text-success" />
          </div>
          <p className="text-sm font-medium text-foreground text-center">
            Message copied
          </p>
          <p className="text-[12px] text-muted-foreground text-center mt-0.5">
            Did you send it? We'll track it for you.
          </p>
        </div>

        <div className="space-y-2">
          {/* Open DM button — if platform and username available */}
          {dmUrl && (
            <Button
              onClick={handleOpenDm}
              variant="primary"
              size="md"
              className="w-full"
            >
              <ExternalLink size={14} />
              Open {platform === 'x' ? 'X' : 'LinkedIn'} DM
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSent}
              variant={dmUrl ? 'ghost' : 'primary'}
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
    </div>
  );
}
