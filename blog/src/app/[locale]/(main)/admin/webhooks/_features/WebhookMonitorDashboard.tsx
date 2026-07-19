'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  Archive,
  Bell,
  CheckCircle2,
  Copy,
  Eye,
  Link2,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Trash2,
  Webhook,
  Zap,
  ChevronDown,
} from 'lucide-react';

import {
  AdminEmptyState,
  AdminListSkeleton,
} from '@/components/admin/admin-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type {
  WebhookDashboardStats,
  WebhookEventDto,
  WebhookSourceDto,
} from '@/lib/data/webhooks';
import { listWebhookIntegrations, isWebhookIntegrationKey } from '@/lib/webhooks/integrations';
import type { PaginationMeta } from '@/lib/pagination';
import { cn } from '@/lib/utils';

type WebhookMonitorDashboardProps = {
  initialSources: WebhookSourceDto[];
  initialStats: WebhookDashboardStats;
  initialEvents: WebhookEventDto[];
  initialPagination: PaginationMeta;
};

type TabKey = 'events' | 'sources';

const POLL_INTERVAL_MS = 15_000;

const SEVERITY_STYLES = {
  INFO: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
  SUCCESS:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  WARNING:
    'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  ERROR: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
} as const;

const SEVERITY_ACCENT = {
  INFO: 'from-slate-400/80 to-slate-500/40',
  SUCCESS: 'from-emerald-400/90 to-teal-500/50',
  WARNING: 'from-amber-400/90 to-orange-500/50',
  ERROR: 'from-rose-400/90 to-red-500/50',
} as const;

function StatCard({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent?: 'teal' | 'rose' | 'amber';
  icon: typeof Radio;
}) {
  const accentRing =
    accent === 'rose'
      ? 'from-rose-500/20'
      : accent === 'amber'
        ? 'from-amber-500/20'
        : 'from-teal-500/20';

  const valueClass =
    accent === 'rose'
      ? 'text-rose-600 dark:text-rose-400'
      : accent === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : accent === 'teal'
          ? 'text-teal-600 dark:text-teal-400'
          : undefined;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/95 via-card/80 to-card/60 p-4 shadow-lg shadow-black/5 backdrop-blur-xl transition hover:border-border/80">
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-60',
          accentRing,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className={cn('mt-2 text-3xl font-bold tabular-nums tracking-tight', valueClass)}>
            {value}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/50 p-2.5 text-muted-foreground shadow-inner">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function Panel({
  children,
  className,
  accent = 'teal',
}: {
  children: ReactNode;
  className?: string;
  accent?: 'teal' | 'violet';
}) {
  const accents = {
    teal: 'from-teal-500 via-cyan-400 to-emerald-400',
    violet: 'from-violet-500 via-purple-400 to-fuchsia-400',
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-xl shadow-black/5 backdrop-blur-xl',
        className,
      )}
    >
      <div className={cn('h-px w-full bg-gradient-to-r opacity-80', accents[accent])} />
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

function WebhookUrlPreview({
  path,
  query,
  queryClassName,
}: {
  path: string;
  query: string;
  queryClassName?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-4 font-mono text-xs leading-relaxed">
      <div className="break-all">{path}</div>
      <div className={cn('break-all', queryClassName ?? 'text-muted-foreground')}>
        {query}
      </div>
    </div>
  );
}

async function copySourceEndpointUrl(sourceId: string) {
  const response = await fetch(`/api/admin/webhooks/sources/${sourceId}/endpoint-url`);
  if (!response.ok) {
    throw new Error('copy_failed');
  }
  const json = (await response.json()) as { data?: { endpointUrl?: string } };
  if (!json.data?.endpointUrl) {
    throw new Error('copy_failed');
  }
  await copyToClipboard(json.data.endpointUrl);
}

