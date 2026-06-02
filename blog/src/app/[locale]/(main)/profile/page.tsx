import { auth } from '@/auth';
import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { ContentCard } from '@/components/layout/content-card';
import { InfoRow } from '@/components/layout/feature-card';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations('Pages.Profile');

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <ContentCard className="mt-2 max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Image
            src={
              user.image ||
              'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
            }
            alt={user.name ?? ''}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-2xl border border-border/60 object-cover ring-2 ring-teal-500/20"
          />
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label={t('phone')} value={user.phone || '—'} />
          <InfoRow label={t('role')} value={user.role} />
          <InfoRow label={t('address')} value={user.address || '—'} className="sm:col-span-2" />
        </div>
        {user.bio && (
          <div className="mt-4 rounded-xl border border-border/40 bg-background/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('bio')}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}
      </ContentCard>
    </>
  );
}
