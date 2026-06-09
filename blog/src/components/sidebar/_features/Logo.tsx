'use client';

import { useTapLogoAnimation } from '@/hooks/useTapLogoAnimation';
import { useRouter } from '@/navigation';

const LogoFeature = () => {
  const router = useRouter();
  const { elementRef, playAnimation } = useTapLogoAnimation();

  const handleClick = () => {
    playAnimation();
    router.push('/');
  };

  return (
    <button
      ref={elementRef}
      type="button"
      onClick={handleClick}
      className="group/logo logo-brand-trigger shrink-0 transition-transform duration-300 ease-out"
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
