export type OAuthProviderId = 'google' | 'github' | 'linkedin';

export type EnabledOAuthProviders = Record<OAuthProviderId, boolean>;

export function getEnabledOAuthProviders(): EnabledOAuthProviders {
  return {
    google: Boolean(
      process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ),
    github: Boolean(
      process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ),
    linkedin: Boolean(
      process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET
    ),
  };
}

export function hasAnyOAuthProvider(providers: EnabledOAuthProviders) {
  return Object.values(providers).some(Boolean);
}
