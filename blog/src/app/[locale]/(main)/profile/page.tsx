import { auth } from '@/auth';
import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import {
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  Phone,
  Quote,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://img.icons8.com/?size=100&id=21441&format=png&color=000000';

type InfoItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  className?: string;
};

function InfoItem({ icon: Icon, label, value, href, className }: InfoItemProps) {
  const content = (
    <div
      className={`flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3 transition-colors ${
        href ? 'hover:border-teal-500/40 hover:bg-teal-500/[0.04]' : ''
      } ${className ?? ''}`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations('Pages.Profile');
  const locale = await getLocale();

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const joined = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(user.createdAt));

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />

      <div className="mt-2 space-y-5">
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <div className="relative h-28 bg-gradient-to-br from-teal-500/25 via-cyan-500/15 to-transparent md:h-32">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 left-12 h-28 w-28 rounded-full bg-cyan-500/15 blur-3xl"
              aria-hidden
            />
          </div>

          <div className="px-5 pb-6 md:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Image
                  src={user.image || FALLBACK_AVATAR}
                  alt={user.name ?? ''}
                  width={104}
                  height={104}
                  unoptimized
                  className="h-24 w-24 rounded-full border-4 border-card bg-card object-cover shadow-md ring-1 ring-border/60"
                />
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                      {user.name}
                    </h2>
                    <Badge variant="accent" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {t(`roles.${user.role}`)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pb-1">
                {user.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={user.website} target="_blank" rel="noreferrer">
                      <Globe className="mr-1.5 h-4 w-4" />
                      {t('website')}
                    </a>
                  </Button>
                )}
                <Button variant="accent" size="sm" asChild>
                  <Link href="/setting">
                    <Settings className="mr-1.5 h-4 w-4" />
                    {t('editProfile')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem icon={Phone} label={t('phone')} value={user.phone || '—'} />
          <InfoItem
            icon={CalendarDays}
            label={t('joined')}
            value={joined}
          />
          <InfoItem
            icon={MapPin}
            label={t('address')}
            value={user.address || '—'}
            className="sm:col-span-2"
          />
          {user.website && (
            <InfoItem
              icon={Globe}
              label={t('website')}
              value={user.website}
              href={user.website}
              className="sm:col-span-2"
            />
          )}
        </div>

        {user.bio && (
          <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
            <Quote
              className="absolute right-4 top-4 h-10 w-10 text-teal-500/10"
              aria-hidden
            />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('bio')}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground">
              {user.bio}
            </p>
          </section>
        )}
      </div>
    </>
  );
}
