import LoadingSkeleton from "@components/Loading/Skeleton";

type Props = {};

const loading = ({ }: Props) => {

  return (
    <main className="relative flex flex-col w-full min-h-screen">
      <section className="flex flex-row justify-around items-center bg-fuchsia-950/10 w-full h-80 max-lg:px-10 max-lg:gap-5 max-sm:h-64">
        <header className="flex flex-col justify-center max-w-xs items-center gap-5 max-lg:items-start max-sm:gap-0">
          <h1 className="text-5xl max-md:text-3xl">
            <LoadingSkeleton width={100} height={40} />
          </h1>
          <div className="text-lg max-md:text-sm max-sm:text-xs line-clamp-4">
            <LoadingSkeleton width={250} height={20} />
          </div>
        </header>
        <figure className="flex justify-center items-center max-md:hidden">
          <LoadingSkeleton width={250} height={250} />
        </figure>
      </section>
      <article className='flex justify-center items-center w-full max-2xl:px-10 max-mobile-lg:px-3'>
        <div className="flex flex-row-reverse max-w-screen-xl w-full gap-5 mt-20 max-md:flex-col">
          <aside className="flex flex-col gap-20 w-96 h-max px-4 py-10 rounded-md max-md:hidden">
            <section className="flex flex-col items-center w-full gap-5">
              <header className="flex flex-col gap-3 w-full">
                <LoadingSkeleton width={150} height={20} />
              </header>
              <div className="relative group/search flex justify-center items-center w-full">
                <LoadingSkeleton width={250} height={40} />
              </div>
            </section>
            <section className="relative flex flex-col items-center w-full gap-5 max-h-64">
              <header className="flex flex-col gap-3 w-full sticky top-0 z-[11] bg-primary">
                <LoadingSkeleton width={150} height={20} />
              </header>
              <ul className="flex flex-col gap-2 w-full">
                {Array(4).fill(null).map((_, index) => (
                  <li key={index} className="relative flex items-center w-full cursor-pointer p-1">
                    <span className="text-slate-300 block z-10">
                      <LoadingSkeleton width={250} height={20} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col items-center w-full gap-5 max-h-96">
              <header className="flex flex-col gap-3 w-full sticky top-0 z-[11] bg-primary">
                <LoadingSkeleton width={150} height={20} />
              </header>
              <ul className="flex flex-col gap-2 w-full">
                {Array(5).fill(null).map((_, index) => (
                  <li key={index} className="flex items-center w-full cursor-pointer p-1 gap-2 rounded-md">
                    <header className="flex flex-col items-start gap-1 w-full">
                      <h3 className="text-slate-300 text-sm line-clamp-2">
                        <LoadingSkeleton width={100} height={20} />
                      </h3>
                      <span className="text-slate-400 text-xs">
                        <LoadingSkeleton width={250} height={20} />
                      </span>
                    </header>
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col items-center w-full gap-5 max-h-40">
              <header className="flex flex-col gap-3 w-full sticky top-0 z-[11]">
                <LoadingSkeleton width={150} height={20} />
              </header>
              <ul className="flex flex-wrap gap-2 w-full">
                {Array(5).fill(null).map((_, index) => (
                  <li key={index} className="flex justify-center items-center cursor-pointer p-1 gap-2 rounded-md">
                    <span className="text-slate-300 text-sm">
                      <LoadingSkeleton width={100} height={20} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside >
          <div className="grid grid-cols-2 w-full gap-5 h-max max-lg:grid-cols-1">
            {Array(6).fill(null).map((_, index) => (
              <LoadingSkeleton key={index} height={500} />
            ))}
            <div className="col-span-2 max-lg:col-span-1">
              <article className='flex flex-col justify-center items-center gap-3 w-full py-2'>
                <header className="flex items-center justify-center w-full">
                  <LoadingSkeleton width={100} height={10} />
                </header>
                <nav className='flex justify-center items-center flex-row gap-4'>
                  <LoadingSkeleton width={250} height={30} />
                </nav>
              </article>
            </div>
          </div>
        </div>
      </article>
    </main>
  )
};

export default loading;