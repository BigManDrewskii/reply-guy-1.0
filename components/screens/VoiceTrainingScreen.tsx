import { useEffect, useState } from 'react';
import { useVoiceTraining } from '@/hooks/useVoiceTraining';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  // Auto-start voice analysis when transitioning to step 2
  useEffect(() => {
    if (step === 2 && !isExtracting && !voiceProfile && !error) {
      analyzeVoice();
    }
  }, [step, isExtracting, voiceProfile, error, analyzeVoice]);

  // Auto-advance to step 3 when extraction completes
  useEffect(() => {
    if (step === 2 && voiceProfile && !isExtracting) {
      setStep(3);
    }
  }, [step, voiceProfile, isExtracting, setStep]);

  const handleSaveAndExit = async () => {
    await saveVoiceProfile();
    addToast({ type: 'success', message: 'Voice profile saved successfully' });
    if (onBack) {
      onBack();
    }
  };

  const handleBack = () => {
    if (onBack) {
      reset();
      onBack();
    }
  };

  // Step 1: Input example messages
  if (step === 1) {
    return (
      <div className="space-y-6">
        {/* Back button header */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label="Back to settings"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-semibold leading-tight text-foreground">
            Voice Training
          </h2>
        </div>

        {hasExistingProfile && (
          <Alert variant="warning" action={{ label: "Cancel", onClick: handleBack }}>
            You already have a voice profile. Training a new one will replace it.
          </Alert>
        )}

        <div>
          <h3 className="text-sm font-medium leading-tight text-foreground mb-2">
            Step 1: Add Your Messages
          </h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground mb-4">
            Paste 10-20 example DMs you've sent. Separate each message with "---".
          </p>
        </div>

        <textarea
          value={exampleMessages}
          onChange={(e) => setExampleMessages(e.target.value)}
          placeholder={`Hey! Saw your post about...

---

That's really interesting. I've been...

---

Would love to chat more about...`}
          className="w-full h-64 px-4 py-3 bg-card border border-border rounded-lg text-[13px] leading-relaxed text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 resize-none font-mono transition-colors"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs leading-normal text-muted-foreground font-numerical">
            {messageCount} message{messageCount !== 1 ? 's' : ''} detected
          </span>
          <span className="text-xs leading-normal text-muted-foreground">
            Min: 5 · Recommended: 10-20
          </span>
        </div>

        {error && (
          <p className="text-xs leading-normal text-destructive">{error}</p>
        )}

        <Button
          onClick={() => setStep(2)}
          disabled={messageCount < 5}
          variant="primary"
          size="md"
          className="w-full"
        >
          Analyze My Voice →
        </Button>
      </div>
    );
  }

  // Step 2: Voice analysis in progress
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label="Back to settings"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-semibold leading-tight text-foreground">
            Voice Training
          </h2>
        </div>

        <div>
          <h3 className="text-sm font-medium leading-tight text-foreground mb-2">
            Step 2: Analyzing Your Voice
          </h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Extracting your unique writing style...
          </p>
        </div>

        {isExtracting && (
          <div className="space-y-3">
            {extractionProgress.tone !== undefined && (
              <div className="animate-fade-in">
                <Badge variant="success" dot size="md">Tone detected</Badge>
              </div>
            )}

            {extractionProgress.openingPatterns && (
              <div className="animate-fade-in">
                <Badge variant="success" dot size="md">Opening patterns found</Badge>
              </div>
            )}

            {extractionProgress.closingPatterns && (
              <div className="animate-fade-in">
                <Badge variant="success" dot size="md">Closing patterns found</Badge>
              </div>
            )}

            {extractionProgress.personalityMarkers && (
              <div className="animate-fade-in">
                <Badge variant="success" dot size="md">Personality markers identified</Badge>
              </div>
            )}

            {extractionProgress.avoidPhrases && (
              <div className="animate-fade-in">
                <Badge variant="success" dot size="md">Avoidances analyzed</Badge>
              </div>
            )}

            {extractionProgress.vocabularySignature && (
              <div className="animate-fade-in">
                <Badge variant="success" dot size="md">Vocabulary signature captured</Badge>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="error" action={{ label: "← Go back", onClick: () => setStep(1) }}>
            {error}
          </Alert>
        )}

        <Button
          onClick={() => {
            reset();
            setStep(1);
          }}
          variant="ghost"
          size="md"
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  // Step 3: Review and save
  if (step === 3 && voiceProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            aria-label="Back to settings"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-semibold leading-tight text-foreground">
            Voice Training
          </h2>
        </div>

        <div>
          <h3 className="text-sm font-medium leading-tight text-foreground mb-2">
            Step 3: Review Your Voice Profile
          </h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Review and edit your voice fingerprint before saving.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tone */}
          <Card variant="default">
            <CardContent className="p-4">
              <label className="text-xs leading-normal text-muted-foreground block mb-2">Tone</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={voiceProfile.tone}
                  readOnly
                  className="flex-1 accent-foreground"
                />
                <span className="text-[13px] leading-relaxed font-numerical text-foreground w-8 text-right">
                  {voiceProfile.tone}/10
                </span>
              </div>
              <p className="text-xs leading-normal text-muted-foreground mt-2">
                {voiceProfile.tone <= 3 ? 'Formal & Professional' : voiceProfile.tone <= 7 ? 'Balanced' : 'Casual & Friendly'}
              </p>
            </CardContent>
          </Card>

          {/* Opening patterns */}
          <Card variant="default">
            <CardContent className="p-4">
              <label className="text-xs leading-normal text-muted-foreground block mb-2">Opening Patterns</label>
              <div className="space-y-1">
                {voiceProfile.openingPatterns.map((pattern, i) => (
                  <p key={i} className="text-xs leading-normal text-muted-foreground font-mono">
                    "{pattern}"
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personality markers */}
          <Card variant="default">
            <CardContent className="p-4">
              <label className="text-xs leading-normal text-muted-foreground block mb-2">Personality Markers</label>
              <div className="flex flex-wrap gap-2">
                {voiceProfile.personalityMarkers.map((marker, i) => (
                  <Badge key={i} variant="default" size="sm">
                    {marker}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vocabulary signature */}
          <Card variant="default">
            <CardContent className="p-4">
              <label className="text-xs leading-normal text-muted-foreground block mb-2">Vocabulary Signature</label>
              <div className="flex flex-wrap gap-2">
                {voiceProfile.vocabularySignature.map((word, i) => (
                  <Badge key={i} variant="info" size="sm">
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setStep(1)}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            ← Back
          </Button>
          <Button
            onClick={handleSaveAndExit}
            variant="primary"
            size="md"
            className="flex-1"
          >
            Save Voice Profile
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
