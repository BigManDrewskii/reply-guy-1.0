import { memo, useState } from 'react';
import CopyButton from './CopyButton';
import EditMessageDialog from './EditMessageDialog';
import { useMessageGeneration } from '@/hooks/useMessageGeneration';
import { RefreshCw, Edit } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card variant="default">
      <CardHeader>
        <CardTitle>Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
            className="space-y-2.5 py-3"
          >
            <div className="h-2.5 bg-muted rounded-full w-full animate-pulse"></div>
            <div className="h-2.5 bg-muted rounded-full w-5/6 animate-pulse"></div>
            <div className="h-2.5 bg-muted rounded-full w-4/6 animate-pulse"></div>
            <div className="h-2.5 bg-muted rounded-full w-full animate-pulse"></div>
            <div className="h-2.5 bg-muted rounded-full w-3/5 animate-pulse"></div>
          </div>
        )}

        {/* Message content */}
        {currentMessage && (
          <>
            {/* The message text */}
            <div className="rounded-lg bg-background/50 p-3">
              <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                {currentMessage.message}
              </p>
            </div>

            {/* Metadata row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {voiceInfo && (
                  <Badge variant={voiceInfo.variant} size="sm">
                    {voiceInfo.label}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground font-numerical tabular-nums">
                  {currentMessage.voiceScore}%
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-numerical tabular-nums">
                {currentMessage.wordCount}w
              </span>
            </div>

            {/* Hook explanation */}
            {currentMessage.hook && (
              <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">
                Hook: {currentMessage.hook}
              </p>
            )}

            {/* Primary CTA: Copy */}
            <CopyButton text={currentMessage.message} onCopy={handleCopy} />

            {/* Secondary actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex-1"
                aria-label="Edit this message"
              >
                <Edit size={13} />
                Edit
              </Button>
            </div>
          </>
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
