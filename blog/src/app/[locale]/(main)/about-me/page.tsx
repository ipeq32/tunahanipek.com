import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { ContentCard } from '@/components/layout/content-card';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { DidYouKnow } from '@/components/ui/did-you-know';

export default async function AboutPage() {
  const t = await getTranslations('Pages.About');
  const highlights = [t('highlight1'), t('highlight2'), t('highlight3')];

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <ContentCard className="mt-2">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-3xl font-bold text-white shadow-lg shadow-teal-500/25">
            Tİ
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground">{t('body')}</p>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <Badge key={item} variant="accent">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ContentCard>
      <DidYouKnow className="mt-6" />
    </>
  );
}
