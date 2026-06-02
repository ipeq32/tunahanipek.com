'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  | '/blog/category/[name]';

type StaticPathname = Exclude<AppPathnames, DynamicPathname>;

function ToggleLanguage() {
  const locale = useLocale();
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
    <Select onValueChange={onSelectChange} defaultValue={locale}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={locale} />
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
