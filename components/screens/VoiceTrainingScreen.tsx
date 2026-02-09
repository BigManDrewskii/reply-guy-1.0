import { useEffect, useState } from 'react';
import { useVoiceTraining } from '@/hooks/useVoiceTraining';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from '@/lib/icons';
import { useToast } from '@/components/ui/useToast';

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
    voiceMetrics,
    voiceMetricsSummary,
    isExtracting,
    extractionProgress,
    error,
    analyzeVoice,
    saveVoiceProfile,
    reset,
  } = useVoiceTraining();

  const { add: addToast } = useToast();
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('voiceProfile', (result) => {
      if (result.voiceProfile) {
        setHasExistingProfile(true);
      }
    });
  }, []);

  useEffect(() => {
    if (step === 2 && !isExtracting && !voiceProfile && !error) {
      analyzeVoice();
    }
  }, [step, isExtracting, voiceProfile, error, analyzeVoice]);

  useEffect(() => {
    if (step === 2 && voiceProfile && !isExtracting) {
      setStep(3);
    }
  }, [step, voiceProfile, isExtracting, setStep]);

  const handleSaveAndExit = async () => {
    await saveVoiceProfile();
    addToast({ type: 'success', message: 'Voice profile saved' });
    if (onBack) onBack();
  };

  const handleBack = () => {
    if (onBack) {
      reset();
      onBack();
    }
  };

  // Header component
  const Header = () => (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={handleBack}
        className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-md"
        aria-label="Back to settings"
      >
        <ArrowLeft size={16} />
      </button>
      <h2 className="text-sm font-semibold text-foreground">Voice Training</h2>
    </div>
  );

  // Step 1: Input example messages
  if (step === 1) {
    return (
      <div className="space-y-4">
        <Header />

        {hasExistingProfile && (
          <Alert variant="warning">
            You already have a voice profile. Training a new one will replace it.
          </Alert>
        )}

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Step 1 of 3
          </p>
          <p className="text-[13px] text-foreground font-medium mb-1">Add your messages</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Paste 10-20 example DMs. Separate each with "---".
          </p>
        </div>

        <textarea
          value={exampleMessages}
          onChange={(e) => setExampleMessages(e.target.value)}
          placeholder={`Hey! Saw your post about...\n\n---\n\nThat's really interesting. I've been...\n\n---\n\nWould love to chat more about...`}
          className="w-full h-56 px-3 py-2.5 bg-background border border-border/60 rounded-lg text-[13px] leading-relaxed text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring resize-none font-mono transition-colors"
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            {messageCount} message{messageCount !== 1 ? 's' : ''}
          </span>
          <span>Min 5 · Best 10-20</span>
        </div>

        {error && <p className="text-[11px] text-destructive">{error}</p>}

        <Button
          onClick={() => setStep(2)}
          disabled={messageCount < 5}
          variant="primary"
          size="md"
          className="w-full"
        >
          Analyze My Voice
        </Button>
      </div>
    );
  }

  // Step 2: Analyzing
  if (step === 2) {
    const progressItems = [
      { key: 'tone', label: 'Tone detected', done: extractionProgress.tone !== undefined },
      { key: 'opening', label: 'Opening patterns', done: !!extractionProgress.openingPatterns },
      { key: 'closing', label: 'Closing patterns', done: !!extractionProgress.closingPatterns },
      { key: 'personality', label: 'Personality markers', done: !!extractionProgress.personalityMarkers },
      { key: 'avoid', label: 'Avoidances', done: !!extractionProgress.avoidPhrases },
      { key: 'vocab', label: 'Vocabulary signature', done: !!extractionProgress.vocabularySignature },
    ];

    return (
      <div className="space-y-4">
        <Header />

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Step 2 of 3
          </p>
          <p className="text-[13px] text-foreground font-medium mb-1">Analyzing your voice</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Running local NLP + AI extraction...
          </p>
        </div>

        {/* Local NLP metrics (appear instantly) */}
        {voiceMetrics && (
          <Card variant="default">
            <CardHeader>
              <CardTitle>Quick Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {voiceMetricsSummary}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <MetricItem label="Readability" value={voiceMetrics.readabilityScore} max={100} />
                <MetricItem label="Formality" value={voiceMetrics.formalityScore} max={100} />
                <MetricItem label="Avg sentence" value={voiceMetrics.avgSentenceLength} suffix=" words" />
                <MetricItem label="Vocab richness" value={voiceMetrics.vocabularyRichness} suffix="%" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* LLM extraction progress */}
        {isExtracting && (
          <Card variant="default">
            <CardHeader>
              <CardTitle>AI Extraction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {progressItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    item.done ? 'bg-success' : 'bg-muted animate-pulse'
                  }`} />
                  <span className={`text-xs transition-colors duration-300 ${
                    item.done ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
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

  // Step 3: Review
  if (step === 3 && voiceProfile) {
    return (
      <div className="space-y-4">
        <Header />

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Step 3 of 3
          </p>
          <p className="text-[13px] text-foreground font-medium mb-1">Review your profile</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Check your voice fingerprint before saving.
          </p>
        </div>

        {/* Tone */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Tone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(voiceProfile.tone / 10) * 100}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-foreground font-medium w-8 text-right">
                {voiceProfile.tone}/10
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {voiceProfile.tone <= 3 ? 'Formal & Professional' : voiceProfile.tone <= 7 ? 'Balanced' : 'Casual & Friendly'}
            </p>
          </CardContent>
        </Card>

        {/* Style Metrics (from compromise.js) */}
        {voiceMetrics && (
          <Card variant="default">
            <CardHeader>
              <CardTitle>Style Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <MetricItem label="Readability" value={voiceMetrics.readabilityScore} max={100} />
                <MetricItem label="Formality" value={voiceMetrics.formalityScore} max={100} />
                <MetricItem label="Questions" value={voiceMetrics.questionFrequency} suffix="%" />
                <MetricItem label="Active voice" value={voiceMetrics.activeVoiceRate} suffix="%" />
                <MetricItem label="Avg sentence" value={voiceMetrics.avgSentenceLength} suffix=" words" />
                <MetricItem label="Vocab richness" value={voiceMetrics.vocabularyRichness} suffix="%" />
              </div>
              {voiceMetrics.topPhrases.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                    Signature phrases
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {voiceMetrics.topPhrases.slice(0, 6).map((phrase, i) => (
                      <Badge key={i} variant="outline" size="sm">{phrase}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Opening patterns */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Opening Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {voiceProfile.openingPatterns.map((pattern: string, i: number) => (
                <p key={i} className="text-xs text-muted-foreground font-mono">
                  "{pattern}"
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personality markers */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Personality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {voiceProfile.personalityMarkers.map((marker: string, i: number) => (
                <Badge key={i} variant="outline" size="sm">{marker}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {voiceProfile.vocabularySignature.map((word: string, i: number) => (
                <Badge key={i} variant="info" size="sm">{word}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => setStep(1)} variant="ghost" size="sm" className="flex-1">
            Redo
          </Button>
          <Button onClick={handleSaveAndExit} variant="primary" size="sm" className="flex-1">
            Save Profile
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// Small metric display component
function MetricItem({ label, value, max, suffix }: {
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
            className="h-full bg-primary/60 rounded-full transition-all"
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
