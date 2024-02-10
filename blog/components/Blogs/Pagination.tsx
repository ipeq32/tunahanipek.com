import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  requestsPerPage: number;
  totalRequests: number;
  paginate: (number: number) => void;
  currentPage: number;
};

const Pagination = ({
  requestsPerPage,
  totalRequests,
  paginate,
  currentPage,
}: Props) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalRequests / requestsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginateBack = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  const paginateBackFirst = () => {
    if (currentPage > 1) {
      paginate(1);
    }
  };

  const paginateFront = () => {
    if (currentPage < pageNumbers.length) {
      paginate(currentPage + 1);
    }
  };

  const paginateFrontLast = () => {
    if (currentPage < pageNumbers.length) {
      paginate(pageNumbers.length);
    }
  };


  // if (pageNumbers.length > 5) {
  //   if (currentPage === 1) {
  //     pageNumbers.splice(3, pageNumbers.length - 3);
  //   } else if (currentPage === 2) {
  //     pageNumbers.splice(4, pageNumbers.length - 4);
  //   } else if (currentPage === pageNumbers.length) {
  //     pageNumbers.splice(2, pageNumbers.length - 2);
  //   } else if (currentPage === pageNumbers.length - 1) {
  //     pageNumbers.splice(1, pageNumbers.length - 1);
  //   } else {
  //     pageNumbers.splice(1, pageNumbers.length - 1);
  //     pageNumbers.splice(4, pageNumbers.length - 4);
  //   }
  // }

  return (//TODO: responsive design for pagination buttons on mobile devices
    <article className='flex flex-col justify-center items-center gap-3 w-full py-2'>
      <header className="flex items-center justify-center w-full">
        <p className='text-sm text-gray-700'>
          Showing&nbsp;
          <span className='font-medium'>
            {currentPage * requestsPerPage - requestsPerPage + 1}&nbsp;
          </span>
          to&nbsp;
          <span className='font-medium'>
            {totalRequests < currentPage * requestsPerPage ? totalRequests : currentPage * requestsPerPage}&nbsp;
          </span>
          of&nbsp;
          <span className='font-medium'>
            {totalRequests}&nbsp;
          </span>
          results
        </p>
      </header>
      <nav className='flex justify-center items-center flex-row gap-4'>
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => {
              paginateBackFirst();
            }}
            disabled={pageNumbers.length === 1 || currentPage === 1 ? true : false}
            className={`relative inline-flex items-center px-2 py-1 disabled:cursor-not-allowed rounded-l-xl border border-slate-400 bg-indigo-800 text-sm font-medium text-gray-500 hover:bg-gray-300`}
          >
            <ChevronFirst />
          </button>
          <button
            onClick={() => {
              paginateBack();
            }}
            disabled={pageNumbers.length === 1 || currentPage === 1 ? true : false}
            className={`relative inline-flex items-center px-2 py-1 disabled:cursor-not-allowed rounded-xl border border-slate-400 bg-indigo-800 text-sm font-medium text-gray-500 hover:bg-gray-300`}
          >
            <ChevronLeft />
          </button>
        </div>
        <ul className='flex pl-0 list-none flex-wrap'>
          <li className="flex justify-center items-center gap-2">
            {pageNumbers.map((number, index) => (
              <button
                onClick={() => {
                  paginate(number);
                }}
                key={index}
                className={
                  currentPage === number
                    ? "bg-blue-600 border-red-300 text-red-500 hover:bg-blue-200 relative inline-flex items-center px-4 py-2 border font-medium rounded-xl"
                    : "bg-indigo-800 border-slate-400 text-gray-500 hover:bg-blue-200 relative inline-flex items-center px-4 py-2 border font-medium rounded-xl"
                }
              >
                {number}
              </button>
            ))}
          </li>
        </ul>
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => {
              paginateFront();
            }}
            disabled={(currentPage === pageNumbers.length || pageNumbers.length === 1) ? true : false}
            className='relative inline-flex items-center px-2 py-1 disabled:cursor-not-allowed rounded-xl border border-slate-400 bg-indigo-800 text-sm font-medium text-gray-500 hover:bg-gray-300'
          >
            <ChevronRight />
          </button>
          <button
            onClick={() => {
              paginateFrontLast();
            }}
            disabled={(currentPage === pageNumbers.length || pageNumbers.length === 1) ? true : false}
            className='relative inline-flex items-center px-2 py-1 disabled:cursor-not-allowed rounded-r-xl border border-slate-400 bg-indigo-800 text-sm font-medium text-gray-500 hover:bg-gray-300'
          >
            <ChevronLast />
          </button>
        </div>
      </nav>
    </article>
  )
};

export default Pagination;