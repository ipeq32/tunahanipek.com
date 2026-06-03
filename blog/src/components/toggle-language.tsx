'use client';

import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppPathnames } from '@/config';
import { locales } from '@/config';
import { usePathname, useRouter } from '@/navigation';
import { cn } from '@/lib/utils';

type LocaleType = (typeof locales)[number];
type DynamicPathname =
  | '/blog/[id]'
  | '/blog/[id]/edit'
  | '/blog/tag/[name]'
  | '/blog/category/[name]'
  | '/project/[id]'
  | '/admin/project/[id]/edit';

type StaticPathname = Exclude<AppPathnames, DynamicPathname>;

type ToggleLanguageProps = {
  locale?: LocaleType;
};

function ToggleLanguage({ locale: localeProp }: ToggleLanguageProps) {
  const localeFromHook = useLocale();
  const locale = localeProp ?? localeFromHook;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const t = useTranslations('LocaleSwitcher');

  function onSelectChange(value: LocaleType) {
    if (value === locale) {
      return;
    }

    if (pathname === '/blog/[id]' && typeof params.id === 'string') {
      router.replace(
        { pathname: '/blog/[id]', params: { id: params.id } },
        { locale: value },
      );
      return;
    }

    if (pathname === '/blog/[id]/edit' && typeof params.id === 'string') {
      router.replace(
        { pathname: '/blog/[id]/edit', params: { id: params.id } },
        { locale: value },
      );
      return;
    }

    if (pathname === '/project/[id]' && typeof params.id === 'string') {
      router.replace(
        { pathname: '/project/[id]', params: { id: params.id } },
        { locale: value },
      );
      return;
    }

    if (
      pathname === '/admin/project/[id]/edit' &&
      typeof params.id === 'string'
    ) {
      router.replace(
        { pathname: '/admin/project/[id]/edit', params: { id: params.id } },
        { locale: value },
      );
      return;
    }

    if (pathname === '/blog/tag/[name]' && typeof params.name === 'string') {
      router.replace(
        { pathname: '/blog/tag/[name]', params: { name: params.name } },
        { locale: value },
      );
      return;
    }

    if (pathname === '/blog/category/[name]' && typeof params.name === 'string') {
      router.replace(
        { pathname: '/blog/category/[name]', params: { name: params.name } },
        { locale: value },
      );
      return;
    }

    router.replace(pathname as StaticPathname, { locale: value });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('label')}
        className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-all hover:border-border hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase tracking-wide">{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-44 rounded-xl border-border/60 bg-popover/95 p-1.5 shadow-lg backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
          {t('label')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />
        {locales.map((cur) => {
          const isActive = cur === locale;

          return (
            <DropdownMenuItem
              key={cur}
              onClick={() => onSelectChange(cur)}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-teal-500/10 font-medium text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <span className="flex-1">{t('locale', { locale: cur })}</span>
              {isActive && (
                <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ToggleLanguage;
