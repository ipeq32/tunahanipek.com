'use client'

import { useState, useRef } from "react";
import Link from "next/link";
import { Globe, LogIn, Menu, MenuSquare, Phone } from "lucide-react";
import { usePathname } from "next/navigation"
import useClickOutside from "@hooks/useClickOutside";
import { useAtom } from "jotai";
import { rain } from "@jotai/atoms";
import { toast } from "react-hot-toast";

type Props = {};

const Navbar = ({ }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isMenuSquareOpen, setIsMenuSquareOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuSquareRef = useRef<HTMLDivElement>(null);
  const [, setRainEffect] = useAtom(rain.rainEffectAtom);

  const pathname = usePathname();

  useClickOutside(menuRef, () => {
    setIsMenuOpen(false);
  });

  useClickOutside(menuSquareRef, () => {
    setIsMenuSquareOpen(false);
  });

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-evenly h-28 bg-secondary/90 shadow-sm shadow-slate-700 backdrop-blur-sm">
      {/* logo */}
      <div className="self-start h-auto text-center max-sm:mr-10">
        <button
          onClick={() => {
            setRainEffect(true);
            toast.success("Rain effect is enabled.", {
              icon: "🌧️",
              style: {
                backgroundColor: "plum",
                color: "#fff",
              },
              position: "top-center",
            });
          }}
          className="transition duration-500 ease-in-out transform mr-44 animate-skew hover:-translate-y-1 hover:-translate-x-2 hover:scale-110 hover:scale-y-125"
        >
          <div className="relative box">
            <p className="text-green-500 text text1">tunahan</p>
            <p className="text-gray-700 text text2">tunahan</p>
          </div>
        </button>
      </div>
      {/* nav links */}
      {/* MD and above */}
      <div className="flex flex-row items-center justify-between max-w-md w-full max-md:hidden">
        <Link href={"/"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>Home</Link>
        <Link href={"/about-me"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/about-me" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>About Me</Link>
        <Link href={"/projects"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/projects" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>Projects</Link>
        <Link href={"/blogs"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/blogs" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>Blogs</Link>
      </div>
      {/* belowe MD */}
      <div ref={menuSquareRef} className="relative md:hidden">
        <MenuSquare onClick={() => setIsMenuSquareOpen(!isMenuSquareOpen)} width={40} height={40} className="cursor-pointer select-none" />
        <div className={`absolute top-20 -left-20 translate-x-[-50%] max-mobile-lg:translate-x-[-30%] w-48 h-max bg-secondary/95 rounded-md flex flex-col items-center justify-center py-5 gap-5 transition-all duration-300 ease-linear ${isMenuSquareOpen ? "block backdrop-blur-3xl" : "hidden"}`}>
          <Link href={"/"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>Home</Link>
          <Link href={"/about-me"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/about-me" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>About Me</Link>
          <Link href={"/projects"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/projects" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>Projects</Link>
          <Link href={"/blogs"} className={`border-b border-transparent py-2 px-1 rounded hover:text-teal-500 hover:border-slate-400 ${pathname === "/blogs" ? "text-teal-500 !border-slate-400" : "text-slate-200"}`}>Blogs</Link>
        </div>
      </div>
      {/* contact */}
      {/* XL and above */}
      <div className="flex flow-row items-center gap-5 max-xl:hidden">
        <div className="flex flex-row items-center group/call w-max gap-2 mr-5 h-10">
          <Link href={"tel:+905416064488"} className="relative flex justify-center items-center group/phone rounded-md bg-indigo-900 h-full w-10">
            <span className="absolute bg-amber-600 top-0 w-0 h-0 group-hover/phone:w-full group-hover/phone:h-full rounded-md transition-all duration-300 ease-linear" />
            <Phone width={25} height={25} className="group-hover/phone:text-slate-200 group-hover/phone:scale-125 text-amber-400 z-10 transition-colors" />
          </Link>
          <div className="flex flex-col items-start">
            <div className="text-md font-medium text-gray-500 group-hover/call:text-gray-400">Call me now</div>
            <div className="text-sm font-medium text-gray-400 group-hover/call:text-gray-300">+90 (541) 606-4488</div>
          </div>
        </div>
        <Link href={"/contact"} className="relative flex justify-center items-center group/start w-40 h-12 px-6 py-3 border border-slate-600 hover:border-slate-400 rounded-md">
          <span className="absolute bg-emerald-600 top-0 left-0 w-0 h-0 group-hover/start:w-full group-hover/start:h-full rounded-md transition-all duration-300 ease-linear" />
          <p className="text-sm group-hover/start:leading-loose z-10 transition-colors">Get Contact Me</p>
          <span className="absolute bg-emerald-600 bottom-0 right-0 w-0 h-0 group-hover/start:w-full group-hover/start:h-full rounded-md transition-all duration-300 ease-linear" />
        </Link>
        <div className="flex flex-row items-center gap-3">
          <Globe className="text-lime-600 hover:text-lime-400 cursor-pointer" />
          <LogIn className="text-teal-600 hover:text-teal-400 cursor-pointer" />
        </div>
      </div>
      {/* below XL */}
      <div ref={menuRef} className="relative xl:hidden">
        <Menu onClick={() => setIsMenuOpen(!isMenuOpen)} width={40} height={40} className="cursor-pointer select-none" />
        <div className={`absolute top-20 -left-20 translate-x-[-80%] max-md:translate-x-[-65%] w-64 h-max bg-secondary/95 rounded-md flex flex-col items-center justify-center gap-5 transition-all duration-300 ease-linear ${isMenuOpen ? "block backdrop-blur-3xl" : "hidden"}`}>
          <div className="flex flex-col-reverse items-center justify-center gap-5 py-5">
            <div className="flex flex-row items-center group/call w-max gap-2 mr-5 h-10">
              <Link href={"tel:+905416064488"} className="relative flex justify-center items-center group/phone rounded-md bg-indigo-900 h-full w-10">
                <span className="absolute bg-amber-600 top-0 w-0 h-0 group-hover/phone:w-full group-hover/phone:h-full rounded-md transition-all duration-300 ease-linear" />
                <Phone width={25} height={25} className="group-hover/phone:text-slate-200 group-hover/phone:scale-125 text-amber-400 z-10 transition-colors" />
              </Link>
              <div className="flex flex-col items-start">
                <div className="text-md font-medium text-gray-500 group-hover/call:text-gray-400">Call me now</div>
                <div className="text-sm font-medium text-gray-400 group-hover/call:text-gray-300">+90 (541) 606-4488</div>
              </div>
            </div>
            <Link href={"/contact"} className="relative flex justify-center items-center group/start w-40 h-12 px-6 py-3 border border-slate-600 hover:border-slate-400 rounded-md">
              <span className="absolute bg-emerald-600 top-0 left-0 w-0 h-0 group-hover/start:w-full group-hover/start:h-full rounded-md transition-all duration-300 ease-linear" />
              <p className="text-sm group-hover/start:leading-loose z-10 transition-colors">Get Contact Me</p>
              <span className="absolute bg-emerald-600 bottom-0 right-0 w-0 h-0 group-hover/start:w-full group-hover/start:h-full rounded-md transition-all duration-300 ease-linear" />
            </Link>
            <div className="flex flex-row justify-around w-full items-center gap-3">
              <Globe width={35} height={35} className="text-lime-600 hover:text-lime-400 cursor-pointer" />
              <LogIn width={35} height={35} className="text-teal-600 hover:text-teal-400 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
};

export default Navbar;