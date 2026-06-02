import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { ContactChannelCard } from '@/components/layout/contact-channel-card';
import { ContentCard } from '@/components/layout/content-card';
import { getTranslations } from 'next-intl/server';
import { Github, Linkedin, Mail } from 'lucide-react';

export default async function ContactPage() {
  const t = await getTranslations('Pages.Contact');

  const channels = [
    {
      label: t('emailLabel'),
      value: 'hello@tunahanipek.com',
      href: 'mailto:hello@tunahanipek.com',
      icon: Mail,
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
      href: 'https://www.linkedin.com/in/tunahanipek',
      icon: Linkedin,
    },
  ];

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <ContentCard className="mb-6 mt-2">
        <p className="text-muted-foreground">{t('body')}</p>
      </ContentCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <ContactChannelCard key={channel.href} {...channel} />
        ))}
      </div>
    </>
  );
}
