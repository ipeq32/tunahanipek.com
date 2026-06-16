export const PRIMARY_SUPER_ADMIN_EMAIL =
  process.env.PRIMARY_SUPER_ADMIN_EMAIL ?? 'tnhnipek@gmail.com';

export function isPrimarySuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL.toLowerCase();
}
