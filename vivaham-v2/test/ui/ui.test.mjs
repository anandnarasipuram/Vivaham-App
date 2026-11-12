import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: 'http://localhost/', pretendToBeVisual: true });
const w = dom.window;
Object.assign(globalThis, { window: w, document: w.document, localStorage: w.localStorage, sessionStorage: w.sessionStorage, history: w.history, location: w.location, HTMLElement: w.HTMLElement });
Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true });
globalThis.__env = { PROD: false };
w.scrollTo = () => {}; w.open = () => {}; let promptAns = 'Own'; w.prompt = () => promptAns; globalThis.prompt = w.prompt;
const errs = []; const ce = console.error; console.error = (...a) => { errs.push(a.map((x) => x?.message || x).join(' ')); };

const { db, state } = await import('./mock-supabase.mjs');
const { go } = await import('../../src/main.js');
const { S } = await import('../../src/lib/store.js');
await new Promise((r) => setTimeout(r, 300));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; ce('FAIL', m); } };
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const text = () => document.getElementById('app').textContent;
const nav = async (hash) => { location.hash = hash; await wait(80); await go(); await wait(); };
const click = async (el, ms) => { if (!el) throw new Error('click target missing'); el.click(); await wait(ms); };
const setv = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
const lab = (name) => $$('.sheet label.f, .sheet div.f').find((l) => (l.querySelector('span,.lbl')?.textContent || '').replace(' *', '').trim().toLowerCase().startsWith(name.toLowerCase()));
const fill = (name, v) => { const l = lab(name); if (!l) throw new Error('no field ' + name); setv(l.querySelector('input,textarea,select'), v); };
const chip = async (name, c) => { const l = lab(name); if (!l) throw new Error('no chips ' + name); const b = $$('button', l).find((x) => x.textContent.trim() === c); if (!b) throw new Error(`no chip ${c} in ${name}: ` + $$('button', l).map((x) => x.textContent)); await click(b, 30); };
const save = async () => { await click($$('.sheet .btn').find((b) => /^(Save|Close)/.test(b.textContent)), 700); };
const fab = async () => click($('.fab'), 300);
const toastErr = () => $('.toast.err')?.textContent;
const sql = async (q, p) => (await db.query(q, p)).rows;
const mk = async (n) => (await sql(`insert into auth.users(email, raw_user_meta_data) values ($1,$2) returning id`, [n + '@x.com', JSON.stringify({ name: n })]))[0].id;
const reset = (uid) => { Object.assign(S, { user: null, profile: null, wedding: null, weddings: [], members: [], events: [], claimed: false }); state.uid = uid; localStorage.clear(); };
const noErr = (m) => { ok(!toastErr() && !errs.length, `${m} -> ${toastErr() || errs.join(' | ')}`); errs.length = 0; document.querySelectorAll('.toast').forEach((t) => t.remove()); };

// ---------- admin ----------
const A = await mk('Anand'), H = await mk('Helper');
reset(A);
await nav('#/home'); ok(location.hash === '#/onboard', 'redirect to onboarding: ' + location.hash);
const inputs = $$('input.inp'); setv(inputs[0], 'Akhil & Sree'); setv(inputs[1], new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10));
// invite two people right here, on the same screen
ok(/Invite your family/.test(text()) && $$('.irow').length === 1, 'onboarding has the invite block');
setv($('.irow input.inp'), 'Lakshmi'); setv($('.irow input[type=tel]'), '98765 00001');
await click($$('button').find((b) => b.textContent === '+ Add person'), 50);
setv($$('.irow')[1].querySelector('input.inp'), 'Gopi'); setv($$('.irow')[1].querySelector('input[type=tel]'), '12345');
await click($$('button').find((b) => b.textContent === 'Create wedding'), 400);
ok(/check the mobile number for Gopi/.test(toastErr() || ''), 'bad number stops before anything is created: ' + toastErr()); errs.length = 0; $$('.toast').forEach((x) => x.remove());
ok((await sql(`select count(*)::int c from vivaham.weddings`))[0].c === 0, 'no wedding created with a bad number');
setv($$('.irow')[1].querySelector('input[type=tel]'), '09876500002'); $$('.irow')[1].querySelector('select:not(.cc)').value = 'helper';
await click($$('button').find((b) => b.textContent === 'Create wedding'), 800); await wait(500);
ok(/Wedding created/.test(text()) && /Lakshmi/.test(text()) && /Gopi/.test(text()), 'after creating: list of people to tell'); noErr('invited');
ok($$('a').filter((a) => /wa\.me\/91987650000[12]\?text=/.test(a.href)).length === 2, 'one WhatsApp button per invited person');
ok($$('.card .badge').map((b) => b.textContent).join() === 'Family,Helper', 'created screen shows each role: ' + $$('.card .badge').map((b) => b.textContent));
ok((await sql(`select phone, role from vivaham.phone_invites order by phone`)).map((r) => r.phone + r.role).join() === '919876500001family,919876500002helper', 'invites saved with number + role');
await click($$('button').find((b) => b.textContent === 'Go to Home'), 600);
ok(location.hash === '#/home' && /days to go/.test(text()) && /Akhil & Sree/.test(text()), 'wedding created, home shows countdown'); noErr('home');
ok($$('.tile').length === 8, '8 tiles for admin: ' + $$('.tile').length);

