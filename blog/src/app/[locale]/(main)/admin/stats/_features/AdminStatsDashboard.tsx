'use client';

import { useCallback, useState, type ComponentType, type ReactNode } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  MessageSquare,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import AiActivityFeed from '@/components/admin/AiActivityFeed';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import type {
  AdminDashboardStats,
  AiModelStats,
  CountBucket,
  DailyUsagePoint,
} from '@/lib/data/admin-stats';

type AdminStatsDashboardProps = {
  initialStats: AdminDashboardStats;
};

const PROVIDER_STYLES: Record<string, { badge: string; bar: string; ring: string }> = {
  gemini: {
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    bar: 'from-blue-500 to-cyan-400',
    ring: 'stroke-blue-500',
  },
  groq: {
    badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    bar: 'from-orange-500 to-amber-400',
    ring: 'stroke-orange-500',
  },
  ollama: {
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    bar: 'from-violet-500 to-purple-400',
    ring: 'stroke-violet-500',
  },
};

function Panel({
  children,
  className,
  accent = 'teal',
}: {
  children: ReactNode;
  className?: string;
  accent?: 'teal' | 'violet' | 'cyan';
}) {
  const accents = {
    teal: 'from-teal-500 via-cyan-500 to-teal-400',
    violet: 'from-violet-500 via-purple-500 to-fuchsia-400',
    cyan: 'from-cyan-500 via-teal-400 to-emerald-400',
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <div className={cn('h-0.5 w-full bg-gradient-to-r', accents[accent])} />
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/10 ring-1 ring-teal-500/20">
          <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  highlight,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  trend?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-teal-500/25 hover:shadow-md hover:shadow-teal-500/5',
        highlight && 'border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-cyan-500/5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tabular-nums tracking-tight',
              highlight && 'text-teal-600 dark:text-teal-400',
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
          {trend ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          ) : null}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors group-hover:bg-teal-500/10 group-hover:text-teal-600 dark:group-hover:text-teal-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function SuccessRing({ rate, className }: { rate: number; className?: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <svg
      className={cn('h-12 w-12 -rotate-90', className)}
      viewBox="0 0 44 44"
      aria-hidden
    >
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        className="stroke-muted/40"
        strokeWidth="4"
      />
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        className="stroke-teal-500"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function ModelUsageCard({
  model,
  providerLabel,
  activeModel,
  labels,
  format,
}: {
  model: AiModelStats;
  providerLabel: (key: string) => string;
  activeModel: string | null;
  labels: {
    requests: string;
    success: string;
    avgDuration: string;
    characters: string;
    share: (values: { percent: number }) => string;
    active: string;
  };
  format: ReturnType<typeof useFormatter>;
}) {
  const style = PROVIDER_STYLES[model.provider] ?? PROVIDER_STYLES.gemini;
  const isActive = activeModel === model.model;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card/50 p-4 backdrop-blur-sm transition-all hover:shadow-md',
        isActive
          ? 'border-teal-500/40 shadow-teal-500/10'
          : 'border-border/50 hover:border-border/80',
      )}
    >
      {isActive ? (
        <div className="absolute right-3 top-3 rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
          {labels.active}
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {model.requests > 0 ? (
            <>
              <SuccessRing rate={model.successRate} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
                {model.successRate}%
              </span>
            </>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40 text-[10px] font-medium text-muted-foreground">
              —
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                style.badge,
              )}
            >
              {providerLabel(model.provider)}
            </span>
            <span className="truncate text-sm font-semibold">{model.model}</span>
          </div>

          <p className="mt-2 text-2xl font-bold tabular-nums">
            {format.number(model.requests)}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              {labels.requests}
            </span>
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/50">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r', style.bar)}
              style={{ width: `${Math.max(model.sharePercent, 2)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {labels.share({ percent: model.sharePercent })}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-4 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {labels.success}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">
            {model.successCount}/{model.requests}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {labels.avgDuration}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">
            {model.avgDurationMs} ms
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {labels.characters}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">
            {format.number(model.promptChars + model.responseChars)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function BreakdownPanel({
  title,
  items,
  labelKey,
}: {
  title: string;
  items: CountBucket[];
  labelKey: (key: string) => string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <Panel accent="cyan">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((item, index) => (
            <li key={item.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {labelKey(item.key)}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-teal-600 dark:text-teal-400">
                  {item.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
                  style={{
                    width: `${(item.count / max) * 100}%`,
                    opacity: 1 - index * 0.08,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DailyChartPanel({
  title,
  points,
  format,
  emptyLabel,
}: {
  title: string;
  points: DailyUsagePoint[];
  format: ReturnType<typeof useFormatter>;
  emptyLabel: string;
}) {
  const max = Math.max(...points.map((p) => p.count), 1);
  const total = points.reduce((sum, p) => sum + p.count, 0);

  return (
    <Panel accent="teal">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-2xl font-bold tabular-nums">{total}</p>
        </div>
        <Activity className="h-5 w-5 text-muted-foreground/60" />
      </div>

      {total === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <>
          <div className="mt-6 flex h-36 items-end gap-[3px]">
            {points.map((point) => {
              const height = Math.max(
                (point.count / max) * 100,
                point.count > 0 ? 10 : 3,
              );

              return (
                <div
                  key={point.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                >
                  <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-lg group-hover:block">
                    {format.dateTime(new Date(point.date), {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' · '}
                    {point.count}
                  </div>
                  <div
                    className={cn(
                      'w-full rounded-t-md bg-gradient-to-t from-teal-600 to-cyan-400 transition-all duration-300 group-hover:from-teal-500 group-hover:to-cyan-300',
                      point.count === 0 && 'from-muted/40 to-muted/30',
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>
              {points[0]
                ? format.dateTime(new Date(points[0].date), {
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </span>
            <span>
              {points[points.length - 1]
                ? format.dateTime(new Date(points[points.length - 1].date), {
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </span>
          </div>
        </>
      )}
    </Panel>
  );
}

export default function AdminStatsDashboard({
  initialStats,
}: AdminStatsDashboardProps) {
  const t = useTranslations('Admin.Stats');
  const format = useFormatter();
  const locale = useLocale();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  const actionLabel = useCallback(
    (key: string) => t(`ai.actions.${key}` as 'ai.actions.translate'),
    [t],
  );

  const contextLabel = useCallback(
    (key: string) => t(`ai.contexts.${key}` as 'ai.contexts.blog'),
    [t],
  );

  const providerLabel = useCallback(
    (key: string) => t(`ai.providers.${key}` as 'ai.providers.gemini'),
    [t],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?locale=${locale}`);
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as { data: AdminDashboardStats };
      setStats(json.data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  const { blogs, projects, users, comments, siteSnippets, ai, aiConfig } = stats;

  return (
    <div className="space-y-8 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 via-card/60 to-card/80 px-5 py-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 ring-1 ring-teal-500/25">
            <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-medium">{t('dashboardTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('lastUpdatedHint')}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="rounded-xl border-border/60 bg-background/50"
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </div>

      <section>
        <SectionHeader
          icon={Zap}
          title={t('siteOverview')}
          description={t('siteOverviewHint')}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard
            label={t('blogs.total')}
            value={blogs.total}
            hint={t('blogs.publishedDrafts', {
              published: blogs.published,
              drafts: blogs.drafts,
            })}
            icon={FileText}
          />
          <MetricCard
            label={t('projects.total')}
            value={projects.total}
            hint={t('projects.publishedDrafts', {
              published: projects.published,
              drafts: projects.drafts,
            })}
            icon={FolderKanban}
          />
          <MetricCard
            label={t('users.total')}
            value={users.total}
            hint={t('users.breakdown', {
              admins: users.admins,
              members: users.members,
            })}
            icon={Users}
          />
          <MetricCard
            label={t('comments.total')}
            value={comments.total}
            hint={t('comments.pending', { count: comments.pending })}
            icon={MessageSquare}
            highlight={comments.pending > 0}
          />
          <MetricCard
            label={t('comments.approved')}
            value={comments.approved}
            hint={t('comments.rejected', { count: comments.rejected })}
            icon={CheckCircle2}
          />
          <MetricCard
            label={t('siteSnippets.total')}
            value={siteSnippets.total}
            hint={t('siteSnippets.active', { count: siteSnippets.active })}
            icon={Sparkles}
          />
        </div>
      </section>

      <section>
        <SectionHeader
          icon={Bot}
          title={t('ai.title')}
          description={t('ai.subtitle')}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                  aiConfig.enabled
                    ? 'border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                    : 'border-border/60 bg-muted/40 text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    aiConfig.enabled ? 'bg-teal-500' : 'bg-muted-foreground',
                  )}
                />
                {aiConfig.enabled ? t('ai.statusOn') : t('ai.statusOff')}
              </span>
              {aiConfig.autoTranslateOnSave ? (
                <span className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                  {t('ai.autoTranslate')}
                </span>
              ) : null}
            </div>
          }
        />

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t('ai.totalRequests')}
            value={format.number(ai.totalRequests)}
            icon={Bot}
            highlight
          />
          <MetricCard
            label={t('ai.today')}
            value={format.number(ai.requestsToday)}
            trend={t('ai.thisWeek', { count: ai.requestsThisWeek })}
            icon={TrendingUp}
          />
          <MetricCard
            label={t('ai.thisMonth')}
            value={format.number(ai.requestsThisMonth)}
            hint={t('ai.successRate', { rate: ai.successRate })}
            icon={Activity}
          />
          <MetricCard
            label={t('ai.avgDuration')}
            value={t('ai.durationMs', { ms: ai.avgDurationMs })}
            hint={t('ai.characters', {
              prompt: format.number(ai.totalPromptChars),
              response: format.number(ai.totalResponseChars),
            })}
            icon={Clock}
          />
        </div>

        <div className="mb-5">
          <h3 className="mb-3 text-sm font-semibold">{t('ai.byModel')}</h3>
          {ai.byModel.length === 0 ? (
            <Panel>
              <p className="text-center text-sm text-muted-foreground">
                {t('ai.noModels')}
              </p>
            </Panel>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ai.byModel.map((model) => (
                <ModelUsageCard
                  key={`${model.provider}-${model.model}`}
                  model={model}
                  providerLabel={providerLabel}
                  activeModel={
                    aiConfig.enabled && aiConfig.provider === model.provider
                      ? aiConfig.model
                      : null
                  }
                  format={format}
                  labels={{
                    requests: t('ai.modelRequests'),
                    success: t('ai.modelSuccess'),
                    avgDuration: t('ai.modelDuration'),
                    characters: t('ai.modelChars'),
                    share: (values) => t('ai.modelShare', values),
                    active: t('ai.activeModel'),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <DailyChartPanel
              title={t('ai.dailyChart')}
              points={ai.dailyLast30Days}
              format={format}
              emptyLabel={t('ai.noActivity')}
            />
          </div>
          <BreakdownPanel
            title={t('ai.byProvider')}
            items={ai.byProvider}
            labelKey={providerLabel}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <BreakdownPanel
            title={t('ai.byAction')}
            items={ai.byAction}
            labelKey={actionLabel}
          />
          <BreakdownPanel
            title={t('ai.byContext')}
            items={ai.byContext}
            labelKey={contextLabel}
          />
        </div>

        <div className="mt-4">
          <AiActivityFeed
            logs={ai.recentLogs}
            actionLabel={actionLabel}
            contextLabel={contextLabel}
            providerLabel={providerLabel}
            labels={{
              title: t('ai.recentActivity'),
              empty: t('ai.noActivity'),
              systemUser: t('ai.systemUser'),
              durationMs: (ms) => t('ai.durationMs', { ms }),
            }}
            headerAction={
              ai.totalRequests > ai.recentLogs.length ? (
                <Link
                  href="/admin/stats/activity"
                  className="text-xs font-medium text-teal-600 transition hover:text-teal-500 dark:text-teal-400"
                >
                  {t('ai.viewAllActivity', { count: ai.totalRequests })}
                </Link>
              ) : null
            }
          />
        </div>
      </section>
    </div>
  );
}
