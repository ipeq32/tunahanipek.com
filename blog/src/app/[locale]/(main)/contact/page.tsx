import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { ContactChannelCard } from '@/components/layout/contact-channel-card';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  Clock,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Sparkles,
} from 'lucide-react';

const EMAIL = 'hello@tunahanipek.com';
const LINKEDIN = 'https://www.linkedin.com/in/tunahanipek';

export default async function ContactPage() {
  const t = await getTranslations('Pages.Contact');

  const channels = [
    {
      label: t('emailLabel'),
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      icon: Mail,
      external: false,
    },
    {
      label: t('githubLabel'),
      value: 'github.com/ipeq32',
      href: 'https://github.com/ipeq32',
      icon: Github,
    },
    {
      label: t('linkedinLabel'),
      value: 'linkedin.com/in/tunahanipek',
      href: LINKEDIN,
      icon: Linkedin,
    },
    {
      label: t('instagramLabel'),
      value: 'instagram.com/tnhnipek',
      href: 'https://www.instagram.com/tnhnipek',
      icon: Instagram,
    },
  ];

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />

      <div className="mt-2 space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-transparent p-8 shadow-sm md:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t('availabilityBadge')}
            </div>
            <p className="text-lg text-foreground/90 md:text-xl">{t('body')}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" asChild>
                <a href={`mailto:${EMAIL}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('ctaEmail')}
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={LINKEDIN} target="_blank" rel="noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  {t('ctaLinkedin')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t('responseNote')}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {t('channelsTitle')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <ContactChannelCard key={channel.href} {...channel} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
