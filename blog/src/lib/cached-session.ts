import { cache } from 'react';

import { auth } from '@/auth';

/** Request başına tek session çözümlemesi (layout, footer, sayfa dedupe). */
export const getSession = cache(auth);
