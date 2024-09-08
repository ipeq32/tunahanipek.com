'use server';

import { signOut } from '@/auth';

export default async function handleSignout() {
  try {
    await signOut({
      redirect: false,
    });
  } catch (error) {
    console.error('Error: ', error);
  }
}
