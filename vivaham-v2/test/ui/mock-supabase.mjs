// Fake supabase-js client that talks to the real SQL (PGlite) with the same row-level security.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
export const configured = true;
export const BUCKET = 'vivaham';
export const db = new PGlite({ parsers: { 1082: (v) => v, 20: (v) => Number(v), 1184: (v) => new Date(v).toISOString() } });
const F = (n) => new URL(`../../${n}`, import.meta.url);
await db.exec(`create schema auth; create schema storage;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid, bucket_id text, name text); alter table storage.objects enable row level security;
create role anon nologin; create role authenticated nologin;
grant usage on schema auth, storage to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;`);
await db.exec(fs.readFileSync(F('supabase/migrations/20261110_vivaham_v2.sql'), 'utf8'));

export const state = { uid: null, log: [] };
let chain = Promise.resolve();
const serial = (fn) => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };
const run = (sql, params = []) => serial(async () => {
  await db.exec(`set app.uid = '${state.uid || ''}'; set role ${state.uid ? 'authenticated' : 'anon'};`);
  try { const r = await db.query(sql, params); return { rows: r.rows }; }
  catch (e) { state.log.push(e.message); return { error: { message: e.message } }; }
  finally { await db.exec('reset role;'); }
});
const q = (id) => `"${id}"`;
class Q {
  constructor(t) { this.t = t; this.op = 'select'; this.cols = '*'; this.f = []; this.o = []; }
  select(c = '*') { if (this.op === 'select') this.cols = c; else this.ret = c; return this; }
  insert(r) { this.op = 'insert'; this.row = r; return this; }
  upsert(r) { this.op = 'upsert'; this.row = r; return this; }
  update(r) { this.op = 'update'; this.row = r; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(c, v) { this.f.push([c, v]); return this; }
  order(c, o = {}) { this.o.push(`${q(c)} ${o.ascending === false ? 'desc' : 'asc'}${o.nullsFirst === true ? ' nulls first' : o.nullsFirst === false ? ' nulls last' : ''}`); return this; }
  single() { this.one = 'single'; return this; }
  maybeSingle() { this.one = 'maybe'; return this; }
  then(a, b) { return this.exec().then(a, b); }
  proj(c) { return c.replace(/(\w+)\(([\w,]+)\)/g, (_, tb, cs) => `(select jsonb_build_object(${cs.split(',').map((x) => `'${x}', e.${x}`).join(',')}) from vivaham.${tb} e where e.id = ${tb.replace(/s$/, '')}_id) as ${tb}`); }
  async exec() {
    const p = []; const where = this.f.length ? ' where ' + this.f.map(([c, v]) => { p.push(v); return `${q(c)} = $${p.length}`; }).join(' and ') : '';
    const T = `vivaham.${q(this.t)}`; let sql, ret = this.op === 'select' ? this.cols : this.ret;
    const retSql = ret ? ` returning ${this.proj(ret)}` : '';
    if (this.op === 'select') sql = `select ${this.proj(this.cols)} from ${T}${where}${this.o.length ? ' order by ' + this.o.join(',') : ''}`;
    else if (this.op === 'delete') sql = `delete from ${T}${where}${retSql}`;
    else if (this.op === 'update') { const ks = Object.keys(this.row); sql = `update ${T} set ${ks.map((k) => { p.unshift(null); return ''; }).join('')}`; p.length = 0; const w2 = this.f.map(([c, v]) => [c, v]); const sets = ks.map((k) => { p.push(this.row[k]); return `${q(k)} = $${p.length}`; }); const wh = w2.length ? ' where ' + w2.map(([c, v]) => { p.push(v); return `${q(c)} = $${p.length}`; }).join(' and ') : ''; sql = `update ${T} set ${sets.join(',')}${wh}${retSql}`; }
    else { const rows = Array.isArray(this.row) ? this.row : [this.row]; const ks = Object.keys(rows[0]);
      const vals = rows.map((r) => '(' + ks.map((k) => { p.push(r[k] === undefined ? null : r[k]); return `$${p.length}`; }).join(',') + ')').join(',');
      const oc = this.op === 'upsert' ? ` on conflict (${this.t === 'budget_settings' ? 'wedding_id' : 'id'}) do update set ${ks.map((k) => `${q(k)} = excluded.${q(k)}`).join(',')}` : '';
      sql = `insert into ${T} (${ks.map(q).join(',')}) values ${vals}${oc}${retSql}`; }
    const r = await run(sql, p);
    if (r.error) return { data: null, error: r.error };
    if (this.one === 'single') return r.rows.length === 1 ? { data: r.rows[0], error: null } : { data: null, error: { message: 'single row expected' } };
    if (this.one === 'maybe') return { data: r.rows[0] || null, error: null };
    return { data: this.op === 'select' || ret ? r.rows : null, error: null };
  }
}
const TABLE_FNS = new Set(['my_weddings', 'get_invite', 'get_invite_preview']);
export const sb = {
  from: (t) => new Q(t),
  async rpc(fn, args = {}) {
    const ks = Object.keys(args); const p = ks.map((k) => args[k]);
    const call = `vivaham.${fn}(${ks.map((k, i) => `${k} => $${i + 1}`).join(',')})`;
    const r = TABLE_FNS.has(fn) ? await run(`select * from ${call}`, p) : await run(`select ${call} as v`, p);
    if (r.error) return { data: null, error: r.error };
    return { data: TABLE_FNS.has(fn) ? r.rows : r.rows[0]?.v ?? null, error: null };
  },
  auth: {
    getSession: async () => ({ data: { session: state.uid ? { user: { id: state.uid } } : null } }),
    getUser: async () => ({ data: { user: state.uid ? { id: state.uid } : null } }),
    signOut: async () => { state.uid = null; return {}; },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: async () => ({ error: null }), signUp: async () => ({ data: {}, error: null }),
    resetPasswordForEmail: async () => ({ error: null }), updateUser: async () => ({ error: null }), setSession: async () => ({}),
  },
  channel: () => ({ on() { return this; }, subscribe() { return this; } }),
  storage: { from: () => ({ upload: async () => ({ error: null }), remove: async () => ({}), createSignedUrls: async (ps) => ({ data: ps.map((path) => ({ path, signedUrl: 'about:blank' })) }) }) },
};
export async function must(p) { const r = await p; if (r.error) throw new Error(r.error.message || 'Something went wrong'); return r.data; }
