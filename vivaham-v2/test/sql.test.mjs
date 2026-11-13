import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const db = new PGlite();
const stub = `
create schema auth; create schema storage;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, phone text, phone_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create role anon nologin; create role authenticated nologin;
grant usage on schema auth, storage to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
`;
await db.exec(stub);
// every migration, in file-name order
const sql = fs.readdirSync(new URL('../supabase/migrations/', import.meta.url)).filter((f) => f.endsWith('.sql')).sort().map((f) => fs.readFileSync(new URL('../supabase/migrations/' + f, import.meta.url), 'utf8')).join('\n');
await db.exec(sql);
await db.exec(sql); // idempotent

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const as = async (uid, q, params = []) => {
  await db.exec(`set app.uid = '${uid ?? ''}'; set role ${uid ? 'authenticated' : 'anon'};`);
  try { return { r: await db.query(q, params) }; }
  catch (e) { return { e: e.message }; }
  finally { await db.exec('reset role;'); }
};
const mk = async (name) => (await db.query(`insert into auth.users(email, raw_user_meta_data) values ($1, $2) returning id`, [name + '@x.com', JSON.stringify({ name })])).rows[0].id;

const A = await mk('Anand'), F = await mk('Fam'), H = await mk('Helper'), X = await mk('Stranger');
const prof = await db.query('select name from vivaham.profiles order by name');
ok(prof.rows.length === 4, 'profiles auto-created');

let w = (await as(A, `select vivaham.create_wedding('Akhil & Sree', '2027-02-14') as id`)).r.rows[0].id;
ok(!!w, 'create_wedding');
ok((await as(A, 'select * from vivaham.my_weddings()')).r.rows[0].role === 'admin', 'creator is admin');

// invites
const invF = (await as(A, `select * from vivaham.get_invite($1,'family')`, [w])).r.rows[0];
const invH = (await as(A, `select * from vivaham.get_invite($1,'helper')`, [w])).r.rows[0];
ok(/^AKHIL-[A-Z2-9]{6}$/.test(invF.code), 'invite code format ' + invF.code);
ok((await as(null, `select * from vivaham.get_invite_preview($1)`, [invF.code.toLowerCase()])).r.rows[0].role === 'family', 'anon preview');
ok((await as(F, `select * from vivaham.get_invite($1,'family')`, [w])).e, 'non-admin cannot get invite');
ok((await as(F, `select vivaham.accept_invite($1)`, [invF.code])).r, 'accept family');
ok((await as(H, `select vivaham.accept_invite($1)`, [invH.code])).r, 'accept helper');
ok((await as(X, `select vivaham.accept_invite('NOPE-123456')`)).e, 'bad code rejected');
const rot = (await as(A, `select * from vivaham.get_invite($1,'family',true)`, [w])).r.rows[0];
ok(rot.code !== invF.code, 'rotate changes code');
ok((await as(X, `select vivaham.accept_invite($1)`, [invF.code])).e, 'old code dead');
ok((await as(X, 'select * from vivaham.events')).r.rows.length === 0, 'stranger sees nothing');

// events
const ev = (await as(F, `insert into vivaham.events(wedding_id,type,event_date,start_time,venue_name,guests,dress_code,dress_note) values ($1,'Haldi','2027-02-12','10:00','Home',50,true,'Yellow') returning id`, [w])).r.rows[0].id;
ok(ev, 'family adds event');
ok((await as(H, `insert into vivaham.events(wedding_id,type) values ($1,'X')`, [w])).e, 'helper cannot add event');
ok((await as(X, `insert into vivaham.events(wedding_id,type) values ($1,'X')`, [w])).e, 'stranger cannot add event');

// tasks / materials: helper can tick only
const t = (await as(F, `insert into vivaham.tasks(wedding_id,title,event_id) values ($1,'Book band',$2) returning id`, [w, ev])).r.rows[0].id;
ok((await as(H, `update vivaham.tasks set done=true where id=$1`, [t])).r, 'helper ticks task');
ok((await as(H, `update vivaham.tasks set title='x' where id=$1`, [t])).e, 'helper cannot edit task title');
const m = (await as(F, `insert into vivaham.materials(wedding_id,event_id,name) values ($1,null,'Marigold') returning id`, [w])).r.rows[0].id;
ok((await as(H, `update vivaham.materials set done=true where id=$1`, [m])).r, 'helper ticks material');
ok((await as(H, `delete from vivaham.materials where id=$1`, [m])).r.affectedRows === 0, 'helper cannot delete material');

