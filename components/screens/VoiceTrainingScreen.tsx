import { useEffect, useState } from 'react';
import { useVoiceTraining } from '@/hooks/useVoiceTraining';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Check,
  Mic,
  Brain,
  Fingerprint,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from '@/lib/icons';
import { useToast } from '@/components/ui/useToast';
import type { VoiceProfile, RegisterDimensions } from '@/types';
import type { LocalStyleMetrics } from '@/lib/voice-analyzer';

interface VoiceTrainingScreenProps {
  onBack?: () => void;
}

export default function VoiceTrainingScreen({ onBack }: VoiceTrainingScreenProps) {
  const {
    step,
    setStep,
    exampleMessages,
    setExampleMessages,
    messageCount,
    voiceProfile,
    localMetrics,
    localMetricsSummary,
    isExtracting,
    extractionStage,
    extractionProgress,
    error,
    analyzeVoice,
    saveVoiceProfile,
    reset,
  } = useVoiceTraining();

  const { add: addToast } = useToast();
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    register: true,
    metrics: false,
    patterns: false,
    rules: false,
    exemplars: false,
  });

  useEffect(() => {
    chrome.storage.local.get('voiceProfile', (result) => {
      if (result.voiceProfile) setHasExistingProfile(true);
    });
  }, []);

  // Auto-advance from step 2 to step 3 when profile is ready
  useEffect(() => {
    if (step === 2 && voiceProfile && !isExtracting) {
      setStep(3);
    }
  }, [step, voiceProfile, isExtracting, setStep]);

  // Auto-start analysis when entering step 2
  useEffect(() => {
    if (step === 2 && !isExtracting && !voiceProfile && !error) {
      analyzeVoice();
    }
  }, [step, isExtracting, voiceProfile, error, analyzeVoice]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAndExit = async () => {
    await saveVoiceProfile();
    addToast({ type: 'success', message: 'Voice profile saved successfully' });
    if (onBack) onBack();
  };

  const handleBack = () => {
    if (onBack) {
      reset();
      onBack();
    }
  };

  // ── Step Progress Indicator ──
  const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center gap-2 mb-5">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300 ${
              s < current
                ? 'bg-primary text-primary-foreground'
                : s === current
                ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s < current ? <Check size={10} /> : s}
          </div>
          {s < 3 && (
            <div
              className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                s < current ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ── Header ──
  const Header = () => (
    <div className="flex items-center gap-2.5 mb-1">
      <button
        onClick={handleBack}
        className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-md"
        aria-label="Back to settings"
      >
        <ArrowLeft size={16} />
      </button>
      <Fingerprint size={16} className="text-primary" />
      <h2 className="text-sm font-semibold text-foreground">Voice Training</h2>
    </div>
  );

  // ── Collapsible Section ──
  const Section = ({
    id,
    title,
    icon: IconComp,
    children,
    badge,
  }: {
    id: string;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    children: React.ReactNode;
    badge?: string;
  }) => {
    const isExpanded = expandedSections[id] ?? false;
    return (
      <Card variant="default">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left"
        >
          <div className="flex items-center gap-2">
            <IconComp size={13} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{title}</span>
            {badge && <Badge variant="outline" size="sm">{badge}</Badge>}
          </div>
          {isExpanded ? (
            <ChevronUp size={13} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={13} className="text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <CardContent className="pt-0 pb-3 px-3.5 border-t border-border/30">
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  // ════════════════════════════════════════════
  // STEP 1: Input Example Messages
  // ════════════════════════════════════════════
  if (step === 1) {
    const qualityLabel =
      messageCount >= 15
        ? { text: 'Optimal', color: 'text-success' }
        : messageCount >= 10
        ? { text: 'Excellent', color: 'text-success' }
        : messageCount >= 5
        ? { text: 'Good', color: 'text-primary' }
        : messageCount >= 3
        ? { text: 'Minimum', color: 'text-warning' }
        : { text: 'Need more', color: 'text-muted-foreground' };

    return (
      <div className="space-y-4">
        <Header />
        <StepIndicator current={1} />

        {hasExistingProfile && (
          <Alert variant="warning">
            You have an existing voice profile. Training will replace it.
          </Alert>
        )}

        <div>
          <p className="text-[13px] text-foreground font-medium mb-1">
            Paste your writing samples
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add 5-20 example messages, DMs, or posts that represent your natural voice.
            Separate each with <code className="text-[10px] bg-muted px-1 py-0.5 rounded">---</code>
          </p>
        </div>

        <textarea
          value={exampleMessages}
          onChange={(e) => setExampleMessages(e.target.value)}
          placeholder={`Hey! Saw your post about design systems...\n\n---\n\nThat's a really interesting take. I've been working on something similar...\n\n---\n\nWould love to chat more about this. Free for a quick call?`}
          className="w-full h-52 px-3 py-2.5 bg-background border border-border/60 rounded-lg text-[13px] leading-relaxed text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring resize-none font-mono transition-colors"
        />

        {/* Sample counter with quality indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {messageCount} sample{messageCount !== 1 ? 's' : ''}
            </span>
            <span className={`text-[10px] font-medium ${qualityLabel.color}`}>
              {qualityLabel.text}
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-1 rounded-full transition-colors duration-300 ${
                  i < Math.min(5, Math.ceil(messageCount / 4))
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-[11px] text-destructive">{error}</p>}

        <Button
          onClick={() => setStep(2)}
          disabled={messageCount < 3}
          variant="primary"
          size="md"
          className="w-full"
        >
          <Fingerprint size={14} className="mr-1.5" />
          Analyze My Voice
        </Button>

        <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          Your samples are analyzed locally first, then sent to AI for deep style extraction.
          Nothing is stored externally.
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STEP 2: Analyzing (3-stage pipeline)
  // ════════════════════════════════════════════
  if (step === 2) {
    const stages = [
      {
        key: 'local-nlp',
        label: 'Local NLP Analysis',
        description: 'Extracting quantitative style metrics',
        icon: Brain,
      },
      {
        key: 'llm-analysis',
        label: 'AI Voice Extraction',
        description: 'Register dimensions, tone, patterns',
        icon: Sparkles,
      },
      {
        key: 'building-profile',
        label: 'Building Profile',
        description: 'Assembling structured voice fingerprint',
        icon: Fingerprint,
      },
    ];

    const stageOrder = ['idle', 'local-nlp', 'llm-analysis', 'building-profile', 'complete'];
    const currentStageIndex = stageOrder.indexOf(extractionStage);

    return (
      <div className="space-y-4">
        <Header />
        <StepIndicator current={2} />

        <div>
          <p className="text-[13px] text-foreground font-medium mb-1">
            Analyzing your voice
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {extractionProgress || 'Starting analysis pipeline...'}
          </p>
        </div>

        {/* Pipeline stages */}
        <Card variant="default">
          <CardContent className="py-3 space-y-3">
            {stages.map((stage, i) => {
              const stageIdx = stageOrder.indexOf(stage.key);
              const isActive = extractionStage === stage.key;
              const isDone = currentStageIndex > stageIdx;
              const StageIcon = stage.icon;

              return (
                <div key={stage.key} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isDone
                        ? 'bg-success/15 text-success'
                        : isActive
                        ? 'bg-primary/15 text-primary animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? <Check size={12} /> : <StageIcon size={12} />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className={`text-xs font-medium transition-colors duration-300 ${
                        isDone
                          ? 'text-foreground'
                          : isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Local NLP metrics (appear instantly) */}
        {localMetrics && (
          <Card variant="default">
            <CardHeader>
              <CardTitle>Quick Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {localMetricsSummary}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <MetricBar label="Readability" value={localMetrics.readabilityGrade} max={100} />
                <MetricBar label="Formality" value={localMetrics.formalityScore} max={100} />
                <MetricBar label="Avg sentence" value={localMetrics.sentenceLengthMean} suffix=" words" />
                <MetricBar label="Vocab richness" value={Math.round(localMetrics.vocabularyRichness * 100)} suffix="%" />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="error" action={{ label: 'Go back', onClick: () => setStep(1) }}>
            {error}
          </Alert>
        )}

        <Button onClick={() => { reset(); setStep(1); }} variant="ghost" size="sm" className="w-full">
          Cancel
        </Button>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STEP 3: Review Voice Profile
  // ════════════════════════════════════════════
  if (step === 3 && voiceProfile) {
    return (
      <div className="space-y-3">
        <Header />
        <StepIndicator current={3} />

        {/* Profile quality banner */}
        <div className="flex items-center justify-between bg-card border border-border/40 rounded-lg px-3.5 py-2.5">
          <div>
            <p className="text-[13px] font-medium text-foreground">Voice Fingerprint</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {voiceProfile.sampleCount} samples analyzed
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold tabular-nums ${
              voiceProfile.quality.score >= 90 ? 'text-success' :
              voiceProfile.quality.score >= 70 ? 'text-primary' : 'text-warning'
            }`}>
              {voiceProfile.quality.score}%
            </p>
            <p className="text-[10px] text-muted-foreground">{voiceProfile.quality.label}</p>
          </div>
        </div>

        {/* Tone & Descriptors */}
        <Card variant="default">
          <CardContent className="py-3 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Mic size={12} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Voice Identity</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">{voiceProfile.tone.primary}</Badge>
              <span className="text-[10px] text-muted-foreground">+</span>
              <Badge variant="outline" size="sm">{voiceProfile.tone.secondary}</Badge>
              {voiceProfile.tone.humor !== 'none' && (
                <>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <Badge variant="outline" size="sm">{voiceProfile.tone.humor} humor</Badge>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {voiceProfile.descriptors.map((d, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground mb-1">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      voiceProfile.tone.confidence === 'commanding'
                        ? 'bg-primary w-full'
                        : voiceProfile.tone.confidence === 'assertive'
                        ? 'bg-primary w-3/4'
                        : voiceProfile.tone.confidence === 'balanced'
                        ? 'bg-primary/70 w-1/2'
                        : 'bg-primary/50 w-1/4'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-foreground font-medium capitalize">
                  {voiceProfile.tone.confidence}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Register Dimensions */}
        <Section id="register" title="Register Dimensions" icon={Brain} badge="Biber's 6D">
          <div className="space-y-2.5 mt-2">
            <RegisterBar label="Involved ↔ Informational" value={voiceProfile.register.involvedVsInformational} leftLabel="Personal" rightLabel="Factual" />
            <RegisterBar label="Narrative ↔ Non-narrative" value={voiceProfile.register.narrativeVsNonNarrative} leftLabel="Story-like" rightLabel="Expository" />
            <RegisterBar label="Situation ↔ Explicit" value={voiceProfile.register.situationDependentVsExplicit} leftLabel="Contextual" rightLabel="Explicit" />
            <RegisterBar label="Neutral ↔ Persuasive" value={voiceProfile.register.nonPersuasiveVsPersuasive} leftLabel="Neutral" rightLabel="Persuasive" />
            <RegisterBar label="Concrete ↔ Abstract" value={voiceProfile.register.concreteVsAbstract} leftLabel="Concrete" rightLabel="Abstract" />
            <RegisterBar label="Casual ↔ Formal" value={voiceProfile.register.casualVsFormalElaboration} leftLabel="Casual" rightLabel="Formal" />
          </div>
        </Section>

        {/* Quantitative Metrics */}
        {localMetrics && (
          <Section id="metrics" title="Style Metrics" icon={Fingerprint} badge={`${voiceProfile.sampleCount} samples`}>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              <MetricBar label="Readability" value={localMetrics.readabilityGrade} max={100} />
              <MetricBar label="Formality" value={localMetrics.formalityScore} max={100} />
              <MetricBar label="Avg sentence" value={localMetrics.sentenceLengthMean} suffix=" words" />
              <MetricBar label="Vocab richness" value={Math.round(localMetrics.vocabularyRichness * 100)} suffix="%" />
              <MetricBar label="Questions" value={Math.round(localMetrics.questionRatio * 100)} suffix="%" />
              <MetricBar label="Contractions" value={Math.round(localMetrics.contractionRate * 100)} suffix="%" />
              <MetricBar label="Active voice" value={Math.round(localMetrics.activeVoiceRatio * 100)} suffix="%" />
              <MetricBar label="Exclamations" value={Math.round(localMetrics.exclamationRatio * 100)} suffix="%" />
            </div>

            {localMetrics.topBigrams.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Signature phrases
                </p>
                <div className="flex flex-wrap gap-1">
                  {localMetrics.topBigrams.slice(0, 8).map(([phrase], i) => (
                    <Badge key={i} variant="outline" size="sm">{phrase}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Signature Patterns */}
        <Section id="patterns" title="Signature Patterns" icon={Sparkles}>
          <div className="space-y-3 mt-2">
            {voiceProfile.signatures.openingPatterns.length > 0 && (
              <PatternGroup label="Opening Patterns" items={voiceProfile.signatures.openingPatterns} />
            )}
            {voiceProfile.signatures.closingPatterns.length > 0 && (
              <PatternGroup label="Closing Patterns" items={voiceProfile.signatures.closingPatterns} />
            )}
            {voiceProfile.signatures.transitionWords.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Transition Words
                </p>
                <div className="flex flex-wrap gap-1">
                  {voiceProfile.signatures.transitionWords.map((w, i) => (
                    <Badge key={i} variant="outline" size="sm">{w}</Badge>
                  ))}
                </div>
              </div>
            )}
            {voiceProfile.signatures.catchphrases.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Catchphrases
                </p>
                <div className="flex flex-wrap gap-1">
                  {voiceProfile.signatures.catchphrases.map((c, i) => (
                    <Badge key={i} variant="info" size="sm">"{c}"</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Voice Rules & Anti-Patterns */}
        <Section id="rules" title="Voice Rules" icon={Shield} badge={`${voiceProfile.rules.length} rules`}>
          <div className="space-y-3 mt-2">
            {voiceProfile.rules.length > 0 && (
              <div className="space-y-1.5">
                {voiceProfile.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={10} className="text-success mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-foreground leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            )}

            {voiceProfile.antiPatterns.length > 0 && (
              <div className="pt-2.5 border-t border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-destructive/70 mb-1.5">
                  Never Do
                </p>
                <div className="space-y-1.5">
                  {voiceProfile.antiPatterns.map((ap, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-destructive text-[10px] mt-0.5 flex-shrink-0">✕</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{ap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Few-Shot Exemplars */}
        <Section id="exemplars" title="Stored Exemplars" icon={Mic} badge={`${voiceProfile.exemplars.length} samples`}>
          <div className="space-y-2 mt-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              These actual writing samples are injected into every generation prompt for 23.5x better style matching.
            </p>
            {voiceProfile.exemplars.map((ex, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-md px-2.5 py-2 border border-border/20"
              >
                <p className="text-[11px] text-foreground leading-relaxed line-clamp-3 font-mono">
                  {ex.text}
                </p>
                <p className="text-[9px] text-muted-foreground mt-1 tabular-nums">
                  {ex.wordCount} words · {ex.context}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button onClick={() => setStep(1)} variant="ghost" size="sm" className="flex-1">
            Redo
          </Button>
          <Button onClick={handleSaveAndExit} variant="primary" size="sm" className="flex-1">
            <Fingerprint size={13} className="mr-1.5" />
            Save Profile
          </Button>
        </div>

        {voiceProfile.quality.suggestion && (
          <p className="text-[10px] text-muted-foreground/60 text-center">
            {voiceProfile.quality.suggestion}
          </p>
        )}
      </div>
    );
  }

  return null;
}

// ════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════

function MetricBar({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-medium tabular-nums text-foreground">
          {Math.round(value)}{suffix || ''}
        </span>
      </div>
      {max && (
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/60 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function RegisterBar({
  label,
  value,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}) {
  const pct = ((value - 1) / 9) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{leftLabel}</span>
        <span className="text-[10px] text-muted-foreground">{rightLabel}</span>
      </div>
      <div className="relative h-1.5 bg-muted rounded-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-sm transition-all duration-500"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground/60 text-center tabular-nums">
        {value}/10
      </p>
    </div>
  );
}

function PatternGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <p key={i} className="text-[11px] text-foreground/80 leading-relaxed pl-2 border-l-2 border-border/40">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
