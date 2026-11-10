import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm, fail, toast, confirmBox } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { fmtDate, fmtTime, hhmm, mapsUrl, money } from '../lib/format.js';
import { uploadFile, signed, removeFiles, pickImages, nul } from '../lib/api.js';

const SUGGEST = ['Mehandi', 'Haldi', 'Sangeet', 'Pelli', 'Reception', 'Vratham', 'Nalugu'];

export function eventForm(ev, done) {
  const v = ev ? { ...ev, start_time: hhmm(ev.start_time), _files: [] } : { type: '', guests: 0, dress_code: false, _files: [] };
  openForm({
    title: ev ? 'Edit event' : 'Add event', values: v,
    fields: [
      { k: 'type', label: 'Event', type: 'chips', opts: SUGGEST, custom: true, req: true },
      { k: 'event_date', label: 'Date', type: 'date' },
      { k: 'start_time', label: 'Start time', type: 'time' },
      { k: 'venue_name', label: 'Venue name', placeholder: 'Home, hall...' },
      { k: 'address', label: 'Address or Google Maps link', type: 'textarea' },
      { k: 'guests', label: 'How many guests?', type: 'number' },
      { k: 'dress_code', label: 'Dress code?', type: 'toggle' },
      { k: 'dress_note', label: 'Dress code note', show: (x) => x.dress_code, placeholder: 'Yellow, traditional...' },
      { k: '_ph', type: 'node', render: (x, redraw) => h('div', { class: 'f' }, h('div', { class: 'lbl' }, t('Photos')),
          h('button', { type: 'button', class: 'btn sm ghost', onclick: async () => { x._files.push(...(await pickImages())); redraw(); } }, '📷 ' + t('Add photos')),
          x._files.length ? h('span', { class: 'mute', style: 'margin-left:8px' }, x._files.length + ' ✓') : null) },
    ],
    onSave: async (x) => {
      const row = { wedding_id: wid(), type: x.type.trim(), event_date: nul(x.event_date), start_time: nul(x.start_time), venue_name: nul(x.venue_name), address: nul(x.address), guests: x.guests || 0, dress_code: !!x.dress_code, dress_note: x.dress_code ? nul(x.dress_note) : null };
      let id = ev?.id;
      if (id) await must(sb.from('events').update(row).eq('id', id)); else id = (await must(sb.from('events').insert(row).select('id').single())).id;
      for (const f of x._files) { const path = await uploadFile(f, 'events/' + id); await must(sb.from('event_photos').insert({ wedding_id: wid(), event_id: id, path })); }
      done(id);
    },
    onDelete: ev && (async () => {
      const ph = await must(sb.from('event_photos').select('path').eq('event_id', ev.id));
      await must(sb.from('events').delete().eq('id', ev.id)); await removeFiles(ph.map((p) => p.path)); location.hash = '#/events'; done();
    }),
  });
}

export async function render({ id }, refresh) {
  return id ? detail(id, refresh) : list(refresh);
}

function list(refresh) {
  page({ title: t('Events'), back: '#/home', fab: canEdit() && { label: t('Add event'), onclick: () => eventForm(null, refresh) } },
    S.events.length ? S.events.map((e) => h('a', { class: 'card tap', href: '#/events/' + e.id, style: 'display:block;text-decoration:none;color:inherit' },
      h('div', { class: 'row between' }, h('b', { class: 'serif', style: 'font-size:19px' }, e.type), h('span', { class: 'mute' }, fmtDate(e.event_date))),
      h('div', { class: 'mute' }, [fmtTime(e.start_time), e.venue_name, e.guests ? e.guests + ' ' + t('guests') : ''].filter(Boolean).join(' · ')))) : h('div', { class: 'empty' }, t('No events yet. Add Mehandi, Haldi, Pelli...')));
}

