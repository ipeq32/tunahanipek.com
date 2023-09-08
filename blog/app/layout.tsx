import './globals.css'
import type { Metadata } from 'next'
import { Chakra_Petch } from 'next/font/google'
import Navbar from '@components/Navigation/Navbar'
import NavContact from '@components/Navigation/Contact'
import ScrollToTopButton from '@components/ScrollToTop/ScrollToTopButton'
import Footer from '@components/Footer/Footer'
import RainEffect from '@components/RainDrop/Rain'
import { Toaster } from 'react-hot-toast'

const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.tunahanipek.com'),
  title: {
    default: 'Tunahan İPEK',
    template: '%s | Tunahan İPEK',
  },
  description: 'My personal blog.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blog.tunahanipek.com',
    emails: ['tnhnipek@gmail.com', 'tunahan@rubiklabs.com'],
    phoneNumbers: ['+905416064488'],
    images: [
      {
        url: '/tunahanipek.jpg',
        width: 512,
        height: 512,
        alt: 'Tunahan İPEK',
      },
    ],
    title: 'Tunahan İPEK',
    description: 'My personal blog.',
    countryName: 'Turkey',
    siteName: 'Tunahan İPEK',
    ttl: 60 * 60 * 24 * 7,
    alternateLocale: ['tr_TR'],
  },
  twitter: {
    site: 'https://blog.tunahanipek.com',
    title: 'Tunahan İPEK',
    description: 'My personal blog.',
    images: [
      {
        url: '/tunahanipek.jpg',
        width: 512,
        height: 512,
        alt: 'Tunahan İPEK',
        username: '@tunahanipek',
      },
    ],
    siteId: 'https://blog.tunahanipek.com',
  },
  category: 'Personal Blog',
  authors: [
    {
      name: 'Tunahan İPEK',
      url: 'https://blog.tunahanipek.com',
    },
  ],
  themeColor: '#eba0bf',
  creator: 'Tunahan İPEK',
  publisher: 'Tunahan İPEK',
  keywords: [
    'Tunahan İPEK',
    'Tunahan',
    'İPEK',
    'tnhnipek',
    'tunahanipek',
    'tunahan',
    'ipek',
    'tnhn',
    'tnhnipek.com',
    'tunahanipek.com',
    'tunahanipekblog',
    'blog',
    'personal website',
    'personal blog',
    'personal',
    'website',
    'ipek tunahan',
  ],
  robots: 'index, follow',
  icons: [
    {
      url: '/favicon.ico',
      sizes: '16x16',
      username: '@tunahanipek',
    },
  ],
  generator: 'Tunahan İPEK',
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title: 'Tunahan İPEK',
    startupImage: {
      url: '/tunahanipek.jpg',
      media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
    },
  },
  colorScheme: 'light',
  formatDetection: {
    url: true,
    email: true,
    telephone: true,
    address: true,
    date: true,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${chakra.className} bg-primary text-slate-200`}>
        <RainEffect />
        <Toaster position='top-right' />
        <NavContact />
        <Navbar />
        {children}
        <ScrollToTopButton />
        <Footer />
      </body>
    </html >
  )
}
