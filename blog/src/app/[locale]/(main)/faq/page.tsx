import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { FaqAccordion } from '@/components/layout/faq-accordion';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  FileText,
  Info,
  type LucideIcon,
  Mail,
  MessageCircleQuestion,
  UserRound,
} from 'lucide-react';

type FaqGroup = {
  category: 'general' | 'content' | 'account' | 'contact';
  icon: LucideIcon;
  keys: string[];
};

const groups: FaqGroup[] = [
  { category: 'general', icon: Info, keys: ['what', 'tech'] },
  {
    category: 'content',
    icon: FileText,
    keys: ['addPost', 'publish', 'languages', 'comments'],
  },
  { category: 'account', icon: UserRound, keys: ['register', 'forgotPassword'] },
  { category: 'contact', icon: Mail, keys: ['contact', 'collaboration'] },
];

export default async function FaqPage() {
  const t = await getTranslations('Pages.Faq');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />

      <div className="mt-2 space-y-8">
        {groups.map((group, groupIndex) => {
          const items = group.keys.map((key) => ({
            id: key,
            question: t(`items.${key}.question`),
            answer: t(`items.${key}.answer`),
          }));
          const Icon = group.icon;

          return (
            <section key={group.category} className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight">
                  {t(`categories.${group.category}`)}
                </h2>
              </div>
              <FaqAccordion items={items} openFirst={groupIndex === 0} />
            </section>
          );
        })}

        <section className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-transparent p-8 text-center shadow-sm md:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-lg flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <MessageCircleQuestion className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              {t('moreTitle')}
            </h2>
            <p className="text-muted-foreground">{t('moreDescription')}</p>
            <Button variant="accent" asChild className="mt-1">
              <Link href="/contact">
                {t('moreCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
