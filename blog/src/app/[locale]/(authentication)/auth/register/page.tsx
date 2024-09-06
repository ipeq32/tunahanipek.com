import FormPage from './form';

export default async function RegisterPage() {
  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center justify-start">
      <h1 className="text-4xl font-bold text-black dark:text-white mt-5">
        Register
      </h1>
      <div className="w-[600px] max-md:w-full">
        <FormPage />
      </div>
    </section>
  );
}
