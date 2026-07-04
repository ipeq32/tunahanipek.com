'use client';

import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useTranslations } from 'next-intl';
import type { SiteAuthCredentials } from '@/lib/validations/site-auth';

type ProjectSiteAuthFieldsProps = {
  value: SiteAuthCredentials;
  onChange: (value: SiteAuthCredentials) => void;
  disabled?: boolean;
};

export default function ProjectSiteAuthFields({
  value,
  onChange,
  disabled,
}: ProjectSiteAuthFieldsProps) {
  const t = useTranslations('Content.SiteAuth');

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-muted/15 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t('title')}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="site-auth-username" className="text-xs font-medium">
            {t('username')}
          </label>
          <Input
            id="site-auth-username"
            value={value.username}
            onChange={(event) =>
              onChange({ ...value, username: event.target.value })
            }
            autoComplete="off"
            disabled={disabled}
            placeholder={t('usernamePlaceholder')}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="site-auth-password" className="text-xs font-medium">
            {t('password')}
          </label>
          <PasswordInput
            id="site-auth-password"
            value={value.password}
            onChange={(event) =>
              onChange({ ...value, password: event.target.value })
            }
            autoComplete="new-password"
            disabled={disabled}
            placeholder={t('passwordPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
