'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RotatingMotto } from './_features/RotatingMotto';
import { SiteContainer } from '@/components/layout/site-container';

type FooterProps = {
  isAuthenticated: boolean;
  userName: string | null;
};

const Footer = ({ isAuthenticated, userName }: FooterProps) => {
  const t = useTranslations('Footer');

  const emailAddress = 'tnhnipek@gmail.com';
  const emailSubject = t('Mail.subject');
  const emailBody = t('Mail.body', {
    auth: isAuthenticated ? `İsmim ${userName}` : 'Daha giriş yapmadım.',
  });
  const recipientAddress = 'Gültepe, Albayrak Meydanı, Merkezefendi/Denizli';

  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const googleMapsLink = `https://www.google.com/maps/search/${encodeURIComponent(recipientAddress)}`;

  const instagramLinks = [
    {
      src: '/insta-photo-1.jpg',
      url: 'https://www.instagram.com/p/BtYoiKplxjKfBcFcpjSfCRhiBgWjmFYyCMQMqM0/',
    },
    {
      src: '/insta-photo-2.jpg',
      url: 'https://www.instagram.com/p/CzXScHENJP_IaA1kbULM4rGAt_e3F_ljwHfguw0/',
    },
    {
      src: '/insta-photo-3.jpg',
      url: 'https://www.instagram.com/p/BtRVtURFUM2kWGGaaq_VektF2mH1Jl81ApwhQg0/',
    },
    {
      src: '/insta-photo-4.jpg',
      url: 'https://www.instagram.com/p/CzXScHENJP_IaA1kbULM4rGAt_e3F_ljwHfguw0/',
    },
  ];

  const usefulLinks = [
    { href: '/about-me', label: t.raw('UsefulLink.about') as string },
    { href: '/project', label: t.raw('UsefulLink.project') as string },
    { href: '/faq', label: t.raw('UsefulLink.faq') as string },
    { href: '/contact', label: t.raw('UsefulLink.contact') as string },
  ];

  const socials = [
    { href: 'https://github.com/ipeq32', label: 'GitHub', icon: Github },
    {
      href: 'https://www.instagram.com/tnhnipek',
      label: 'Instagram',
      icon: Instagram,
    },
    {
      href: 'https://www.linkedin.com/in/tunahanipek',
      label: 'LinkedIn',
      icon: Linkedin,
    },
  ];

  return (
    <footer className="relative border-t border-border/60 bg-card/30 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
        aria-hidden
      />
      <SiteContainer className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="text-lg font-bold tracking-tight text-gradient">Tunahan İPEK</p>
          <RotatingMotto />
          <div className="flex gap-2">
            {socials.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-400"
              >
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('AddressInfo.title')}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="tel:+905416064488"
                className="flex items-center gap-2 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +90 (541) 606-4488
              </Link>
            </li>
            <li>
              <Link
                href={mailtoLink}
                className="flex items-center gap-2 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {emailAddress}
              </Link>
            </li>
            <li>
              <Link
                href={googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                Gültepe/DENİZLİ
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('UsefulLink.title')}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {usefulLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-teal-600 dark:hover:text-teal-400"
                >
                  <ChevronRight className="h-3.5 w-3.5 -translate-x-1 text-teal-500/0 transition-all group-hover:translate-x-0 group-hover:text-teal-500" />
                  <span dangerouslySetInnerHTML={{ __html: item.label }} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Instagram
          </h3>
          <div className="grid max-w-[180px] grid-cols-2 gap-2.5">
            {instagramLinks.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Instagram ${index + 1}`}
                className="group relative overflow-hidden rounded-xl border border-border/60 ring-teal-500/0 transition-all hover:ring-2 hover:ring-teal-500/40"
              >
                <Image
                  src={link.src}
                  alt={`Instagram ${index + 1}`}
                  width={80}
                  height={80}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Instagram className="h-4 w-4 text-white" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </SiteContainer>

      <SiteContainer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <p>
          © <span className="text-teal-600 dark:text-teal-400">Blog</span>{' '}
          {t.rich('ownership', {
            link: (text) => (
              <Link
                href="https://tunahanipek.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                {text}
              </Link>
            ),
          })}
        </p>
      </SiteContainer>
    </footer>
  );
};

export default Footer;
