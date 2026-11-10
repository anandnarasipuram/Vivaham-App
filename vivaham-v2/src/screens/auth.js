import { sb, must } from '../lib/supabase.js';
import { S } from '../lib/store.js';
import { h, toast, fail } from '../lib/ui.js';
import { t, setLang, getLang } from '../lib/i18n.js';
import { plain, go, afterAuthRedirect, reloadAll, endRecovery } from '../main.js';

const langBar = () => h('div', { class: 'row', style: 'justify-content:flex-end;margin-bottom:10px' },
  ...[['en', 'English'], ['te', 'తెలుగు']].map(([l, n]) => h('button', { class: 'chip' + (getLang() === l ? ' on' : ''), onclick: () => { setLang(l); go(); } }, n)));
const field = (label, props) => h('label', { class: 'f' }, h('span', null, t(label)), h('input', { class: 'inp', ...props }));
const link = (txt, hash) => h('button', { class: 'link', onclick: () => (location.hash = hash) }, txt);
const val = (root, n) => root.querySelector(`[name=${n}]`).value.trim();

async function afterLogin() {
  S.profile = null; S.wedding = null;
  afterAuthRedirect();
}

export const screens = {
  login() {
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        const { error } = await sb.auth.signInWithPassword({ email: val(f, 'email'), password: f.password.value });
        if (error) throw new Error(error.message === 'Invalid login credentials' ? "That email or password doesn't match." : error.message);
        S.user = (await sb.auth.getUser()).data.user; await afterLogin();
      } catch (er) { fail(er); }
    } },
      field('Email', { name: 'email', type: 'email', autocomplete: 'email', required: true }),
      field('Password', { name: 'password', type: 'password', autocomplete: 'current-password', required: true }),
      h('button', { class: 'btn', type: 'submit' }, t('Log in')));
    plain(langBar(), h('h1', null, 'Vivaham'), h('p', { class: 'mute' }, t('Plan the whole wedding together.')), f,
      h('div', { class: 'row between', style: 'margin-top:12px' }, link(t('Forgot password?'), '#/forgot'), link(t('Create account'), '#/signup')),
      link(t('I have an invite code'), '#/join'));
  },
  signup() {
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        if (f.password.value.length < 6) throw new Error('Password needs at least 6 characters.');
        const { data, error } = await sb.auth.signUp({ email: val(f, 'email'), password: f.password.value, options: { data: { name: val(f, 'name') }, emailRedirectTo: location.origin } });
        if (error) throw new Error(error.message);
        if (!data.session) { toast('Check your email and tap the link to confirm, then log in.'); location.hash = '#/login'; return; }
        S.user = data.user; await afterLogin();
      } catch (er) { fail(er); }
    } },
      field('Your name', { name: 'name', required: true, autocomplete: 'name' }),
      field('Email', { name: 'email', type: 'email', required: true, autocomplete: 'email' }),
      field('Password', { name: 'password', type: 'password', required: true, autocomplete: 'new-password', minLength: 6 }),
      h('button', { class: 'btn', type: 'submit' }, t('Sign up')));
    plain(langBar(), h('h1', null, t('Create account')), f, link(t('I already have an account'), '#/login'));
  },
  forgot() {
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        const { error } = await sb.auth.resetPasswordForEmail(val(f, 'email'), { redirectTo: location.origin + '/' });
        if (error) throw new Error(error.message);
        toast('If that email has an account, a reset link is on its way.');
      } catch (er) { fail(er); }
    } }, field('Email', { name: 'email', type: 'email', required: true }), h('button', { class: 'btn', type: 'submit' }, t('Send reset link')));
    plain(langBar(), h('h1', null, t('Forgot password?')), f, link(t('Back to log in'), '#/login'));
  },
  reset() {
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        if (f.password.value.length < 6) throw new Error('Password needs at least 6 characters.');
        if (f.password.value !== f.again.value) throw new Error("The two passwords don't match.");
        const { error } = await sb.auth.updateUser({ password: f.password.value });
        if (error) throw new Error(error.message);
        endRecovery(); toast('Password changed.'); location.hash = '#/home'; go();
      } catch (er) { fail(er); }
    } },
      field('New password', { name: 'password', type: 'password', required: true, minLength: 6, autocomplete: 'new-password' }),
      field('Type it again', { name: 'again', type: 'password', required: true, autocomplete: 'new-password' }),
      h('button', { class: 'btn', type: 'submit' }, t('Save')));
    plain(h('h1', null, t('New password')), f);
  },
  async join({ q }) {
    const code = (q.code || sessionStorage.getItem('joinCode') || '').toUpperCase();
    const box = h('div');
    const inp = h('input', { class: 'inp', placeholder: 'AKHIL-7Q4K2M', value: code, style: 'text-transform:uppercase', autocapitalize: 'characters' });
    const look = async () => {
      box.textContent = '';
      const c = inp.value.trim().toUpperCase(); if (!c) return;
      const { data, error } = await sb.rpc('get_invite_preview', { p_code: c });
      const p = data?.[0];
      if (error || !p) { box.append(h('p', { class: 'red' }, "This code doesn't work. Ask for a new one.")); return; }
      sessionStorage.setItem('joinCode', c);
      box.append(h('div', { class: 'card' }, h('div', { class: 'mute' }, t('You are invited to')), h('h2', { style: 'color:var(--maroon)' }, p.wedding_name), h('span', { class: 'badge b-' + p.role }, t({ admin: 'Admin', family: 'Family', helper: 'Helper' }[p.role]))));
      if (S.user) box.append(h('button', { class: 'btn', onclick: async () => {
        try { await must(sb.rpc('accept_invite', { p_code: c })); sessionStorage.removeItem('joinCode'); await reloadAll(); toast('Welcome!'); location.hash = '#/home'; go(); } catch (e) { fail(e); }
      } }, t('Join')));
      else box.append(h('p', { class: 'mute' }, t('Log in or sign up first, then you will join automatically.')), h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => (location.hash = '#/signup') }, t('Sign up')), h('button', { class: 'btn ghost', onclick: () => (location.hash = '#/login') }, t('Log in'))));
    };
    plain(h('h1', null, t('Join a wedding')), h('label', { class: 'f' }, h('span', null, t('Invite code')), inp),
      h('button', { class: 'btn gold', style: 'margin-bottom:14px', onclick: look }, t('Check code')), box,
      S.user && h('button', { class: 'link', onclick: () => { location.hash = '#/home'; } }, t('Back')));
    if (code) look();
  },
  onboard() {
    const name = h('input', { class: 'inp', placeholder: 'Akhil & Sree' });
    const date = h('input', { class: 'inp', type: 'date' });
    plain(h('h1', null, t('Welcome') + (S.profile?.name ? ', ' + S.profile.name : '')), h('p', { class: 'mute' }, t('Start a new wedding, or join one with an invite code.')),
      h('div', { class: 'card' }, h('h2', { style: 'font-size:20px;margin-bottom:12px' }, t('Create wedding')),
        h('label', { class: 'f' }, h('span', null, t('Whose wedding is this?')), name),
        h('label', { class: 'f' }, h('span', null, t('Wedding date')), date),
        h('button', { class: 'btn', onclick: async () => {
          try {
            if (!name.value.trim()) throw new Error('Whose wedding is this?');
            await must(sb.rpc('create_wedding', { p_name: name.value, p_date: date.value || null }));
            await reloadAll(); location.hash = '#/home'; go();
          } catch (e) { fail(e); }
        } }, t('Create wedding'))),
      h('button', { class: 'btn ghost', onclick: () => (location.hash = '#/join') }, t('I have an invite code')),
      h('button', { class: 'link', onclick: async () => { await sb.auth.signOut(); location.hash = '#/login'; go(); } }, t('Log out')));
  },
};
