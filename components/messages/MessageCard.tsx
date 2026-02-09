import { memo, useState, useEffect } from 'react';
import CopyButton from './CopyButton';
import EditMessageDialog from './EditMessageDialog';
import { useMessageGeneration } from '@/hooks/useMessageGeneration';
import { RefreshCw, Edit, AlertOctagon, Zap } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateAiScore } from '@/lib/ai-score';
import type { PageData, AnalysisResult, OutreachAngle } from '@/types';

interface MessageCardProps {
  pageData: PageData;
  analysis: AnalysisResult | null;
  selectedAngle: OutreachAngle['angle'];
  onSelectAngle: (angle: OutreachAngle['angle']) => void;
  onCopy?: (message?: string) => void;
  onRegenerate?: () => void;
  onScheduleFollowUp?: () => void;
}

function getVoiceLabel(score: number): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } {
  if (score >= 80) return { label: 'Sounds like you', variant: 'success' };
  if (score >= 60) return { label: 'Close match', variant: 'info' };
  if (score >= 40) return { label: 'Moderate match', variant: 'warning' };
  return { label: 'Generic tone', variant: 'error' };
}

function getAiLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'Very human', color: 'text-success' };
  if (score <= 40) return { label: 'Human', color: 'text-info' };
  if (score <= 60) return { label: 'Mixed', color: 'text-warning' };
  return { label: 'AI-sounding', color: 'text-destructive' };
}

function MessageCard({
  pageData,
  analysis,
  selectedAngle,
  onSelectAngle,
  onCopy,
  onRegenerate,
  onScheduleFollowUp,
}: MessageCardProps) {
  const { messages, streamingText, isGenerating, generateMessage, regenerateMessage, setMessages } = useMessageGeneration();

  const [isEditing, setIsEditing] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);

  const currentMessage = messages[selectedAngle];
  const currentStreamingText = streamingText[selectedAngle] || '';
  const isLoading = isGenerating[selectedAngle];
  const isStreaming = isLoading && currentStreamingText.length > 0;

  // Calculate AI-ness score when message is available
  const aiScore = currentMessage ? calculateAiScore(currentMessage.message) : null;
  const aiLabel = aiScore ? getAiLabel(aiScore.score) : null;

  const handleAngleChange = (angle: string) => {
    onSelectAngle(angle as OutreachAngle['angle']);
    if (!messages[angle] && !isGenerating[angle]) {
      generateMessage(pageData, analysis!, angle as OutreachAngle['angle']);
    }
  };

  const handleRegenerate = () => {
    regenerateMessage(pageData, analysis!, selectedAngle);
    setShowAiDetails(false);
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

        {/* Loading state — skeleton before any streaming text arrives */}
        {isLoading && !currentMessage && !isStreaming && (
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

        {/* Streaming text — show partial message as it arrives */}
        {isStreaming && !currentMessage && (
          <div className="rounded-lg bg-background/50 p-3">
            <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
              {currentStreamingText}
              <span className="inline-block w-[2px] h-[14px] bg-primary ml-0.5 align-middle animate-blink" />
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-muted-foreground">
                Generating · {currentStreamingText.split(/\s+/).filter(Boolean).length}w
              </span>
            </div>
          </div>
        )}

        {/* Message content — final result */}
        {currentMessage && (
          <>
            {/* The message text */}
            <div className="rounded-lg bg-background/50 p-3">
              <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                {currentMessage.message}
              </p>
            </div>

            {/* Metadata row: voice score + AI score + word count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {voiceInfo && (
                  <Badge variant={voiceInfo.variant} size="sm">
                    {voiceInfo.label}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {currentMessage.voiceScore}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* AI-ness indicator */}
                {aiScore && aiLabel && (
                  <button
                    onClick={() => setShowAiDetails(!showAiDetails)}
                    className={`flex items-center gap-1 text-[10px] ${aiLabel.color} hover:opacity-80 transition-opacity`}
                    title="AI-ness score — click for details"
                  >
                    <Zap size={10} />
                    <span className="tabular-nums">{aiScore.score}% AI</span>
                  </button>
                )}
                <span className="text-[10px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {currentMessage.wordCount}w
                </span>
              </div>
            </div>

            {/* AI-ness details panel */}
            {showAiDetails && aiScore && (
              <div className="rounded-lg bg-background/50 border border-border/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-foreground">AI Detection Breakdown</span>
                  <span className={`text-[11px] font-medium ${aiLabel!.color}`}>{aiScore.label}</span>
                </div>

                {/* Score bars */}
                <div className="space-y-1.5">
                  {[
                    { label: 'Phrases', value: aiScore.breakdown.phrases, desc: 'Common AI phrases' },
                    { label: 'Structure', value: aiScore.breakdown.structure, desc: 'Sentence uniformity' },
                    { label: 'Hedging', value: aiScore.breakdown.hedging, desc: 'Qualifiers & hedges' },
                    { label: 'Vocab', value: aiScore.breakdown.compression, desc: 'Word diversity' },
                  ].map(({ label, value, desc }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            value <= 30 ? 'bg-success' : value <= 60 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${Math.max(2, value)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 w-6 text-right tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {aiScore.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">Suggestions</p>
                    <ul className="space-y-0.5">
                      {aiScore.suggestions.map((s, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground/70 flex gap-1.5">
                          <span className="shrink-0">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

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

            {/* Follow-up button */}
            {onScheduleFollowUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onScheduleFollowUp}
                className="w-full text-muted-foreground"
              >
                <AlertOctagon size={13} />
                Schedule Follow-ups
              </Button>
            )}
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
