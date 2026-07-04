import 'server-only';

import type { AiUsageAction, AiProvider } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAdminBlogStats } from '@/lib/data/blogs';
import { getAdminProjectStats } from '@/lib/data/projects';
import { getAdminUserStats } from '@/lib/data/users';
import {
  buildPaginatedResult,
  type PageSize,
  type PaginatedResult,
} from '@/lib/pagination';
import {
  getSiteAiSettings,
  type SiteAiSettingsDto,
} from '@/lib/site-ai-settings';

export const RECENT_AI_ACTIVITY_PREVIEW_LIMIT = 5;

export type CountBucket = {
  key: string;
  count: number;
};

export type AiModelStats = {
  provider: AiProvider;
  model: string;
  requests: number;
  successCount: number;
  successRate: number;
  avgDurationMs: number;
  promptChars: number;
  responseChars: number;
  sharePercent: number;
};

export type DailyUsagePoint = {
  date: string;
  count: number;
};

export type RecentAiUsageLog = {
  id: string;
  action: AiUsageAction;
  context: string;
  provider: AiProvider;
  model: string;
  durationMs: number;
  success: boolean;
  createdAt: string;
  userName: string | null;
};

export type AdminAiStats = {
  totalRequests: number;
  requestsToday: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  successRate: number;
  avgDurationMs: number;
  totalPromptChars: number;
  totalResponseChars: number;
  byAction: CountBucket[];
  byContext: CountBucket[];
  byProvider: CountBucket[];
  byModel: AiModelStats[];
  dailyLast30Days: DailyUsagePoint[];
  recentLogs: RecentAiUsageLog[];
};

export type AdminCommentStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type AdminSiteSnippetStats = {
  total: number;
  active: number;
};

export type AdminDashboardStats = {
  blogs: Awaited<ReturnType<typeof getAdminBlogStats>>;
  projects: Awaited<ReturnType<typeof getAdminProjectStats>>;
  users: Awaited<ReturnType<typeof getAdminUserStats>>;
  comments: AdminCommentStats;
  siteSnippets: AdminSiteSnippetStats;
  ai: AdminAiStats;
  aiConfig: {
    enabled: boolean;
    provider: string | null;
    model: string | null;
    autoTranslateOnSave: boolean;
  };
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - days);
  return d;
}

async function getCommentStats(): Promise<AdminCommentStats> {
  const baseWhere = { deletedAt: null, isReply: false };

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.comment.count({ where: baseWhere }),
    prisma.comment.count({ where: { ...baseWhere, status: 'PENDING' } }),
    prisma.comment.count({ where: { ...baseWhere, status: 'APPROVED' } }),
    prisma.comment.count({ where: { ...baseWhere, status: 'REJECTED' } }),
  ]);

  return { total, pending, approved, rejected };
}

async function getSiteSnippetStats(): Promise<AdminSiteSnippetStats> {
  const [total, active] = await Promise.all([
    prisma.siteSnippet.count(),
    prisma.siteSnippet.count({ where: { isActive: true } }),
  ]);

  return { total, active };
}

function buildDailySeries(
  rows: Array<{ createdAt: Date }>,
  days: number,
): DailyUsagePoint[] {
  const counts = new Map<string, number>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    counts.set(key, 0);
  }

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([date, count]) => ({ date, count }));
}

function groupByCount(row: { _count?: { _all?: number } | null }): number {
  return row._count?._all ?? 0;
}

function sortBuckets(buckets: CountBucket[]): CountBucket[] {
  return [...buckets].sort((a, b) => b.count - a.count);
}

const EMPTY_AI_STATS: AdminAiStats = {
  totalRequests: 0,
  requestsToday: 0,
  requestsThisWeek: 0,
  requestsThisMonth: 0,
  successRate: 100,
  avgDurationMs: 0,
  totalPromptChars: 0,
  totalResponseChars: 0,
  byAction: [],
  byContext: [],
  byProvider: [],
  byModel: [],
  dailyLast30Days: buildDailySeries([], 30),
  recentLogs: [],
};

function modelKey(provider: AiProvider, model: string): string {
  return `${provider}::${model}`;
}

function buildModelStats(
  totalRequests: number,
  byModelRaw: Array<{
    provider: AiProvider;
    model: string;
    _count?: { _all?: number } | null;
    _avg?: { durationMs?: number | null } | null;
    _sum?: { promptChars?: number | null; responseChars?: number | null } | null;
  }>,
  successByModel: Array<{
    provider: AiProvider;
    model: string;
    _count?: { _all?: number } | null;
  }>,
): AiModelStats[] {
  const successMap = new Map(
    successByModel.map((row) => [
      modelKey(row.provider, row.model),
      groupByCount(row),
    ]),
  );

  return byModelRaw
    .map((row) => {
      const requests = groupByCount(row);
      const successCount = successMap.get(modelKey(row.provider, row.model)) ?? 0;

      return {
        provider: row.provider,
        model: row.model,
        requests,
        successCount,
        successRate:
          requests > 0 ? Math.round((successCount / requests) * 100) : 100,
        avgDurationMs: Math.round(row._avg?.durationMs ?? 0),
        promptChars: row._sum?.promptChars ?? 0,
        responseChars: row._sum?.responseChars ?? 0,
        sharePercent:
          totalRequests > 0 ? Math.round((requests / totalRequests) * 100) : 0,
      };
    })
    .sort((a, b) => b.requests - a.requests);
}

