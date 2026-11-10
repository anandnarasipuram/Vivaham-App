import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm, priceField } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { fmtShort, mapsUrl } from '../lib/format.js';
import { priceMap, priceValues, applyPrice, priceTag, nul } from '../lib/api.js';

export async function render(_p, refresh) {
  const [stays, sg, guests, prices] = await Promise.all([
    must(sb.from('stays').select('*').eq('wedding_id', wid()).order('check_in', { nullsFirst: false })),
    must(sb.from('stay_guests').select('stay_id,name').eq('wedding_id', wid()).order('created_at')),
    must(sb.from('guests').select('name').eq('wedding_id', wid()).order('name')),
    priceMap('stay'),
  ]);
  const names = (id) => sg.filter((x) => x.stay_id === id).map((x) => x.name);
  const suggest = [...new Set([...S.members.map((m) => m.name), ...guests.map((g) => g.name)])];
  const form = async (st) => {
    const pv = st ? await priceValues('stay', st.id) : {};
    openForm({
      title: st ? 'Edit stay' : 'Add stay', values: { ...(st || { rooms: 1 }), people: st ? names(st.id) : [], ...pv },
      fields: [
        { k: 'name', label: 'Hotel or house name', req: true },
        { k: 'address', label: 'Address', type: 'textarea' },
        { k: 'maps_link', label: 'Google Maps link', type: 'url' },
        { k: 'check_in', label: 'Check-in', type: 'date' }, { k: 'check_out', label: 'Check-out', type: 'date' },
        { k: 'rooms', label: 'Rooms', type: 'number' },
        { k: 'people', label: 'Who is staying?', type: 'tags', suggest },
        ...(canEdit() ? [priceField()] : []),
      ],
      onSave: async (v) => {
        if (v.check_in && v.check_out && v.check_out < v.check_in) throw new Error('Check-out is before check-in.');
        const row = { wedding_id: wid(), name: v.name.trim(), address: nul(v.address), maps_link: nul(v.maps_link), check_in: nul(v.check_in), check_out: nul(v.check_out), rooms: v.rooms ?? 1 };
        let id = st?.id;
        if (id) await must(sb.from('stays').update(row).eq('id', id)); else id = (await must(sb.from('stays').insert(row).select('id').single())).id;
        await must(sb.from('stay_guests').delete().eq('stay_id', id));
        if (v.people.length) await must(sb.from('stay_guests').insert(v.people.map((n) => ({ wedding_id: wid(), stay_id: id, name: n }))));
        await applyPrice('stay', id, v); refresh();
      },
      onDelete: st && (async () => { await must(sb.from('stays').delete().eq('id', st.id)); refresh(); }),
    });
  };
  page({ title: t('Stays'), back: '#/home', fab: canEdit() && { label: t('Add stay'), onclick: () => form(null) } },
    stays.length ? stays.map((s) => { const m = mapsUrl(s.maps_link || s.address); return h('div', { class: 'card' },
      h('div', { class: 'row between', onclick: () => canEdit() && form(s) }, h('b', { class: 'serif', style: 'font-size:19px' }, s.name), h('span', { class: 'mute' }, `${s.rooms} ${t('rooms')}`)),
      h('div', { class: 'mute' }, [s.check_in && fmtShort(s.check_in) + ' → ' + fmtShort(s.check_out), s.address].filter(Boolean).join(' · ')),
      names(s.id).length ? h('div', { class: 'small', style: 'margin-top:6px' }, '👥 ' + names(s.id).join(', ')) : null,
      h('div', { class: 'row between', style: 'margin-top:8px' }, priceTag(prices[s.id]), m && h('a', { class: 'act', href: m, target: '_blank', rel: 'noopener' }, '📍 ' + t('Open map')))); }) : h('div', { class: 'empty' }, t('No stays yet.')));
}
