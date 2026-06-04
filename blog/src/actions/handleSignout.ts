'use server';

import { signOut } from '@/auth';
import { logger } from '@/lib/logger';

export default async function handleSignout() {
  try {
    await signOut({
      redirect: false,
    });
  } catch (error) {
    logger.error('Sign out failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
