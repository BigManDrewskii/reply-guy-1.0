import { memo, useState } from 'react';
import CopyButton from './CopyButton';
import EditMessageDialog from './EditMessageDialog';
import { useMessageGeneration } from '@/hooks/useMessageGeneration';
import { RefreshCw, Edit, AlertOctagon, Zap, ChevronDown } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateAiScore } from '@/lib/ai-score';
import type { VoiceMatchBreakdown } from '@/lib/voice-analyzer';
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

// ── Voice Match Labels ──

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

const BREAKDOWN_LABELS: Record<keyof VoiceMatchBreakdown, { label: string; desc: string }> = {
  sentenceLength: { label: 'Rhythm', desc: 'Sentence length pattern' },
  formality: { label: 'Formality', desc: 'Register & tone level' },
  contractions: { label: 'Contractions', desc: 'Contraction usage' },
  readability: { label: 'Readability', desc: 'Reading level match' },
  pronouns: { label: 'Pronouns', desc: 'I/you/we usage' },
  punctuation: { label: 'Punctuation', desc: 'Marks & emphasis' },
};

// ── Component ──

function MessageCard({
  pageData,
  analysis,
  selectedAngle,
  onSelectAngle,
  onCopy,
  onRegenerate,
  onScheduleFollowUp,
}: MessageCardProps) {
  const {
    messages,
    streamingText,
    isGenerating,
    isRefining,
    voiceMatchScores,
    generateMessage,
    regenerateMessage,
    refineMessage,
    setMessages,
  } = useMessageGeneration();

  const [isEditing, setIsEditing] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [showVoiceDetails, setShowVoiceDetails] = useState(false);

  const currentMessage = messages[selectedAngle];
  const currentStreamingText = streamingText[selectedAngle] || '';
  const isLoading = isGenerating[selectedAngle];
  const isCurrentRefining = isRefining[selectedAngle];
  const isStreaming = (isLoading || isCurrentRefining) && currentStreamingText.length > 0;
  const voiceMatch = voiceMatchScores[selectedAngle];

  // AI-ness score
  const aiScore = currentMessage ? calculateAiScore(currentMessage.message) : null;
  const aiLabel = aiScore ? getAiLabel(aiScore.score) : null;

  // Voice match info — prefer local NLP score, fallback to LLM voiceScore
  const effectiveVoiceScore = voiceMatch?.score ?? currentMessage?.voiceScore ?? 0;
  const voiceInfo = currentMessage ? getVoiceLabel(effectiveVoiceScore) : null;

  // Can refine if score is below threshold and we have a voice profile
  const canRefine = voiceMatch && voiceMatch.score < 70 && !isCurrentRefining && !isLoading;

  const handleAngleChange = (angle: string) => {
    onSelectAngle(angle as OutreachAngle['angle']);
    if (!messages[angle] && !isGenerating[angle]) {
      generateMessage(pageData, analysis!, angle as OutreachAngle['angle']);
    }
  };

  const handleRegenerate = () => {
    regenerateMessage(pageData, analysis!, selectedAngle);
    setShowAiDetails(false);
    setShowVoiceDetails(false);
    if (onRegenerate) onRegenerate();
  };

  const handleRefine = () => {
    if (!analysis) return;
    refineMessage(pageData, analysis, selectedAngle);
    setShowVoiceDetails(false);
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
            <div className="h-2.5 bg-muted rounded-full w-full animate-pulse" />
            <div className="h-2.5 bg-muted rounded-full w-5/6 animate-pulse" />
            <div className="h-2.5 bg-muted rounded-full w-4/6 animate-pulse" />
            <div className="h-2.5 bg-muted rounded-full w-full animate-pulse" />
            <div className="h-2.5 bg-muted rounded-full w-3/5 animate-pulse" />
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
                {isCurrentRefining ? 'Refining voice' : 'Generating'} · {currentStreamingText.split(/\s+/).filter(Boolean).length}w
              </span>
            </div>
          </div>
        )}

        {/* Refining overlay — show streaming text while refining an existing message */}
        {isCurrentRefining && isStreaming && currentMessage && (
          <div className="rounded-lg bg-background/50 p-3 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-medium">Refining voice match...</span>
            </div>
            <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
              {currentStreamingText}
              <span className="inline-block w-[2px] h-[14px] bg-primary ml-0.5 align-middle animate-blink" />
            </p>
          </div>
        )}

        {/* Message content — final result */}
        {currentMessage && !isCurrentRefining && (
          <>
            {/* The message text */}
            <div className="rounded-lg bg-background/50 p-3">
              <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                {currentMessage.message}
              </p>
            </div>

            {/* ── Metadata row: voice score + AI score + word count ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {voiceInfo && (
                  <button
                    onClick={() => setShowVoiceDetails(!showVoiceDetails)}
                    className="flex items-center gap-1 group"
                  >
                    <Badge variant={voiceInfo.variant} size="sm">
                      {voiceInfo.label}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {effectiveVoiceScore}%
                    </span>
                    <ChevronDown
                      size={10}
                      className={`text-muted-foreground/50 transition-transform ${showVoiceDetails ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
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

            {/* ── Voice Match Breakdown Panel ── */}
            {showVoiceDetails && voiceMatch && (
              <div className="rounded-lg bg-background/50 border border-border/40 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-foreground">Voice Match Breakdown</span>
                  <span className={`text-[11px] font-medium ${voiceInfo ? `text-${voiceInfo.variant}` : 'text-muted-foreground'}`}>
                    {voiceMatch.score}/100
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(Object.entries(voiceMatch.breakdown) as [keyof VoiceMatchBreakdown, number][]).map(
                    ([key, value]) => {
                      const info = BREAKDOWN_LABELS[key];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-[70px] shrink-0" title={info.desc}>
                            {info.label}
                          </span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                value >= 70 ? 'bg-success' : value >= 40 ? 'bg-warning' : 'bg-destructive'
                              }`}
                              style={{ width: `${Math.max(3, value)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-muted-foreground/60 w-6 text-right tabular-nums">
                            {value}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Refine CTA if score is low */}
                {canRefine && (
                  <div className="pt-2 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefine}
                      className="w-full text-[11px]"
                    >
                      <RefreshCw size={11} />
                      Refine Voice Match ({voiceMatch.score}% → 85%+)
                    </Button>
                    <p className="text-[9px] text-muted-foreground/50 text-center mt-1">
                      Uses a second LLM pass to improve weak dimensions
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── AI-ness Details Panel ── */}
            {showAiDetails && aiScore && (
              <div className="rounded-lg bg-background/50 border border-border/40 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-foreground">AI Detection Breakdown</span>
                  <span className={`text-[11px] font-medium ${aiLabel!.color}`}>{aiScore.label}</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: 'Phrases', value: aiScore.breakdown.phrases, desc: 'Common AI phrases' },
                    { label: 'Structure', value: aiScore.breakdown.structure, desc: 'Sentence uniformity' },
                    { label: 'Hedging', value: aiScore.breakdown.hedging, desc: 'Qualifiers & hedges' },
                    { label: 'Vocab', value: aiScore.breakdown.compression, desc: 'Word diversity' },
                  ].map(({ label, value, desc }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14 shrink-0" title={desc}>
                        {label}
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            value <= 30 ? 'bg-success' : value <= 60 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${Math.max(2, value)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 w-6 text-right tabular-nums">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

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
                disabled={isLoading || isCurrentRefining}
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
