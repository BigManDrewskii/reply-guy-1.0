import { useEffect, useState } from 'react';
import { useVoiceTraining } from '@/hooks/useVoiceTraining';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Link,
  Plus,
  FileText,
  Type,
  Globe,
  Loader2,
  Trash2,
  XCircle,
} from '@/lib/icons';
import { useToast } from '@/components/ui/useToast';
import type { VoiceProfile } from '@/types';
import type { LocalStyleMetrics } from '@/lib/voice-analyzer';

interface VoiceTrainingScreenProps {
  onBack?: () => void;
}

export default function VoiceTrainingScreen({ onBack }: VoiceTrainingScreenProps) {
  const {
    step,
    setStep,
    sources,
    addTextSource,
    addUrlSource,
    removeSource,
    autoDetectAndAdd,
    writingSamples,
    isSegmenting,
    segmentSources,
    rawTextInput,
    setRawTextInput,
    sampleCount,
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
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    const success = await saveVoiceProfile();
    setIsSaving(false);

    if (success) {
      addToast({ type: 'success', message: 'Voice profile saved successfully' });
      if (onBack) onBack();
    }
    // Error is set inside saveVoiceProfile if it fails
  };

  const handleBack = () => {
    if (onBack) {
      reset();
      onBack();
    }
  };

  const handleAddUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;

    setIsFetchingUrl(true);
    await addUrlSource(url);
    setUrlInput('');
    setIsFetchingUrl(false);
  };

  const handleAddText = () => {
    if (!rawTextInput.trim()) return;
    addTextSource(rawTextInput);
    setRawTextInput('');
  };

  const handleSmartPaste = async () => {
    if (!rawTextInput.trim()) return;
    await autoDetectAndAdd(rawTextInput);
    setRawTextInput('');
  };

  const handleProceedToSegment = async () => {
    await segmentSources();
  };

  const handleProceedToAnalyze = () => {
    setStep(2);
  };

  // Auto-start analysis when entering step 2
  useEffect(() => {
    if (step === 2 && !isExtracting && !voiceProfile && !error && writingSamples.length >= 3) {
      analyzeVoice();
    }
  }, [step]);

  // Auto-advance from step 2 to step 3 when profile is ready
  useEffect(() => {
    if (step === 2 && voiceProfile && !isExtracting) {
      setStep(3);
    }
  }, [step, voiceProfile, isExtracting, setStep]);

  // ── Step Progress Indicator ──
  const StepIndicator = ({ current }: { current: number }) => {
    const steps = [
      { num: 1, label: 'Add Content' },
      { num: 2, label: 'Analyze' },
      { num: 3, label: 'Review' },
    ];

    return (
      <div className="flex items-center gap-1.5 mb-5">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1.5 flex-1">
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all duration-300 ${
                  s.num < current
                    ? 'bg-primary text-primary-foreground'
                    : s.num === current
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s.num < current ? <Check size={14} /> : s.num}
              </div>
              <span className="text-[12px] text-muted-foreground">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-colors duration-300 mb-3 ${
                  s.num < current ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

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
            <IconComp size={15} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{title}</span>
            {badge && <Badge variant="outline" size="sm">{badge}</Badge>}
          </div>
          {isExpanded ? (
            <ChevronUp size={15} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={15} className="text-muted-foreground" />
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
  // STEP 1: Multi-Source Content Input
  // ════════════════════════════════════════════
  if (step === 1) {
    const readySources = sources.filter((s) => s.status === 'ready');
    const fetchingSources = sources.filter((s) => s.status === 'fetching');
    const hasContent = readySources.length > 0;
    const hasSamples = writingSamples.length >= 3;

    return (
      <div className="space-y-4">
        <Header />
        <StepIndicator current={1} />

        {hasExistingProfile && (
          <Alert variant="warning">
            You have an existing voice profile. Training will replace it.
          </Alert>
        )}

        {/* Intro */}
        <div>
          <p className="text-[14px] text-foreground font-medium mb-1">
            Feed your writing to the AI
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Paste text, drop in URLs to your posts/articles, or paste entire documents.
            The AI will extract and segment your writing samples automatically.
          </p>
        </div>

        {/* Tabbed Input */}
        <Tabs defaultValue="smart">
          <TabsList>
            <TabsTrigger value="smart">
              <div className="flex items-center gap-1.5">
                <Sparkles size={15} />
                Smart Paste
              </div>
            </TabsTrigger>
            <TabsTrigger value="url">
              <div className="flex items-center gap-1.5">
                <Link size={15} />
                Add URL
              </div>
            </TabsTrigger>
            <TabsTrigger value="text">
              <div className="flex items-center gap-1.5">
                <Type size={15} />
                Paste Text
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Smart Paste — auto-detects URLs vs text */}
          <TabsContent value="smart" className="mt-3 space-y-2.5">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Paste anything — URLs, documents, emails, tweets, blog posts.
              The AI auto-detects the format and extracts writing samples.
            </p>
            <textarea
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder={`Paste anything here:\n\n• A URL to your blog post or tweet\n• An email you wrote\n• A document or essay\n• Multiple messages (any format)\n\nThe AI will figure out the rest...`}
              className="w-full h-40 px-3 py-2.5 bg-background border border-border/60 rounded-lg text-[14px] leading-relaxed text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring resize-none font-mono transition-colors"
            />
            <Button
              onClick={handleSmartPaste}
              disabled={!rawTextInput.trim()}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <Plus size={15} className="mr-1.5" />
              Add to Sources
            </Button>
          </TabsContent>

          {/* URL Input */}
          <TabsContent value="url" className="mt-3 space-y-2.5">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Add URLs to your tweets, blog posts, LinkedIn posts, or any page with your writing.
              Content is extracted using Jina Reader AI.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                placeholder="https://x.com/you/status/..."
                className="flex-1 px-3 py-2 bg-background border border-border/60 rounded-lg text-[14px] text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-colors"
              />
              <Button
                onClick={handleAddUrl}
                disabled={!urlInput.trim() || isFetchingUrl}
                variant="primary"
                size="sm"
              >
                {isFetchingUrl ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Plain Text Input */}
          <TabsContent value="text" className="mt-3 space-y-2.5">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Paste raw text — emails, DMs, documents, essays. The AI will segment
              it into individual writing samples for analysis.
            </p>
            <textarea
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder={`Paste your writing here...\n\nYou can paste:\n• A single long document\n• Multiple messages/emails\n• Copy-pasted social media posts\n\nNo special formatting needed.`}
              className="w-full h-40 px-3 py-2.5 bg-background border border-border/60 rounded-lg text-[14px] leading-relaxed text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring resize-none font-mono transition-colors"
            />
            <Button
              onClick={handleAddText}
              disabled={!rawTextInput.trim()}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <FileText size={15} className="mr-1.5" />
              Add Text Source
            </Button>
          </TabsContent>
        </Tabs>

        {/* Source List */}
        {sources.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-foreground">
                Sources ({sources.length})
              </p>
              {fetchingSources.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span className="text-[12px] text-muted-foreground">
                    Fetching {fetchingSources.length}...
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                    source.status === 'error'
                      ? 'border-destructive/30 bg-destructive/5'
                      : source.status === 'fetching'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/40 bg-card'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${
                    source.status === 'error' ? 'text-destructive' :
                    source.status === 'fetching' ? 'text-primary' :
                    'text-muted-foreground'
                  }`}>
                    {source.type === 'url' ? (
                      source.status === 'fetching' ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Globe size={15} />
                      )
                    ) : (
                      <FileText size={15} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-foreground truncate font-medium">
                      {source.label}
                    </p>
                    {source.status === 'ready' && (
                      <p className="text-[12px] text-muted-foreground">
                        {source.rawContent.split(/\s+/).length} words extracted
                      </p>
                    )}
                    {source.status === 'error' && (
                      <p className="text-[12px] text-destructive">{source.error}</p>
                    )}
                    {source.status === 'fetching' && (
                      <p className="text-[12px] text-primary">Fetching content...</p>
                    )}
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant={
                      source.status === 'error' ? 'destructive' :
                      source.status === 'fetching' ? 'info' :
                      'outline'
                    }
                    size="sm"
                  >
                    {source.status === 'ready' ? 'Ready' :
                     source.status === 'fetching' ? 'Loading' :
                     'Error'}
                  </Badge>

                  {/* Remove button */}
                  <button
                    onClick={() => removeSource(source.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                    aria-label="Remove source"
                  >
                    <XCircle size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Writing Samples Preview (after segmentation) */}
        {writingSamples.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-foreground">
                Writing Samples ({writingSamples.length})
              </p>
              <span className={`text-[12px] font-medium ${
                writingSamples.length >= 10 ? 'text-green-500' :
                writingSamples.length >= 5 ? 'text-primary' :
                writingSamples.length >= 3 ? 'text-yellow-500' :
                'text-muted-foreground'
              }`}>
                {writingSamples.length >= 10 ? 'Excellent' :
                 writingSamples.length >= 5 ? 'Good' :
                 writingSamples.length >= 3 ? 'Minimum' :
                 'Need more'}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
              {writingSamples.slice(0, 10).map((sample, i) => (
                <div
                  key={i}
                  className="bg-muted/50 rounded-md px-2.5 py-2 border border-border/20"
                >
                  <p className="text-[12px] text-foreground leading-relaxed line-clamp-2 font-mono">
                    {sample.text}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1 tabular-nums">
                    {sample.wordCount} words · from {sample.sourceLabel}
                  </p>
                </div>
              ))}
              {writingSamples.length > 10 && (
                <p className="text-[12px] text-muted-foreground text-center py-1">
                  +{writingSamples.length - 10} more samples
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quality bar */}
        {(sources.length > 0 || writingSamples.length > 0) && (
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                  i < Math.min(5, Math.ceil(
                    (writingSamples.length > 0 ? writingSamples.length : readySources.length) / 3
                  ))
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        {error && <p className="text-[12px] text-destructive">{error}</p>}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Step 1: Segment sources if we have content but no samples yet */}
          {hasContent && !hasSamples && !isSegmenting && (
            <Button
              onClick={handleProceedToSegment}
              disabled={fetchingSources.length > 0}
              variant="primary"
              size="md"
              className="w-full"
            >
              <Brain size={14} className="mr-1.5" />
              Extract Writing Samples
              {fetchingSources.length > 0 && ' (waiting for URLs...)'}
            </Button>
          )}

          {isSegmenting && (
            <Button disabled variant="primary" size="md" className="w-full">
              <Loader2 size={14} className="mr-1.5 animate-spin" />
              {extractionProgress || 'Segmenting...'}
            </Button>
          )}

          {/* Step 2: Analyze if we have enough samples */}
          {hasSamples && (
            <Button
              onClick={handleProceedToAnalyze}
              variant="primary"
              size="md"
              className="w-full"
            >
              <Fingerprint size={14} className="mr-1.5" />
              Analyze My Voice ({writingSamples.length} samples)
            </Button>
          )}
        </div>

        <p className="text-[12px] text-muted-foreground/60 text-center leading-relaxed">
          URLs are fetched via Jina Reader AI. Your text is analyzed locally first,
          then sent to AI for deep style extraction. Nothing is stored externally.
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STEP 2: Analyzing (4-stage pipeline)
  // ════════════════════════════════════════════
  if (step === 2) {
    const stages = [
      {
        key: 'segmenting',
        label: 'Content Segmentation',
        description: 'Extracting discrete writing samples',
        icon: FileText,
      },
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

    const stageOrder = ['idle', 'segmenting', 'local-nlp', 'llm-analysis', 'building-profile', 'complete'];
    const currentStageIndex = stageOrder.indexOf(extractionStage);

    return (
      <div className="space-y-4">
        <Header />
        <StepIndicator current={2} />

        <div>
          <p className="text-[14px] text-foreground font-medium mb-1">
            Analyzing your voice
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {extractionProgress || 'Starting analysis pipeline...'}
          </p>
        </div>

        {/* Pipeline stages */}
        <Card variant="default">
          <CardContent className="py-3 space-y-3">
            {stages.map((stage) => {
              const stageIdx = stageOrder.indexOf(stage.key);
              const isActive = extractionStage === stage.key;
              const isDone = currentStageIndex > stageIdx;
              const StageIcon = stage.icon;

              return (
                <div key={stage.key} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isDone
                        ? 'bg-green-500/15 text-green-500'
                        : isActive
                        ? 'bg-primary/15 text-primary animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? <Check size={14} /> : <StageIcon size={14} />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className={`text-xs font-medium transition-colors duration-300 ${
                        isDone || isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
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
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {localMetricsSummary}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <MetricBar label="Readability" value={localMetrics.fleschReadingEase} max={100} />
                <MetricBar label="Formality" value={localMetrics.formalityScore} max={100} />
                <MetricBar label="Avg sentence" value={localMetrics.sentenceLength.mean} suffix=" words" />
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
            <p className="text-[14px] font-medium text-foreground">Voice Fingerprint</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {voiceProfile.sampleCount} samples analyzed
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold tabular-nums ${
              voiceProfile.quality.score >= 90 ? 'text-green-500' :
              voiceProfile.quality.score >= 70 ? 'text-primary' : 'text-yellow-500'
            }`}>
              {voiceProfile.quality.score}%
            </p>
            <p className="text-[12px] text-muted-foreground">{voiceProfile.quality.label}</p>
          </div>
        </div>

        {/* Tone & Descriptors */}
        <Card variant="default">
          <CardContent className="py-3 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Mic size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Voice Identity</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">{voiceProfile.tone.primary}</Badge>
              <span className="text-[12px] text-muted-foreground">+</span>
              <Badge variant="outline" size="sm">{voiceProfile.tone.secondary}</Badge>
              {voiceProfile.tone.humor !== 'none' && (
                <>
                  <span className="text-[12px] text-muted-foreground">&middot;</span>
                  <Badge variant="outline" size="sm">{voiceProfile.tone.humor} humor</Badge>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {voiceProfile.descriptors.map((d, i) => (
                <span
                  key={i}
                  className="text-[12px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-border/30">
              <p className="text-[12px] text-muted-foreground mb-1">Confidence</p>
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
                <span className="text-[12px] text-foreground font-medium capitalize">
                  {voiceProfile.tone.confidence}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Register Dimensions */}
        <Section id="register" title="Register Dimensions" icon={Brain} badge="Biber's 6D">
          <div className="space-y-2.5 mt-2">
            <RegisterBar label="Involved / Informational" value={voiceProfile.register.involvedVsInformational} leftLabel="Personal" rightLabel="Factual" />
            <RegisterBar label="Narrative / Non-narrative" value={voiceProfile.register.narrativeVsNonNarrative} leftLabel="Story-like" rightLabel="Expository" />
            <RegisterBar label="Situation / Explicit" value={voiceProfile.register.situationDependentVsExplicit} leftLabel="Contextual" rightLabel="Explicit" />
            <RegisterBar label="Neutral / Persuasive" value={voiceProfile.register.nonPersuasiveVsPersuasive} leftLabel="Neutral" rightLabel="Persuasive" />
            <RegisterBar label="Concrete / Abstract" value={voiceProfile.register.concreteVsAbstract} leftLabel="Concrete" rightLabel="Abstract" />
            <RegisterBar label="Casual / Formal" value={voiceProfile.register.casualVsFormalElaboration} leftLabel="Casual" rightLabel="Formal" />
          </div>
        </Section>

        {/* Quantitative Metrics */}
        {localMetrics && (
          <Section id="metrics" title="Style Metrics" icon={Fingerprint} badge={`${voiceProfile.sampleCount} samples`}>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              <MetricBar label="Readability" value={localMetrics.fleschReadingEase} max={100} />
              <MetricBar label="Formality" value={localMetrics.formalityScore} max={100} />
              <MetricBar label="Avg sentence" value={localMetrics.sentenceLength.mean} suffix=" words" />
              <MetricBar label="Vocab richness" value={Math.round(localMetrics.vocabularyRichness * 100)} suffix="%" />
              <MetricBar label="Questions" value={Math.round(localMetrics.punctuation.questionRate)} suffix="%" />
              <MetricBar label="Contractions" value={Math.round(localMetrics.contractionRate)} suffix="%" />
              <MetricBar label="Active voice" value={Math.round(localMetrics.activeVoiceRate)} suffix="%" />
              <MetricBar label="Exclamations" value={Math.round(localMetrics.punctuation.exclamationRate)} suffix="%" />
            </div>

            {localMetrics.topBigrams.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-border/30">
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Signature phrases
                </p>
                <div className="flex flex-wrap gap-1">
                  {localMetrics.topBigrams.slice(0, 8).map((phrase, i) => (
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
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1.5">
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
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  Catchphrases
                </p>
                <div className="flex flex-wrap gap-1">
                  {voiceProfile.signatures.catchphrases.map((c, i) => (
                    <Badge key={i} variant="info" size="sm">&ldquo;{c}&rdquo;</Badge>
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
                    <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-foreground/80 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            )}

            {voiceProfile.antiPatterns.length > 0 && (
              <div className="pt-2.5 border-t border-border/30">
                <p className="text-[12px] uppercase tracking-wider text-destructive/70 mb-1.5">
                  Never Do
                </p>
                <div className="space-y-1.5">
                  {voiceProfile.antiPatterns.map((ap, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-destructive text-[12px] mt-0.5 flex-shrink-0">&times;</span>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{ap}</p>
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
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              These actual writing samples are injected into every generation prompt for better style matching.
            </p>
            {voiceProfile.exemplars.map((ex, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-md px-2.5 py-2 border border-border/20"
              >
                <p className="text-[12px] text-foreground leading-relaxed line-clamp-3 font-mono">
                  {ex.text}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 tabular-nums">
                  {ex.wordCount} words &middot; {ex.context}
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
          <Button
            onClick={handleSaveAndExit}
            disabled={isSaving}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            {isSaving ? (
              <Loader2 size={15} className="mr-1.5 animate-spin" />
            ) : (
              <Fingerprint size={15} className="mr-1.5" />
            )}
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {voiceProfile.quality.suggestion && (
          <p className="text-[12px] text-muted-foreground/60 text-center">
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
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="text-[12px] font-medium tabular-nums text-foreground">
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
        <span className="text-[12px] text-muted-foreground">{leftLabel}</span>
        <span className="text-[12px] text-muted-foreground">{rightLabel}</span>
      </div>
      <div className="relative h-1.5 bg-muted rounded-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-sm transition-all duration-500"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
      <p className="text-[12px] text-muted-foreground/60 text-center tabular-nums">
        {value}/10
      </p>
    </div>
  );
}

function PatternGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <p key={i} className="text-[12px] text-foreground/80 leading-relaxed pl-2 border-l-2 border-border/40">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
