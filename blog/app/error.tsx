'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex justify-center items-center w-full min-h-[calc(100vh-150px)] -mt-5 max-sm:-mt-20">
      <div className="flex items-center justify-center w-full h-full mt-20">
        <div className="flex items-center justify-center w-4/5 h-[75%] max-lg:h-[60%] m-auto">
          <div className="overflow-hidden rounded-lg shadow shadow-slate-700 bg-slate-950/40">
            <div className="flex flex-col items-center justify-center h-max">
              <h1 className="font-bold text-purple-500 text-9xl max-sm:text-6xl">{error.name}</h1>
              <h1 className="text-6xl text-center font-medium max-lg:text-5xl text-slate-500 max-md:text-4xl max-sm:text-2xl">oops! {error.message}</h1>
              <p className="px-12 text-2xl mt-3 font-medium text-slate-700 max-md:text-sm max-sm:px-5 max-sm:text-center">{error.stack}</p>
              <div className="flex flex-row items-center justify-around my-10">
                <Link href={'/'} className="px-6 py-3 mr-6 font-semibold text-white rounded-md bg-gradient-to-r from-purple-400 to-blue-500 hover:from-pink-500 hover:to-orange-500">
                  HOME
                </Link>
                <button onClick={() => reset()} className="px-6 py-3 font-semibold text-white rounded-md bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-500">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}