// shopping + price
const si = (await as(F, `insert into vivaham.shopping_items(wedding_id,name,category,event_id) values ($1,'Saree','Clothes',$2) returning id`, [w, ev])).r.rows[0].id;
const mem = (await as(A, `select id from vivaham.members where user_id=$1`, [A])).r.rows[0].id;
ok((await as(H, `select vivaham.save_price('shopping',$1,1000,'full',null,null,'upi',current_date)`, [si])).e, 'helper cannot save price');
ok((await as(F, `select vivaham.save_price('shopping',$1,10000,'adv',2000,$2,'cash',current_date)`, [si, mem])).r, 'advance price');
let pr = (await as(F, `select payment_status, price from vivaham.prices where source_id=$1`, [si])).r.rows[0];
ok(pr.payment_status === 'advance' && Number(pr.price) === 10000, 'status advance');
ok((await as(H, `select * from vivaham.prices`)).r.rows.length === 0, 'helper sees no prices');
ok((await as(H, `select * from vivaham.payments`)).r.rows.length === 0, 'helper sees no payments');
let bud = (await as(F, `select vivaham.budget_summary($1) as s`, [w])).r.rows[0].s;
ok(bud.paid == 2000 && bud.still_to_pay == 8000, 'budget after advance ' + JSON.stringify(bud));
ok((await as(H, `select vivaham.budget_summary($1)`, [w])).e, 'helper cannot see budget summary');
// pay the rest as a budget payment tied to the booking
ok((await as(F, `insert into vivaham.payments(wedding_id,title,category,amount,source_type,source_id,origin) values ($1,'Saree rest','Shopping',8000,'shopping',$2,'budget')`, [w, si])).r, 'pay rest');
pr = (await as(F, `select payment_status from vivaham.prices where source_id=$1`, [si])).r.rows[0];
ok(pr.payment_status === 'paid', 'status paid');
// re-saving price in "full" replaces booking payments but keeps budget ones
await as(F, `select vivaham.save_price('shopping',$1,10000,'no')`, [si]);
bud = (await as(F, `select vivaham.budget_summary($1) as s`, [w])).r.rows[0].s;
ok(bud.paid == 8000 && bud.still_to_pay == 2000, 'resave keeps budget payments ' + JSON.stringify(bud));
// delete item cleans price + booking payments
await as(F, `delete from vivaham.shopping_items where id=$1`, [si]);
ok((await db.query(`select count(*)::int c from vivaham.prices`)).rows[0].c === 0, 'price cleaned');

// custom part payment
await as(F, `insert into vivaham.payments(wedding_id,title,category,amount,total_price) values ($1,'Tent','Other',5000,20000)`, [w]);
bud = (await as(F, `select vivaham.budget_summary($1) as s`, [w])).r.rows[0].s;
ok(bud.still_to_pay == 15000, 'custom total counted ' + JSON.stringify(bud));
ok((await as(F, `select * from vivaham.v_bookings`)).r.rows.length === 1, 'v_bookings row');

// members
ok((await as(F, `insert into vivaham.members(wedding_id,name,role) values ($1,'Aunt','helper')`, [w])).r, 'family adds name-only member');
ok((await as(F, `insert into vivaham.members(wedding_id,name,role) values ($1,'Boss','admin')`, [w])).e, 'family cannot add admin');
ok((await as(F, `update vivaham.members set role='admin' where user_id=$1`, [F])).r.affectedRows === 0, 'family cannot promote self');
ok((await as(A, `update vivaham.members set role='family' where user_id=$1`, [A])).e, 'last admin guard (update)');
ok((await as(A, `delete from vivaham.members where user_id=$1`, [A])).e, 'last admin guard (delete)');
// name-only member becomes account on join
const Y = await mk('Aunt');
const inv2 = (await as(A, `select * from vivaham.get_invite($1,'family')`, [w])).r.rows[0];
await as(Y, `select vivaham.accept_invite($1)`, [inv2.code]);
const auntRows = (await db.query(`select user_id, role from vivaham.members where lower(name)='aunt'`)).rows;
ok(auntRows.length === 1 && auntRows[0].user_id === Y && auntRows[0].role === 'family', 'name-only linked');