async function detail(id, refresh) {
  const e = S.events.find((x) => x.id === id);
  if (!e) { location.hash = '#/events'; return; }
  const [photos, tasks, mats, shop, meals, ge] = await Promise.all([
    must(sb.from('event_photos').select('*').eq('event_id', id).order('created_at')),
    must(sb.from('tasks').select('title,done').eq('event_id', id)),
    must(sb.from('materials').select('name,done').eq('event_id', id)),
    must(sb.from('shopping_items').select('name,bought').eq('event_id', id)),
    must(sb.from('meals').select('meal,meal_time,guests').eq('event_id', id).order('meal_time')),
    must(sb.from('guest_events').select('rsvp,guests(people)').eq('event_id', id)),
  ]);
  const urls = await signed(photos.map((p) => p.path));
  const sum = (r) => ge.filter((x) => x.rsvp === r).reduce((a, x) => a + (x.guests?.people || 1), 0);
  const kv = (k, val) => val ? h('div', { class: 'kv' }, h('span', { class: 'mute' }, t(k)), h('b', null, val)) : null;
  const map = e.address ? mapsUrl(e.address) : '';
  page({ title: e.type, sub: fmtDate(e.event_date), back: '#/events', right: canEdit() && h('button', { class: 'hbtn', onclick: () => eventForm(e, refresh) }, t('Edit')) },
    h('div', { class: 'card' }, kv('Time', fmtTime(e.start_time)), kv('Venue', e.venue_name), kv('Address', e.address && !/^https?:/.test(e.address) ? e.address : ''), kv('Guests', e.guests || ''),
      kv('Dress code', e.dress_code ? e.dress_note || t('Yes') : ''),
      map && h('a', { class: 'btn sm gold', href: map, target: '_blank', rel: 'noopener', style: 'display:inline-block;margin-top:10px;text-decoration:none' }, '📍 ' + t('Open map'))),
    h('div', { class: 'card' }, h('div', { class: 'sec', style: 'margin-top:0' }, t('Guests')),
      h('div', { class: 'row' }, h('span', { class: 'badge b-coming' }, t('Coming') + ' ' + sum('coming')), h('span', { class: 'badge b-pending' }, t('Pending') + ' ' + sum('pending')), h('span', { class: 'badge b-not_coming' }, t('Not coming') + ' ' + sum('not_coming')))),
    meals.length ? h('div', { class: 'card' }, h('div', { class: 'sec', style: 'margin-top:0' }, t('Food')), ...meals.map((m) => h('div', { class: 'kv' }, h('span', null, m.meal), h('b', null, [fmtTime(m.meal_time), m.guests ? m.guests + ' ' + t('guests') : ''].filter(Boolean).join(' · '))))) : null,
    list3('To-do', tasks.map((x) => [x.title, x.done])), list3('Materials', mats.map((x) => [x.name, x.done])), list3('Shopping', shop.map((x) => [x.name, x.bought])),
    h('div', { class: 'sec' }, t('Photos')),
    h('div', { class: 'photos' }, ...photos.map((p) => h('div', { class: 'ph' }, h('img', { src: urls[p.path], loading: 'lazy' }),
      canEdit() && h('button', { class: 'x', onclick: () => confirmBox('Delete this photo?', async () => { try { await must(sb.from('event_photos').delete().eq('id', p.id)); await removeFiles([p.path]); refresh(); } catch (er) { fail(er); } }) }, '✕')))),
    canEdit() && h('button', { class: 'btn ghost', style: 'margin-top:12px', onclick: async () => {
      try { for (const f of await pickImages()) { const path = await uploadFile(f, 'events/' + id); await must(sb.from('event_photos').insert({ wedding_id: wid(), event_id: id, path })); } refresh(); } catch (er) { fail(er); }
    } }, '📷 ' + t('Add photos')));
}
const list3 = (title, rows) => rows.length ? h('div', { class: 'card' }, h('div', { class: 'sec', style: 'margin-top:0' }, t(title)),
  ...rows.map(([n, d]) => h('div', { class: 'kv' }, h('span', { class: d ? 'done' : '' }, n), h('span', null, d ? '✓' : '')))) : null;
