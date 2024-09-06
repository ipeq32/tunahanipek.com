'use client';

import { useRouter } from '@/navigation';

const LogoFeature = () => {
  const router = useRouter();

  return (
    <div
      className="self-start h-auto text-center max-sm:mr-10"
      onClick={() => router.push('/')}
    >
      <button className="transition duration-500 ease-in-out transform mr-44 animate-skew hover:-translate-y-1 hover:-translate-x-2 hover:scale-110 hover:scale-y-125">
        <div className="relative box">
          <p className="text-green-500 text text1">tunahan</p>
          <p className="text-gray-700 text text2">tunahan</p>
        </div>
      </button>
    </div>
  );
};

export default LogoFeature;
