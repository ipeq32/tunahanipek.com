import Link from "next/link";
import { site } from "@/app/_content/site";
import SignatureLogo from "@/app/_ui/SignatureLogo";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 mx-3 mb-0 mt-1 shrink-0 md:mb-0 md:mt-1">
      <nav
        className="nav-surface flex h-24 items-center shadow-none max-sm:justify-between max-sm:px-3 md:h-[5.5rem]"
        aria-label="Ana menü"
      >
        <div className="flex w-16 flex-none items-center justify-center self-center sm:w-24 sm:mx-6">
          <div className="max-sm:hidden animate-fadeInDown space-y-2">
            <div className="h-4 w-2/4 rounded bg-gradient-to-r from-blue-400" />
            <div className="h-4 rounded bg-gradient-to-tl from-indigo-400 via-green-300 to-pink-400" />
            <div className="h-4 w-5/6 rounded bg-gradient-to-tr from-yellow-400" />
          </div>
          <div className="hidden max-sm:flex h-12 w-12 items-center justify-center premium-logo-float nav-logo-emphasis">
            <SignatureLogo
              gradientId="nav-signature-gradient"
              className="h-11 w-11 translate-x-[1px] opacity-100"
              loopDraw
            />
          </div>
        </div>

        <div className="mr-3 flex flex-auto animate-pulse items-center justify-center space-x-2 max-lg:hidden">
          <div className="h-8 w-8 rounded-full bg-pink-400" />
          <div className="h-8 w-8 rounded-md bg-blue-400" />
          <div className="h-8 w-8 rounded-full bg-red-400" />
        </div>

        <div className="flex flex-grow items-center justify-center self-center max-sm:flex-1">
          <Link
            href="/"
            className="brand-link flex items-center transition duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02]"
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

        <div className="flex w-16 flex-none items-center justify-center self-center sm:w-24 sm:mx-6">
          <div className="hidden max-sm:flex h-12 w-12 items-center justify-center premium-logo-float nav-logo-emphasis">
            <SignatureLogo
              gradientId="nav-signature-gradient-right"
              className="h-11 w-11 translate-x-[1px] opacity-100"
              loopDraw
            />
          </div>
          <div className="flex w-24 flex-none animate-fadeInDown items-center self-center max-sm:hidden">
          <div className="rotate-180 space-y-2">
            <div className="h-4 w-2/4 rounded bg-gradient-to-tr from-yellow-400" />
            <div className="h-4 rounded bg-gradient-to-l from-blue-400 via-red-300 to-green-400" />
            <div className="h-4 w-5/6 rounded bg-gradient-to-tr from-indigo-400" />
          </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
