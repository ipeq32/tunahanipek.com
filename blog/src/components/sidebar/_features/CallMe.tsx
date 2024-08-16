'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';

const CallMeFeature = () => {
  return (
    <div className="flex flex-row items-center group/call w-max max-xl:w-full gap-2 mr-5 h-10">
      <Link
        href={'tel:+905416064488'}
        className="relative flex justify-center items-center group/phone rounded-md bg-indigo-900 h-full w-10"
      >
        <span className="absolute bg-amber-600 top-0 w-0 h-0 group-hover/phone:w-full group-hover/phone:h-full rounded-md transition-all duration-300 ease-linear" />
        <Phone
          width={25}
          height={25}
          className="group-hover/phone:text-slate-200 group-hover/phone:scale-125 text-amber-400 z-10 transition-colors"
        />
      </Link>
      <div className="flex flex-col items-start">
        <div className="text-md font-medium text-gray-500 group-hover/call:text-gray-400">
          Call me now
        </div>
        <div className="text-sm font-medium text-gray-400 group-hover/call:text-gray-300">
          +90 (541) 606-4488
        </div>
      </div>
    </div>
  );
};

export default CallMeFeature;
