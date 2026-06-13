import { auth } from '@/auth';
import { ContentCard } from '@/components/layout/content-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, redirect } from '@/navigation';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import {
  CalendarDays,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://img.icons8.com/?size=100&id=21441&format=png&color=000000';

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

function DetailRow({ icon: Icon, label, value, href }: DetailRowProps) {
  const displayValue = value || '—';

  return (
    <div className="flex items-center gap-3 border-b border-border/40 py-3.5 last:border-b-0 last:pb-0 first:pt-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href && value ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block truncate text-sm font-medium text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400"
          >
            {displayValue}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
            {displayValue}
          </p>
        )}
      </div>
    </div>
  );
}

function roleBadgeClass(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300';
    case 'ADMIN':
      return 'border-cyan-500/25 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300';
    default:
      return 'border-border/60 bg-muted/40 text-muted-foreground';
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations('Pages.Profile');

  if (!session?.user) {
    return redirect({
      href: {
        pathname: '/auth/login',
        query: { callback: '/profile' },
      },
      locale,
    });
  }

  const { user } = session;
  const joined = user.createdAt
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(user.createdAt))
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-4 pt-2">
      <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm backdrop-blur-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <Image
                  src={user.image || FALLBACK_AVATAR}
                  alt={user.name ?? ''}
                  width={112}
                  height={112}
                  className="h-28 w-28 rounded-2xl border border-border/60 bg-muted object-cover shadow-sm"
                />
                <span
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-teal-500 text-white shadow-sm"
                  aria-hidden
                >
                  <UserRound className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {t('description')}
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {user.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge
                    className={cn('gap-1 border', roleBadgeClass(user.role ?? 'USER'))}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {t(`roles.${user.role}`)}
                  </Badge>
                  {joined && (
                    <Badge variant="outline" className="gap-1 font-normal">
                      <CalendarDays className="h-3 w-3" />
                      {joined}
                    </Badge>
                  )}
                </div>

                <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              {user.website && (
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <a href={user.website} target="_blank" rel="noreferrer">
                    <Globe className="mr-1.5 h-4 w-4" />
                    {t('website')}
                  </a>
                </Button>
              )}
              <Button variant="accent" size="sm" className="w-full sm:w-auto" asChild>
                <Link href="/setting">
                  <Settings className="mr-1.5 h-4 w-4" />
                  {t('editProfile')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <ContentCard className="p-5 md:p-6">
          <h2 className="mb-1 text-sm font-semibold tracking-tight">
            {t('contactInfo')}
          </h2>
          <dl>
            <DetailRow icon={Mail} label={t('email')} value={user.email ?? ''} />
            <DetailRow icon={Phone} label={t('phone')} value={user.phone ?? ''} />
            <DetailRow
              icon={MapPin}
              label={t('address')}
              value={user.address ?? ''}
            />
            {user.website && (
              <DetailRow
                icon={Globe}
                label={t('website')}
                value={user.website}
                href={user.website}
              />
            )}
          </dl>
        </ContentCard>

        <ContentCard className="p-5 md:p-6">
          <h2 className="mb-1 text-sm font-semibold tracking-tight">
            {t('accountDetails')}
          </h2>
          <dl>
            <DetailRow icon={ShieldCheck} label={t('role')} value={t(`roles.${user.role}`)} />
            <DetailRow icon={CalendarDays} label={t('joined')} value={joined ?? ''} />
            <DetailRow
              icon={KeyRound}
              label={t('password')}
              value={user.hasPassword ? t('passwordSet') : t('passwordNotSet')}
            />
          </dl>
        </ContentCard>
      </div>

      {user.bio && (
        <ContentCard className="relative overflow-hidden p-5 md:p-6">
          <div
            className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-gradient-to-bl from-teal-500/10 to-transparent"
            aria-hidden
          />
          <h2 className="text-sm font-semibold tracking-tight">{t('bio')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {user.bio}
          </p>
        </ContentCard>
      )}
    </div>
  );
}
