// Game dates are calendar dates (YYYY-MM-DD) stored as DateTime at UTC midnight.
// Formatting/parsing must always use UTC to avoid the stored day shifting in
// local timezones west of UTC.

export function formatGameDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    ...options,
    timeZone: 'UTC',
  });
}

export function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
