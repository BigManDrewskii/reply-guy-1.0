import { useEffect, useState } from 'react';
import type { PageData, OutreachAngle } from '@/types';
import ProfileCard from '@/components/profile/ProfileCard';
import PageCard from '@/components/profile/PageCard';
import MessageCard from '@/components/messages/MessageCard';
import PostCopySheet from '@/components/messages/PostCopySheet';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/hooks/useAnalysis';
import { db } from '@/lib/db';
import { AlertOctagon, Zap } from '@/lib/icons';

interface OutreachScreenProps {
  initialData?: PageData | null;
}

export default function OutreachScreen({ initialData }: OutreachScreenProps) {
  const [pageData, setPageData] = useState<PageData | null | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [selectedAngle, setSelectedAngle] = useState<OutreachAngle['angle']>('service');
  const [showPostCopySheet, setShowPostCopySheet] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [lastCopiedMessage, setLastCopiedMessage] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const { analysis, isAnalyzing, isDebouncing, debounceCountdown, error, analyzePage, cancelAnalysis } = useAnalysis();

  useEffect(() => {
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.currentPageData) {
        const newData = changes.currentPageData.newValue;
        setPageData(newData);
        setIsLoading(false);
        setHasAnalyzed(false);
        setDuplicateWarning(null);
      }
    };

    chrome.storage.session.onChanged.addListener(listener);
    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    const checkDuplicate = async () => {
      if (!pageData?.url) return;
      try {
        const existing = await db.conversations
          .where('pageUrl')
          .equals(pageData.url)
          .count();
        if (existing > 0) {
          setDuplicateWarning(`You've already sent ${existing} message${existing > 1 ? 's' : ''} to this page.`);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Silently fail
      }
    };
    checkDuplicate();
  }, [pageData?.url]);

  const handleAnalyze = () => {
    if (pageData && !analysis && !isAnalyzing && !hasAnalyzed) {
      setHasAnalyzed(true);
      analyzePage(pageData);
    }
  };

  const handleCopy = (message?: string) => {
    if (message) {
      setLastCopiedMessage(message);
    }
    setTimeout(() => setShowPostCopySheet(true), 100);
  };

  const handleLogged = async () => {
    if (!pageData || !lastCopiedMessage) return;

    try {
      await db.conversations.add({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        platform: pageData.platform,
        pageUrl: pageData.url,
        pageName: analysis?.personName || pageData.name || pageData.ogTitle || pageData.hostname,
        sentMessage: lastCopiedMessage,
        angle: selectedAngle,
        sentAt: Date.now(),
        status: 'sent',
      });
    } catch (err) {
      console.error('[OutreachScreen] Failed to log conversation:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <ProfileCardSkeleton />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // No data yet
  if (!pageData) {
    return (
      <div className="text-center py-8">
        <p className="text-[13px] leading-relaxed text-muted-foreground">Waiting for page data...</p>
      </div>
    );
  }

  const isProfile = pageData.isProfile || pageData.name;

  return (
    <div className="space-y-3">
      {isProfile ? (
        <ProfileCard data={pageData} />
      ) : (
        <PageCard data={pageData} />
      )}

      {/* Duplicate contact warning */}
      {duplicateWarning && (
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <AlertOctagon size={14} className="shrink-0" />
            <span>{duplicateWarning}</span>
          </div>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Analyze CTA — before analysis */}
      {pageData && !analysis && !isAnalyzing && !isDebouncing && !hasAnalyzed && (
        <Card variant="default">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Zap size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Ready to analyze
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Generate personalized outreach for{' '}
              <span className="text-foreground font-medium">
                {pageData.name || pageData.ogTitle || pageData.hostname}
              </span>
            </p>
            <Button
              onClick={handleAnalyze}
              variant="primary"
              size="md"
              className="w-full"
            >
              Analyze This Page
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debouncing countdown */}
      {isDebouncing && (
        <Card variant="default">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
              <span className="text-xs font-medium text-foreground">Starting analysis...</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Analyzing in {debounceCountdown}s
            </p>
            <Button
              onClick={cancelAnalysis}
              variant="ghost"
              size="xs"
              className="mt-2"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analyzing state */}
      {isAnalyzing && !analysis && (
        <Card variant="default">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
              <span className="text-xs font-medium text-foreground">Analyzing page...</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2 bg-muted rounded-full w-full animate-pulse"></div>
              <div className="h-2 bg-muted rounded-full w-3/4 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis results */}
      {analysis && (
        <>
          {/* Confidence */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={analysis.confidence} showValue size="md" />
              {analysis.confidenceReason && (
                <p className="text-[11px] leading-relaxed text-muted-foreground mt-2">
                  {analysis.confidenceReason}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {analysis.summary && (
            <Card variant="default">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {analysis.interests && analysis.interests.length > 0 && (
            <Card variant="default">
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.interests.map((interest, i) => (
                    <Badge key={i} variant="outline" size="sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Messages section */}
      {analysis && pageData && (
        <MessageCard
          pageData={pageData}
          analysis={analysis}
          selectedAngle={selectedAngle}
          onSelectAngle={setSelectedAngle}
          onCopy={handleCopy}
        />
      )}

      {/* Post-copy sheet */}
      <PostCopySheet
        isOpen={showPostCopySheet}
        onClose={() => setShowPostCopySheet(false)}
        onLogged={handleLogged}
      />
    </div>
  );
}
