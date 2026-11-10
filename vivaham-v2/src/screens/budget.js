import { sb, must } from '../lib/supabase.js';
import { S, wid, canEdit } from '../lib/store.js';
import { h, openForm, fail, toast, confirmBox, clear } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { money, fmtDate, todayStr } from '../lib/format.js';
import { eventOpts, memberOpts, nul, uploadFile, signed, removeFiles, pickImages } from '../lib/api.js';

const CATS = ['Shopping', 'Stays', 'Food', 'Transport', 'Vendors', 'Other'];
const METHODS = [{ v: 'cash', l: 'Cash' }, { v: 'upi', l: 'UPI' }, { v: 'card', l: 'Card' }, { v: 'bank', l: 'Bank transfer' }];
let tab = 'pay';

export async function render(_p, refresh) {
  if (!canEdit()) { location.hash = '#/home'; return; }
  const [sum, pays, books] = await Promise.all([
    must(sb.rpc('budget_summary', { p_wedding: wid() })),
    must(sb.from('payments').select('*').eq('wedding_id', wid()).order('paid_on', { ascending: false }).order('created_at', { ascending: false })),
    must(sb.from('v_bookings').select('*').eq('wedding_id', wid())),
  ]);
  const due = books.filter((b) => Number(b.total) - Number(b.paid) > 0).sort((a, b) => (b.total - b.paid) - (a.total - a.paid));

  const editTotal = () => openForm({ title: 'Total budget', values: { v: sum.total_budget || null },
    fields: [{ k: 'v', label: 'Total budget (₹)', type: 'number', req: true }],
    onSave: async (x) => { await must(sb.from('budget_settings').upsert({ wedding_id: wid(), total_budget: x.v })); refresh(); } });

  const payForm = (pay, preset = {}) => {
    const v = pay ? { ...pay, part: pay.total_price != null } : { title: '', category: 'Other', amount: null, paid_on: todayStr(), method: 'upi', paid_by: S.wedding.member_id, event_id: '', part: false, ...preset };
    const booking = pay?.origin === 'booking';
    openForm({
      title: pay ? 'Payment' : 'Add payment', values: v, saveLabel: booking ? 'Close' : 'Save',
      fields: booking ? [{ k: '_i', type: 'node', render: () => h('p', { class: 'mute' }, t('This came from a price block. Change it where you added the price (Shopping, Stays, Food, Transport or Vendors).')) }] : [
        { k: 'title', label: 'What was it for?', req: true },
        { k: 'category', label: 'Category', type: 'chips', opts: CATS },
        { k: 'amount', label: 'Amount paid (₹)', type: 'number', req: true },
        { k: 'part', label: 'Is this only a part / advance?', type: 'toggle', show: (x) => !x.source_type },
        { k: 'total_price', label: 'Full price (₹)', type: 'number', show: (x) => x.part && !x.source_type },
        { k: 'paid_on', label: 'Paid on', type: 'date' },
        { k: 'paid_by', label: 'Paid by', type: 'chips', opts: memberOpts() },
        { k: 'method', label: 'How', type: 'chips', opts: METHODS },
        { k: 'event_id', label: 'For which event?', type: 'chips', opts: eventOpts(t('Whole wedding')) },
        { k: 'note', label: 'Note', type: 'textarea' },
        { k: '_r', type: 'node', render: (x, redraw) => h('div', { class: 'f' }, h('div', { class: 'lbl' }, t('Receipt photo')),
            h('button', { type: 'button', class: 'btn sm ghost', onclick: async () => { const f = (await pickImages(false))[0]; if (f) { x._file = f; redraw(); } } }, '📷 ' + (x._file ? '✓ ' + x._file.name.slice(0, 18) : x.receipt_path ? t('Change photo') : t('Add photo'))),
            x.receipt_path && !x._file ? h('button', { type: 'button', class: 'link', onclick: async () => { const u = (await signed([x.receipt_path]))[x.receipt_path]; if (u) window.open(u, '_blank'); } }, t('View receipt')) : null) },
      ],
      onSave: async (x) => {
        if (booking) return;
        const row = { wedding_id: wid(), title: x.title.trim(), category: x.category, amount: x.amount, paid_on: x.paid_on || todayStr(), paid_by: nul(x.paid_by), method: x.method || 'upi', event_id: nul(x.event_id), note: nul(x.note),
          total_price: x.part && !x.source_type ? nul(x.total_price) : null, source_type: x.source_type || null, source_id: x.source_id || null, origin: 'budget' };
        if (x._file) { const old = pay?.receipt_path; row.receipt_path = await uploadFile(x._file, 'receipts'); if (old) await removeFiles([old]); }
        if (pay) await must(sb.from('payments').update(row).eq('id', pay.id)); else await must(sb.from('payments').insert(row));
        refresh();
      },
      onDelete: pay && !booking && (async () => { await must(sb.from('payments').delete().eq('id', pay.id)); await removeFiles([pay.receipt_path]); refresh(); }),
    });
  };

  const stat = (l, n, c) => h('div', { class: 'card grow', style: 'margin:0;text-align:center' }, h('div', { class: 'mute' }, t(l)), h('div', { class: 'serif', style: 'font-size:21px;' + (c ? 'color:' + c : '') }, money(n)));
  const used = sum.total_budget ? Math.min(100, ((sum.paid + sum.still_to_pay) / sum.total_budget) * 100) : 0;
  const body = h('div');
  const draw = () => {
    clear(body);
    if (tab === 'pay') body.append(...(pays.length ? pays.map((p) => h('div', { class: 'card tap row between', onclick: () => payForm(p) },
      h('div', { class: 'grow' }, h('b', null, p.title), h('div', { class: 'mute' }, [fmtDate(p.paid_on), p.category, p.paid_by && S.members.find((m) => m.id === p.paid_by)?.name].filter(Boolean).join(' · '))), h('b', null, money(p.amount)))) : [h('div', { class: 'empty' }, t('No payments yet.'))]));
    if (tab === 'due') body.append(...(due.length ? due.map((b) => h('div', { class: 'card row between' },
      h('div', { class: 'grow' }, h('b', null, b.title), h('div', { class: 'mute' }, `${b.category} · ${t('Paid')} ${money(b.paid)} / ${money(b.total)}`)),
      h('div', { style: 'text-align:right' }, h('b', { class: 'red' }, money(b.total - b.paid)), h('div', null, h('button', { class: 'btn sm gold', style: 'margin-top:6px', onclick: () => payForm(null, { title: b.title, category: b.category, amount: b.total - b.paid, event_id: b.event_id || '', source_type: b.key_type, source_id: b.key_id }) }, t('Pay')))))) : [h('div', { class: 'empty' }, t('Nothing left to pay 🎉'))]));
    if (tab === 'cat') body.append(...sum.by_category.map((c) => { const tot = c.paid + c.due; return h('div', { class: 'card' }, h('div', { class: 'row between' }, h('b', null, t(c.category)), h('span', { class: 'mute' }, `${c.count} ${t('payments')}`)),
      h('div', { class: 'bar', style: 'margin:8px 0' }, h('i', { style: `width:${tot ? (c.paid / tot) * 100 : 0}%` })),
      h('div', { class: 'row between small' }, h('span', null, t('Paid') + ' ' + money(c.paid)), h('span', { class: 'red' }, t('Still to pay') + ' ' + money(c.due)))); }));
  };
  page({ title: t('Budget'), back: '#/home', fab: { label: t('Add payment'), onclick: () => payForm(null) } },
    h('div', { class: 'card', onclick: editTotal }, h('div', { class: 'row between' }, h('span', { class: 'mute' }, t('Total budget') + ' ✎'), h('b', { class: 'serif', style: 'font-size:24px' }, money(sum.total_budget))),
      h('div', { class: 'bar', style: 'margin-top:8px' }, h('i', { style: `width:${used}%` })),
      h('div', { class: 'small mute', style: 'margin-top:6px' }, `${t('Free to spend')}: `, h('b', { class: sum.free_to_spend < 0 ? 'red' : '' }, money(sum.free_to_spend)))),
    h('div', { class: 'row', style: 'margin-bottom:14px' }, stat('Paid', sum.paid), stat('Still to pay', sum.still_to_pay, 'var(--maroon)')),
    h('div', { class: 'tabs' }, ...[['pay', 'Payments'], ['due', 'Still to pay'], ['cat', 'By category']].map(([k, l]) => h('button', { class: tab === k ? 'on' : '', onclick: (e) => { tab = k; document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('on')); e.target.classList.add('on'); draw(); } }, t(l)))),
    body);
  draw();
}