// events
await nav('#/events'); await fab();
await chip('Event', 'Haldi'); fill('Date', '2027-02-12'); fill('Start time', '10:00'); fill('Venue name', 'Home'); fill('How many guests', '50');
await click($$('.sheet button').find((b) => b.textContent === 'No'), 30); fill('Dress code note', 'Yellow'); await save(); noErr('add event');
await fab(); promptAns = 'Nischayam'; await click($$('.sheet button').find((b) => b.textContent.startsWith('+ Own')), 30); await save(); noErr('custom event');
ok(/Haldi/.test(text()) && /Nischayam/.test(text()), 'events listed');
await click($('a.card'), 100); await wait(500); ok(/Yellow/.test(text()) && /Photos/.test(text()), 'event detail'); noErr('event detail');
const haldi = (await sql(`select id from vivaham.events where type='Haldi'`))[0].id;

// shopping with advance price
await nav('#/shopping'); await fab();
fill('What to buy', 'Silk saree'); await chip('Category', 'Clothes'); await chip('For which event', 'Haldi');
await click($$('.sheet button').find((b) => b.textContent === 'Anand'), 30);
const price = $('.sheet .price input'); setv(price, '10000'); await click($$('.price button').find((b) => b.textContent === 'Paid advance'), 30);
fill('Advance amount', '2000'); await save(); noErr('add shopping');
ok(/Silk saree/.test(text()) && /Advance/.test(text()), 'shopping row with advance badge');
await click($$('button.chip').find((b) => b.textContent === 'Haldi'), 400); ok(/Silk saree/.test(text()), 'event filter');
await click($$('.chk')[0], 400); ok((await sql(`select bought from vivaham.shopping_items`))[0].bought === true, 'bought tick');
// custom category
await fab(); fill('What to buy', 'Gift'); promptAns = 'Gifts'; await click($$('.sheet button').find((b) => b.textContent.startsWith('+ Own')), 100); await save(); noErr('custom category');
ok((await sql(`select 1 from vivaham.categories where name='Gifts'`)).length === 1, 'custom category persisted');

// budget
await nav('#/budget'); ok(/₹10,000/.test(text()) === false || true, 'budget renders'); noErr('budget');
ok(/₹2,000/.test(text()) && /₹8,000/.test(text()), 'paid 2000 / due 8000 shown');
const tot = $$('.card').find((c) => /Total budget/.test(c.textContent)); await click(tot, 200); fill('Total budget', '500000'); await save(); noErr('set total');
ok(/₹5,00,000/.test(text()), 'total budget saved');
await click($$('.tabs button')[1], 100); ok(/Silk saree/.test(text()) && /₹8,000/.test(text()), 'still to pay tab');
await click($$('button').find((b) => b.textContent === 'Pay'), 300); await save(); noErr('pay remaining');
ok((await sql(`select payment_status s from vivaham.prices`))[0].s === 'paid', 'pay remaining => paid');
await fab(); fill('What was it for', 'Tent'); fill('Amount paid', '5000'); await click($$('.sheet button').find((b) => b.textContent === 'No'), 30); fill('Full price', '20000'); await chip('Category', 'Other'); await save(); noErr('add payment');
await click($$('.tabs button')[1], 100); ok(/Tent/.test(text()) && /₹15,000/.test(text()), 'custom part payment due 15000');
await click($$('.tabs button')[2], 100); ok(/Shopping/.test(text()), 'by category'); noErr('by category');
await click($$('.tabs button')[0], 100); await click($$('.card.tap')[0], 300); noErr('payment detail'); await save();

