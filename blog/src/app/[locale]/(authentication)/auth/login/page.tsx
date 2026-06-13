import LoginForm from './_components/form';
import HeaderComponent from './_components/header';
import { GoogleOneTap } from '@/components/auth/google-one-tap';
import {
  getEnabledOAuthProviders,
  hasAnyOAuthProvider,
} from '@/lib/oauth/config';

export default async function LoginPage() {
  const enabledProviders = getEnabledOAuthProviders();

  return (
    <section className="space-y-6">
      <GoogleOneTap />
      <HeaderComponent />
      <LoginForm
        enabledProviders={enabledProviders}
        showOAuth={hasAnyOAuthProvider(enabledProviders)}
      />
    </section>
  );
}
