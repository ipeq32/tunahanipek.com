'use client'

import { Clock3, Github, Instagram, Linkedin, Stethoscope } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link"

type Props = {};

const NavContact = ({ }: Props) => {
  const [isOpen, setIsOpen] = useState<'Open' | 'Closed'>('Closed');

  const currentDay = new Date().toLocaleDateString('en', { weekday: 'long' });
  const currentHour = new Date().getHours();

  useEffect(() => {
    if ((currentDay !== 'Saturday' || 'Sunday') && currentHour < 8 || currentHour > 18) {
      return setIsOpen('Closed');
    } else {
      return setIsOpen('Open');
    }
  })

  return (
    <div className="flex items-center justify-center h-12 bg-indigo-950 max-2xl:px-10">
      <div className="flex flex-row justify-between max-w-screen-xl w-full">
        <div className="flex flex-row items-center gap-2 max-md:hidden">
          <Stethoscope width={20} height={20} className="animate-pulse" />
          <div className="flex items-center overflow-hidden">
            <p className="text-sm animate-text-slide whitespace-nowrap">Welcome to my blog page.</p>
          </div>
        </div>
        {/* contact */}
        <div className="flex flex-row justify-end max-md:justify-around items-center w-full gap-10">
          <div className="flex flex-row items-center gap-2">
            <Clock3 width={20} height={20} className="animate-spin-slow" />
            <div className="flex flex-row gap-2 text-sm">
              <div className={`flex items-center overflow-hidden border-b ${isOpen ? "border-sky-400" : "border-rose-400"}`}>
                <span className="max-sm:hidden animate-text-slide-slow whitespace-nowrap max-w-[250px]">
                  My working hours are between 08:00 and 16:00 on weekdays.
                </span>
                <span className="max-sm:block hidden">
                  {currentDay}
                </span>
              </div>
              <span className={`select-none ${isOpen === 'Open' ? 'text-green-500 cursor-grab' : 'text-red-500 cursor-wait'}`}>
                {isOpen}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-evenly w-28">
            <Link href="https://github.com/ipeq32" target="_blank">
              <Github className="hover:text-stone-500 transition-colors duration-500 ease-linear" width={20} height={20} />
            </Link>
            <Link href="https://www.instagram.com/tnhnipek" target="_blank">
              <Instagram className="hover:text-rose-500 transition-colors duration-500 ease-linear" width={20} height={20} />
            </Link>
            <Link href="https://www.linkedin.com/in/tunahanipek" target="_blank">
              <Linkedin className="hover:text-sky-500 transition-colors duration-500 ease-linear" width={20} height={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
};

export default NavContact;
