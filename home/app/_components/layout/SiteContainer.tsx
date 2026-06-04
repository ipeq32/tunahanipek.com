import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SiteContainerProps<T extends ElementType = "div"> = {
  children: ReactNode;
  className?: string;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Navbar, footer ve sayfa bölümleri — blog ile aynı genişlik (container, max 1280px).
 */
export function SiteContainer<T extends ElementType = "div">({
  children,
  className,
  as,
  ...props
}: SiteContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const classes = className ? `container ${className}` : "container";
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
