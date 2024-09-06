'use client';

import { motion } from 'framer-motion';
import FormPage from './form';

export default function RegisterPage() {
  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center justify-start gap-2">
      <motion.h1
        animate={{ y: 0 }}
        initial={{ y: -100 }}
        transition={{
          ease: 'circInOut',
          duration: 2,
          y: { duration: 1 },
        }}
        className="sticky top-0 text-4xl font-bold text-black dark:text-white mt-5 backdrop-blur-md max-md:w-full max-md:text-center"
      >
        Register
      </motion.h1>
      <div className="w-[600px] max-md:w-full md:max-h-[calc(100vh-300px)] h-svh overflow-auto">
        <FormPage />
      </div>
    </section>
  );
}