// rename
await as(Y, `select vivaham.update_my_name('Auntie')`);
ok((await db.query(`select 1 from vivaham.members where name='Auntie'`)).rows.length === 1, 'rename propagates');

// wedding edits
ok((await as(F, `update vivaham.weddings set name='Hack' where id=$1`, [w])).r.affectedRows === 0, 'family cannot rename wedding');
ok((await as(A, `update vivaham.weddings set name='Akhil & Sree 2' where id=$1`, [w])).r.affectedRows === 1, 'admin renames wedding');

// guests / rsvp / meals / stays / vehicles / vendors basic
const g = (await as(F, `insert into vivaham.guests(wedding_id,name,side,people) values ($1,'Uncle','bride',3) returning id`, [w])).r.rows[0].id;
ok((await as(F, `insert into vivaham.guest_events(guest_id,event_id,wedding_id,rsvp) values ($1,$2,$3,'coming')`, [g, ev, w])).r, 'rsvp');
const meal = (await as(F, `insert into vivaham.meals(wedding_id,event_id,meal,meal_time,dishes,guests) values ($1,$2,'Lunch','13:00','{Rice,Dal}',50) returning id`, [w, ev])).r.rows[0].id;
ok((await as(F, `select vivaham.save_price('meal',$1,15000,'full',null,$2,'upi',current_date)`, [meal, mem])).r, 'meal price');
const st = (await as(F, `insert into vivaham.stays(wedding_id,name,check_in,check_out,rooms) values ($1,'Hotel','2027-02-11','2027-02-14',3) returning id`, [w])).r.rows[0].id;
ok((await as(F, `insert into vivaham.stay_guests(wedding_id,stay_id,name) values ($1,$2,'Uncle')`, [w, st])).r, 'stay guest');
ok((await as(F, `insert into vivaham.stays(wedding_id,name,check_in,check_out) values ($1,'Bad','2027-02-14','2027-02-11')`, [w])).e, 'stay date check');
const ve = (await as(F, `insert into vivaham.vehicles(wedding_id,name,seats) values ($1,'Innova',7) returning id`, [w])).r.rows[0].id;
const vd = (await as(F, `insert into vivaham.vendors(wedding_id,name,services) values ($1,'Flowers','{Decor}') returning id`, [w])).r.rows[0].id;
ok((await as(F, `select vivaham.save_price('vendor',$1,5000,'no')`, [vd])).r, 'vendor price');
ok((await as(F, `select vivaham.save_price('vehicle',$1,3000,'adv',1000,null,'cash',current_date)`, [ve])).r, 'vehicle price');
bud = (await as(F, `select vivaham.budget_summary($1) as s`, [w])).r.rows[0].s;
ok(bud.by_category.length === 6, 'by category rows');
ok((await as(F, `delete from vivaham.events where id=$1`, [ev])).r, 'delete event cascades');
ok((await db.query(`select count(*)::int c from vivaham.meals`)).rows[0].c === 0, 'meals cascaded');
// ---- invite by mobile number ----
const mkPhone = async (phone, confirmed = true) => (await db.query(`insert into auth.users(phone, phone_confirmed_at) values ($1, $2) returning id`, [phone, confirmed ? new Date().toISOString() : null])).rows[0].id;
ok((await as(F, `select vivaham.invite_phone($1,'Lakshmi','+919876500001','family')`, [w])).e, 'family cannot invite by number');
ok((await as(A, `select vivaham.invite_phone($1,'Lakshmi','12345','family')`, [w])).e, 'bad number rejected');
ok((await as(A, `select vivaham.invite_phone($1,'Lakshmi','+91 98765 00001','family')`, [w])).r, 'admin invites by number');
ok((await db.query(`select phone from vivaham.phone_invites`)).rows[0].phone === '919876500001', 'number stored as digits with country code');
ok((await db.query(`select user_id, role from vivaham.members where name='Lakshmi'`)).rows[0].user_id === null, 'invited person waits as a name');
ok((await as(A, `select vivaham.invite_phone($1,'Someone','+919876500001','helper')`, [w])).e, 'same number cannot be invited twice');
ok((await as(A, `select vivaham.invite_phone($1,'Lakshmi','+919876500009','helper')`, [w])).e, 'same waiting name cannot get a second number');
ok((await as(A, `select vivaham.invite_phone($1,'Fam','+919876500008','helper')`, [w])).e, 'name of someone with a login is refused');
ok((await as(F, `select * from vivaham.phone_invites`)).r.rows.length === 0, 'family cannot see invited numbers');
ok((await as(A, `select * from vivaham.phone_invites`)).r.rows.length === 1, 'admin sees invited numbers');
// a number that was never confirmed with a code gets nothing
const U = await mkPhone('919876500001', false);
ok((await as(U, `select vivaham.claim_phone_invites() as j`)).r.rows[0].j.length === 0, 'unconfirmed number cannot claim');
await db.query(`delete from auth.users where id=$1`, [U]);
// a stranger's number gets nothing
const S2 = await mkPhone('919000000000');
ok((await as(S2, `select vivaham.claim_phone_invites() as j`)).r.rows[0].j.length === 0, 'other number joins nothing');
ok((await as(S2, 'select * from vivaham.my_weddings()')).r.rows.length === 0, 'other number is in no wedding');
// the invited number logs in: inside, with the role and the name the admin typed
const L = await mkPhone('919876500001');
const joined = (await as(L, `select vivaham.claim_phone_invites() as j`)).r.rows[0].j;
ok(joined.length === 1 && joined[0].wedding_id === w, 'invited number joins on login ' + JSON.stringify(joined));
const lrow = (await db.query(`select user_id, role from vivaham.members where name='Lakshmi'`)).rows;
ok(lrow.length === 1 && lrow[0].user_id === L && lrow[0].role === 'family', 'waiting name became the login');
ok((await db.query(`select name from vivaham.profiles where user_id=$1`, [L])).rows[0].name === 'Lakshmi', 'profile takes the invited name');
ok((await as(L, `select vivaham.claim_phone_invites() as j`)).r.rows[0].j.length === 0, 'claiming twice does nothing');
ok((await as(L, 'select * from vivaham.my_weddings()')).r.rows[0].role === 'family', 'invited person sees the wedding');
ok((await as(A, `select vivaham.invite_phone($1,'Again','+919876500001','helper')`, [w])).e, 'number already inside is refused');
// admin can cancel a waiting invite; the number then joins nothing
ok((await as(A, `select vivaham.invite_phone($1,'Ravi','+14155550100','helper')`, [w])).r, 'invite a foreign number');
ok((await as(F, `delete from vivaham.phone_invites where name='Ravi'`)).r.affectedRows === 0, 'family cannot cancel an invite');
ok((await as(A, `delete from vivaham.phone_invites where name='Ravi'`)).r.affectedRows === 1, 'admin cancels an invite');
const R = await mkPhone('14155550100');
ok((await as(R, `select vivaham.claim_phone_invites() as j`)).r.rows[0].j.length === 0, 'cancelled invite no longer works');
// removing the waiting name removes its invite
await as(A, `select vivaham.invite_phone($1,'Gopi','+919876500002','helper')`, [w]);
await as(A, `delete from vivaham.members where name='Gopi'`);
ok((await db.query(`select count(*)::int c from vivaham.phone_invites where name='Gopi'`)).rows[0].c === 0, 'removing the name removes the invite');
// anon cannot call any of it
ok((await as(null, `select vivaham.claim_phone_invites()`)).e, 'anon cannot claim');
ok((await as(null, `select * from vivaham.phone_invites`)).e, 'anon cannot read invites');

// wedding delete
ok((await as(A, `delete from vivaham.weddings where id=$1`, [w])).r.affectedRows === 1, 'admin deletes wedding');
ok((await db.query(`select count(*)::int c from vivaham.members`)).rows[0].c === 0, 'members cascaded');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
