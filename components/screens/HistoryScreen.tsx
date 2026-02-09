import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Conversation } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

  const STAGGER_DELAY = 30; // ms per item

  // Live query — auto-updates when Dexie data changes
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

  // Filtered conversations
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

  // Analytics stats
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

    const responseRate = total > 0
      ? Math.round((byStatus.responded / total) * 100)
      : 0;

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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x': return '𝕏';
      case 'linkedin': return 'in';
      case 'github': return 'GH';
      default: return '🌐';
    }
  };

  return (
    <div className="space-y-3">
      {/* Stats toggle + search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search conversations..."
            variant="bordered"
            size="md"
            leftIcon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
        {stats && (
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-3 rounded-lg border transition-colors ${
              showStats
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
            aria-label="Toggle analytics"
            aria-pressed={showStats}
          >
            <BarChart3 size={16} />
          </button>
        )}
      </div>

      {/* Analytics dashboard */}
      {showStats && stats && (
        <Card variant="default">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold leading-tight text-foreground">Analytics</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold font-numerical text-foreground">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Total Sent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold font-numerical text-foreground">{stats.last7Days}</p>
                <p className="text-[10px] text-muted-foreground">Last 7 Days</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold font-numerical text-foreground">{stats.responseRate}%</p>
                <p className="text-[10px] text-muted-foreground">Response Rate</p>
              </div>
            </div>
            {/* Platform breakdown */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {Object.entries(stats.byPlatform).map(([platform, count]) => (
                <Badge key={platform} variant="default" size="sm">
                  {getPlatformIcon(platform)} {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'x', 'linkedin', 'github', 'generic'] as FilterType[]).map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-card'
              }`}
              aria-pressed={activeFilter === filter}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <Card variant="default">
          <CardContent className="p-8 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {searchQuery || activeFilter !== 'all'
                ? 'No conversations match your search'
                : 'No conversations yet. Copy and send a message to start tracking.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, convs]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-semibold leading-tight text-muted-foreground px-1">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </h3>
            {convs.map((conv) => {
              const globalIndex = filtered.findIndex(c => c.id === conv.id);
              return (
                <Card
                  key={conv.id}
                  variant="default"
                  className={`cursor-pointer transition-all ${
                    expandedId === conv.id ? 'ring-1 ring-foreground/20' : ''
                  }`}
                  style={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : {
                          animation: `fade-in-up ${globalIndex * STAGGER_DELAY}ms forwards`,
                          opacity: 0,
                        }
                  }
                  onClick={() =>
                    setExpandedId(expandedId === conv.id ? null : conv.id)
                  }
                >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] leading-normal font-numerical">
                      {getPlatformIcon(conv.platform)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold leading-tight text-foreground truncate">
                          {conv.pageName}
                        </h4>
                        <span className="text-xs leading-normal text-muted-foreground font-numerical flex-shrink-0">
                          {new Date(conv.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {expandedId !== conv.id && (
                        <p className="text-[13px] leading-relaxed text-muted-foreground truncate mt-1">
                          {conv.sentMessage}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            conv.status === 'sent'
                              ? 'bg-info'
                              : conv.status === 'responded'
                                ? 'bg-success'
                                : 'bg-muted-foreground'
                          }`}
                        />
                        <span className="text-xs leading-normal text-muted-foreground capitalize">
                          {conv.status.replace('_', ' ')}
                        </span>
                      </div>

                      {expandedId === conv.id && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">
                            {conv.sentMessage}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs leading-normal text-muted-foreground">
                              Angle: {conv.angle}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({ id: conv.id, name: conv.pageName });
                              }}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                              aria-label={`Delete conversation with ${conv.pageName}`}
                            >
                              <Trash2 size={14} />
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

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Conversation?"
          description={`Delete the conversation with ${deleteTarget.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
