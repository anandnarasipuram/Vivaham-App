import { sb, must } from '../lib/supabase.js';
import { S } from '../lib/store.js';
import { h, toast, fail } from '../lib/ui.js';
import { t, setLang, getLang } from '../lib/i18n.js';
import { plain, go, afterAuthRedirect, reloadAll, endRecovery } from '../main.js';
import { phoneInput, prettyPhone, canPickContacts, pickContacts, inviteText } from '../lib/phone.js';
import { waUrl } from '../lib/format.js';

const langBar = () => h('div', { class: 'row', style: 'justify-content:flex-end;margin-bottom:10px' },
  ...[['en', 'English'], ['te', 'తెలుగు']].map(([l, n]) => h('button', { class: 'chip' + (getLang() === l ? ' on' : ''), onclick: () => { setLang(l); go(); } }, n)));
const field = (label, props) => h('label', { class: 'f' }, h('span', null, t(label)), h('input', { class: 'inp', ...props }));
const link = (txt, hash) => h('button', { class: 'link', onclick: () => (location.hash = hash) }, txt);
const val = (root, n) => root.querySelector(`[name=${n}]`).value.trim();

async function afterLogin() {
  S.profile = null; S.wedding = null; S.claimed = false;
  afterAuthRedirect();
}

// The login code goes out by SMS, or by WhatsApp when VITE_OTP_CHANNEL=whatsapp (needs Twilio in Supabase).
const CHANNEL = import.meta.env.VITE_OTP_CHANNEL === 'whatsapp' ? 'whatsapp' : 'sms';
const RESEND_SECONDS = 60;
let otp = null; // { phone, at } once a code has been sent
const otpError = (m, checking) => new Error(
  /unsupported phone provider|phone (logins|signups) are disabled|provider is not enabled|sms provider/i.test(m) ? 'Mobile login is not switched on yet. Please use email for now.'
  : /rate limit|only request this after/i.test(m) ? 'Too many tries. Please wait a minute and try again.'
  : checking && /expired|invalid/i.test(m) ? 'That code is wrong or too old. Check it, or get a new code.'
  : m);
async function sendCode(phone) {
  const { error } = await sb.auth.signInWithOtp({ phone, options: { channel: CHANNEL } });
  if (error) throw otpError(error.message);
  otp = { phone, at: Date.now() };
}

