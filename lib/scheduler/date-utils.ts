export function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = normalizeDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(_date: Date) {
  // Prepared for a Swedish holiday calendar in a later version.
  return false;
}

export function isTeachingDay(date: Date, teachingDays: number[]) {
  return teachingDays.includes(date.getDay()) && !isWeekend(date) && !isHoliday(date);
}

export function nextTeachingDay(date: Date, teachingDays: number[]) {
  let cursor = normalizeDate(date);
  while (!isTeachingDay(cursor, teachingDays)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parseTeachingDays(value: string) {
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
}
