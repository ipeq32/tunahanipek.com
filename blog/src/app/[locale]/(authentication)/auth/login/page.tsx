import LoginForm from './_components/form';
import HeaderComponent from './_components/header';

export default async function LoginPage() {
  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center md:justify-center">
      <HeaderComponent />
      <div className="w-[600px] max-md:w-full">
        <LoginForm />
      </div>
    </section>
  );
}