export const screens = {
  login() {
    const head = [langBar(), h('h1', null, 'Vivaham'), h('p', { class: 'mute' }, t('Plan the whole wedding together.'))];
    if (!otp) {
      const ph = phoneInput({ name: 'phone' });
      const btn = h('button', { class: 'btn', type: 'submit' }, t('Send code'));
      const f = h('form', { onsubmit: async (e) => {
        e.preventDefault();
        try {
          const phone = ph.get();
          if (!phone) throw new Error('Please check the mobile number.');
          btn.disabled = true;
          await sendCode(phone); go();
        } catch (er) { btn.disabled = false; fail(er); }
      } },
        h('label', { class: 'f' }, h('span', null, t('Mobile number')), ph.el),
        h('p', { class: 'mute', style: 'margin:-6px 0 14px' }, t(CHANNEL === 'whatsapp' ? 'We send a 6-digit code to your WhatsApp.' : 'We send a 6-digit code by SMS.')),
        btn);
      plain(...head, f,
        h('div', { class: 'row between', style: 'margin-top:12px' }, link(t('I have an invite code'), '#/join'), link(t('Use email instead'), '#/email')));
      return;
    }
    const phone = otp.phone;
    const code = h('input', { class: 'inp otp', name: 'code', inputMode: 'numeric', autocomplete: 'one-time-code', maxLength: 6, placeholder: '••••••', required: true });
    const btn = h('button', { class: 'btn', type: 'submit' }, t('Log in'));
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        const token = code.value.replace(/\D/g, '');
        if (token.length !== 6) throw new Error('The code has 6 digits.');
        btn.disabled = true;
        const { data, error } = await sb.auth.verifyOtp({ phone, token, type: 'sms' });
        if (error) throw otpError(error.message, true);
        otp = null;
        S.user = data?.user || (await sb.auth.getUser()).data.user; await afterLogin();
      } catch (er) { btn.disabled = false; fail(er); }
    } },
      h('label', { class: 'f' }, h('span', null, t('Code')), code), btn);
    const again = h('button', { class: 'link', type: 'button', onclick: async () => {
      try { again.disabled = true; await sendCode(phone); toast(t('New code sent.')); tick(); } catch (er) { fail(er); tick(); }
    } });
    const tick = () => {
      const left = Math.ceil(RESEND_SECONDS - (Date.now() - (otp?.at || 0)) / 1000);
      again.disabled = left > 0;
      again.textContent = left > 0 ? `${t('Send again')} (${left})` : t('Send again');
      if (left > 0 && again.isConnected) setTimeout(tick, 1000);
    };
    plain(...head, h('p', null, t('Enter the code we sent to'), ' ', h('b', null, prettyPhone(phone))), f,
      h('div', { class: 'row between', style: 'margin-top:12px' }, again, h('button', { class: 'link', type: 'button', onclick: () => { otp = null; go(); } }, t('Change number'))));
    tick(); code.focus();
  },
  // first login with a mobile number: we only know the number, so ask what to call them
  name() {
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        const n = val(f, 'name');
        if (!n) throw new Error('Please type your name.');
        await must(sb.rpc('update_my_name', { p_name: n }));
        S.profile.name = n; go();
      } catch (er) { fail(er); }
    } },
      field('Your name', { name: 'name', required: true, autocomplete: 'name', placeholder: 'Lakshmi' }),
      h('button', { class: 'btn', type: 'submit' }, t('Continue')));
    plain(langBar(), h('h1', null, t('Welcome')), h('p', { class: 'mute' }, t('What should the family call you?')), f,
      h('button', { class: 'link', onclick: async () => { await sb.auth.signOut(); location.hash = '#/login'; go(); } }, t('Log out')));
  },
  email() {
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
    plain(langBar(), h('h1', null, t('Log in with email')), f,
      h('div', { class: 'row between', style: 'margin-top:12px' }, link(t('Forgot password?'), '#/forgot'), link(t('Create account'), '#/signup')),
      link(t('Use mobile number instead'), '#/login'));
  },
  signup() {
    const f = h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        if (f.password.value.length < 6) throw new Error('Password needs at least 6 characters.');
        const { data, error } = await sb.auth.signUp({ email: val(f, 'email'), password: f.password.value, options: { data: { name: val(f, 'name') }, emailRedirectTo: location.origin } });
        if (error) throw new Error(error.message);
        if (!data.session) { toast('Check your email and tap the link to confirm, then log in.'); location.hash = '#/email'; return; }
        S.user = data.user; await afterLogin();
      } catch (er) { fail(er); }
    } },
      field('Your name', { name: 'name', required: true, autocomplete: 'name' }),
      field('Email', { name: 'email', type: 'email', required: true, autocomplete: 'email' }),
      field('Password', { name: 'password', type: 'password', required: true, autocomplete: 'new-password', minLength: 6 }),
      h('button', { class: 'btn', type: 'submit' }, t('Sign up')));
    plain(langBar(), h('h1', null, t('Create account')), f, link(t('I already have an account'), '#/email'));
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
    plain(langBar(), h('h1', null, t('Forgot password?')), f, link(t('Back to log in'), '#/email'));
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
      else box.append(h('p', { class: 'mute' }, t('Log in first, then you will join automatically.')),
        h('button', { class: 'btn', onclick: () => (location.hash = '#/login') }, t('Log in with mobile number')),
        h('div', { style: 'text-align:center;margin-top:8px' }, link(t('Use email instead'), '#/email')));
    };
    plain(h('h1', null, t('Join a wedding')), h('label', { class: 'f' }, h('span', null, t('Invite code')), inp),
      h('button', { class: 'btn gold', style: 'margin-bottom:14px', onclick: look }, t('Check code')), box,
      S.user && h('button', { class: 'link', onclick: () => { location.hash = '#/home'; } }, t('Back')));
    if (code) look();
  },
  onboard() {
    const name = h('input', { class: 'inp', placeholder: 'Akhil & Sree' });
    const date = h('input', { class: 'inp', type: 'date' });
    const rows = [];
    const list = h('div');
    const addRow = (c = {}) => {
      const nm = h('input', { class: 'inp', placeholder: t('Name'), value: c.name || '', autocomplete: 'off' });
      const ph = phoneInput();
      if (c.phone) { if (c.phone.startsWith('+')) ph.set('+' + c.phone.replace(/\D/g, '')); else ph.inp.value = c.phone; }
      const role = h('select', { class: 'inp', 'aria-label': t('Role') }, ...[['family', 'Family'], ['helper', 'Helper'], ['admin', 'Admin']].map(([v, l]) => h('option', { value: v }, t(l))));
      const row = { nm, ph, role };
      row.el = h('div', { class: 'irow' }, nm, ph.el, h('div', { class: 'row' }, role,
        h('button', { type: 'button', class: 'btn sm danger', 'aria-label': t('Remove'), onclick: () => { rows.splice(rows.indexOf(row), 1); row.el.remove(); } }, '✕')));
      rows.push(row); list.append(row.el);
      return row;
    };
    const create = h('button', { class: 'btn', onclick: async () => {
      try {
        if (!name.value.trim()) throw new Error('Whose wedding is this?');
        const people = [];
        for (const r of rows) {
          const n = r.nm.value.trim(), raw = r.ph.raw();
          if (!n && !raw) continue;
          if (!n) throw new Error('Add a name for ' + raw + '.');
          const phone = r.ph.get();
          if (!phone) throw new Error(`Please check the mobile number for ${n}.`);
          if (people.some((p) => p.phone === phone)) throw new Error(`${prettyPhone(phone)} is in the list twice.`);
          if (people.some((p) => p.name.toLowerCase() === n.toLowerCase())) throw new Error(`${n} is in the list twice.`);
          people.push({ name: n, phone, role: r.role.value });
        }
        create.disabled = true;
        const id = await must(sb.rpc('create_wedding', { p_name: name.value, p_date: date.value || null }));
        for (const p of people) {
          const { error } = await sb.rpc('invite_phone', { p_wedding: id, p_name: p.name, p_phone: p.phone, p_role: p.role });
          if (error) p.error = error.message;
        }
        localStorage.setItem('wedding', id);
        await reloadAll();
        if (!people.length) { location.hash = '#/home'; go(); return; }
        invited(name.value.trim(), people);
      } catch (e) { create.disabled = false; fail(e); }
    } }, t('Create wedding'));
    plain(h('h1', null, t('Welcome') + (S.profile?.name ? ', ' + S.profile.name : '')), h('p', { class: 'mute' }, t('Start a new wedding, or join one with an invite code.')),
      h('div', { class: 'card' }, h('h2', { style: 'font-size:20px;margin-bottom:12px' }, t('Create wedding')),
        h('label', { class: 'f' }, h('span', null, t('Whose wedding is this?')), name),
        h('label', { class: 'f' }, h('span', null, t('Wedding date')), date),
        h('div', { class: 'lbl' }, t('Invite your family')),
        h('p', { class: 'mute', style: 'margin:0 0 10px' }, t('Add their mobile numbers. They log in with that number and are inside straight away. You can also do this later in Profile.')),
        list,
        h('div', { class: 'row', style: 'margin-bottom:14px' },
          h('button', { type: 'button', class: 'btn sm ghost', onclick: () => addRow().nm.focus() }, '+ ' + t('Add person')),
          canPickContacts() && h('button', { type: 'button', class: 'btn sm ghost', onclick: async () => {
            const picked = await pickContacts();
            if (!picked.length) return;
            rows.filter((r) => !r.nm.value.trim() && !r.ph.raw()).forEach((r) => { rows.splice(rows.indexOf(r), 1); r.el.remove(); });
            picked.forEach((c) => addRow(c));
          } }, t('Pick from contacts'))),
        create),
      h('button', { class: 'btn ghost', onclick: () => (location.hash = '#/join') }, t('I have an invite code')),
      h('button', { class: 'link', onclick: async () => { await sb.auth.signOut(); location.hash = '#/login'; go(); } }, t('Log out')));
    addRow();
  },
};

