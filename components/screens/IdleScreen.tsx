import { Zap } from '@/lib/icons';
import { PLATFORM_ICONS } from '@/lib/icons';

export default function IdleScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mb-5">
        <Zap size={22} className="text-muted-foreground" />
      </div>

      {/* Title */}
      <h1 className="text-base font-semibold text-foreground mb-1.5">
        Navigate to a page
      </h1>

      <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mb-6">
        Open any profile, portfolio, or company page and Reply Guy will help you craft a message.
      </p>

      {/* Platform pills */}
      <div className="flex items-center gap-1.5 mb-6">
        {[
          { icon: PLATFORM_ICONS.x, label: 'X' },
          { icon: PLATFORM_ICONS.linkedin, label: 'LinkedIn' },
          { icon: PLATFORM_ICONS.github, label: 'GitHub' },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 text-[11px] text-muted-foreground"
          >
            <Icon size={12} />
            {label}
          </span>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div className="w-full max-w-[200px] pt-5 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2.5">Shortcuts</p>
        <div className="space-y-1.5">
          {[
            { key: 'Alt+1', label: 'Outreach' },
            { key: 'Alt+2', label: 'History' },
            { key: 'Alt+3', label: 'Settings' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground/60">{label}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted/40 border border-border/40 font-mono text-[9px] text-muted-foreground/50">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
