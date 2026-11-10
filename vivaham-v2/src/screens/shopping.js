import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm, fail, toast } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { priceField } from '../lib/ui.js';
import { priceMap, priceValues, applyPrice, priceTag, eventOpts, memberOpts, nul } from '../lib/api.js';

const BASE = ['Clothes', 'Shoes', 'Jewellery', 'Accessories'];
let fCat = '', fEv = null;

export async function render(_p, refresh) {
  const [items, ip, cats, prices] = await Promise.all([
    must(sb.from('shopping_items').select('*').eq('wedding_id', wid()).order('created_at')),
    must(sb.from('item_people').select('item_id,member_id').eq('wedding_id', wid())),
    must(sb.from('categories').select('name').eq('wedding_id', wid()).order('name')),
    priceMap('shopping'),
  ]);
  const allCats = [...BASE, ...cats.map((c) => c.name).filter((n) => !BASE.includes(n))];
  const people = (id) => ip.filter((x) => x.item_id === id).map((x) => S.members.find((m) => m.id === x.member_id)?.name).filter(Boolean);
  const shown = items.filter((i) => (!fCat || i.category === fCat) && (fEv === null || (i.event_id || '') === fEv));
  const groups = [['', t('General')], ...S.events.map((e) => [e.id, e.type])].map(([k, n]) => [n, shown.filter((i) => (i.event_id || '') === k)]).filter(([, r]) => r.length);

  const form = async (it) => {
    const pv = it ? await priceValues('shopping', it.id) : {};
    openForm({
      title: it ? 'Edit item' : 'Add item',
      values: { name: it?.name || '', category: it?.category || 'Clothes', event_id: it?.event_id || '', people: it ? people(it.id).map((n) => S.members.find((m) => m.name === n)?.id) : [], ...pv },
      fields: [
        { k: 'name', label: 'What to buy?', req: true, placeholder: 'Silk saree' },
        { k: 'category', label: 'Category', type: 'chips', opts: allCats, custom: true, onCustom: async (n) => { await sb.from('categories').insert({ wedding_id: wid(), name: n }); } },
        { k: 'event_id', label: 'For which event?', type: 'chips', opts: eventOpts(t('General')) },
        { k: 'people', label: 'For whom?', type: 'multi', opts: memberOpts() },
        ...(canEdit() ? [priceField()] : []),
      ],
      onSave: async (v) => {
        const row = { wedding_id: wid(), name: v.name.trim(), category: v.category, event_id: nul(v.event_id) };
        let id = it?.id;
        if (id) await must(sb.from('shopping_items').update(row).eq('id', id)); else id = (await must(sb.from('shopping_items').insert(row).select('id').single())).id;
        await must(sb.from('item_people').delete().eq('item_id', id));
        if (v.people.length) await must(sb.from('item_people').insert(v.people.map((m) => ({ item_id: id, member_id: m, wedding_id: wid() }))));
        await applyPrice('shopping', id, v); refresh();
      },
      onDelete: it && (async () => { await must(sb.from('shopping_items').delete().eq('id', it.id)); refresh(); }),
    });
  };
  const chip = (label, on, fn) => h('button', { class: 'chip' + (on ? ' on' : ''), onclick: fn }, label);
  page({ title: t('Shopping'), back: '#/home', fab: canEdit() && { label: t('Add item'), onclick: () => form(null) } },
    h('div', { class: 'chips', style: 'margin-bottom:8px' }, chip(t('All'), !fCat, () => { fCat = ''; refresh(); }), ...allCats.map((c) => chip(c, fCat === c, () => { fCat = c; refresh(); }))),
    h('div', { class: 'chips', style: 'margin-bottom:14px' }, chip(t('All events'), fEv === null, () => { fEv = null; refresh(); }), chip(t('General'), fEv === '', () => { fEv = ''; refresh(); }), ...S.events.map((e) => chip(e.type, fEv === e.id, () => { fEv = e.id; refresh(); }))),
    h('div', { class: 'mute', style: 'margin-bottom:10px' }, `${items.filter((i) => i.bought).length}/${items.length} ${t('bought')}`),
    groups.length ? groups.map(([n, rows]) => [h('div', { class: 'sec' }, n), ...rows.map((i) => h('div', { class: 'card row' },
      h('button', { class: 'chk' + (i.bought ? ' on' : ''), disabled: !canEdit(), onclick: async () => { try { await must(sb.from('shopping_items').update({ bought: !i.bought }).eq('id', i.id)); refresh(); } catch (e) { fail(e); } } }, i.bought ? '✓' : ''),
      h('div', { class: 'grow', onclick: () => canEdit() && form(i) }, h('div', { class: i.bought ? 'done' : '' }, h('b', null, i.name)), h('div', { class: 'mute' }, [i.category, people(i.id).join(', ')].filter(Boolean).join(' · ')), priceTag(prices[i.id]))))]) : h('div', { class: 'empty' }, t('Nothing to buy yet.')));
}
