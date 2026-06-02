import { cn } from '@/lib/utils';
import type { ElementType, ReactNode } from 'react';

type SiteContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/**
 * Navbar, HeaderTemplate ve sayfa içeriği ile aynı genişlik.
 * tailwind.config: container → center, padding 1rem, 2xl max-width 1280px
 */
export function SiteContainer({
  children,
  className,
  as: Component = 'div',
}: SiteContainerProps) {
  return <Component className={cn('container', className)}>{children}</Component>;
}
