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

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant={copied ? 'success' : 'primary'}
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      size="md"
      className="w-full"
    >
      {copied ? (
        <>
          <Check size={15} />
          Copied!
        </>
      ) : (
        <>
          <Copy size={15} />
          Copy Message
        </>
      )}
    </Button>
  );
}

export default memo(CopyButton, (prevProps, nextProps) => {
  return prevProps.text === nextProps.text;
});
