import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid } from '../lib/store.js';
import { h, openForm } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { waUrl, fmtDate, telUrl } from '../lib/format.js';
import { nul, eventOpts } from '../lib/api.js';

let side = '', q = '';
const NEXT = { pending: 'coming', coming: 'not_coming', not_coming: 'pending' };
const LBL = { pending: 'Pending', coming: 'Coming', not_coming: 'Not coming' };

export async function render(_p, refresh) {
  const [guests, ge] = await Promise.all([
    must(sb.from('guests').select('*').eq('wedding_id', wid()).order('name')),
    must(sb.from('guest_events').select('*').eq('wedding_id', wid())),
  ]);
  const rs = (g) => ge.filter((x) => x.guest_id === g.id);
  const total = (st) => guests.reduce((a, g) => a + (rs(g).some((x) => x.rsvp === st) ? g.people : 0), 0);
  const shown = guests.filter((g) => (!side || g.side === side) && (!q || g.name.toLowerCase().includes(q.toLowerCase())));

  const form = (g) => {
    const cur = g ? Object.fromEntries(rs(g).map((x) => [x.event_id, x.rsvp])) : {};
    openForm({
      title: g ? 'Edit guest' : 'Add guest',
      values: { name: g?.name || '', phone: g?.phone || '', side: g?.side || 'groom', people: g?.people || 1, notes: g?.notes || '', invited: Object.keys(cur), rsvp: cur },
      fields: [
        { k: 'name', label: 'Name', req: true }, { k: 'phone', label: 'Phone / WhatsApp', type: 'tel' },
        { k: 'side', label: 'Which side?', type: 'chips', opts: [{ v: 'bride', l: t('Bride side') }, { v: 'groom', l: t('Groom side') }] },
        { k: 'people', label: 'How many people?', type: 'number', min: 1 },
        { k: 'invited', label: 'Invited to', type: 'multi', opts: eventOpts(), empty: t('Add events first') },
        { k: '_r', type: 'node', show: (v) => v.invited.length, render: (v, redraw) => h('div', { class: 'f' }, h('div', { class: 'lbl' }, 'RSVP'),
            ...v.invited.map((id) => h('div', { class: 'row between', style: 'margin-bottom:6px' }, h('span', null, S.events.find((e) => e.id === id)?.type),
              h('button', { type: 'button', class: 'badge b-' + (v.rsvp[id] || 'pending'), style: 'border:0', onclick: () => { v.rsvp[id] = NEXT[v.rsvp[id] || 'pending']; redraw(); } }, t(LBL[v.rsvp[id] || 'pending']))))) },
        { k: 'notes', label: 'Notes', type: 'textarea' },
      ],
      onSave: async (v) => {
        const row = { wedding_id: wid(), name: v.name.trim(), phone: nul(v.phone), side: v.side, people: Math.max(1, v.people || 1), notes: nul(v.notes) };
        let id = g?.id;
        if (id) await must(sb.from('guests').update(row).eq('id', id)); else id = (await must(sb.from('guests').insert(row).select('id').single())).id;
        await must(sb.from('guest_events').delete().eq('guest_id', id));
        if (v.invited.length) await must(sb.from('guest_events').insert(v.invited.map((e) => ({ guest_id: id, event_id: e, wedding_id: wid(), rsvp: v.rsvp[e] || 'pending' }))));
        refresh();
      },
      onDelete: g && (async () => { await must(sb.from('guests').delete().eq('id', g.id)); refresh(); }),
    });
  };
  const invite = (g) => {
    const evs = rs(g).map((x) => S.events.find((e) => e.id === x.event_id)).filter(Boolean).map((e) => `${e.type}${e.event_date ? ' ' + fmtDate(e.event_date) : ''}${e.venue_name ? ', ' + e.venue_name : ''}`);
    return waUrl(g.phone, `Namaste ${g.name} 🙏\nYou are warmly invited to ${S.wedding.name}${S.wedding.wedding_date ? ' on ' + fmtDate(S.wedding.wedding_date) : ''}.\n${evs.join('\n')}`);
  };
  const chip = (l, on, fn) => h('button', { class: 'chip' + (on ? ' on' : ''), onclick: fn }, l);
  page({ title: t('Guests'), back: '#/home', fab: canEdit() && { label: t('Add guest'), onclick: () => form(null) } },
    h('div', { class: 'row', style: 'margin-bottom:12px' }, ...[['Coming', 'coming'], ['Pending', 'pending'], ['Not coming', 'not_coming']].map(([l, k]) => h('div', { class: 'card grow', style: 'margin:0;text-align:center' }, h('div', { class: 'serif', style: 'font-size:24px' }, total(k)), h('span', { class: 'badge b-' + k }, t(l))))),
    h('input', { class: 'inp', placeholder: '🔍 ' + t('Search'), value: q, style: 'margin-bottom:10px', oninput: (e) => { q = e.target.value; clearTimeout(window.__gq); window.__gq = setTimeout(refresh, 300); } }),
    h('div', { class: 'chips', style: 'margin-bottom:12px' }, chip(t('All'), !side, () => { side = ''; refresh(); }), chip(t('Bride side'), side === 'bride', () => { side = 'bride'; refresh(); }), chip(t('Groom side'), side === 'groom', () => { side = 'groom'; refresh(); })),
    shown.length ? shown.map((g) => h('div', { class: 'card' },
      h('div', { class: 'row between', onclick: () => canEdit() && form(g) }, h('b', null, g.name), h('span', { class: 'mute' }, `${g.people} · ${g.side === 'bride' ? t('Bride side') : t('Groom side')}`)),
      h('div', { class: 'chips', style: 'margin:8px 0' }, ...rs(g).map((x) => h('button', { class: 'badge b-' + x.rsvp, style: 'border:0', disabled: !canEdit(), onclick: async () => { try { await must(sb.from('guest_events').update({ rsvp: NEXT[x.rsvp] }).eq('guest_id', g.id).eq('event_id', x.event_id)); refresh(); } catch (e) { console.error(e); } } }, `${S.events.find((e) => e.id === x.event_id)?.type}: ${t(LBL[x.rsvp])}`))),
      g.phone ? h('div', { class: 'row' }, h('a', { class: 'act', href: telUrl(g.phone) }, '📞 ' + t('Call')), h('a', { class: 'act', href: invite(g), target: '_blank', rel: 'noopener' }, '💬 ' + t('Invite on WhatsApp'))) : null)) : h('div', { class: 'empty' }, t('No guests yet.')));
}
