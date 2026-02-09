import { Target } from '@/lib/icons';
import { PLATFORM_ICONS } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';

export default function IdleScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Target size={32} className="text-foreground" />
      </div>

      <h1 className="text-lg font-semibold text-foreground mb-2">
        Navigate to any page
      </h1>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-xs">
        Browse a profile, portfolio, or company page — Reply Guy will read it and help you craft a message.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-3">Enhanced on:</p>
          <div className="flex justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
              <PLATFORM_ICONS.x size={14} /> X
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
              <PLATFORM_ICONS.linkedin size={14} /> LinkedIn
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-xs text-muted-foreground">
              <PLATFORM_ICONS.github size={14} /> GitHub
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Works on any site.</p>
        </div>

        {/* Keyboard shortcuts hint */}
        <Card variant="default">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Keyboard shortcuts</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Alt+1</kbd>
                <span>Outreach</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Alt+2</kbd>
                <span>History</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Alt+3</kbd>
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Esc</kbd>
                <span>Go back</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
