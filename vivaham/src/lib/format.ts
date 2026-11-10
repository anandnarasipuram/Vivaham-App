export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function parseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayIso() {
  return isoDate(new Date());
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

export function shortDate(iso: string) {
  const date = parseDate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function dayDate(iso: string) {
  const date = parseDate(iso);
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function fullDate(iso: string) {
  const date = parseDate(iso);
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((parseDate(toIso).getTime() - parseDate(fromIso).getTime()) / 86400000);
}

export function shortTime(time: string | null) {
  return time ? time.slice(0, 5) : '';
}

export function timeLabel(time: string | null) {
  if (!time) {
    return '';
  }
  const [hours, minutes] = time.split(':').map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

export function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

export function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function rupees(amount: number) {
  const rounded = Number.isFinite(amount) ? Math.round(amount) : 0;
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded).toString();
  if (digits.length <= 3) {
    return `${sign}₹${digits}`;
  }
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${sign}₹${rest},${lastThree}`;
}

export function parseAmount(text: string) {
  const value = Number(text.replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

export function weddingTag(name: string) {
  const base = name.replace(/\s*wedding$/i, '').replace(/[’']s$/i, '').trim();
  return `ॐ · ${base ? `${base.toUpperCase()}’S ` : ''}VIVAHAM`;
}

export function countdown(iso: string, now: Date = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((parseDate(iso).getTime() - today.getTime()) / 86400000);
  if (days > 1) {
    return { value: String(days), caption: 'days to go' };
  }
  if (days === 1) {
    return { value: '1', caption: 'day to go' };
  }
  if (days === 0) {
    return { value: '0', caption: 'Today is the big day!' };
  }
  return { value: String(Math.abs(days)), caption: 'days since the wedding' };
}

export function toDbTime(hour12: number, minute: number, pm: boolean) {
  const hours = (hour12 % 12) + (pm ? 12 : 0);
  return `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}
