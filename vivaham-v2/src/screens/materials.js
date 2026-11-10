import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm, fail } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { eventOpts, nul } from '../lib/api.js';

const SUG = ['Marigold garlands', 'Mango leaf thoranam', 'Banana plants', 'Betel leaves & nuts', 'Coconuts', 'Turmeric & kumkum', 'Flowers', 'Camphor & incense', 'Rice & akshintalu', 'Ghee & oil lamps', 'Pooja plates', 'Rangoli colours'];

export async function render(_p, refresh) {
  const rows = await must(sb.from('materials').select('*').eq('wedding_id', wid()).order('created_at'));
  const form = (m) => openForm({
    title: m ? 'Edit material' : 'Add material', values: { name: m?.name || '', event_id: m?.event_id || '' },
    fields: [
      { k: 'name', label: 'What do you need?', req: true },
      { k: '_s', type: 'node', show: () => !m, render: (v, redraw) => h('div', { class: 'chips', style: 'margin:-6px 0 14px' }, ...SUG.map((s) => h('button', { type: 'button', class: 'chip add', onclick: () => { v.name = s; redraw(); } }, s))) },
      { k: 'event_id', label: 'For which event?', type: 'chips', opts: eventOpts(t('Buy once, use for all events')) },
    ],
    onSave: async (v) => {
      const row = { wedding_id: wid(), name: v.name.trim(), event_id: nul(v.event_id) };
      if (m) await must(sb.from('materials').update(row).eq('id', m.id)); else await must(sb.from('materials').insert(row));
      refresh();
    },
    onDelete: m && (async () => { await must(sb.from('materials').delete().eq('id', m.id)); refresh(); }),
  });
  const groups = [['', t('Buy once, use for all events')], ...S.events.map((e) => [e.id, e.type])].map(([k, n]) => [n, rows.filter((r) => (r.event_id || '') === k)]).filter(([, r]) => r.length);
  page({ title: t('Materials'), sub: `${rows.filter((r) => r.done).length}/${rows.length}`, fab: canEdit() && { label: t('Add'), onclick: () => form(null) } },
    groups.length ? groups.map(([n, rs]) => [h('div', { class: 'sec' }, n), ...rs.map((r) => h('div', { class: 'card row' },
      h('button', { class: 'chk' + (r.done ? ' on' : ''), onclick: async () => { try { await must(sb.from('materials').update({ done: !r.done }).eq('id', r.id)); refresh(); } catch (e) { fail(e); } } }, r.done ? '✓' : ''),
      h('div', { class: 'grow ' + (r.done ? 'done' : ''), onclick: () => canEdit() && form(r) }, r.name)))]) : h('div', { class: 'empty' }, t('No materials yet.')));
}
