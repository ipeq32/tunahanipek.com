'use client';

import { useRouter } from '@/navigation';

const LogoFeature = () => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/')}
      className="group/logo shrink-0 transition-transform duration-300 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5"
      aria-label="Ana sayfa"
    >
      <div className="logo-brand-box relative h-9 w-[7.5rem] cursor-pointer select-none">
        <span className="logo-brand-text logo-brand-text1">tunahan</span>
        <span className="logo-brand-text logo-brand-text2">tunahan</span>
      </div>
    </button>
  );
};

export default LogoFeature;
