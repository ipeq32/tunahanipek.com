import FormPage from './_components/form';
import HeaderComponent from './_components/header';

export default async function RegisterPage() {
  return (
    <section className="space-y-6">
      <HeaderComponent />
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        <FormPage />
      </div>
    </section>
  );
}
