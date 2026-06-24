import 'server-only';

import { randomBytes } from 'node:crypto';

import type {
  Prisma,
  WebhookEventSeverity,
  WebhookEventStatus,
  WebhookProvider,
} from '@prisma/client';

import { buildPaginationMeta, type PaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { encryptSecret, decryptSecret } from '@/lib/secret-crypto';
import {
  buildWebhookEndpointUrl,
  formatWebhookEndpointDisplay,
} from '@/lib/webhooks/build-endpoint-url';
import { parseWebhookEvent } from '@/lib/webhooks/parse-event';
import { sanitizeWebhookHeaders } from '@/lib/webhooks/sanitize-headers';

export type WebhookSourceDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  provider: WebhookProvider;
  enabled: boolean;
  endpointUrl: string;
  endpointPath: string;
  endpointQueryHint: string;
  lastEventAt: string | null;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
  unreadCount: number;
};

export type WebhookEventDto = {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceSlug: string;
  provider: WebhookProvider;
  eventType: string;
  severity: WebhookEventSeverity;
  title: string;
  payload: unknown;
  headers: Record<string, string> | null;
  clientIp: string | null;
  status: WebhookEventStatus;
  receivedAt: string;
};

export type WebhookDashboardStats = {
  totalSources: number;
  activeSources: number;
  totalEvents: number;
  unreadEvents: number;
  errorEvents24h: number;
};

function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex');
}

function toSourceDto(
  source: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    provider: WebhookProvider;
    enabled: boolean;
    secretEnc: string;
    lastEventAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { events: number };
    events: { id: string }[];
  },
  secretPlain?: string
): WebhookSourceDto {
  const secret = secretPlain ?? decryptSecret(source.secretEnc);
  const endpointUrl = buildWebhookEndpointUrl(source.slug, secret);
  const display = formatWebhookEndpointDisplay(source.slug, secret);

  return {
    id: source.id,
    name: source.name,
    slug: source.slug,
    description: source.description,
    provider: source.provider,
    enabled: source.enabled,
    endpointUrl,
    endpointPath: display.path,
    endpointQueryHint: display.queryHint,
    lastEventAt: source.lastEventAt?.toISOString() ?? null,
    createdAt: source.createdAt.toISOString(),
    updatedAt: source.updatedAt.toISOString(),
    eventCount: source._count.events,
    unreadCount: source.events.length,
  };
}

const sourceListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  provider: true,
  enabled: true,
  secretEnc: true,
  lastEventAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      events: true,
    },
  },
  events: {
    where: { status: 'NEW' as const },
    select: { id: true },
    take: 1,
  },
} satisfies Prisma.WebhookSourceSelect;

export async function getWebhookDashboardStats(): Promise<WebhookDashboardStats> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalSources, activeSources, totalEvents, unreadEvents, errorEvents24h] =
    await Promise.all([
      prisma.webhookSource.count(),
      prisma.webhookSource.count({ where: { enabled: true } }),
      prisma.webhookEvent.count(),
      prisma.webhookEvent.count({ where: { status: 'NEW' } }),
      prisma.webhookEvent.count({
        where: {
          severity: 'ERROR',
          receivedAt: { gte: since },
        },
      }),
    ]);

  return {
    totalSources,
    activeSources,
    totalEvents,
    unreadEvents,
    errorEvents24h,
  };
}

export async function listWebhookSources(): Promise<WebhookSourceDto[]> {
  const sources = await prisma.webhookSource.findMany({
    select: sourceListSelect,
    orderBy: [{ enabled: 'desc' }, { name: 'asc' }],
  });

  return sources.map((source) => toSourceDto(source));
}

export async function createWebhookSource(input: {
  name: string;
  slug: string;
  description?: string;
  provider: WebhookProvider;
  enabled: boolean;
}): Promise<{ source: WebhookSourceDto; secret: string }> {
  const secret = generateWebhookSecret();

  const created = await prisma.webhookSource.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      provider: input.provider,
      enabled: input.enabled,
      secretEnc: encryptSecret(secret),
    },
    select: sourceListSelect,
  });

  return {
    source: toSourceDto(created, secret),
    secret,
  };
}

export async function updateWebhookSource(
  id: string,
  input: {
    name?: string;
    description?: string | null;
    provider?: WebhookProvider;
    enabled?: boolean;
  }
): Promise<WebhookSourceDto | null> {
  const existing = await prisma.webhookSource.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.webhookSource.update({
    where: { id },
    data: input,
    select: sourceListSelect,
  });

  return toSourceDto(updated);
}

export async function deleteWebhookSource(id: string): Promise<boolean> {
  const existing = await prisma.webhookSource.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return false;
  }

  await prisma.webhookSource.delete({ where: { id } });
  return true;
}

