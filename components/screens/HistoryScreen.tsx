import { useState, useEffect } from 'react';
import { db, type Conversation } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Trash2 } from '@/lib/icons';

type FilterType = 'all' | 'x' | 'linkedin' | 'github' | 'generic';

export default function HistoryScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filtered, setFiltered] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      const all = await db.conversations
        .orderBy('sentAt')
        .reverse()
        .limit(50)
        .toArray();
      setConversations(all);
    };
    loadConversations();
  }, []);

  useEffect(() => {
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

    setFiltered(result);
  }, [conversations, activeFilter, searchQuery]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this conversation?')) {
      await db.conversations.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
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
      case 'x':
        return '𝕏';
      case 'linkedin':
        return 'in';
      case 'github':
        return 'GH';
      default:
        return '🌐';
    }
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search conversations..."
        variant="bordered"
        size="md"
        leftIcon={<Search size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search conversations"
      />

      <div className="flex gap-2 flex-wrap">
        {(['all', 'x', 'linkedin', 'github', 'generic'] as FilterType[]).map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-card'
              }`}
              aria-pressed={activeFilter === filter}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <Card variant="default">
          <CardContent className="p-8 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {searchQuery || activeFilter !== 'all'
                ? 'No conversations match your search'
                : 'No conversations yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, convs]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-semibold leading-tight text-muted-foreground px-1">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </h3>
            {convs.map((conv) => (
              <Card
                key={conv.id}
                variant="default"
                className={`cursor-pointer transition-all ${
                  expandedId === conv.id ? 'ring-2 ring-primary' : ''
                }`}
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

                      {!expandedId && (
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
                                handleDelete(conv.id);
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
            ))}
          </div>
        ))
      )}
    </div>
  );
}
