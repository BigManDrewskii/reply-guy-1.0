import { useState, memo } from 'react';
import { Copy, Check } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
}

function CopyButton({ text, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (onCopy) {
        onCopy();
      }

      // Reset after 1 second
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant={copied ? 'success' : 'primary'}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className="w-full"
    >
      {copied ? (
        <>
          <Check size={16} />
          Copied
        </>
      ) : (
        <>
          <Copy size={16} />
          Copy Message
        </>
      )}
    </Button>
  );
}

export default memo(CopyButton, (prevProps, nextProps) => {
  // Only re-render if text changes
  return prevProps.text === nextProps.text;
});
