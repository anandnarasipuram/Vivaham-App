import { sb, must, BUCKET } from './supabase.js';
import { S, canEdit, wid } from './store.js';
import { h, clear, toast, fail } from './ui.js';
import { t } from './i18n.js';
import { money } from './format.js';

export async function loadWeddings() {
  S.weddings = (await must(sb.rpc('my_weddings'))) || [];
  const saved = localStorage.getItem('wedding');
  S.wedding = S.weddings.find((w) => w.wedding_id === saved) || S.weddings[0] || null;
  if (S.wedding) localStorage.setItem('wedding', S.wedding.wedding_id);
}
export async function loadContext() {
  if (!S.wedding) return;
  const [m, e] = await Promise.all([
    must(sb.from('members').select('*').eq('wedding_id', wid()).order('created_at')),
    must(sb.from('events').select('*').eq('wedding_id', wid()).order('event_date', { nullsFirst: false }).order('start_time', { nullsFirst: false })),
  ]);
  S.members = m; S.events = e;
  const mine = m.find((x) => x.user_id === S.user.id);
  if (mine) { S.wedding.role = mine.role; S.wedding.member_id = mine.id; }
}

// ---------- prices ----------
export async function priceMap(type) {
  if (!canEdit()) return {};
  const rows = await must(sb.from('prices').select('source_id,price,payment_status').eq('wedding_id', wid()).eq('source_type', type));
  return Object.fromEntries(rows.map((r) => [r.source_id, r]));
}
export async function priceValues(type, id) {
  if (!canEdit() || !id) return {};
  const p = (await must(sb.from('prices').select('price').eq('source_type', type).eq('source_id', id))) [0];
  if (!p) return { mode: 'no' };
  const pays = await must(sb.from('payments').select('amount,paid_by,method,paid_on').eq('source_type', type).eq('source_id', id).eq('origin', 'booking').order('created_at'));
  const sum = pays.reduce((a, x) => a + Number(x.amount), 0);
  const first = pays[0] || {};
  const mode = sum === 0 ? 'no' : sum >= Number(p.price) ? 'full' : 'adv';
  return { _hadPrice: true, price: Number(p.price), mode, advance: mode === 'adv' ? sum : null, paid_by: first.paid_by || null, method: first.method || 'upi', paid_on: first.paid_on };
}
export async function applyPrice(type, id, v) {
  if (!canEdit()) return;
  if (v.price == null && !v._hadPrice) return;
  const price = v.price == null ? null : Number(v.price);
  await must(sb.rpc('save_price', { p_type: type, p_id: id, p_price: price, p_mode: price == null ? 'no' : v.mode || 'no', p_advance: v.advance ?? null, p_paid_by: v.paid_by || null, p_method: v.method || 'upi', p_paid_on: v.paid_on || null }));
}
export const payBadge = (s) => h('span', { class: 'badge b-' + s }, t({ paid: 'Paid', advance: 'Advance', not_paid: 'Not paid' }[s]));
export const priceTag = (p) => (p ? h('span', { class: 'small' }, money(p.price), ' ', payBadge(p.payment_status)) : null);

// ---------- photos ----------
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const sc = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
    return blob || file;
  } catch { return file; }
}
export async function uploadFile(file, folder) {
  const blob = await shrink(file);
  const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${wid()}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
export async function signed(paths) {
  if (!paths.length) return {};
  const { data } = await sb.storage.from(BUCKET).createSignedUrls(paths, 3600);
  return Object.fromEntries((data || []).map((d) => [d.path, d.signedUrl]));
}
export async function removeFiles(paths) {
  const p = paths.filter(Boolean);
  if (p.length) await sb.storage.from(BUCKET).remove(p);
}
// file picker -> File[]
export function pickImages(multiple = true) {
  return new Promise((res) => {
    const i = h('input', { type: 'file', accept: 'image/*', multiple, style: 'display:none', onchange: () => res([...i.files]) });
    document.body.append(i); i.click(); setTimeout(() => i.remove(), 60000);
  });
}

// ---------- misc ----------
export const eventOpts = (general = null) => [...(general ? [{ v: '', l: general }] : []), ...S.events.map((e) => ({ v: e.id, l: e.type }))];
export const memberOpts = () => S.members.map((m) => ({ v: m.id, l: m.name }));
export const nul = (x) => (x === '' || x === undefined ? null : x);
