// Profile Card Component - Displays profile information
import React from 'react';
import type { ProfileData } from '@/lib/db';

interface ProfileCardProps {
  profile: ProfileData;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="border-b border-[#262626] p-4">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center">
          <span className="text-[#ededed] font-semibold">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-[#ededed] font-semibold truncate">
              {profile.name}
            </h3>
            {profile.verified && (
              <svg
                className="w-4 h-4 text-[#0070f3]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <p className="text-[#a1a1a1] text-sm">@{profile.handle}</p>

          {profile.location && (
            <p className="text-[#666] text-xs mt-1">{profile.location}</p>
          )}

          {profile.followers && (
            <p className="text-[#666] text-xs font-mono">
              {formatFollowers(profile.followers)} followers
            </p>
          )}

          {profile.bio && (
            <p className="text-[#a1a1a1] text-sm mt-2 line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