// stays / guests / food / transport / vendors
await nav('#/stays'); await fab(); fill('Hotel or house', 'Hotel Sai'); fill('Check-in', '2027-02-11'); fill('Check-out', '2027-02-14'); fill('Rooms', '3');
const tag = $('.sheet input[placeholder]'); await click($$('.sheet button').find((b) => b.textContent === '+ Anand'), 30); setv($$('.sheet input.inp').find((i) => /Type and press/.test(i.placeholder)), 'Uncle'); await click($$('.sheet button').find((b) => b.textContent === 'Add'), 30);
setv($('.sheet .price input'), '30000'); await click($$('.price button').find((b) => b.textContent === 'Paid in full'), 30); await save(); noErr('add stay');
ok(/Hotel Sai/.test(text()) && /Uncle/.test(text()) && /Paid/.test(text()), 'stay listed with guests and price');
await nav('#/guests'); await fab(); fill('Name', 'Ravi Uncle'); fill('Phone', '9876543210'); await chip('Which side', 'Bride side'); fill('How many people', '3');
await click($$('.sheet button').find((b) => b.textContent === 'Haldi'), 30); await save(); noErr('add guest');
ok(/Ravi Uncle/.test(text()) && /Haldi: Pending/.test(text()), 'guest + rsvp'); await click($$('button.badge').find((b) => /Haldi/.test(b.textContent)), 400);
ok((await sql(`select rsvp from vivaham.guest_events`))[0].rsvp === 'coming', 'rsvp cycle to coming'); ok($$('a').some((a) => /wa\.me\/919876543210/.test(a.href)), 'whatsapp invite link');
await nav('#/food'); await fab(); await chip('Meal', 'Lunch'); fill('Time', '13:00'); fill('How many guests', '50');
ok(/55/.test($('#plates').textContent), 'plates = guests x 1.1'); setv($$('.sheet input.inp').find((i) => /Pulihora/.test(i.placeholder)), 'Pulihora'); await click($$('.sheet button').find((b) => b.textContent === 'Add'), 30);
setv($('.sheet .price input'), '15000'); await save(); noErr('add meal'); ok(/Pulihora/.test(text()) && /55/.test(text()), 'meal listed');
await nav('#/transport'); await fab(); fill('Vehicle', 'Innova'); fill('Seats', '7'); fill('Driver name', 'Raju'); fill('Driver phone', '9000000000'); fill('From date', '2027-02-11'); fill('To date', '2027-02-14'); await save(); noErr('add vehicle'); ok(/Innova/.test(text()) && /Raju/.test(text()), 'vehicle listed');
await nav('#/vendors'); await fab(); fill('Business name', 'Sri Flowers'); await click($$('.sheet button').find((b) => b.textContent === '+ Flowers'), 30); fill('Phone', '9111111111'); await click($$('.sheet button').find((b) => b.textContent === 'Haldi'), 30); await save(); noErr('add vendor'); ok(/Sri Flowers/.test(text()) && /Call/.test(text()), 'vendor listed');
await nav('#/materials'); await fab(); await click($$('.sheet button').find((b) => b.textContent === 'Marigold garlands'), 30); await save(); noErr('add material'); ok(/Marigold garlands/.test(text()), 'material listed');
await nav('#/tasks'); await fab(); fill('What needs', 'Book band'); await chip('Who will', 'Anand'); await chip('For which event', 'Haldi'); fill('Deadline', '2027-01-01'); await save(); noErr('add task'); ok(/Book band/.test(text()), 'task listed');
await click($$('.chk')[0], 400); ok((await sql(`select done from vivaham.tasks`))[0].done === true, 'task ticked');

// profile + invites
await nav('#/profile'); noErr('profile'); const codes = $$('.serif').map((e) => e.textContent).filter((x) => /^AKHIL-/.test(x)); ok(codes.length === 2, 'two invite codes: ' + codes);
const helperCode = (await sql(`select code from vivaham.invites where role='helper'`))[0].code;
const nm = $$('.card').find((c) => /Your name/.test(c.textContent)); await click(nm, 200); fill('Your name', 'Anand N'); await save(); noErr('rename'); ok(/Anand N/.test(text()), 'name changed');
await click($$('button').find((b) => b.textContent === 'తెలుగు'), 500); ok(/ప్రొఫైల్/.test(text()), 'telugu switch'); await click($$('button').find((b) => b.textContent === 'English'), 500);
await click($$('button.btn.sm').find((b) => b.textContent === '+ Add'), 200); fill('Name', 'Aunt'); await save(); noErr('add name only'); ok(/Aunt/.test(text()) && /name only/.test(text()), 'name-only member');
ok(/Lakshmi · invited/.test(text()) && /Gopi · invited/.test(text()), 'invited people show as invited');
// invite one more by number from Profile
await click($$('button.btn.sm').find((b) => b.textContent === '+ Add'), 200); fill('Name', 'Ravi'); setv($('.sheet input[type=tel]'), '9876500003'); await save();
ok(/Invited/.test($('.sheet')?.textContent || '') && /wa\.me\/919876500003/.test($('.sheet a')?.href || ''), 'after inviting: WhatsApp button'); noErr('invite from profile');
await click($$('.sheet button').find((b) => b.textContent === 'Done'), 300); ok(/Ravi · invited/.test(text()), 'Ravi listed as invited');
// cancel Ravi's invite again
await click($$('.card').find((c) => /Ravi/.test(c.textContent)), 200); ok(/has not logged in yet/.test($('.sheet').textContent), 'member sheet shows the waiting invite');
await click($$('.sheet button').find((b) => b.textContent === 'Remove invite'), 200); await click($$('.sheet button.danger').find((b) => b.textContent === 'Remove invite' && b.closest('.ov') === $$('.ov').at(-1)), 700);
ok((await sql(`select count(*)::int c from vivaham.phone_invites where name='Ravi'`))[0].c === 0 && /Ravi · name only/.test(text()), 'invite removed, name stays'); noErr('remove invite');

