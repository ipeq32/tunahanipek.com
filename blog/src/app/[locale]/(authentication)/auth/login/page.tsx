'use client';

import { motion } from 'framer-motion';
import LoginForm from './form';

export default function LoginPage() {
  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center md:justify-center">
      <motion.h1
        animate={{ y: 0 }}
        initial={{ y: -100 }}
        transition={{
          ease: 'circInOut',
          duration: 2,
          y: { duration: 1 },
        }}
        className="text-4xl font-bold text-black dark:text-white mt-5"
      >
        Login
      </motion.h1>
      <div className="w-[600px] max-md:w-full">
        <LoginForm />
      </div>
    </section>
  );
}
