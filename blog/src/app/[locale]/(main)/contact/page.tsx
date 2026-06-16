import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';
import { ContactForm } from './_components/ContactForm';
import { ContactInfoPanel } from './_components/ContactInfoPanel';
import { ContactLocationSection } from './_components/ContactLocationSection';
import {
  ArrowRight,
  Github,
  HelpCircle,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/social';
import { getContactMapLocation } from '@/lib/contact/location.server';
import { getSiteOwner } from '@/lib/site-owner';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pages.Contact' });
  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    route: '/contact',
  });
}

function socialHandle(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export default async function ContactPage() {
  const t = await getTranslations('Pages.Contact');
  const siteOwner = await getSiteOwner();
  const mapLocation = await getContactMapLocation(siteOwner);
  const publicEmail = siteOwner?.publicEmail ?? 'hello@tunahanipek.com';

  const channels = [
    {
      label: t('emailLabel'),
      value: publicEmail,
      href: `mailto:${publicEmail}`,
      icon: Mail,
      external: false,
    },
    {
      label: t('githubLabel'),
      value: socialHandle(SOCIAL_LINKS.github),
      href: SOCIAL_LINKS.github,
      icon: Github,
    },
    {
      label: t('linkedinLabel'),
      value: socialHandle(SOCIAL_LINKS.linkedin),
      href: SOCIAL_LINKS.linkedin,
      icon: Linkedin,
    },
    {
      label: t('twitterLabel'),
      value: socialHandle(SOCIAL_LINKS.twitter),
      href: SOCIAL_LINKS.twitter,
      icon: Twitter,
    },
    {
      label: t('instagramLabel'),
      value: socialHandle(SOCIAL_LINKS.instagram),
      href: SOCIAL_LINKS.instagram,
      icon: Instagram,
    },
  ];

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />

      <div className="mt-2 grid gap-8 lg:grid-cols-5 lg:items-start">
        <aside className="lg:col-span-2 lg:sticky lg:top-24">
          <ContactInfoPanel
            availabilityBadge={t('availabilityBadge')}
            body={t('body')}
            responseNote={t('responseNote')}
            directContactTitle={t('directContactTitle')}
            socialTitle={t('socialTitle')}
            siteOwner={siteOwner}
            corporateEmailLabel={t('corporateEmailLabel')}
            personalEmailLabel={t('personalEmailLabel')}
            phoneLabel={t('phoneLabel')}
            addressLabel={t('addressLabel')}
            websiteLabel={t('websiteLabel')}
            omitAddress={Boolean(mapLocation)}
            channels={channels}
          />
        </aside>

        <div className="flex flex-col gap-8 lg:col-span-3">
          <ContactForm />
          {mapLocation && (
            <ContactLocationSection
              latitude={mapLocation.latitude}
              longitude={mapLocation.longitude}
              addressLabel={mapLocation.addressLabel}
              mapsHref={mapLocation.mapsHref}
              mapTitle={t('mapTitle')}
              openInMapsLabel={t('openInMaps')}
              approximate={mapLocation.approximate}
              approximateNote={
                mapLocation.approximate ? t('mapApproximateNote') : undefined
              }
            />
          )}
        </div>
      </div>

      <section className="relative mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm md:p-10">
        <div
          className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-lg flex-col items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <HelpCircle className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            {t('faqTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('faqDescription')}</p>
          <Button variant="outline" asChild className="mt-1">
            <Link href="/faq">
              {t('faqCta')}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
