import { memo, useState } from 'react';
import CopyButton from './CopyButton';
import EditMessageDialog from './EditMessageDialog';
import { useMessageGeneration } from '@/hooks/useMessageGeneration';
import { RefreshCw, Edit } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PageData, AnalysisResult, OutreachAngle } from '@/types';

interface MessageCardProps {
  pageData: PageData;
  analysis: AnalysisResult | null;
  selectedAngle: OutreachAngle['angle'];
  onSelectAngle: (angle: OutreachAngle['angle']) => void;
  onCopy?: (message?: string) => void;
  onRegenerate?: () => void;
}

/**
 * Get a human-readable tone label from the voice score.
 */
function getVoiceLabel(score: number): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } {
  if (score >= 80) return { label: 'Sounds like you', variant: 'success' };
  if (score >= 60) return { label: 'Close match', variant: 'info' };
  if (score >= 40) return { label: 'Moderate match', variant: 'warning' };
  return { label: 'Generic tone', variant: 'error' };
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
    onSelectAngle(angle as OutreachAngle['angle']);
    if (!messages[angle] && !isGenerating[angle]) {
      generateMessage(pageData, analysis!, angle as OutreachAngle['angle']);
    }
  };

  const handleRegenerate = () => {
    regenerateMessage(pageData, analysis!, selectedAngle);
    if (onRegenerate) onRegenerate();
  };

  const handleCopy = () => {
    if (onCopy && currentMessage) {
      onCopy(currentMessage.message);
    }
  };

  // Generate initial message for selected angle
  if (!currentMessage && !isLoading && analysis) {
    generateMessage(pageData, analysis, selectedAngle);
  }

  const voiceInfo = currentMessage ? getVoiceLabel(currentMessage.voiceScore) : null;

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

            {/* Metadata with voice score badge */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                {voiceInfo && (
                  <Badge variant={voiceInfo.variant} size="sm">
                    {voiceInfo.label}
                  </Badge>
                )}
                <span className="font-numerical">
                  {currentMessage.voiceScore}%
                </span>
              </div>
              <span className="font-numerical">
                {currentMessage.wordCount}w
              </span>
            </div>

            {/* Hook explanation */}
            {currentMessage.hook && (
              <p className="text-xs text-muted-foreground italic">
                Hook: {currentMessage.hook}
              </p>
            )}

            {/* Copy button */}
            <CopyButton text={currentMessage.message} onCopy={handleCopy} />
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
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
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
  return (
    prevProps.pageData.url === nextProps.pageData.url &&
    prevProps.selectedAngle === nextProps.selectedAngle &&
    prevProps.analysis?.personName === nextProps.analysis?.personName &&
    prevProps.analysis?.confidence === nextProps.analysis?.confidence &&
    prevProps.analysis?.outreachAngles?.length === nextProps.analysis?.outreachAngles?.length
  );
});
