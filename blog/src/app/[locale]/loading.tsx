import { PageLoading } from '@/components/layout/page-loading';
import { DidYouKnow } from '@/components/ui/did-you-know';

export default function Loading() {
  return (
    <main className="mesh-background flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <PageLoading />
      <DidYouKnow variant="inline" className="max-w-md px-4 text-center" />
    </main>
  );
}
