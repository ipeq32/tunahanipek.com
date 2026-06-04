"use client";

type BrandWordmarkProps = {
  word: string;
};

export function BrandWordmark({ word }: BrandWordmarkProps) {
  return (
    <span className="brand-wordmark-box" aria-hidden>
      <span className="brand-wordmark-text brand-wordmark-text1">{word}</span>
      <span className="brand-wordmark-text brand-wordmark-text2">{word}</span>
    </span>
  );
}