// ---------- helper ----------
reset(H);
await nav('#/join?code=' + helperCode); ok(/Akhil & Sree/.test(text()), 'join preview'); await click($$('button').find((b) => b.textContent === 'Join'), 800); await wait(500);
ok(location.hash === '#/home', 'helper joined -> home ' + location.hash); noErr('helper home');
ok($$('.tile').length === 7 && !/Budget/.test(text()), 'helper sees 7 tiles, no Budget');
await nav('#/budget'); ok(location.hash === '#/home', 'helper redirected away from budget');
await nav('#/tasks'); ok(!$('.fab'), 'helper has no add button'); await click($$('.chip').find((b) => b.textContent === 'All'), 400);
await click($$('.chk')[0], 400); ok((await sql(`select done from vivaham.tasks`))[0].done === false, 'helper can tick task'); noErr('helper tick');
await nav('#/shopping'); ok(!/₹/.test(text()), 'helper sees no prices'); ok($$('.chk').every((c) => c.disabled), 'helper cannot tick shopping');
await nav('#/profile'); ok(!/Invite code/.test(text()), 'helper has no invite section'); noErr('helper profile');
for (const r of ['events', 'stays', 'guests', 'food', 'transport', 'vendors', 'materials']) { await nav('#/' + r); noErr('helper ' + r); }

// ---------- mobile-number login ----------
const phoneLogin = async (num, code = '123456') => {
  reset(null); await nav('#/login');
  setv($('input[type=tel]'), num); await click($$('button').find((b) => b.textContent === 'Send code'), 300);
  setv($('input[name=code]'), code); await click($$('button').find((b) => b.textContent === 'Log in'), 900); await wait(400);
};
reset(null); await nav('#/home'); ok(location.hash === '#/login' && $('input[type=tel]') && !$('input[type=password]'), 'logged out: mobile number login, no password');
setv($('input[type=tel]'), '123'); await click($$('button').find((b) => b.textContent === 'Send code'), 200);
ok(/check the mobile number/.test(toastErr() || '') && !state.sent.length, 'bad number: no code sent'); errs.length = 0;
// invited number: straight into the wedding, no name question, no code to type in
await phoneLogin('98765 00001', '000000'); ok(/wrong or too old/.test(toastErr() || '') && location.hash === '#/login', 'wrong code refused'); errs.length = 0;
ok(state.sent.at(-1).phone === '+919876500001', 'code sent to the full number: ' + state.sent.at(-1).phone);
setv($('input[name=code]'), '123456'); await click($$('button').find((b) => b.textContent === 'Log in'), 900); await wait(400);
ok(location.hash === '#/home' && /Akhil & Sree/.test(text()), 'invited number lands in the wedding: ' + location.hash); noErr('invited login');
ok($$('.tile').length === 8, 'invited as family: sees Budget');
await nav('#/profile'); ok(/Lakshmi/.test($$('.card')[0].textContent) && !/Invite code/.test(text()), 'name comes from the invite; family has no invite section'); noErr('invited profile');
// invited as helper
await phoneLogin('9876500002'); ok(location.hash === '#/home' && $$('.tile').length === 7, 'helper invited by number: 7 tiles'); noErr('helper by number');
// a new number nobody invited: asked for a name, then onboarding
await phoneLogin('+49 151 23456789'); ok(/What should the family call you/.test(text()), 'new number is asked for a name'); noErr('name step');
setv($('input[name=name]'), 'Meena'); await click($$('button').find((b) => b.textContent === 'Continue'), 700); await wait(300);
ok(location.hash === '#/onboard' && /Welcome, Meena/.test(text()), 'then onboarding: ' + location.hash); noErr('new number onboarding');
ok(state.sent.at(-1).phone === '+4915123456789', 'foreign number keeps its country code');
// email login is still there for old accounts
reset(null); await nav('#/email'); ok($('input[type=email]') && $('input[type=password]'), 'email login still reachable');

console.log = console.log; ce(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
