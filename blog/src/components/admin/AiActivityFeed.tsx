'use client';

import { useFormatter } from 'next-intl';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentAiUsageLog } from '@/lib/data/admin-stats';

type AiActivityFeedProps = {
  logs: RecentAiUsageLog[];
  actionLabel: (key: string) => string;
  contextLabel: (key: string) => string;
  providerLabel: (key: string) => string;
  labels: {
    title: string;
    empty: string;
    systemUser: string;
    durationMs: (ms: number) => string;
  };
  headerAction?: React.ReactNode;
};

function ActivityPanel({
  children,
  headerAction,
  title,
}: {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-sm backdrop-blur-md">
      <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-400" />
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {headerAction}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AiActivityFeed({
  logs,
  actionLabel,
  contextLabel,
  providerLabel,
  labels,
  headerAction,
}: AiActivityFeedProps) {
  const format = useFormatter();

  return (
    <ActivityPanel title={labels.title} headerAction={headerAction}>
      {logs.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="mt-5 space-y-0">
          {logs.map((log, index) => (
            <li
              key={log.id}
              className={cn(
                'relative flex gap-3 py-3',
                index !== logs.length - 1 && 'border-b border-border/40',
              )}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card',
                    log.success
                      ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                      : 'bg-destructive/15 text-destructive',
                  )}
                >
                  {log.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium leading-snug">
                  {actionLabel(log.action)}
                  <span className="font-normal text-muted-foreground">
                    {' '}
                    · {contextLabel(log.context)}
                  </span>
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {log.userName ?? labels.systemUser} ·{' '}
                  {providerLabel(log.provider)} · {log.model}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">
                    {labels.durationMs(log.durationMs)}
                  </span>
                  <span>·</span>
                  <time dateTime={log.createdAt}>
                    {format.dateTime(new Date(log.createdAt), {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ActivityPanel>
  );
}
