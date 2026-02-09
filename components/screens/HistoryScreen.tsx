import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Conversation } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, BarChart3 } from '@/lib/icons';
import ConfirmDialog from '@/components/ui/dialog';

type FilterType = 'all' | 'x' | 'linkedin' | 'github' | 'generic';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const STAGGER_DELAY = 30;

  const conversations = useLiveQuery(
    () => db.conversations.orderBy('sentAt').reverse().limit(100).toArray(),
    [],
    []
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const filtered = useMemo(() => {
    let result = conversations;
    if (activeFilter !== 'all') {
      result = result.filter((c) => c.platform === activeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.pageName.toLowerCase().includes(query) ||
          c.sentMessage.toLowerCase().includes(query)
      );
    }
    return result;
  }, [conversations, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    if (!conversations.length) return null;
    const total = conversations.length;
    const byPlatform: Record<string, number> = {};
    const byStatus: Record<string, number> = { sent: 0, responded: 0, no_response: 0 };
    const last7Days = conversations.filter(
      (c) => Date.now() - c.sentAt < 7 * 24 * 60 * 60 * 1000
    ).length;
    conversations.forEach((c) => {
      byPlatform[c.platform] = (byPlatform[c.platform] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });
    const responseRate = total > 0 ? Math.round((byStatus.responded / total) * 100) : 0;
    return { total, byPlatform, byStatus, last7Days, responseRate };
  }, [conversations]);

  const handleDelete = async (id: string) => {
    await db.conversations.delete(id);
    setDeleteTarget(null);
    setExpandedId(null);
  };

  const groupByDate = (convs: Conversation[]) => {
    const groups: Record<string, Conversation[]> = {};
    convs.forEach((c) => {
      const date = new Date(c.sentAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(c);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'x': return 'X';
      case 'linkedin': return 'in';
      case 'github': return 'GH';
      default: return 'W';
    }
  };

  return (
    <div className="space-y-3">
      {/* Search + stats toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversations"
            className="pl-8"
          />
        </div>
        {stats && (
          <button
            onClick={() => setShowStats(!showStats)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
              showStats
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border/60 hover:text-foreground'
            }`}
            aria-label="Toggle analytics"
            aria-pressed={showStats}
          >
            <BarChart3 size={14} />
          </button>
        )}
      </div>

      {/* Analytics dashboard */}
      {showStats && stats && (
        <Card variant="default">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-lg font-bold tabular-nums text-foreground">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-lg font-bold tabular-nums text-foreground">{stats.last7Days}</p>
                <p className="text-[10px] text-muted-foreground">7 Days</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-lg font-bold tabular-nums text-foreground">{stats.responseRate}%</p>
                <p className="text-[10px] text-muted-foreground">Replied</p>
              </div>
            </div>
            {Object.keys(stats.byPlatform).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-border/40">
                {Object.entries(stats.byPlatform).map(([platform, count]) => (
                  <Badge key={platform} variant="outline" size="sm">
                    {getPlatformLabel(platform)} {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Platform filters */}
      <div className="flex gap-1.5">
        {(['all', 'x', 'linkedin', 'github'] as FilterType[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={activeFilter === filter}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs text-muted-foreground">
            {searchQuery || activeFilter !== 'all'
              ? 'No conversations match your search.'
              : 'No conversations yet.'}
          </p>
          {!searchQuery && activeFilter === 'all' && (
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Copy and send a message to start tracking.
            </p>
          )}
        </div>
      ) : (
        Object.entries(grouped).map(([date, convs]) => (
          <div key={date} className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 px-1 pt-1">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </p>
            {convs.map((conv) => {
              const globalIndex = filtered.findIndex((c) => c.id === conv.id);
              const isExpanded = expandedId === conv.id;

              return (
                <Card
                  key={conv.id}
                  variant="default"
                  className={`cursor-pointer transition-all ${
                    isExpanded ? 'ring-1 ring-ring/30' : ''
                  }`}
                  style={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : {
                          animation: `fade-in-up 200ms ${globalIndex * STAGGER_DELAY}ms forwards`,
                          opacity: 0,
                        }
                  }
                  onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      {/* Platform icon */}
                      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                        {getPlatformLabel(conv.platform)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-[13px] font-medium text-foreground truncate">
                            {conv.pageName}
                          </h4>
                          <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
                            {new Date(conv.sentAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {!isExpanded && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {conv.sentMessage}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              conv.status === 'sent'
                                ? 'bg-info'
                                : conv.status === 'responded'
                                  ? 'bg-success'
                                  : 'bg-muted-foreground'
                            }`}
                          />
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {conv.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] text-muted-foreground/60 capitalize">
                            {conv.angle}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="mt-2.5 pt-2.5 border-t border-border/40">
                            <p className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                              {conv.sentMessage}
                            </p>
                            <div className="flex items-center justify-end mt-2.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({ id: conv.id, name: conv.pageName });
                                }}
                                className="flex items-center gap-1 text-[10px] text-destructive/70 hover:text-destructive transition-colors"
                                aria-label={`Delete conversation with ${conv.pageName}`}
                              >
                                <Trash2 size={11} />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Conversation?"
          description={`Delete the conversation with ${deleteTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
