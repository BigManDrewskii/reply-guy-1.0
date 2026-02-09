import { Zap } from '@/lib/icons';
import { PLATFORM_ICONS } from '@/lib/icons';

export default function IdleScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-6 animate-fade-in-up">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Zap size={24} className="text-muted-foreground" />
      </div>

      {/* Title */}
      <h1 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Navigate to a page
      </h1>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mb-8">
        Open any profile, portfolio, or company page and Reply Guy will help you craft a message.
      </p>

      {/* Platform pills */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { icon: PLATFORM_ICONS.x, label: 'X' },
          { icon: PLATFORM_ICONS.linkedin, label: 'LinkedIn' },
          { icon: PLATFORM_ICONS.github, label: 'GitHub' },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-xs text-muted-foreground border border-border/20"
          >
            <Icon size={13} />
            {label}
          </span>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div className="w-full max-w-[220px] pt-6 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.08em] font-semibold mb-3">Shortcuts</p>
        <div className="space-y-2">
          {[
            { key: 'Alt+1', label: 'Outreach' },
            { key: 'Alt+2', label: 'History' },
            { key: 'Alt+3', label: 'Settings' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/50">{label}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-muted/30 border border-border/30 font-mono text-[10px] text-muted-foreground/40">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
