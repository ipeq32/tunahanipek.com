import { cn } from '@/lib/utils';

type RichContentViewProps = {
  html: string;
  className?: string;
};

/** Blog ve proje detay sayfalarında ortak zengin metin görünümü. */
export default function RichContentView({
  html,
  className,
}: RichContentViewProps) {
  return (
    <div
      className={cn('prose-blog min-w-0 max-w-full', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
