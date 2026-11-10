import { sb, must } from '../lib/supabase.js';
import { S, canEdit, wid, memberName, eventName } from '../lib/store.js';
import { h, openForm, fail } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page } from '../main.js';
import { fmtShort, todayStr } from '../lib/format.js';
import { eventOpts, memberOpts, nul } from '../lib/api.js';

let flt = 'open', who = '';

export async function render(_p, refresh) {
  const rows = await must(sb.from('tasks').select('*').eq('wedding_id', wid()).order('done').order('deadline', { nullsFirst: false }).order('created_at'));
  const me = S.wedding.member_id;
  const shown = rows.filter((r) => (flt === 'all' || (flt === 'open' ? !r.done : flt === 'done' ? r.done : r.member_id === me)) && (!who || r.member_id === who));
  const form = (r) => openForm({
    title: r ? 'Edit task' : 'Add task', values: { title: r?.title || '', member_id: r?.member_id || '', event_id: r?.event_id || '', deadline: r?.deadline || '' },
    fields: [
      { k: 'title', label: 'What needs to be done?', req: true },
      { k: 'member_id', label: 'Who will do it?', type: 'chips', opts: [{ v: '', l: '—' }, ...memberOpts()] },
      { k: 'event_id', label: 'For which event?', type: 'chips', opts: eventOpts(t('No event')) },
      { k: 'deadline', label: 'Deadline', type: 'date' },
    ],
    onSave: async (v) => {
      const row = { wedding_id: wid(), title: v.title.trim(), member_id: nul(v.member_id), event_id: nul(v.event_id), deadline: nul(v.deadline) };
      if (r) await must(sb.from('tasks').update(row).eq('id', r.id)); else await must(sb.from('tasks').insert(row));
      refresh();
    },
    onDelete: r && (async () => { await must(sb.from('tasks').delete().eq('id', r.id)); refresh(); }),
  });
  const chip = (l, on, fn) => h('button', { class: 'chip' + (on ? ' on' : ''), onclick: fn }, l);
  page({ title: t('To-do'), sub: `${rows.filter((r) => !r.done).length} ${t('open')}`, fab: canEdit() && { label: t('Add task'), onclick: () => form(null) } },
    h('div', { class: 'chips', style: 'margin-bottom:8px' }, ...[['open', 'Open'], ['mine', 'Mine'], ['done', 'Done'], ['all', 'All']].map(([k, l]) => chip(t(l), flt === k, () => { flt = k; refresh(); }))),
    S.members.length > 1 ? h('div', { class: 'chips', style: 'margin-bottom:14px' }, chip(t('Everyone'), !who, () => { who = ''; refresh(); }), ...S.members.map((m) => chip(m.name, who === m.id, () => { who = m.id; refresh(); }))) : null,
    shown.length ? shown.map((r) => { const late = !r.done && r.deadline && r.deadline < todayStr(); return h('div', { class: 'card row' },
      h('button', { class: 'chk' + (r.done ? ' on' : ''), onclick: async () => { try { await must(sb.from('tasks').update({ done: !r.done }).eq('id', r.id)); refresh(); } catch (e) { fail(e); } } }, r.done ? '✓' : ''),
      h('div', { class: 'grow', onclick: () => canEdit() && form(r) }, h('div', { class: r.done ? 'done' : '' }, h('b', null, r.title)),
        h('div', { class: 'mute' + (late ? ' red' : '') }, [memberName(r.member_id), eventName(r.event_id), r.deadline && fmtShort(r.deadline)].filter(Boolean).join(' · ')))); }) : h('div', { class: 'empty' }, t('Nothing here. 🎉')));
}
