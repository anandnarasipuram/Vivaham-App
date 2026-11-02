export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function weekday(iso: string) {
  return DAYS[parseDate(iso).getDay()];
}

export function monthShort(iso: string) {
  return MONTHS[parseDate(iso).getMonth()].toUpperCase();
}

export function dayOfMonth(iso: string) {
  return parseDate(iso).getDate();
}

export function fullDate(iso: string) {
  const date = parseDate(iso);
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function shortTime(time: string | null) {
  return time ? time.slice(0, 5) : '';
}

export function rupees(amount: number) {
  const digits = Math.round(amount).toString();
  if (digits.length <= 3) {
    return `₹${digits}`;
  }
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${lastThree}`;
}
