import React from 'react';
import { Badge } from '../ui/Badge';
import type { Platform } from '../../types';

interface HeaderProps {
  platformBadge?: Platform;
}

export default function Header({ platformBadge }: HeaderProps) {
  const getPlatformLabel = (platform: Platform): string => {
    switch (platform) {
      case 'x': return '𝕏';
      case 'linkedin': return 'in';
      case 'github': return 'GH';
      case 'dribbble': return 'Dr';
      case 'behance': return 'Be';
      case 'generic': return '🌐';
      default: return '';
    }
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-bg-050 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-text-primary">⚡ Reply Guy</span>
      </div>
      {platformBadge && (
        <Badge variant="platform" className="text-[10px]">
          {getPlatformLabel(platformBadge)}
        </Badge>
      )}
    </header>
  );
}
