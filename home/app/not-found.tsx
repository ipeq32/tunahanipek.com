import Link from "next/link";
import React from "react";

type Props = {};

const NotFound = (props: Props) => {
  return (
    <main className="flex justify-center items-center w-full min-h-[calc(100vh-150px)] max-sm:-mt-20">
      <div className="flex items-center justify-center w-full h-full mt-20">
        <div className="flex items-center justify-center w-4/5 h-[75%] max-lg:h-[60%] m-auto">
          <div className="overflow-hidden rounded-lg shadow shadow-slate-700 bg-slate-950/40">
            <div className="flex flex-col items-center justify-center h-max">
              <h1 className="font-bold leading-relaxed text-purple-500 text-9xl max-sm:text-8xl">404</h1>
              <h1 className="-mt-10 text-6xl text-center font-medium max-lg:text-5xl text-slate-500 max-md:text-4xl max-sm:text-2xl">oops! Page not found</h1>
              <p className="px-12 text-2xl font-medium text-slate-700 max-md:text-lg max-sm:px-5 max-sm:text-center">Oops! The page you are looking for does not exist. It might have been moved or deleted.</p>
              <div className="flex flex-row items-center justify-around my-10">
                <Link href={'/'} className="px-6 py-3 mr-6 font-semibold text-white rounded-md bg-gradient-to-r from-purple-400 to-blue-500 hover:from-pink-500 hover:to-orange-500">
                  HOME
                </Link>
                <Link href={'https://blog.tunahanipek.com/contact'} className="px-6 py-3 font-semibold text-white rounded-md bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-500">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
};

export default NotFound;