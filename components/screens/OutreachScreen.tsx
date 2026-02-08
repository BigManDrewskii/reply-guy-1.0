import { useEffect, useState } from 'react';
import type { PageData, OutreachAngle } from '@/types';
import ProfileCard from '@/components/profile/ProfileCard';
import PageCard from '@/components/profile/PageCard';
import MessageCard from '@/components/messages/MessageCard';
import PostCopySheet from '@/components/messages/PostCopySheet';
import { ProfileCardSkeleton } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalysis } from '@/hooks/useAnalysis';

interface OutreachScreenProps {
  initialData?: PageData | null;
}

export default function OutreachScreen({ initialData }: OutreachScreenProps) {
  const [pageData, setPageData] = useState<PageData | null | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [selectedAngle, setSelectedAngle] = useState<OutreachAngle['angle']>('service');
  const [showPostCopySheet, setShowPostCopySheet] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const { analysis, isAnalyzing, isDebouncing, debounceCountdown, error, analyzePage, cancelAnalysis } = useAnalysis();

  useEffect(() => {
    // Subscribe to page data updates
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.currentPageData) {
        const newData = changes.currentPageData.newValue;
        setPageData(newData);
        setIsLoading(false);
        // Reset hasAnalyzed when page data changes (new page = new analysis needed)
        setHasAnalyzed(false);
      }
    };

    chrome.storage.session.onChanged.addListener(listener);

    return () => chrome.storage.session.onChanged.removeListener(listener);
  }, []);

  const handleAnalyze = () => {
    if (pageData && !analysis && !isAnalyzing && !hasAnalyzed) {
      setHasAnalyzed(true);
      analyzePage(pageData);
    }
  };

  const handleCopy = () => {
    // Show post-copy sheet after a short delay
    setTimeout(() => setShowPostCopySheet(true), 100);
  };

  const handleLogged = () => {
    // Log conversation to history (Phase 7)
    console.log('Conversation logged');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
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

  // Check if this is a profile page or generic page
  const isProfile = pageData.isProfile || pageData.name;

  return (
    <div className="space-y-4">
      {isProfile ? (
        <ProfileCard data={pageData} />
      ) : (
        <PageCard data={pageData} />
      )}

      {/* Analysis section */}
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Show analyze button when data exists but not yet analyzed */}
      {pageData && !analysis && !isAnalyzing && !isDebouncing && !hasAnalyzed && (
        <Card variant="default">
          <CardContent className="p-4 text-center">
            <div className="mb-4 flex justify-center">
              <Badge variant="info" size="md">Ready to analyze</Badge>
            </div>
            <h3 className="text-sm font-semibold leading-tight text-foreground mb-2">
              {pageData.name || pageData.ogTitle || pageData.hostname}
            </h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground mb-6">
              We'll analyze this {pageData.isProfile ? 'profile' : 'page'} and generate personalized outreach messages.
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

      {/* Show debouncing countdown */}
      {isDebouncing && (
        <Card variant="default">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="info" size="sm">Starting analysis...</Badge>
            </div>
            <p className="text-xs leading-normal text-muted-foreground">
              Analyzing in {debounceCountdown} second{debounceCountdown !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={cancelAnalysis}
              variant="ghost"
              size="xs"
              className="mt-3"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && !analysis && (
        <Card variant="default">
          <CardContent className="p-4 text-center">
            <Badge variant="info" size="sm">Analyzing page...</Badge>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          <Card variant="default">
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs leading-normal text-muted-foreground">Confidence</span>
                </div>
                <Progress value={analysis.confidence} showValue size="md" />
              </div>
              {analysis.confidenceReason && (
                <p className="text-xs leading-normal text-muted-foreground mt-2">{analysis.confidenceReason}</p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {analysis.summary && (
            <Card variant="default">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold leading-tight text-muted-foreground mb-2">Summary</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{analysis.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {analysis.interests && analysis.interests.length > 0 && (
            <Card variant="default">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold leading-tight text-muted-foreground mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.interests.map((interest, i) => (
                    <Badge key={i} variant="default" size="sm">
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
