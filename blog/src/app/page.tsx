import { redirect } from '@/navigation';
import { defaultLocale } from '@/config';

export default function RootPage() {
  redirect({ href: '/', locale: defaultLocale });
}
