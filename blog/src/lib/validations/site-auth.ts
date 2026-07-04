import { z } from 'zod';

export const siteAuthCredentialsSchema = z.object({
  username: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
});

export type SiteAuthCredentials = z.infer<typeof siteAuthCredentialsSchema>;

export function hasSiteAuthCredentials(
  credentials?: SiteAuthCredentials | null,
): credentials is SiteAuthCredentials {
  return Boolean(credentials?.username?.trim() && credentials?.password);
}
