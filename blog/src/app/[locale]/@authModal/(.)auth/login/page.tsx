import LoginModalClient from './LoginModalClient';
import {
  getEnabledOAuthProviders,
  hasAnyOAuthProvider,
} from '@/lib/oauth/config';

export default function LoginModalPage() {
  const enabledProviders = getEnabledOAuthProviders();

  return (
    <LoginModalClient
      enabledProviders={enabledProviders}
      showOAuth={hasAnyOAuthProvider(enabledProviders)}
    />
  );
}
