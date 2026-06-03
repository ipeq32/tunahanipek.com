export function isPublicRegistrationEnabled(): boolean {
  if (process.env.ALLOW_PUBLIC_REGISTRATION === 'false') {
    return false;
  }
  if (process.env.NEXT_PUBLIC_ALLOW_PUBLIC_REGISTRATION === 'false') {
    return false;
  }
  return true;
}