export async function rotateWebhookSourceSecret(
  id: string
): Promise<{ source: WebhookSourceDto; secret: string } | null> {
  const existing = await prisma.webhookSource.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const secret = generateWebhookSecret();

  const updated = await prisma.webhookSource.update({
    where: { id },
    data: { secretEnc: encryptSecret(secret) },
    select: sourceListSelect,
  });

  return {
    source: toSourceDto(updated, secret),
    secret,
  };
}

export async function getWebhookSourceBySlug(slug: string) {
  return prisma.webhookSource.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      enabled: true,
      provider: true,
      secretEnc: true,
    },
  });
}

export async function recordWebhookEvent(input: {
  sourceId: string;
  provider: WebhookProvider;
  payload: unknown;
  headers: Headers;
  clientIp: string;
}) {
  const parsed = parseWebhookEvent(input.provider, input.payload);
  const sanitizedHeaders = sanitizeWebhookHeaders(input.headers);

  const [event] = await prisma.$transaction([
    prisma.webhookEvent.create({
      data: {
        sourceId: input.sourceId,
        eventType: parsed.eventType,
        severity: parsed.severity,
        title: parsed.title,
        payload: input.payload as Prisma.InputJsonValue,
        headers:
          Object.keys(sanitizedHeaders).length > 0
            ? sanitizedHeaders
            : undefined,
        clientIp: input.clientIp,
      },
      select: {
        id: true,
        eventType: true,
        severity: true,
        title: true,
        receivedAt: true,
      },
    }),
    prisma.webhookSource.update({
      where: { id: input.sourceId },
      data: { lastEventAt: new Date() },
    }),
  ]);

  return event;
}

export async function listWebhookEvents(input: {
  page: number;
  pageSize: number;
  sourceId?: string;
  severity?: WebhookEventSeverity;
  status?: WebhookEventStatus;
  search?: string;
}): Promise<{ data: WebhookEventDto[]; pagination: PaginationMeta }> {
  const where: Prisma.WebhookEventWhereInput = {};

  if (input.sourceId) {
    where.sourceId = input.sourceId;
  }
  if (input.severity) {
    where.severity = input.severity;
  }
  if (input.status) {
    where.status = input.status;
  }
  if (input.search) {
    where.OR = [
      { title: { contains: input.search, mode: 'insensitive' } },
      { eventType: { contains: input.search, mode: 'insensitive' } },
    ];
  }

  const skip = (input.page - 1) * input.pageSize;

  const [total, events] = await Promise.all([
    prisma.webhookEvent.count({ where }),
    prisma.webhookEvent.findMany({
      where,
      skip,
      take: input.pageSize,
      orderBy: { receivedAt: 'desc' },
      select: {
        id: true,
        sourceId: true,
        eventType: true,
        severity: true,
        title: true,
        payload: true,
        headers: true,
        clientIp: true,
        status: true,
        receivedAt: true,
        source: {
          select: {
            name: true,
            slug: true,
            provider: true,
          },
        },
      },
    }),
  ]);

  return {
    data: events.map((event) => ({
      id: event.id,
      sourceId: event.sourceId,
      sourceName: event.source.name,
      sourceSlug: event.source.slug,
      provider: event.source.provider,
      eventType: event.eventType,
      severity: event.severity,
      title: event.title,
      payload: event.payload,
      headers: (event.headers as Record<string, string> | null) ?? null,
      clientIp: event.clientIp,
      status: event.status,
      receivedAt: event.receivedAt.toISOString(),
    })),
    pagination: buildPaginationMeta(input.page, input.pageSize as 20 | 50 | 100, total),
  };
}

export async function updateWebhookEventStatus(
  id: string,
  status: WebhookEventStatus
): Promise<WebhookEventDto | null> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const event = await prisma.webhookEvent.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      sourceId: true,
      eventType: true,
      severity: true,
      title: true,
      payload: true,
      headers: true,
      clientIp: true,
      status: true,
      receivedAt: true,
      source: {
        select: {
          name: true,
          slug: true,
          provider: true,
        },
      },
    },
  });

  return {
    id: event.id,
    sourceId: event.sourceId,
    sourceName: event.source.name,
    sourceSlug: event.source.slug,
    provider: event.source.provider,
    eventType: event.eventType,
    severity: event.severity,
    title: event.title,
    payload: event.payload,
    headers: (event.headers as Record<string, string> | null) ?? null,
    clientIp: event.clientIp,
    status: event.status,
    receivedAt: event.receivedAt.toISOString(),
  };
}

export async function markAllWebhookEventsRead(sourceId?: string): Promise<number> {
  const result = await prisma.webhookEvent.updateMany({
    where: {
      status: 'NEW',
      ...(sourceId ? { sourceId } : {}),
    },
    data: { status: 'READ' },
  });

  return result.count;
}
