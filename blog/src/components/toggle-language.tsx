'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales } from '@/config';
import { useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';

type LocaleType = (typeof locales)[number];

function ToggleLanguage() {
  const locale = useLocale();
  const router = useRouter();

  const t = useTranslations('LocaleSwitcher');

  function onSelectChange(value: LocaleType) {
    router.push('/', { locale: value });
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
