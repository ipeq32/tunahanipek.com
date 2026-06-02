import Link from "next/link";
import { site } from "@/app/_content/site";
import SignatureLogo from "@/app/_ui/SignatureLogo";

const Navbar = () => {
  return (
    <header className="mx-3 mb-6 mt-4 shrink-0 md:mb-4 md:mt-3">
      <nav
        className="flex h-24 items-center rounded-full bg-red-100 shadow-xl md:h-[5.5rem]"
        aria-label="Ana menü"
      >
        <div className="flex w-24 flex-none items-center self-center max-sm:mr-5 sm:mx-6">
          <div className="max-sm:hidden animate-fadeInDown space-y-2">
            <div className="h-4 w-2/4 rounded bg-gradient-to-r from-blue-400" />
            <div className="h-4 rounded bg-gradient-to-tl from-indigo-400 via-green-300 to-pink-400" />
            <div className="h-4 w-5/6 rounded bg-gradient-to-tr from-yellow-400" />
          </div>
          <div className="hidden max-sm:block animate-bounce">
            <SignatureLogo gradientId="nav-signature-gradient" className="h-14 w-14" />
          </div>
        </div>

        <div className="mr-3 flex flex-auto animate-pulse items-center justify-center space-x-2 max-lg:hidden">
          <div className="h-8 w-8 rounded-full bg-pink-400" />
          <div className="h-8 w-8 rounded-md bg-blue-400" />
          <div className="h-8 w-8 rounded-full bg-red-400" />
        </div>

        <div className="flex flex-grow items-center justify-center self-center max-sm:mr-6">
          <Link
            href="/"
            className="brand-link flex items-center animate-skew transition duration-500 ease-in-out hover:-translate-x-2 hover:-translate-y-1 hover:scale-110 hover:scale-y-125"
            aria-label={site.name}
          >
            <div className="box">
              <p className="text text1 text-green-500">tunahan</p>
              <p className="text text2 text-gray-700">tunahan</p>
            </div>
          </Link>
        </div>

        <div className="ml-5 flex flex-auto animate-pulse items-center justify-center space-x-2 max-lg:hidden">
          <div className="h-8 w-8 rounded-full bg-red-400" />
          <div className="h-8 w-8 rounded-md bg-blue-400" />
          <div className="h-8 w-8 rounded-full bg-pink-400" />
        </div>

        <div className="flex w-24 flex-none animate-fadeInDown items-center self-center max-sm:hidden sm:mx-6">
          <div className="rotate-180 space-y-2">
            <div className="h-4 w-2/4 rounded bg-gradient-to-tr from-yellow-400" />
            <div className="h-4 rounded bg-gradient-to-l from-blue-400 via-red-300 to-green-400" />
            <div className="h-4 w-5/6 rounded bg-gradient-to-tr from-indigo-400" />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
