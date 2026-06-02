const OFFICE_TIME_ZONE = 'Europe/Istanbul';

function getIstanbulHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: OFFICE_TIME_ZONE,
    }).format(now)
  );
}

function getIstanbulWeekday(now: Date): string {
  return now.toLocaleDateString('tr', {
    weekday: 'long',
    timeZone: OFFICE_TIME_ZONE,
  });
}

export function getOfficeOpen(now = new Date()): boolean {
  const day = getIstanbulWeekday(now);
  const hour = getIstanbulHour(now);
  const isWeekday = day !== 'Saturday' && day !== 'Sunday';

  return !((isWeekday && hour < 8) || hour > 18);
}

export function getOfficeHoursSnapshot(now = new Date()) {
  return {
    isOpen: getOfficeOpen(now),
    currentDay: getIstanbulWeekday(now),
  };
}

export type OfficeHoursSnapshot = ReturnType<typeof getOfficeHoursSnapshot>;
