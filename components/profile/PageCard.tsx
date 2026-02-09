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
      <CardContent className="p-5">
        {/* Header with globe icon */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <Avatar
            fallback={<Globe size={20} />}
            size="md"
            variant="circle"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate tracking-tight">
              {data.hostname}
            </h2>
            {data.ogTitle && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{data.ogTitle}</p>
            )}
            {!data.ogTitle && data.h1 && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{data.h1}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {data.ogDescription && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3.5 leading-relaxed">{data.ogDescription}</p>
        )}

        {/* Social links */}
        {data.socialLinks && data.socialLinks.length > 0 && (
          <div className="border-t border-border/30 pt-3.5 mt-3.5">
            <p className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5">Detected social links</p>
            <div className="flex flex-wrap gap-2">
              {data.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground/70 hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200"
                >
                  {new URL(link).hostname}
                  <ExternalLink size={15} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        {data.email && (
          <div className="border-t border-border/30 pt-3.5 mt-3.5">
            <p className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-1.5">Contact</p>
            <a
              href={`mailto:${data.email}`}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200"
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
  return (
    prevProps.data.hostname === nextProps.data.hostname &&
    prevProps.data.ogTitle === nextProps.data.ogTitle &&
    prevProps.data.ogDescription === nextProps.data.ogDescription
  );
});
