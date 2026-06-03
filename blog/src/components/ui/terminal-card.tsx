import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TerminalCardProps = {
  fileName?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function TerminalCard({
  fileName,
  children,
  className,
  bodyClassName,
}: TerminalCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/60 bg-slate-950/95 shadow-lg ring-1 ring-black/5 dark:bg-slate-900/80',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/90" />
        </span>
        {fileName && (
          <span className="ml-1 select-none font-mono text-[11px] tracking-tight text-slate-400">
            {fileName}
          </span>
        )}
      </div>

      <div className={cn('px-3 py-3', bodyClassName)}>{children}</div>
    </div>
  );
}

type TerminalLineProps = {
  prompt?: string;
  children: ReactNode;
  className?: string;
  promptClassName?: string;
};

export function TerminalLine({
  prompt = '>',
  children,
  className,
  promptClassName,
}: TerminalLineProps) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn('select-none pt-px font-mono text-sm text-teal-400', promptClassName)}
        aria-hidden="true"
      >
        {prompt}
      </span>
      <span
        className={cn(
          'font-mono text-[13px] leading-relaxed text-slate-200 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-teal-300',
          className,
        )}
      >
        {children}
      </span>
    </div>
  );
}

export function TerminalCursor({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'ml-1 inline-block h-[1.05em] w-[0.5em] animate-terminal-blink rounded-[1px] bg-teal-400 align-[-0.15em]',
        className,
      )}
      aria-hidden="true"
    />
  );
}
