import { memo } from 'react';
import type { PageData } from '@/types';
import { PLATFORM_ICONS } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

interface ProfileCardProps {
  data: PageData;
}

function ProfileCard({ data }: ProfileCardProps) {
  const PlatformIcon = PLATFORM_ICONS[data.platform] || PLATFORM_ICONS.generic;

  return (
    <Card variant="default">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <Avatar
            src={data.avatarUrl}
            fallback={data.name?.charAt(0).toUpperCase() || data.ogTitle?.charAt(0).toUpperCase() || '?'}
            size="lg"
            variant="circle"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground truncate tracking-tight">
                {data.name || data.ogTitle || data.title}
              </h2>
              <PlatformIcon size={14} className="text-muted-foreground/60 shrink-0" />
            </div>
            {(data.location || data.company) && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {[data.location, data.company].filter(Boolean).join(' · ')}
              </p>
            )}
            {data.headline && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.headline}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {data.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3.5">
            {data.bio}
          </p>
        )}

        {/* About section for LinkedIn */}
        {data.about && !data.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-3.5">
            {data.about}
          </p>
        )}

        {/* Followers */}
        {data.followers && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground pb-3.5 mb-3.5 border-b border-border/30">
            <span>
              <span className="text-foreground font-medium tabular-nums">{data.followers}</span> followers
            </span>
          </div>
        )}

        {/* Recent posts for X */}
        {data.recentPosts && data.recentPosts.length > 0 && (
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5">
              Recent posts
            </p>
            <div className="space-y-2">
              {data.recentPosts.slice(0, 3).map((post, i) => (
                <p key={i} className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">
                  {post}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(ProfileCard, (prevProps, nextProps) => {
  return (
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.headline === nextProps.data.headline &&
    prevProps.data.bio === nextProps.data.bio
  );
});
