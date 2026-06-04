import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

/** Locale layout owns html/body; root only forwards children (next-intl pattern). */
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
