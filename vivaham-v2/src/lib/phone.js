// Mobile numbers: one format everywhere, with country code (+919876543210)
import { h } from './ui.js';

export const COUNTRIES = [['+91', '🇮🇳 +91'], ['+1', '🇺🇸 +1'], ['+44', '🇬🇧 +44'], ['+49', '🇩🇪 +49'], ['+971', '🇦🇪 +971'],
  ['+65', '🇸🇬 +65'], ['+61', '🇦🇺 +61'], ['+966', '🇸🇦 +966'], ['+974', '🇶🇦 +974'], ['+60', '🇲🇾 +60']];

// "98765 43210" + "+91" -> "+919876543210". A number typed with its own "+" or "00" keeps its country code.
// Returns null when the number cannot be right.
export function toE164(cc, raw) {
  const s = String(raw || '').trim();
  let d = s.replace(/\D/g, '');
  let out;
  if (s.startsWith('+')) out = '+' + d;
  else if (s.startsWith('00')) out = '+' + d.slice(2);
  else {
    d = d.replace(/^0+/, '');
    if (cc === '+91' && d.length === 12 && d.startsWith('91')) d = d.slice(2);
    out = cc + d;
  }
  const n = out.slice(1);
  const good = n.startsWith('91') ? /^91[6-9]\d{9}$/.test(n) : /^[1-9]\d{7,14}$/.test(n);
  return good ? out : null;
}

export function prettyPhone(p) {
  const d = String(p || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return d ? '+' + d : '';
}

// country code + number side by side. get() gives the full number, or null if it is not valid.
export function phoneInput({ cc = '+91', value = '', placeholder = '98765 43210', oninput, name } = {}) {
  const sel = h('select', { class: 'inp cc', 'aria-label': 'Country code', onchange: () => oninput && oninput() },
    ...COUNTRIES.map(([v, l]) => h('option', { value: v, selected: v === cc }, l)));
  const inp = h('input', { class: 'inp', type: 'tel', inputMode: 'tel', autocomplete: 'tel-national', name, placeholder, value, oninput: () => oninput && oninput() });
  return {
    el: h('div', { class: 'row phone' }, sel, inp), sel, inp,
    raw: () => inp.value.trim(),
    get: () => toE164(sel.value, inp.value),
    set: (full) => {
      const hit = COUNTRIES.map(([v]) => v).sort((a, b) => b.length - a.length).find((v) => String(full).startsWith(v));
      if (hit) { sel.value = hit; inp.value = String(full).slice(hit.length); } else inp.value = full || '';
    },
  };
}

// Phone's own contact list (works in Chrome on Android). Gives [{ name, phone }] or [] when not possible.
export const canPickContacts = () => typeof navigator !== 'undefined' && !!navigator.contacts?.select;
export async function pickContacts() {
  if (!canPickContacts()) return [];
  try {
    const list = await navigator.contacts.select(['name', 'tel'], { multiple: true });
    return list.map((c) => ({ name: (c.name?.[0] || '').trim(), phone: (c.tel?.[0] || '').trim() })).filter((c) => c.phone);
  } catch { return []; }
}

export const inviteText = (wedding, phone, from) =>
  `🙏 ${from ? from + ' invited you' : 'You are invited'} to plan the wedding "${wedding}" together on Vivaham.\n\n1. Open ${location.origin}\n2. Log in with this mobile number: ${prettyPhone(phone)}\n\nYou are inside straight away. No password needed.`;
