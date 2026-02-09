import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Conversation, type Contact } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Trash2, BarChart3, ExternalLink, X } from '@/lib/icons';
import ConfirmDialog from '@/components/ui/dialog';
import { deleteContact, updateContactStatus, getCrmStats } from '@/lib/crm';

type Tab = 'conversations' | 'contacts';
type FilterType = 'all' | 'x' | 'linkedin' | 'github' | 'generic';
type ContactStatus = Contact['status'];

const STATUS_COLORS: Record<ContactStatus, string> = {
  new: 'bg-muted-foreground',
  contacted: 'bg-info',
  replied: 'bg-success',
  meeting: 'bg-warning',
  converted: 'bg-chart-1',
  archived: 'bg-muted-foreground/40',
};

const STATUS_OPTIONS: ContactStatus[] = ['new', 'contacted', 'replied', 'meeting', 'converted', 'archived'];

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteContactTarget, setDeleteContactTarget] = useState<{ id: number; name: string } | null>(null);
  const [crmStats, setCrmStats] = useState<Awaited<ReturnType<typeof getCrmStats>> | null>(null);

  const STAGGER_DELAY = 30;

  const conversations = useLiveQuery(
    () => db.conversations.orderBy('sentAt').reverse().limit(100).toArray(),
    [],
    []
  );

  const contacts = useLiveQuery(
    () => db.contacts.orderBy('lastContactedAt').reverse().toArray(),
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

  // Load CRM stats when stats panel is shown
  useEffect(() => {
    if (showStats) {
      getCrmStats().then(setCrmStats).catch(() => {});
    }
  }, [showStats, contacts, conversations]);

  // ============================================
  // Conversations tab logic
  // ============================================

  const filteredConversations = useMemo(() => {
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

  const convStats = useMemo(() => {
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

  // ============================================
  // Contacts tab logic
  // ============================================

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (activeFilter !== 'all') {
      result = result.filter((c) => c.platform === activeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.bio || '').toLowerCase().includes(query) ||
          (c.username || '').toLowerCase().includes(query)
      );
    }
    return result;
  }, [contacts, activeFilter, searchQuery]);

  const handleDeleteConversation = async (id: string) => {
    await db.conversations.delete(id);
    setDeleteTarget(null);
    setExpandedId(null);
  };

  const handleDeleteContact = async (id: number) => {
    await deleteContact(id);
    setDeleteContactTarget(null);
    setExpandedContactId(null);
  };

  const handleStatusChange = async (contactId: number, status: ContactStatus) => {
    await updateContactStatus(contactId, status);
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

  const grouped = groupByDate(filteredConversations);

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'x': return 'X';
      case 'linkedin': return 'in';
      case 'github': return 'GH';
      default: return 'W';
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-lg bg-muted/50 p-0.5 gap-0.5">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 py-1.5 px-3 rounded-md text-[11px] font-medium transition-all ${
            activeTab === 'conversations'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Messages {conversations.length > 0 && `(${conversations.length})`}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-1.5 px-3 rounded-md text-[11px] font-medium transition-all ${
            activeTab === 'contacts'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Contacts {contacts.length > 0 && `(${contacts.length})`}
        </button>
      </div>

      {/* Search + stats toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={activeTab === 'conversations' ? 'Search messages...' : 'Search contacts...'}
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
            className="pl-8"
          />
        </div>
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
      </div>

      {/* Analytics dashboard */}
      {showStats && (
        <Card variant="default">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {crmStats?.totalContacts || contacts.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Contacts</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {convStats?.total || 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Messages</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {convStats?.responseRate || 0}%
                </p>
                <p className="text-[10px] text-muted-foreground">Reply Rate</p>
              </div>
            </div>
            {crmStats && crmStats.topAngles.length > 0 && (
              <div className="pt-3 mt-3 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground mb-1.5">Top Angles</p>
                <div className="flex flex-wrap gap-1.5">
                  {crmStats.topAngles.map(({ angle, count }) => (
                    <Badge key={angle} variant="outline" size="sm">
                      {angle} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {crmStats && Object.keys(crmStats.contactsByPlatform).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-border/40">
                {Object.entries(crmStats.contactsByPlatform).map(([platform, count]) => (
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

      {/* ============================================ */}
      {/* Conversations Tab */}
      {/* ============================================ */}
      {activeTab === 'conversations' && (
        <>
          {filteredConversations.length === 0 ? (
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
                  const globalIndex = filteredConversations.findIndex((c) => c.id === conv.id);
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
        </>
      )}

      {/* ============================================ */}
      {/* Contacts Tab */}
      {/* ============================================ */}
      {activeTab === 'contacts' && (
        <>
          {filteredContacts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-muted-foreground">
                {searchQuery || activeFilter !== 'all'
                  ? 'No contacts match your search.'
                  : 'No contacts yet.'}
              </p>
              {!searchQuery && activeFilter === 'all' && (
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Contacts are created automatically when you send messages.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredContacts.map((contact, index) => {
                const isExpanded = expandedContactId === contact.id;

                return (
                  <Card
                    key={contact.id}
                    variant="default"
                    className={`cursor-pointer transition-all ${
                      isExpanded ? 'ring-1 ring-ring/30' : ''
                    }`}
                    style={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : {
                            animation: `fade-in-up 200ms ${index * STAGGER_DELAY}ms forwards`,
                            opacity: 0,
                          }
                    }
                    onClick={() => setExpandedContactId(isExpanded ? null : (contact.id ?? null))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2.5">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[11px] font-semibold text-primary">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-[13px] font-medium text-foreground truncate">
                                {contact.name}
                              </h4>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COLORS[contact.status]}`} />
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
                              {getRelativeTime(contact.lastContactedAt)}
                            </span>
                          </div>

                          {/* Bio/headline preview */}
                          {(contact.headline || contact.bio) && !isExpanded && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {contact.headline || contact.bio}
                            </p>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Badge variant="outline" size="sm">
                              {getPlatformLabel(contact.platform)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {contact.totalMessages} msg{contact.totalMessages !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40">·</span>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {contact.status}
                            </span>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="mt-2.5 pt-2.5 border-t border-border/40 space-y-2.5">
                              {/* Bio */}
                              {(contact.headline || contact.bio) && (
                                <p className="text-[12px] leading-relaxed text-muted-foreground">
                                  {contact.headline || contact.bio}
                                </p>
                              )}

                              {/* Location + followers */}
                              {(contact.location || contact.followers) && (
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                                  {contact.location && <span>{contact.location}</span>}
                                  {contact.location && contact.followers && <span>·</span>}
                                  {contact.followers && <span>{contact.followers} followers</span>}
                                </div>
                              )}

                              {/* Tags */}
                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {contact.tags.map((tag, i) => (
                                    <Badge key={i} variant="outline" size="sm">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Status changer */}
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                                <div className="flex flex-wrap gap-1">
                                  {STATUS_OPTIONS.map((status) => (
                                    <button
                                      key={status}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (contact.id) handleStatusChange(contact.id, status);
                                      }}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                                        contact.status === status
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between">
                                <a
                                  href={contact.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-[10px] text-info hover:text-info/80 transition-colors"
                                >
                                  <ExternalLink size={10} />
                                  View Profile
                                </a>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (contact.id) {
                                      setDeleteContactTarget({ id: contact.id, name: contact.name });
                                    }
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-destructive/70 hover:text-destructive transition-colors"
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
          )}
        </>
      )}

      {/* Confirm dialogs */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Conversation?"
          description={`Delete the conversation with ${deleteTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDeleteConversation(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {deleteContactTarget && (
        <ConfirmDialog
          title="Delete Contact?"
          description={`Delete ${deleteContactTarget.name} and all associated touchpoints? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => handleDeleteContact(deleteContactTarget.id)}
          onClose={() => setDeleteContactTarget(null)}
        />
      )}
    </div>
  );
}
