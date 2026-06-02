import { redirect } from '@/navigation';
import { defaultLocale } from '@/config';

// This page only renders when the app is built statically (output: 'export')
export default function RootPage() {
  redirect({ href: '/', locale: defaultLocale });
}
