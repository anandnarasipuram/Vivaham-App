import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm, priceField } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { fmtTime, hhmm, plates } from '../lib/format.js';
import { priceMap, priceValues, applyPrice, priceTag, eventOpts, nul } from '../lib/api.js';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export async function render(_p, refresh) {
  const [meals, prices] = await Promise.all([must(sb.from('meals').select('*').eq('wedding_id', wid()).order('meal_time', { nullsFirst: false })), priceMap('meal')]);
  const form = async (m) => {
    const pv = m ? await priceValues('meal', m.id) : {};
    openForm({
      title: m ? 'Edit meal' : 'Add meal', values: { event_id: m?.event_id || S.events[0]?.id || '', meal: m?.meal || 'Lunch', meal_time: hhmm(m?.meal_time), dishes: m?.dishes || [], guests: m?.guests ?? (S.events[0]?.guests || null), diet_notes: m?.diet_notes || '', ...pv },
      fields: [
        { k: 'event_id', label: 'For which event?', type: 'chips', opts: eventOpts(), req: true },
        { k: 'meal', label: 'Meal', type: 'chips', opts: MEALS, custom: true },
        { k: 'meal_time', label: 'Time', type: 'time' },
        { k: 'dishes', label: 'Dishes', type: 'tags', placeholder: 'Pulihora, Dal...' },
        { k: 'guests', label: 'How many guests?', type: 'number', live: (v) => { const el = document.getElementById('plates'); if (el) el.textContent = plates(v.guests); } },
        { k: '_p', type: 'node', render: (v) => h('div', { class: 'mute', style: 'margin:-6px 0 14px' }, `🍽️ ${t('Plates to prepare')}: `, h('b', { id: 'plates' }, plates(v.guests))) },
        { k: 'diet_notes', label: 'Diet notes', type: 'textarea', placeholder: 'No onion-garlic, 5 diabetic...' },
        ...(canEdit() ? [priceField()] : []),
      ],
      onSave: async (v) => {
        const row = { wedding_id: wid(), event_id: v.event_id, meal: v.meal.trim(), meal_time: nul(v.meal_time), dishes: v.dishes, guests: v.guests || 0, diet_notes: nul(v.diet_notes) };
        let id = m?.id;
        if (id) await must(sb.from('meals').update(row).eq('id', id)); else id = (await must(sb.from('meals').insert(row).select('id').single())).id;
        await applyPrice('meal', id, v); refresh();
      },
      onDelete: m && (async () => { await must(sb.from('meals').delete().eq('id', m.id)); refresh(); }),
    });
  };
  const groups = S.events.map((e) => [e, meals.filter((m) => m.event_id === e.id)]).filter(([, r]) => r.length);
  page({ title: t('Food'), back: '#/home', fab: canEdit() && { label: t('Add meal'), onclick: () => { if (!S.events.length) { location.hash = '#/events'; return; } form(null); } } },
    groups.length ? groups.map(([e, rows]) => [h('div', { class: 'sec' }, e.type), ...rows.map((m) => h('div', { class: 'card', onclick: () => canEdit() && form(m) },
      h('div', { class: 'row between' }, h('b', null, m.meal), h('span', { class: 'mute' }, fmtTime(m.meal_time))),
      m.dishes.length ? h('div', { class: 'small' }, m.dishes.join(' · ')) : null,
      h('div', { class: 'mute' }, `${m.guests} ${t('guests')} · 🍽️ ${plates(m.guests)} ${t('plates')}${m.diet_notes ? ' · ' + m.diet_notes : ''}`), priceTag(prices[m.id])))]) : h('div', { class: 'empty' }, S.events.length ? t('No meals yet.') : t('Add an event first, then plan its meals.')));
}
