import { Target } from '@/lib/icons';
import { PLATFORM_ICONS } from '@/lib/icons';

export default function IdleScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Target size={32} className="text-foreground" />
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Navigate to any page
      </h1>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Browse a profile, portfolio, or company page —<br />
        Reply Guy will read it and help you<br />
        craft a message.
      </p>

      <div className="border-t border-border pt-6 w-full">
        <p className="text-xs text-muted-foreground mb-3">Enhanced on:</p>
        <div className="flex justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
            <PLATFORM_ICONS.x size={14} />
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
            <PLATFORM_ICONS.linkedin size={14} />
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
            <PLATFORM_ICONS.github size={14} />
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Works on any site.</p>
      </div>
    </div>
  );
}
