import { sb, must } from '../lib/supabase.js';
import { S, canEdit, isAdmin, wid } from '../lib/store.js';
import { h, openForm, sheet, fail, toast, confirmBox } from '../lib/ui.js';
import { t, setLang, getLang } from '../lib/i18n.js';
import { page, go } from '../main.js';
import { fmtDate, waShare, waUrl } from '../lib/format.js';
import { phoneInput, prettyPhone, inviteText } from '../lib/phone.js';
import { nul } from '../lib/api.js';
import { consent, setConsent, capture } from '../lib/track.js';
import { installCard } from '../lib/install.js';

const ROLES = [['admin', 'Admin'], ['family', 'Family'], ['helper', 'Helper']];
const badge = (r) => h('span', { class: 'badge b-' + r }, t(ROLES.find((x) => x[0] === r)[1]));

export async function render(_p, refresh) {
  const w = S.wedding;
  const codes = isAdmin() ? await Promise.all(['family', 'helper'].map(async (r) => (await must(sb.rpc('get_invite', { p_wedding: wid(), p_role: r })))[0])) : [];
  const link = (c) => `${location.origin}/#/join?code=${c.code}`;
  // people invited by mobile number who have not logged in yet (admins only see the numbers)
  const waiting = isAdmin() ? (await must(sb.from('phone_invites').select('*').eq('wedding_id', wid()).order('created_at'))).filter((i) => !i.accepted_at) : [];
  const inviteOf = (m) => waiting.find((i) => i.member_id === m.id);
  const waBtn = (i, cls = 'btn sm gold') => h('a', { class: cls, style: 'text-decoration:none;text-align:center', href: waUrl(i.phone, inviteText(w.name, i.phone, S.profile.name)), target: '_blank', rel: 'noopener' }, t('Send on WhatsApp'));
  const tellThem = (i) => sheet(t('Invited') + ' 🎉', (box, close) => box.append(
    h('p', null, h('b', null, i.name), ' · ', prettyPhone(i.phone)),
    h('p', { class: 'mute' }, t('Tell them: they log in with this mobile number and are inside straight away.')),
    waBtn(i, 'btn gold'), h('button', { class: 'btn ghost', style: 'margin-top:10px', onclick: close }, t('Done'))));

  const editName = () => openForm({ title: 'Your name', values: { name: S.profile.name }, fields: [{ k: 'name', label: 'Your name', req: true }],
    onSave: async (v) => { await must(sb.rpc('update_my_name', { p_name: v.name })); S.profile.name = v.name.trim(); refresh(); } });
  const editWedding = () => openForm({ title: 'Wedding details', values: { name: w.name, date: w.wedding_date || '' },
    fields: [{ k: 'name', label: 'Wedding name', req: true }, { k: 'date', label: 'Wedding date', type: 'date' }],
    onSave: async (v) => { await must(sb.from('weddings').update({ name: v.name.trim(), wedding_date: nul(v.date) }).eq('id', wid())); w.name = v.name.trim(); w.wedding_date = nul(v.date); refresh(); } });
  const addName = () => {
    const ph = phoneInput();
    openForm({ title: 'Add a person', values: { name: '', role: 'family' },
      fields: [{ k: 'name', label: 'Name', req: true },
        isAdmin() && { k: '_phone', type: 'node', render: () => h('div', { class: 'f' }, h('span', { class: 'lbl' }, t('Mobile number')), ph.el,
          h('div', { class: 'mute', style: 'margin-top:4px' }, t('They log in with this number and are inside. Leave it empty for people who do not use the app; you can still give them tasks and shopping.'))) },
        { k: 'role', label: 'Role', type: 'chips', opts: isAdmin() ? ROLES.map(([v, l]) => ({ v, l: t(l) })) : [{ v: 'family', l: t('Family') }, { v: 'helper', l: t('Helper') }] }].filter(Boolean),
      onSave: async (v) => {
        if (isAdmin() && ph.raw()) {
          const phone = ph.get();
          if (!phone) throw new Error('Please check the mobile number.');
          await must(sb.rpc('invite_phone', { p_wedding: wid(), p_name: v.name.trim(), p_phone: phone, p_role: v.role }));
          refresh(); tellThem({ name: v.name.trim(), phone });
          return;
        }
        await must(sb.from('members').insert({ wedding_id: wid(), name: v.name.trim(), role: v.role })); refresh();
      } });
  };
  const member = (m) => openForm({ title: m.name, trackAs: 'Member', values: { role: m.role },
    fields: [{ k: 'role', label: 'Role', type: 'chips', opts: ROLES.map(([v, l]) => ({ v, l: t(l) })) }],
    saveLabel: 'Save',
    extra: () => { const i = inviteOf(m); return i ? h('div', { class: 'card' },
      h('div', { class: 'mute' }, t('Invited, has not logged in yet')), h('b', null, prettyPhone(i.phone)),
      h('div', { class: 'row', style: 'margin-top:10px' }, waBtn(i),
        h('button', { type: 'button', class: 'btn sm danger', onclick: () => confirmBox('Remove this invite? The name stays in the list.', async () => {
          try { await must(sb.from('phone_invites').delete().eq('id', i.id)); document.querySelectorAll('.ov').forEach((x) => x.remove()); refresh(); } catch (e) { fail(e); } }, 'Remove invite') }, t('Remove invite')))) : h('span'); },
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
    ...S.members.map((m) => h('div', { class: 'card row between', onclick: isAdmin() ? () => member(m) : null }, h('div', null, h('b', null, m.name), m.user_id ? null : h('span', { class: 'mute' }, ' · ' + t(inviteOf(m) ? 'invited' : 'name only'))), badge(m.role))),
    isAdmin() ? [h('div', { class: 'sec' }, t('Invite code')), h('p', { class: 'mute', style: 'margin-top:0' }, t('Easiest: tap + Add above and type their mobile number. Or share a code; whoever joins with it gets that role.')), ...codes.map(inviteCard)] : null,
    h('div', { class: 'sec' }, t('Language')),
    h('div', { class: 'chips' }, ...[['en', 'English'], ['te', 'తెలుగు']].map(([l, n]) => h('button', { class: 'chip' + (getLang() === l ? ' on' : ''), onclick: async () => {
      setLang(l); S.profile.language = l;
      try { await must(sb.from('profiles').update({ language: l }).eq('user_id', S.user.id)); } catch (e) { console.error(e); }
      go(); } }, n))),
    h('div', { class: 'sec' }, t('App')),
    installCard(refresh, { always: true }),
    h('div', { class: 'card' }, h('div', { class: 'row between' },
      h('div', { class: 'grow' }, h('b', null, t('Help improve Vivaham')), h('div', { class: 'mute' }, t('Share how you use the app (screens and taps). Never what you type.'))),
      h('button', { class: 'chip' + (consent() !== 'no' ? ' on' : ''), onclick: () => { const on = consent() === 'no'; if (!on) capture('stats_off'); setConsent(on); refresh(); } }, consent() !== 'no' ? t('Yes') : t('No'))),
      h('button', { class: 'link', style: 'padding-left:0', onclick: () => (location.hash = '#/privacy') }, t('Privacy notice'))),
    h('button', { class: 'btn ghost', style: 'margin-top:24px', onclick: async () => { await sb.auth.signOut(); location.hash = '#/login'; go(); } }, t('Log out')));
}
