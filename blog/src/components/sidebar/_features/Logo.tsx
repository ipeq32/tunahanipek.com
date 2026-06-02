'use client';

import { useRouter } from '@/navigation';

const LogoFeature = () => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/')}
      className="text-left transition-opacity hover:opacity-80"
      aria-label="Ana sayfa"
    >
      <span className="text-lg font-bold tracking-tight">
        <span className="text-gradient">tunahan</span>
        <span className="text-muted-foreground">ipek</span>
      </span>
    </button>
  );
};

export default LogoFeature;
