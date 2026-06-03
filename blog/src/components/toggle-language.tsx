'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import type { AppPathnames } from '@/config';
import { locales } from '@/config';
import { usePathname, useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

type LocaleType = (typeof locales)[number];
type DynamicPathname =
  | '/blog/[id]'
  | '/blog/[id]/edit'
  | '/blog/tag/[name]'
  | '/blog/category/[name]'
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
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[120px]" aria-label={t('label')}>
        <span className="truncate">{t('locale', { locale })}</span>
      </SelectTrigger>
      <SelectContent>
        {locales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {t('locale', { locale: cur })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ToggleLanguage;
