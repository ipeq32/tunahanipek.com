import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./_components/Navigation/Navbar";
import InitialLoader from "./_components/Loading/InitialLoader";
import { metadataCopy, site } from "./_content/site";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tunahanipek.com"),
  title: {
    default: metadataCopy.title,
    template: `%s | ${metadataCopy.title}`,
  },
  description: metadataCopy.description,
  openGraph: {
    type: "profile",
    locale: metadataCopy.locale,
    url: "https://tunahanipek.com",
    emails: site.emails.map((e) => e.address),
    images: [
      {
        url: site.openGraphImage,
        width: 512,
        height: 512,
        alt: site.name,
      },
    ],
    title: metadataCopy.title,
    description: metadataCopy.description,
    countryName: "Turkey",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: metadataCopy.title,
    description: metadataCopy.description,
    images: [site.openGraphImage],
  },
  authors: [{ name: site.name, url: "https://tunahanipek.com" }],
  creator: site.name,
  keywords: [
    "Tunahan İpek",
    "yazılım geliştirici",
    "software developer",
    "tunahanipek",
    "blog",
    "kişisel web sitesi",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://tunahanipek.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body
        className={`${inter.className} page-canvas flex min-h-full flex-col text-slate-900 antialiased md:h-dvh md:max-h-dvh md:overflow-hidden`}
      >
        <InitialLoader>
          <Navbar />
          {children}
        </InitialLoader>
      </body>
    </html>
  );
}
