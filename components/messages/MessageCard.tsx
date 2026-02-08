import { memo, useState } from 'react';
import CopyButton from './CopyButton';
import EditMessageDialog from './EditMessageDialog';
import { useMessageGeneration } from '@/hooks/useMessageGeneration';
import { RefreshCw, Edit } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { PageData, AnalysisResult, OutreachAngle } from '@/types';

interface MessageCardProps {
  pageData: PageData;
  analysis: AnalysisResult | null;
  selectedAngle: OutreachAngle['angle'];
  onSelectAngle: (angle: OutreachAngle['angle']) => void;
  onCopy?: () => void;
  onRegenerate?: () => void;
}

function MessageCard({
  pageData,
  analysis,
  selectedAngle,
  onSelectAngle,
  onCopy,
  onRegenerate,
}: MessageCardProps) {
  const { messages, isGenerating, generateMessage, regenerateMessage, setMessages } = useMessageGeneration();

  const [isEditing, setIsEditing] = useState(false);

  const currentMessage = messages[selectedAngle];
  const isLoading = isGenerating[selectedAngle];

  // Auto-generate message when angle changes
  const handleAngleChange = (angle: string) => {
    onSelectAngle(angle);
    if (!messages[angle] && !isGenerating[angle]) {
      generateMessage(pageData, analysis, angle);
    }
  };

  const handleRegenerate = () => {
    regenerateMessage(pageData, analysis, selectedAngle);
    if (onRegenerate) onRegenerate();
  };

  // Generate initial message for selected angle
  if (!currentMessage && !isLoading) {
    generateMessage(pageData, analysis, selectedAngle);
  }

  return (
    <Card variant="default" className="space-y-4">
      <CardContent className="space-y-4">
        {/* Angle tabs */}
        {analysis?.outreachAngles && (
          <Tabs.Root defaultValue={selectedAngle} value={selectedAngle} onValueChange={handleAngleChange}>
            <Tabs.List>
              {analysis.outreachAngles.map((a: OutreachAngle) => (
                <Tabs.Trigger key={a.angle} value={a.angle}>
                  {a.angle.charAt(0).toUpperCase() + a.angle.slice(1)}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        )}

        {/* Loading state */}
        {isLoading && !currentMessage && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Generating message"
            className="space-y-3 py-4"
          >
            <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-5/6 animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-4/6 animate-pulse"></div>
          </div>
        )}

        {/* Message content */}
        {currentMessage && (
          <>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {currentMessage.message}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
              <span className="font-numerical">
                Voice: {currentMessage.voiceScore}% · {currentMessage.wordCount}w
              </span>
            </div>

            {/* Hook explanation */}
            {currentMessage.hook && (
              <p className="text-xs text-muted-foreground">
                Hook: {currentMessage.hook}
              </p>
            )}

            {/* Copy button */}
            <CopyButton text={currentMessage.message} onCopy={onCopy} />
          </>
        )}

        {/* Actions */}
        {currentMessage && (
          <div className="flex gap-2 pt-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw size={14} />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex-1"
              aria-label="Edit this message"
            >
              <Edit size={14} />
              Edit
            </Button>
          </div>
        )}
      </CardContent>

      {isEditing && currentMessage && (
        <EditMessageDialog
          initialMessage={currentMessage.message}
          onSave={(edited) => {
            setMessages((prev) => ({
              ...prev,
              [selectedAngle]: {
                ...currentMessage,
                message: edited,
                wordCount: edited.split(/\s+/).filter(Boolean).length,
              },
            }));
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </Card>
  );
}

export default memo(MessageCard, (prevProps, nextProps) => {
  // Only re-render if these critical props change
  return (
    prevProps.pageData.url === nextProps.pageData.url &&
    prevProps.selectedAngle === nextProps.selectedAngle &&
    prevProps.analysis?.personName === nextProps.analysis?.personName &&
    prevProps.analysis?.summary === nextProps.analysis?.summary
  );
});
