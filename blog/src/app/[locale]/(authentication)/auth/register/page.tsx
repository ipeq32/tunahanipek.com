import FormPage from './_components/form';
import HeaderComponent from './_components/header';

export default async function RegisterPage() {
  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center justify-start gap-2">
      <HeaderComponent />
      <div className="w-[600px] max-md:w-full md:max-h-[calc(100vh-300px)] h-svh overflow-auto">
        <FormPage />
      </div>
    </section>
  );
}
