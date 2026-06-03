import FormPage from './_components/form';
import HeaderComponent from './_components/header';

export default async function RegisterPage() {
  return (
    <section className="space-y-8">
      <HeaderComponent />
      <FormPage />
    </section>
  );
}