function FilterMenu({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 text-sm shadow-sm transition-colors hover:border-border hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <span className="truncate text-left">{selected?.label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(option.value === value && 'bg-accent font-medium')}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export default function WebhookMonitorDashboard({
  initialSources,
  initialStats,
  initialEvents,
  initialPagination,
}: WebhookMonitorDashboardProps) {
  const t = useTranslations('Admin.Webhooks');
  const format = useFormatter();

  const [tab, setTab] = useState<TabKey>('events');
  const [sources, setSources] = useState(initialSources);
  const [stats, setStats] = useState(initialStats);
  const [events, setEvents] = useState(initialEvents);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventDto | null>(null);
  const [revealedCredentials, setRevealedCredentials] = useState<{
    integrationKey: string;
    endpointUrl: string;
    endpointPath: string;
    endpointQuery: string;
  } | null>(null);
  const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('NEW');
  const skipAutoFilterRef = useRef(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const statsSnapshotRef = useRef({
    totalEvents: initialStats.totalEvents,
    unreadEvents: initialStats.unreadEvents,
  });

  const [newSource, setNewSource] = useState({
    name: '',
    slug: '',
    description: '',
    integrationKey: 'generic',
    enabled: true,
  });

  const refreshSources = useCallback(async () => {
    const response = await fetch('/api/admin/webhooks/sources');
    if (!response.ok) {
      throw new Error('load_failed');
    }
    const json = (await response.json()) as {
      data: { sources: WebhookSourceDto[]; stats: WebhookDashboardStats };
    };
    setSources(json.data.sources);
    setStats(json.data.stats);
  }, []);

  const loadEvents = useCallback(
    async (page = pagination.page, options?: { silent?: boolean }) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      if (sourceFilter !== 'all') {
        params.set('sourceId', sourceFilter);
      }
      if (severityFilter !== 'all') {
        params.set('severity', severityFilter);
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }

      const response = await fetch(`/api/admin/webhooks/events?${params}`);
      if (!response.ok) {
        throw new Error('load_failed');
      }

      const json = (await response.json()) as {
        data: { data: WebhookEventDto[]; pagination: PaginationMeta };
      };

      setEvents(json.data.data);
      setPagination(json.data.pagination);
      setSelectedEvent((current) => {
        if (!current) {
          return null;
        }
        return json.data.data.find((event) => event.id === current.id) ?? current;
      });

      if (!options?.silent) {
        setLastUpdatedAt(new Date());
      }
    },
    [
      debouncedSearch,
      pagination.page,
      pagination.limit,
      severityFilter,
      sourceFilter,
      statusFilter,
    ],
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([refreshSources(), loadEvents()]);
      setLastUpdatedAt(new Date());
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [loadEvents, refreshSources, t]);

  const pollRefresh = useCallback(async () => {
    if (document.visibilityState !== 'visible') {
      return;
    }

    setIsPolling(true);
    try {
      const previous = statsSnapshotRef.current;
      const sourcesResponse = await fetch('/api/admin/webhooks/sources');
      if (!sourcesResponse.ok) {
        return;
      }

      const sourcesJson = (await sourcesResponse.json()) as {
        data: { sources: WebhookSourceDto[]; stats: WebhookDashboardStats };
      };

      const nextStats = sourcesJson.data.stats;
      setSources(sourcesJson.data.sources);
      setStats(nextStats);
      await loadEvents(pagination.page, { silent: true });

      if (nextStats.totalEvents > previous.totalEvents) {
        toast.info(t('newEventReceived'));
      }

      statsSnapshotRef.current = {
        totalEvents: nextStats.totalEvents,
        unreadEvents: nextStats.unreadEvents,
      };
      setLastUpdatedAt(new Date());
    } catch {
      // Sessiz arka plan yenilemesi — kullanıcıyı gereksiz toast ile rahatsız etme.
    } finally {
      setIsPolling(false);
    }
  }, [loadEvents, pagination.page, t]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void pollRefresh();
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void pollRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollRefresh]);

  useEffect(() => {
    if (skipAutoFilterRef.current) {
      skipAutoFilterRef.current = false;
      return;
    }

    let cancelled = false;
    setFiltering(true);

    void loadEvents(1, { silent: true }).finally(() => {
      if (!cancelled) {
        setFiltering(false);
        setLastUpdatedAt(new Date());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, sourceFilter, severityFilter, statusFilter, loadEvents]);

  const handleCreateSource = async () => {
    if (!newSource.name.trim() || !newSource.slug.trim()) {
      toast.error(t('validation.required'));
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/webhooks/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSource.name.trim(),
          slug: newSource.slug.trim().toLowerCase(),
          description: newSource.description.trim() || undefined,
          integrationKey: newSource.integrationKey,
          enabled: newSource.enabled,
        }),
      });

      const json = (await response.json()) as {
        data?: { source: WebhookSourceDto & { endpointUrl: string }; secret: string };
        error?: string;
      };

      if (!response.ok) {
        toast.error(json.error ?? t('actionError'));
        return;
      }

      if (json.data) {
        setRevealedCredentials({
          integrationKey: json.data.source.integrationKey,
          endpointUrl: json.data.source.endpointUrl,
          endpointPath: json.data.source.endpointPath,
          endpointQuery: `?key=${json.data.secret}`,
        });
        setSources((current) => [json.data!.source, ...current]);
        setStats((current) => ({
          ...current,
          totalSources: current.totalSources + 1,
          activeSources: current.activeSources + (json.data!.source.enabled ? 1 : 0),
        }));
        setNewSource({
          name: '',
          slug: '',
          description: '',
          integrationKey: 'generic',
          enabled: true,
        });
        toast.success(t('sourceCreated'));
        setTab('sources');
      }
    } catch {
      toast.error(t('actionError'));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleSource = async (source: WebhookSourceDto) => {
    try {
      const response = await fetch(`/api/admin/webhooks/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !source.enabled }),
      });

      const json = (await response.json()) as {
        data?: WebhookSourceDto;
        error?: string;
      };

      if (!response.ok || !json.data) {
        toast.error(json.error ?? t('actionError'));
        return;
      }

      setSources((current) =>
        current.map((item) => (item.id === source.id ? json.data! : item)),
      );
      await refreshSources();
      toast.success(t('sourceUpdated'));
    } catch {
      toast.error(t('actionError'));
    }
  };

  const handleRotateSecret = async (sourceId: string) => {
    try {
      const response = await fetch(
        `/api/admin/webhooks/sources/${sourceId}/rotate-secret`,
        { method: 'POST' },
      );

      const json = (await response.json()) as {
        data?: { source: WebhookSourceDto & { endpointUrl: string }; secret: string };
        error?: string;
      };

      if (!response.ok || !json.data) {
        toast.error(json.error ?? t('actionError'));
        return;
      }

      setRevealedCredentials({
        integrationKey: json.data.source.integrationKey,
        endpointUrl: json.data.source.endpointUrl,
        endpointPath: json.data.source.endpointPath,
        endpointQuery: `?key=${json.data.secret}`,
      });
      setSources((current) =>
        current.map((item) =>
          item.id === sourceId ? json.data!.source : item,
        ),
      );
      toast.success(t('secretRotated'));
    } catch {
      toast.error(t('actionError'));
    }
  };

  const handleDeleteSource = async () => {
    if (!deleteSourceId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/webhooks/sources/${deleteSourceId}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        toast.error(t('actionError'));
        return;
      }

      setSources((current) => current.filter((item) => item.id !== deleteSourceId));
      await refreshSources();
      await loadEvents(1);
      toast.success(t('sourceDeleted'));
    } catch {
      toast.error(t('actionError'));
    } finally {
      setDeleteSourceId(null);
    }
  };

  const handleEventStatus = async (
    event: WebhookEventDto,
    status: WebhookEventDto['status'],
  ) => {
    try {
      const response = await fetch(`/api/admin/webhooks/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const json = (await response.json()) as {
        data?: WebhookEventDto;
        error?: string;
      };

      if (!response.ok || !json.data) {
        toast.error(json.error ?? t('actionError'));
        return;
      }

      setEvents((current) =>
        current.map((item) => (item.id === event.id ? json.data! : item)),
      );
      if (selectedEvent?.id === event.id) {
        setSelectedEvent(json.data);
      }
      await refreshSources();
    } catch {
      toast.error(t('actionError'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/admin/webhooks/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: sourceFilter !== 'all' ? sourceFilter : undefined,
        }),
      });

      if (!response.ok) {
        toast.error(t('actionError'));
        return;
      }

      await Promise.all([refreshSources(), loadEvents()]);
      toast.success(t('markedAllRead'));
    } catch {
      toast.error(t('actionError'));
    }
  };

  const integrationOptions = useMemo(
    () =>
      listWebhookIntegrations().map((integration) => ({
        value: integration.key,
        label: t(`integrations.${integration.key}.label` as 'integrations.generic.label'),
        description: t(
          `integrations.${integration.key}.description` as 'integrations.generic.description',
        ),
      })),
    [t],
  );

  const integrationLabel = useCallback(
    (key: string) => {
      if (!isWebhookIntegrationKey(key)) {
        return key;
      }
      return t(`integrations.${key}.label` as 'integrations.generic.label');
    },
    [t],
  );

  const sourceFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.all') },
      ...sources.map((source) => ({ value: source.id, label: source.name })),
    ],
    [sources, t],
  );

  const severityFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.all') },
      { value: 'ERROR', label: t('severity.error') },
      { value: 'WARNING', label: t('severity.warning') },
      { value: 'SUCCESS', label: t('severity.success') },
      { value: 'INFO', label: t('severity.info') },
    ],
    [t],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.all') },
      { value: 'NEW', label: t('status.new') },
      { value: 'READ', label: t('status.read') },
      { value: 'ARCHIVED', label: t('status.archived') },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t('stats.sources')}
          value={stats.totalSources}
          accent="teal"
          icon={Radio}
        />
        <StatCard
          label={t('stats.activeSources')}
          value={stats.activeSources}
          icon={Zap}
        />
        <StatCard
          label={t('stats.totalEvents')}
          value={stats.totalEvents}
          icon={Activity}
        />
        <StatCard
          label={t('stats.unreadEvents')}
          value={stats.unreadEvents}
          accent="amber"
          icon={Bell}
        />
        <StatCard
          label={t('stats.errors24h')}
          value={stats.errorEvents24h}
          accent="rose"
          icon={AlertTriangle}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-border/50 bg-muted/30 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setTab('events')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              tab === 'events'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Bell className="h-4 w-4" />
            {t('tabs.events')}
          </button>
          <button
            type="button"
            onClick={() => setTab('sources')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              tab === 'sources'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Webhook className="h-4 w-4" />
            {t('tabs.sources')}
          </button>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isPolling ? 'animate-pulse bg-teal-500' : 'bg-teal-500/70',
                )}
              />
              {t('liveUpdates')}
            </span>
            <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              {t('refresh')}
            </Button>
          </div>
          {lastUpdatedAt && (
            <p className="text-[11px] text-muted-foreground">
              {t('lastUpdated', {
                time: format.dateTime(lastUpdatedAt, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              })}
            </p>
          )}
        </div>
      </div>

      {tab === 'events' ? (
        <Panel>
          <div className="mb-6 rounded-2xl border border-border/40 bg-muted/20 p-4 md:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_auto] lg:items-end">
              <div>
                <Label htmlFor="webhook-search" className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('search')}
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="webhook-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="h-10 border-border/60 bg-background/70 pl-9 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('filters.source')}
                  </Label>
                  <div className="mt-2">
                    <FilterMenu
                      value={sourceFilter}
                      options={sourceFilterOptions}
                      onChange={setSourceFilter}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('filters.severity')}
                  </Label>
                  <div className="mt-2">
                  <FilterMenu
                    value={severityFilter}
                    options={severityFilterOptions}
                    onChange={setSeverityFilter}
                  />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('filters.status')}
                  </Label>
                  <div className="mt-2">
                  <FilterMenu
                    value={statusFilter}
                    options={statusFilterOptions}
                    onChange={setStatusFilter}
                  />
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-10 shrink-0 border-border/60 bg-background/70"
                onClick={() => void handleMarkAllRead()}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t('markAllRead')}
              </Button>
            </div>
          </div>

          {loading ? (
            <AdminListSkeleton rows={5} />
          ) : events.length === 0 ? (
            <AdminEmptyState message={`${t('emptyEvents')}. ${t('emptyEventsHint')}`} />
          ) : (
            <div
              className={cn(
                'space-y-3 transition-opacity',
                filtering && 'pointer-events-none opacity-60',
              )}
            >
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-background/80 to-background/40 p-4 shadow-sm transition hover:border-border/80 hover:shadow-md"
                >
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 w-1 bg-gradient-to-b',
                      SEVERITY_ACCENT[event.severity],
                    )}
                  />
                  <div className="flex flex-col gap-3 pl-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={SEVERITY_STYLES[event.severity]}
                        >
                          {t(`severity.${event.severity.toLowerCase()}` as 'severity.info')}
                        </Badge>
                        <Badge variant="default">{event.sourceName}</Badge>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {event.eventType}
                        </Badge>
                        {event.status === 'NEW' && (
                          <Badge className="bg-teal-600 text-white hover:bg-teal-600">
                            {t('status.new')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base font-medium leading-snug">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format.dateTime(new Date(event.receivedAt), {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                        {event.clientIp ? ` · ${event.clientIp}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 opacity-90 transition group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border/60 bg-background/60"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {t('viewPayload')}
                      </Button>
                      {event.status !== 'READ' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border/60 bg-background/60"
                          onClick={() => void handleEventStatus(event, 'READ')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t('markRead')}
                        </Button>
                      )}
                      {event.status !== 'ARCHIVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleEventStatus(event, 'ARCHIVED')}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          {t('archive')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <DataPagination
              pagination={pagination}
              onPageChange={(page) => void loadEvents(page)}
            />
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Panel accent="violet">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-teal-600" />
              <h3 className="font-semibold">{t('createSource')}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="source-name">{t('fields.name')}</Label>
                <Input
                  id="source-name"
                  value={newSource.name}
                  onChange={(event) =>
                    setNewSource((current) => ({
                      ...current,
                      name: event.target.value,
                      slug:
                        current.slug ||
                        event.target.value
                          .trim()
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="source-slug">{t('fields.slug')}</Label>
                <Input
                  id="source-slug"
                  value={newSource.slug}
                  onChange={(event) =>
                    setNewSource((current) => ({
                      ...current,
                      slug: event.target.value.toLowerCase(),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="source-description">{t('fields.description')}</Label>
                <Textarea
                  id="source-description"
                  value={newSource.description}
                  onChange={(event) =>
                    setNewSource((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div>
                <Label>{t('fields.integration')}</Label>
                <Select
                  value={newSource.integrationKey}
                  onValueChange={(value) =>
                    setNewSource((current) => ({ ...current, integrationKey: value }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {integrationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                  {
                    integrationOptions.find(
                      (option) => option.value === newSource.integrationKey,
                    )?.description
                  }
                </p>
              </div>
              <div>
                <Label>{t('fields.enabled')}</Label>
                <Select
                  value={newSource.enabled ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setNewSource((current) => ({
                      ...current,
                      enabled: value === 'true',
                    }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t('enabled')}</SelectItem>
                    <SelectItem value="false">{t('disabled')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">{t('fields.enabledHint')}</p>
              </div>
              <Button className="w-full" onClick={() => void handleCreateSource()} disabled={creating}>
                {creating ? t('creating') : t('createSource')}
              </Button>
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-teal-600" />
              <h3 className="font-semibold">{t('sourceList')}</h3>
            </div>

            {sources.length === 0 ? (
              <AdminEmptyState message={`${t('emptySources')}. ${t('emptySourcesHint')}`} />
            ) : (
              <div className="space-y-4">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-2xl border border-border/50 bg-gradient-to-br from-background/80 to-background/40 p-5 shadow-sm transition hover:border-border/80 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold">{source.name}</h4>
                          <Badge variant="outline">{integrationLabel(source.integrationKey)}</Badge>
                          {source.enabled ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              {t('enabled')}
                            </Badge>
                          ) : (
                            <Badge variant="outline">{t('disabled')}</Badge>
                          )}
                          {source.unreadCount > 0 && (
                            <Badge variant="outline">{source.unreadCount} {t('unread')}</Badge>
                          )}
                        </div>
                        {source.description && (
                          <p className="text-sm text-muted-foreground">{source.description}</p>
                        )}
                        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-3">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            <Link2 className="h-3.5 w-3.5" />
                            {t('endpointUrl')}
                          </div>
                          <div className="mt-2">
                            <WebhookUrlPreview
                              path={source.endpointPath}
                              query={source.endpointQueryHint}
                            />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void copySourceEndpointUrl(source.id)
                                  .then(() => toast.success(t('copied')))
                                  .catch(() => toast.error(t('actionError')))
                              }
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {t('copyUrl')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleRotateSecret(source.id)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              {t('rotateSecret')}
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {t('copyUrlHint')}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('eventCount', { count: source.eventCount })}
                          {source.lastEventAt
                            ? ` · ${t('lastEvent', {
                                date: format.dateTime(new Date(source.lastEventAt), {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                }),
                              })}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleToggleSource(source)}
                        >
                          {source.enabled ? t('disable') : t('enable')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => setDeleteSourceId(source.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? `${selectedEvent.sourceName} · ${selectedEvent.eventType}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={SEVERITY_STYLES[selectedEvent.severity]}
                >
                  {t(`severity.${selectedEvent.severity.toLowerCase()}` as 'severity.info')}
                </Badge>
                <Badge variant="default">{selectedEvent.status}</Badge>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-muted/40 p-4 text-xs leading-relaxed">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
              {selectedEvent.headers && (
                <div>
                  <p className="mb-2 text-sm font-medium">{t('headers')}</p>
                  <pre className="overflow-x-auto rounded-xl bg-muted/40 p-4 text-xs leading-relaxed">
                    {JSON.stringify(selectedEvent.headers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!revealedCredentials}
        onOpenChange={() => setRevealedCredentials(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('secretTitle')}</DialogTitle>
            <DialogDescription>{t('secretDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm text-teal-950 dark:text-teal-100">
              <p className="font-medium">{t('setupHintTitle')}</p>
              <p className="mt-1 text-teal-900/80 dark:text-teal-100/80">
                {revealedCredentials
                  ? t(
                      `integrations.${revealedCredentials.integrationKey}.setupHint` as 'integrations.generic.setupHint',
                    )
                  : null}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">{t('endpointUrl')}</p>
              <WebhookUrlPreview
                path={revealedCredentials?.endpointPath ?? ''}
                query={revealedCredentials?.endpointQuery ?? ''}
                queryClassName="text-teal-700 dark:text-teal-300"
              />
              <Button
                className="mt-3 w-full sm:w-auto"
                onClick={() =>
                  revealedCredentials
                    ? void copyToClipboard(revealedCredentials.endpointUrl).then(() =>
                        toast.success(t('copied')),
                      )
                    : undefined
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                {t('copyUrl')}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">{t('copyUrlHint')}</p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{t('secretWarning')}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteSourceId}
        onOpenChange={(open) => !open && setDeleteSourceId(null)}
        title={t('deleteTitle')}
        description={t('deleteConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={() => void handleDeleteSource()}
      />
    </div>
  );
}
