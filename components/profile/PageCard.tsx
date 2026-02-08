import { memo } from 'react';
import type { PageData } from '@/types';
import { Globe, ExternalLink } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

interface PageCardProps {
  data: PageData;
}

function PageCard({ data }: PageCardProps) {
  return (
    <Card variant="default">
      <CardContent className="p-4">
        {/* Header with globe icon */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            fallback={<Globe size={20} />}
            size="md"
            variant="circle"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">
              {data.hostname}
            </h2>
            {data.ogTitle && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{data.ogTitle}</p>
            )}
            {!data.ogTitle && data.h1 && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{data.h1}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {data.ogDescription && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{data.ogDescription}</p>
        )}

        {/* Social links */}
        {data.socialLinks && data.socialLinks.length > 0 && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground mb-2">Detected social links</p>
            <div className="flex flex-wrap gap-2">
              {data.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {new URL(link).hostname}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        {data.email && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground mb-1">Contact</p>
            <a
              href={`mailto:${data.email}`}
              className="text-sm text-primary hover:underline"
            >
              {data.email}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(PageCard, (prevProps, nextProps) => {
  // Only re-render if key page data changes
  return (
    prevProps.data.hostname === nextProps.data.hostname &&
    prevProps.data.ogTitle === nextProps.data.ogTitle &&
    prevProps.data.ogDescription === nextProps.data.ogDescription
  );
});
