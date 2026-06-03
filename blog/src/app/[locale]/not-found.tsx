'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { TerminalCard, TerminalLine } from '@/components/ui/terminal-card';
import { RotatingTerminalText } from '@/components/ui/rotating-terminal-text';

export default function NotFound() {
  const t = useTranslations('Error.Main.NotFound');
  const jokes = t.raw('jokes') as string[];
  const pathname = usePathname();
  const attemptedPath = pathname || '/';

  return (
    <main className="mesh-background grid min-h-screen place-content-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <p className="text-7xl font-bold tracking-tight text-gradient">404</p>
        <h2 className="text-2xl font-semibold tracking-tight">{t('title')}</h2>

        <TerminalCard fileName={t('file')} className="text-left">
          <div className="space-y-1.5">
            <TerminalLine prompt="$" promptClassName="text-slate-500">
              cd {attemptedPath}
            </TerminalLine>
            <TerminalLine prompt="" className="text-red-300/90">
              bash: cd: {attemptedPath}: No such file or directory
            </TerminalLine>
            <TerminalLine>{t('description')}</TerminalLine>
          </div>
        </TerminalCard>

        <Button asChild variant="accent" className="font-semibold">
          <Link href="/">{t('button')}</Link>
        </Button>

        <RotatingTerminalText
          lines={jokes}
          variant="inline"
          icon={Ghost}
          intervalMs={6500}
          className="pt-2"
        />
      </div>
    </main>
  );
}
