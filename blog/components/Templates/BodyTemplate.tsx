import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

const BodyTemplate = ({ children }: Props) => {
  return (
    <article className='flex justify-center items-center w-full max-2xl:px-10 max-mobile-lg:px-3'>
      <div className="flex flex-col justify-center items-center max-w-screen-xl w-full gap-5 mt-20">
        {children}
      </div>
    </article>
  )
};

export default BodyTemplate;