import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm, priceField } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { telUrl, waUrl } from '../lib/format.js';
import { priceMap, priceValues, applyPrice, priceTag, eventOpts, nul } from '../lib/api.js';

const SUG = ['Decorator', 'Photographer', 'Caterer', 'Pandit', 'Makeup', 'Music / DJ', 'Mehandi', 'Flowers', 'Tent house'];

export async function render(_p, refresh) {
  const [rows, ve, prices] = await Promise.all([must(sb.from('vendors').select('*').eq('wedding_id', wid()).order('name')), must(sb.from('vendor_events').select('vendor_id,event_id').eq('wedding_id', wid())), priceMap('vendor')]);
  const evs = (id) => ve.filter((x) => x.vendor_id === id).map((x) => x.event_id);
  const form = async (v0) => {
    const pv = v0 ? await priceValues('vendor', v0.id) : {};
    openForm({
      title: v0 ? 'Edit vendor' : 'Add vendor', values: { on_whatsapp: true, services: [], ...(v0 || {}), events: v0 ? evs(v0.id) : [], ...pv },
      fields: [
        { k: 'name', label: 'Business name', req: true }, { k: 'services', label: 'What do they do?', type: 'tags', suggest: SUG },
        { k: 'contact_name', label: 'Contact person' }, { k: 'phone', label: 'Phone', type: 'tel' },
        { k: 'on_whatsapp', label: 'On WhatsApp?', type: 'toggle' },
        { k: 'events', label: 'Which events?', type: 'multi', opts: eventOpts(), empty: t('Add events first') },
        { k: 'notes', label: 'Notes', type: 'textarea' },
        ...(canEdit() ? [priceField()] : []),
      ],
      onSave: async (v) => {
        const row = { wedding_id: wid(), name: v.name.trim(), services: v.services, contact_name: nul(v.contact_name), phone: nul(v.phone), on_whatsapp: !!v.on_whatsapp, notes: nul(v.notes) };
        let id = v0?.id;
        if (id) await must(sb.from('vendors').update(row).eq('id', id)); else id = (await must(sb.from('vendors').insert(row).select('id').single())).id;
        await must(sb.from('vendor_events').delete().eq('vendor_id', id));
        if (v.events.length) await must(sb.from('vendor_events').insert(v.events.map((e) => ({ vendor_id: id, event_id: e, wedding_id: wid() }))));
        await applyPrice('vendor', id, v); refresh();
      },
      onDelete: v0 && (async () => { await must(sb.from('vendors').delete().eq('id', v0.id)); refresh(); }),
    });
  };
  page({ title: t('Vendors'), back: '#/home', fab: canEdit() && { label: t('Add vendor'), onclick: () => form(null) } },
    rows.length ? rows.map((r) => h('div', { class: 'card' },
      h('div', { onclick: () => canEdit() && form(r) }, h('b', { class: 'serif', style: 'font-size:19px' }, r.name), r.services.length ? h('div', { class: 'chips', style: 'margin:6px 0' }, ...r.services.map((s) => h('span', { class: 'badge b-family' }, s))) : null,
        h('div', { class: 'mute' }, [r.contact_name, evs(r.id).map((id) => S.events.find((e) => e.id === id)?.type).filter(Boolean).join(', ')].filter(Boolean).join(' · ')), r.notes ? h('div', { class: 'small' }, r.notes) : null),
      h('div', { class: 'row between', style: 'margin-top:8px' }, priceTag(prices[r.id]), r.phone && h('div', { class: 'row' }, h('a', { class: 'act', href: telUrl(r.phone) }, '📞 ' + t('Call')), r.on_whatsapp && h('a', { class: 'act', href: waUrl(r.phone), target: '_blank', rel: 'noopener' }, '💬 WhatsApp'))))) : h('div', { class: 'empty' }, t('No vendors yet.')));
}
