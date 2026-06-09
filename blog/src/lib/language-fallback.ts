import { defaultLocale, locales } from '@/config';

export type LanguageDto = {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export function getStaticLanguageFallback(): LanguageDto[] {
  return locales.map((code, index) => ({
    id: code,
    code,
    name: code === 'tr' ? 'Türkçe' : 'English',
    isDefault: code === defaultLocale,
    isActive: true,
    sortOrder: index,
  }));
}