// after "Create wedding": one tap per person sends them the invite on WhatsApp
function invited(wedding, people) {
  const ok = people.filter((p) => !p.error), bad = people.filter((p) => p.error);
  plain(h('h1', null, t('Wedding created') + ' 🎉'),
    ok.length ? h('p', { class: 'mute' }, t('Now tell them. Tap WhatsApp next to each name. They log in with their mobile number and are inside.')) : null,
    ...ok.map((p) => h('div', { class: 'card row between' },
      h('div', { class: 'grow' }, h('b', null, p.name), ' ', h('span', { class: 'badge b-' + p.role }, t({ admin: 'Admin', family: 'Family', helper: 'Helper' }[p.role])), h('div', { class: 'mute' }, prettyPhone(p.phone))),
      h('a', { class: 'btn sm gold', style: 'text-decoration:none', href: waUrl(p.phone, inviteText(wedding, p.phone, S.profile?.name)), target: '_blank', rel: 'noopener' }, 'WhatsApp'))),
    ...bad.map((p) => h('div', { class: 'card' }, h('b', null, p.name), h('div', { class: 'red small' }, p.error), h('div', { class: 'mute' }, t('Not invited. You can add them again in Profile.')))),
    h('button', { class: 'btn', style: 'margin-top:8px', onclick: () => { location.hash = '#/home'; go(); } }, t('Go to Home')));
}
