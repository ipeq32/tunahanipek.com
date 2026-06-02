'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { RotatingMotto } from './_features/RotatingMotto';

const Footer = () => {
  const { data, status } = useSession();
  const t = useTranslations('Footer');

  const emailAddress = 'tnhnipek@gmail.com';
  const emailSubject = t('Mail.subject');
  const emailBody = t('Mail.body', {
    auth: `${status === 'authenticated' && `İsmim ${data?.user?.name}`}${status === 'unauthenticated' && 'Daha giriş yapmadım.'}`,
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

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/30 pt-12 backdrop-blur-sm">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="text-lg font-bold tracking-tight text-gradient">Tunahan İPEK</p>
          <RotatingMotto />
          <div className="flex gap-3">
            <Link
              href="https://github.com/ipeq32"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.instagram.com/tnhnipek"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/tunahanipek"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
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
          <ul className="space-y-2 text-sm">
            {usefulLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
                  dangerouslySetInnerHTML={{ __html: item.label }}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Instagram
          </h3>
          <div className="grid grid-cols-4 gap-2 max-w-[200px]">
            {instagramLinks.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-lg border border-border/60 transition-opacity hover:opacity-80"
              >
                <Image
                  src={link.src}
                  alt={`Instagram ${index + 1}`}
                  width={48}
                  height={48}
                  className="aspect-square object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
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
      </div>
    </footer>
  );
};

export default Footer;
