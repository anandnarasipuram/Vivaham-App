import { sb, must } from '../lib/supabase.js';
import { S, canEdit, isAdmin, wid } from '../lib/store.js';
import { h, openForm, fail, toast, confirmBox } from '../lib/ui.js';
import { t, setLang, getLang } from '../lib/i18n.js';
import { page, go } from '../main.js';
import { fmtDate, waShare } from '../lib/format.js';
import { nul } from '../lib/api.js';

const ROLES = [['admin', 'Admin'], ['family', 'Family'], ['helper', 'Helper']];
const badge = (r) => h('span', { class: 'badge b-' + r }, t(ROLES.find((x) => x[0] === r)[1]));

export async function render(_p, refresh) {
  const w = S.wedding;
  const codes = isAdmin() ? await Promise.all(['family', 'helper'].map(async (r) => (await must(sb.rpc('get_invite', { p_wedding: wid(), p_role: r })))[0])) : [];
  const link = (c) => `${location.origin}/#/join?code=${c.code}`;

  const editName = () => openForm({ title: 'Your name', values: { name: S.profile.name }, fields: [{ k: 'name', label: 'Your name', req: true }],
    onSave: async (v) => { await must(sb.rpc('update_my_name', { p_name: v.name })); S.profile.name = v.name.trim(); refresh(); } });
  const editWedding = () => openForm({ title: 'Wedding details', values: { name: w.name, date: w.wedding_date || '' },
    fields: [{ k: 'name', label: 'Wedding name', req: true }, { k: 'date', label: 'Wedding date', type: 'date' }],
    onSave: async (v) => { await must(sb.from('weddings').update({ name: v.name.trim(), wedding_date: nul(v.date) }).eq('id', wid())); w.name = v.name.trim(); w.wedding_date = nul(v.date); refresh(); } });
  const addName = () => openForm({ title: 'Add a name', values: { name: '', role: 'family' },
    fields: [{ k: 'name', label: 'Name', req: true, hint: t('For people who do not use the app. You can still give them tasks and shopping.') }, { k: 'role', label: 'Role', type: 'chips', opts: isAdmin() ? ROLES.map(([v, l]) => ({ v, l: t(l) })) : [{ v: 'family', l: t('Family') }, { v: 'helper', l: t('Helper') }] }],
    onSave: async (v) => { await must(sb.from('members').insert({ wedding_id: wid(), name: v.name.trim(), role: v.role })); refresh(); } });
  const member = (m) => openForm({ title: m.name, values: { role: m.role },
    fields: [{ k: 'role', label: 'Role', type: 'chips', opts: ROLES.map(([v, l]) => ({ v, l: t(l) })) }],
    saveLabel: 'Save',
    onSave: async (v) => { if (v.role !== m.role) await must(sb.from('members').update({ role: v.role }).eq('id', m.id)); refresh(); },
    onDelete: m.user_id === S.user.id ? null : (async () => { await must(sb.from('members').delete().eq('id', m.id)); refresh(); }) });

  const inviteCard = (c) => h('div', { class: 'card' }, h('div', { class: 'row between' }, badge(c.role), h('span', { class: 'mute' }, t('Valid until') + ' ' + fmtDate(c.expires_at.slice(0, 10)))),
    h('div', { class: 'serif', style: 'font-size:26px;letter-spacing:2px;margin:8px 0;color:var(--maroon)' }, c.code),
    h('div', { class: 'row' },
      h('button', { class: 'btn sm ghost', onclick: async () => { try { await navigator.clipboard.writeText(link(c)); toast(t('Copied')); } catch { toast(c.code); } } }, t('Copy link')),
      h('a', { class: 'btn sm gold', style: 'text-decoration:none;text-align:center', href: waShare(`Join our wedding planner "${w.name}" 🙏\nCode: ${c.code}\n${link(c)}`), target: '_blank', rel: 'noopener' }, 'WhatsApp'),
      h('button', { class: 'btn sm danger', onclick: () => confirmBox('Make a new code? The old one stops working.', async () => { try { await must(sb.rpc('get_invite', { p_wedding: wid(), p_role: c.role, p_rotate: true })); refresh(); } catch (e) { fail(e); } }, 'New code') }, t('New code'))));

  page({ title: t('Profile') },
    h('div', { class: 'card row between', onclick: editName }, h('div', null, h('div', { class: 'mute' }, t('Your name')), h('b', { style: 'font-size:18px' }, S.profile.name || '—')), badge(w.role)),
    h('div', { class: 'sec' }, t('Wedding')),
    h('div', { class: 'card row between', onclick: isAdmin() ? editWedding : null }, h('div', null, h('b', null, w.name), h('div', { class: 'mute' }, w.wedding_date ? fmtDate(w.wedding_date) : t('No date yet'))), isAdmin() ? h('span', null, '✎') : null),
    S.weddings.length > 1 ? h('div', { class: 'chips' }, ...S.weddings.map((x) => h('button', { class: 'chip' + (x.wedding_id === w.wedding_id ? ' on' : ''), onclick: () => { localStorage.setItem('wedding', x.wedding_id); S.wedding = null; go(); } }, x.name))) : null,
    h('div', { class: 'row between' }, h('div', { class: 'sec' }, t('Family & helpers')), canEdit() && h('button', { class: 'btn sm gold', onclick: addName }, '+ ' + t('Add'))),
    ...S.members.map((m) => h('div', { class: 'card row between', onclick: isAdmin() ? () => member(m) : null }, h('div', null, h('b', null, m.name), m.user_id ? null : h('span', { class: 'mute' }, ' · ' + t('name only'))), badge(m.role))),
    isAdmin() ? [h('div', { class: 'sec' }, t('Invite code')), h('p', { class: 'mute', style: 'margin-top:0' }, t('Share a code. Whoever joins gets that role.')), ...codes.map(inviteCard)] : null,
    h('div', { class: 'sec' }, t('Language')),
    h('div', { class: 'chips' }, ...[['en', 'English'], ['te', 'తెలుగు']].map(([l, n]) => h('button', { class: 'chip' + (getLang() === l ? ' on' : ''), onclick: async () => {
      setLang(l); S.profile.language = l;
      try { await must(sb.from('profiles').update({ language: l }).eq('user_id', S.user.id)); } catch (e) { console.error(e); }
      go(); } }, n))),
    h('button', { class: 'btn ghost', style: 'margin-top:24px', onclick: async () => { await sb.auth.signOut(); location.hash = '#/login'; go(); } }, t('Log out')));
}
