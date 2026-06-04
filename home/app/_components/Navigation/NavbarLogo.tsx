"use client";

import SignatureLogo from "@/app/_ui/SignatureLogo";
import { Link } from "@/navigation";

import { BrandWordmark } from "./BrandWordmark";

type NavbarLogoProps = {
  label: string;
  wordmark: string;
};

export function NavbarLogo({ label, wordmark }: NavbarLogoProps) {
  return (
    <Link
      href="/"
      className="nav-brand-group group"
      aria-label={label}
    >
      <span className="nav-logo-emphasis shrink-0">
        <SignatureLogo
          gradientId="nav-signature-gradient"
          className="h-12 w-12 sm:h-14 sm:w-14"
          loopDraw
        />
      </span>
      <BrandWordmark word={wordmark} />
    </Link>
  );
}
