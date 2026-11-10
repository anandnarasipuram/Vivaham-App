import { sb, must } from '../lib/supabase.js';
import { canEdit, wid } from '../lib/store.js';
import { h, openForm, priceField } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { fmtShort, fmtTime, hhmm, telUrl, waUrl } from '../lib/format.js';
import { priceMap, priceValues, applyPrice, priceTag, nul } from '../lib/api.js';

export async function render(_p, refresh) {
  const [rows, prices] = await Promise.all([must(sb.from('vehicles').select('*').eq('wedding_id', wid()).order('from_date', { nullsFirst: false })), priceMap('vehicle')]);
  const form = async (v0) => {
    const pv = v0 ? await priceValues('vehicle', v0.id) : {};
    openForm({
      title: v0 ? 'Edit vehicle' : 'Add vehicle', values: { seats: 4, ...(v0 || {}), from_time: hhmm(v0?.from_time), until_time: hhmm(v0?.until_time), ...pv },
      fields: [
        { k: 'name', label: 'Vehicle', req: true, placeholder: 'Innova, Tempo traveller...' }, { k: 'number', label: 'Vehicle number' },
        { k: 'seats', label: 'Seats', type: 'number', min: 1 },
        { k: 'driver_name', label: 'Driver name' }, { k: 'driver_phone', label: 'Driver phone', type: 'tel' },
        { k: 'from_date', label: 'From date', type: 'date' }, { k: 'from_time', label: 'From time', type: 'time' },
        { k: 'to_date', label: 'To date', type: 'date' }, { k: 'until_time', label: 'Until time', type: 'time' },
        { k: 'notes', label: 'Notes', type: 'textarea' },
        ...(canEdit() ? [priceField()] : []),
      ],
      onSave: async (v) => {
        if (v.from_date && v.to_date && v.to_date < v.from_date) throw new Error('The end date is before the start date.');
        const row = { wedding_id: wid(), name: v.name.trim(), number: nul(v.number), seats: Math.max(1, v.seats || 1), driver_name: nul(v.driver_name), driver_phone: nul(v.driver_phone), from_date: nul(v.from_date), to_date: nul(v.to_date), from_time: nul(v.from_time), until_time: nul(v.until_time), notes: nul(v.notes) };
        let id = v0?.id;
        if (id) await must(sb.from('vehicles').update(row).eq('id', id)); else id = (await must(sb.from('vehicles').insert(row).select('id').single())).id;
        await applyPrice('vehicle', id, v); refresh();
      },
      onDelete: v0 && (async () => { await must(sb.from('vehicles').delete().eq('id', v0.id)); refresh(); }),
    });
  };
  page({ title: t('Transport'), back: '#/home', fab: canEdit() && { label: t('Add vehicle'), onclick: () => form(null) } },
    rows.length ? rows.map((r) => h('div', { class: 'card' },
      h('div', { class: 'row between', onclick: () => canEdit() && form(r) }, h('b', { class: 'serif', style: 'font-size:19px' }, r.name), h('span', { class: 'mute' }, `${r.seats} ${t('seats')}${r.number ? ' · ' + r.number : ''}`)),
      h('div', { class: 'mute' }, [r.from_date && `${fmtShort(r.from_date)} ${fmtTime(r.from_time)}`, r.to_date && `→ ${fmtShort(r.to_date)} ${fmtTime(r.until_time)}`].filter(Boolean).join(' ')),
      r.driver_name || r.driver_phone ? h('div', { class: 'row', style: 'margin-top:6px' }, h('span', null, '🧑‍✈️ ' + (r.driver_name || '')), r.driver_phone && h('a', { class: 'act', href: telUrl(r.driver_phone) }, '📞'), r.driver_phone && h('a', { class: 'act', href: waUrl(r.driver_phone), target: '_blank', rel: 'noopener' }, '💬')) : null,
      r.notes ? h('div', { class: 'small mute' }, r.notes) : null, priceTag(prices[r.id]))) : h('div', { class: 'empty' }, t('No vehicles yet.')));
}
