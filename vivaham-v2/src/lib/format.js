const inr = new Intl.NumberFormat('en-IN');
export const money = (n) => '₹' + inr.format(Math.round(Number(n) || 0));
export const todayStr = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
export const parseDate = (s) => (s ? new Date(s + 'T00:00:00') : null);
export const fmtDate = (s) => (s ? parseDate(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const fmtShort = (s) => (s ? parseDate(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');
export const fmtTime = (s) => {
  if (!s) return '';
  const [h, m] = s.split(':'); const hh = Number(h);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
};
export const hhmm = (s) => (s ? s.slice(0, 5) : '');
export const daysUntil = (s) => (s ? Math.round((parseDate(s) - parseDate(todayStr())) / 864e5) : null);
export const plates = (guests) => Math.ceil(((Number(guests) || 0) * 11) / 10); // guests x 1.1, no float error
export const mapsUrl = (a) => (!a ? '' : /^https?:\/\//i.test(a) ? a : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a));
export const digits = (p) => String(p || '').replace(/[^\d]/g, '');
export const telUrl = (p) => 'tel:' + String(p || '').replace(/[^\d+]/g, '');
export const waUrl = (p, text) => { let d = digits(p); if (d.length === 10) d = '91' + d; return `https://wa.me/${d}${text ? '?text=' + encodeURIComponent(text) : ''}`; };
export const waShare = (text) => 'https://wa.me/?text=' + encodeURIComponent(text);
