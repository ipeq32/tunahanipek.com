import LinkedIn from 'next-auth/providers/linkedin';

export function createLinkedInProvider() {
  return LinkedIn({
    clientId: process.env.AUTH_LINKEDIN_ID,
    clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    allowDangerousEmailAccountLinking: true,
    client: { token_endpoint_auth_method: 'client_secret_post' },
    issuer: 'https://www.linkedin.com',
    authorization: {
      url: 'https://www.linkedin.com/oauth/v2/authorization',
      params: { scope: 'openid profile email' },
    },
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
    userinfo: 'https://api.linkedin.com/v2/userinfo',
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      } as const;
    },
  });
}
