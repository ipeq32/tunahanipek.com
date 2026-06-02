import LoginForm from './_components/form';
import HeaderComponent from './_components/header';

export default async function LoginPage() {
  return (
    <section className="space-y-6">
      <HeaderComponent />
      <LoginForm />
    </section>
  );
}
