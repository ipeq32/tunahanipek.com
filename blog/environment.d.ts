declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_DATABASE?: string;
      POSTGRES_HOST?: string;
      POSTGRES_PASSWORD?: string;
      POSTGRES_PRISMA_URL: string;
      POSTGRES_URL?: string;
      POSTGRES_URL_NON_POOLING: string;
      POSTGRES_URL_NO_SSL?: string;
      POSTGRES_USER?: string;
      DATABASE_URL?: string;
      VERCEL?: string;
      NEXTAUTH_URL: string;
      AUTH_URL?: string;
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_SITE_URL?: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_SALT?: string;
      PORT?: string;
      VERCEL_URL?: string;
      UPLOADTHING_TOKEN?: string;
      RESEND_API_KEY?: string;
      EMAIL_FROM?: string;
      ALLOW_PUBLIC_REGISTRATION?: string;
      NEXT_PUBLIC_ALLOW_PUBLIC_REGISTRATION?: string;
      AUTH_GOOGLE_ID?: string;
      AUTH_GOOGLE_SECRET?: string;
      NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
      NEXT_PUBLIC_GOOGLE_ONE_TAP_ENABLED?: string;
      AUTH_GITHUB_ID?: string;
      AUTH_GITHUB_SECRET?: string;
      AUTH_LINKEDIN_ID?: string;
      AUTH_LINKEDIN_SECRET?: string;
    }
  }
}

export {};