function mapAiUsageLog(row: {
  id: string;
  action: AiUsageAction;
  context: string;
  provider: AiProvider;
  model: string;
  durationMs: number;
  success: boolean;
  createdAt: Date;
  user: { name: string | null } | null;
}): RecentAiUsageLog {
  return {
    id: row.id,
    action: row.action,
    context: row.context,
    provider: row.provider,
    model: row.model,
    durationMs: row.durationMs,
    success: row.success,
    createdAt: row.createdAt.toISOString(),
    userName: row.user?.name ?? null,
  };
}

export async function getAiUsageLogsPaginated(
  page: number,
  limit: PageSize,
): Promise<PaginatedResult<RecentAiUsageLog>> {
  if (!('aiUsageLog' in prisma) || !prisma.aiUsageLog) {
    return buildPaginatedResult([], page, limit, 0);
  }

  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    prisma.aiUsageLog.count(),
    prisma.aiUsageLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    }),
  ]);

  return buildPaginatedResult(
    rows.map(mapAiUsageLog),
    page,
    limit,
    total,
  );
}

async function getAiStats(): Promise<AdminAiStats> {
  if (!('aiUsageLog' in prisma) || !prisma.aiUsageLog) {
    return EMPTY_AI_STATS;
  }

  const today = startOfDay(new Date());
  const weekAgo = daysAgo(7);
  const monthAgo = daysAgo(30);

  const [
    totalRequests,
    requestsToday,
    requestsThisWeek,
    requestsThisMonth,
    successCount,
    aggregates,
    byActionRaw,
    byContextRaw,
    byProviderRaw,
    byModelRaw,
    successByModelRaw,
    dailyRows,
    recentLogsRaw,
  ] = await Promise.all([
    prisma.aiUsageLog.count(),
    prisma.aiUsageLog.count({ where: { createdAt: { gte: today } } }),
    prisma.aiUsageLog.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.aiUsageLog.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.aiUsageLog.count({ where: { success: true } }),
    prisma.aiUsageLog.aggregate({
      _avg: { durationMs: true },
      _sum: { promptChars: true, responseChars: true },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['action'],
      _count: { _all: true },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['context'],
      _count: { _all: true },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['provider'],
      _count: { _all: true },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['provider', 'model'],
      _count: { _all: true },
      _avg: { durationMs: true },
      _sum: { promptChars: true, responseChars: true },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['provider', 'model'],
      where: { success: true },
      _count: { _all: true },
    }),
    prisma.aiUsageLog.findMany({
      where: { createdAt: { gte: monthAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.aiUsageLog.findMany({
      take: RECENT_AI_ACTIVITY_PREVIEW_LIMIT,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    }),
  ]);

  return {
    totalRequests,
    requestsToday,
    requestsThisWeek,
    requestsThisMonth,
    successRate:
      totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 100,
    avgDurationMs: Math.round(aggregates._avg?.durationMs ?? 0),
    totalPromptChars: aggregates._sum?.promptChars ?? 0,
    totalResponseChars: aggregates._sum?.responseChars ?? 0,
    byAction: sortBuckets(
      byActionRaw.map((row) => ({
        key: row.action,
        count: groupByCount(row),
      })),
    ),
    byContext: sortBuckets(
      byContextRaw.map((row) => ({
        key: row.context,
        count: groupByCount(row),
      })),
    ),
    byProvider: sortBuckets(
      byProviderRaw.map((row) => ({
        key: row.provider,
        count: groupByCount(row),
      })),
    ),
    byModel: buildModelStats(totalRequests, byModelRaw, successByModelRaw),
    dailyLast30Days: buildDailySeries(dailyRows, 30),
    recentLogs: recentLogsRaw.map(mapAiUsageLog),
  };
}

function mergeWithConfiguredModels(
  byModel: AiModelStats[],
  settings: SiteAiSettingsDto | null,
): AiModelStats[] {
  if (!settings) {
    return byModel;
  }

  const configured: Array<{ provider: AiProvider; model: string }> = [
    { provider: 'gemini', model: settings.geminiModel },
    { provider: 'groq', model: settings.groqModel },
    { provider: 'ollama', model: settings.ollamaModel },
  ];

  const map = new Map(
    byModel.map((entry) => [modelKey(entry.provider, entry.model), entry]),
  );

  for (const entry of configured) {
    const key = modelKey(entry.provider, entry.model);
    if (!map.has(key)) {
      map.set(key, {
        provider: entry.provider,
        model: entry.model,
        requests: 0,
        successCount: 0,
        successRate: 100,
        avgDurationMs: 0,
        promptChars: 0,
        responseChars: 0,
        sharePercent: 0,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.requests - a.requests);
}

function resolveAiConfigSummary(
  settings: SiteAiSettingsDto | null,
): AdminDashboardStats['aiConfig'] {
  if (!settings) {
    return {
      enabled: false,
      provider: null,
      model: null,
      autoTranslateOnSave: false,
    };
  }

  const model =
    settings.provider === 'groq'
      ? settings.groqModel
      : settings.provider === 'ollama'
        ? settings.ollamaModel
        : settings.geminiModel;

  return {
    enabled: settings.enabled,
    provider: settings.provider,
    model,
    autoTranslateOnSave: settings.autoTranslateOnSave,
  };
}

export async function getAdminDashboardStats(
  locale?: string,
): Promise<AdminDashboardStats> {
  const [blogs, projects, users, comments, siteSnippets, ai, settings] =
    await Promise.all([
      getAdminBlogStats(locale),
      getAdminProjectStats(locale),
      getAdminUserStats(),
      getCommentStats(),
      getSiteSnippetStats(),
      getAiStats(),
      getSiteAiSettings(),
    ]);

  return {
    blogs,
    projects,
    users,
    comments,
    siteSnippets,
    ai: {
      ...ai,
      byModel: mergeWithConfiguredModels(ai.byModel, settings),
    },
    aiConfig: resolveAiConfigSummary(settings),
  };
}
