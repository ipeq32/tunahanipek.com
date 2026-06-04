type PageLoadingProps = {
  ariaLabel: string;
};

export function PageLoading({ ariaLabel }: PageLoadingProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-600 dark:border-t-teal-400"
        role="status"
        aria-label={ariaLabel}
      />
    </div>
  );
}
