const COMMENT_DATE_TIME_ZONE = 'Europe/Istanbul';

export function formatCommentDate(date: Date | string, locale: string): string {
  const value = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: COMMENT_DATE_TIME_ZONE,
  }).format(value);
}
