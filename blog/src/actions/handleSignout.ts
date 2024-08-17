'use server';

import { signOut } from '@/auth';

export default async function handleSignout() {
  try {
    await signOut();
  } catch (error) {
    console.error('Error: ', error);
  }
}
