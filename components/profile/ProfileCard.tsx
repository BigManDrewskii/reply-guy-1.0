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

  const formatFollowers = (followers: string) => {
    if (!followers) return '';
    return followers;
  };

  return (
    <Card
      variant="default"
      className="hover:scale-[1.02] hover:border-border/80"
    >
      <CardContent className="p-4">
        {/* Header with platform icon */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            src={data.avatarUrl}
            fallback={data.name?.charAt(0).toUpperCase() || data.ogTitle?.charAt(0).toUpperCase() || '?'}
            size="md"
            variant="circle"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">
              {data.name || data.ogTitle || data.title}
            </h2>
            {data.headline && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{data.headline}</p>
            )}
            {(data.location || data.company) && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {[data.location, data.company].filter(Boolean).join(' · ')}
              </p>
            )}
            {data.followers && (
              <p className="text-xs text-muted-foreground mt-0.5 font-numerical">
                {formatFollowers(data.followers)} followers
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {data.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{data.bio}</p>
        )}

        {/* About section for LinkedIn */}
        {data.about && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{data.about}</p>
        )}

        {/* Recent posts for X */}
        {data.recentPosts && data.recentPosts.length > 0 && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground mb-2">Recent posts</p>
            <div className="space-y-2">
              {data.recentPosts.slice(0, 3).map((post, i) => (
                <p key={i} className="text-xs text-muted-foreground line-clamp-2">
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
  // Only re-render if key profile data changes
  return (
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.headline === nextProps.data.headline &&
    prevProps.data.bio === nextProps.data.bio
  );
});
