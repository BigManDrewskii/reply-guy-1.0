import React from 'react';
import { ConfidenceIcon } from '../../lib/icons';
import { ICON_SIZE, ICON_DEFAULTS } from '../../lib/icons';
import { Badge } from '../ui/Badge';

export default function IdleScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] px-6">
      {/* Icon */}
      <ConfidenceIcon {...ICON_DEFAULTS} size={ICON_SIZE.xxl} className="text-text-tertiary mb-6" />

      {/* Heading */}
      <h1 className="text-xl font-semibold text-text-primary mb-2">
        Browse any page
      </h1>

      {/* Description */}
      <p className="text-sm text-text-secondary text-center mb-8 max-w-xs">
        Navigate to any profile or page and Reply Guy will read it and help you craft the perfect outreach message.
      </p>

      {/* Platform badges */}
      <div className="space-y-4">
        <p className="text-xs text-text-tertiary">Works best on:</p>
        <div className="flex gap-2">
          <Badge variant="platform" className="px-3 py-1.5">𝕏 X</Badge>
          <Badge variant="platform" className="px-3 py-1.5">in LI</Badge>
          <Badge variant="platform" className="px-3 py-1.5">GH</Badge>
        </div>
      </div>

      {/* Additional info */}
      <p className="text-xs text-text-tertiary mt-4 max-w-xs text-center">
        ...and any website with profile info.
      </p>
    </div>
  );
}
