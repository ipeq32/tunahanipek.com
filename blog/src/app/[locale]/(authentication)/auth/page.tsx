import { redirect } from '@/navigation';

// This page only renders when the app is built statically (output: 'export')
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/auth/login', locale });
}
