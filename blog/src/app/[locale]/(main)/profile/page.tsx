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
  type LucideIcon,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://img.icons8.com/?size=100&id=21441&format=png&color=000000';

type InfoTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

function InfoTile({ icon: Icon, label, value, href }: InfoTileProps) {
  const displayValue = value || '—';

  return (
    <div className="group rounded-xl border border-border/50 bg-muted/15 p-4 transition-colors hover:border-teal-500/25 hover:bg-teal-500/[0.03]">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 ring-1 ring-border/50">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      {href && value ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block break-all text-base font-medium text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400"
        >
          {displayValue}
        </a>
      ) : (
        <p className="break-words text-base font-medium leading-snug text-foreground">
          {displayValue}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold tracking-tight text-foreground">
      {children}
    </h2>
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
  const role = user.role ?? 'USER';
  const joined = user.createdAt
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(user.createdAt))
    : null;

  return (
    <div className="w-full space-y-8 pb-2">
      <section className="relative w-full overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm backdrop-blur-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-400" />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10 lg:p-10">
          <div className="flex justify-center lg:justify-start">
            <Image
              src={user.image || FALLBACK_AVATAR}
              alt={user.name ?? ''}
              width={144}
              height={144}
              className="h-32 w-32 rounded-2xl border border-border/60 bg-muted object-cover shadow-md ring-2 ring-teal-500/20 lg:h-36 lg:w-36"
            />
          </div>

          <div className="space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                {t('title')}
              </p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {user.name}
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                {t('description')}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <Badge className={cn('gap-1.5 border px-3 py-1', roleBadgeClass(role))}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {t(`roles.${role}`)}
              </Badge>
              {joined && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1 font-normal">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {joined}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {user.email && (
                <span className="inline-flex max-w-full items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-teal-500" />
                  <span className="truncate">{user.email}</span>
                </span>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-teal-500" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-center gap-3 lg:flex-col lg:justify-center">
            {user.website && (
              <Button variant="outline" className="min-w-[10rem]" asChild>
                <a href={user.website} target="_blank" rel="noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  {t('website')}
                </a>
              </Button>
            )}
            <Button variant="accent" className="min-w-[10rem]" asChild>
              <Link href="/setting">
                <Settings className="mr-2 h-4 w-4" />
                {t('editProfile')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid w-full gap-6 xl:grid-cols-12">
        <ContentCard className="xl:col-span-8">
          <SectionTitle>{t('contactInfo')}</SectionTitle>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoTile icon={Mail} label={t('email')} value={user.email ?? ''} />
            <InfoTile icon={Phone} label={t('phone')} value={user.phone ?? ''} />
            <InfoTile
              icon={MapPin}
              label={t('address')}
              value={user.address ?? ''}
            />
            {user.website ? (
              <InfoTile
                icon={Globe}
                label={t('website')}
                value={user.website}
                href={user.website}
              />
            ) : (
              <InfoTile icon={Globe} label={t('website')} value="" />
            )}
          </div>
        </ContentCard>

        <ContentCard className="xl:col-span-4">
          <SectionTitle>{t('accountDetails')}</SectionTitle>
          <div className="mt-5 space-y-4">
            <InfoTile icon={ShieldCheck} label={t('role')} value={t(`roles.${role}`)} />
            <InfoTile icon={CalendarDays} label={t('joined')} value={joined ?? ''} />
            <InfoTile
              icon={KeyRound}
              label={t('password')}
              value={user.hasPassword ? t('passwordSet') : t('passwordNotSet')}
            />
          </div>
        </ContentCard>
      </div>

      {user.bio && (
        <ContentCard className="relative w-full overflow-hidden">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500"
            aria-hidden
          />
          <SectionTitle>{t('bio')}</SectionTitle>
          <p className="mt-4 max-w-none text-base leading-relaxed text-muted-foreground md:text-[15px]">
            {user.bio}
          </p>
        </ContentCard>
      )}
    </div>
  );
}
