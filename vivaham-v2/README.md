# Vivaham · V2 (Supabase edition)

Wedding organiser, V2 design (Pooja-plate palette, Marcellus + Manrope), wired to Supabase.
Roles: **Admin / Family / Helper**. Languages: **English / తెలుగు**.

## Set it up (about 15 minutes)

### 1. Database
1. Supabase dashboard -> **SQL Editor** -> **New query**.
2. Paste the whole file `supabase/migrations/20261110_vivaham_v2.sql` -> **Run**. (Safe to run twice.)
   Then do the same with `supabase/migrations/20261112_phone_login_invites.sql` (mobile-number login and invites).
3. **Project Settings -> API -> Exposed schemas** -> add `vivaham` -> **Save**.
   (Everything lives in its own schema `vivaham`, so it cannot touch your older tables.)

### 2. Login settings
**Authentication -> URL Configuration**
- Site URL: your live address (for now `http://localhost:5173`)
- Redirect URLs: add the same address, and later your Cloudflare address.
  The password-reset email and invite links come back to this address.

**Authentication -> Providers -> Email**: for a family app, switch **Confirm email** off, so people can start straight away.

**Authentication -> Providers -> Phone** (mobile-number login, the main way in):
1. Switch **Enable phone provider** on and pick the SMS provider (Twilio or Twilio Verify, MessageBird, Vonage, Textlocal). Paste its keys.
2. Keep **Confirm phone** on. An invite only works for a number that was confirmed with a code.
3. For testing without sending real messages, add your own number under **Test phone numbers and OTPs** (for example `919876543210=123456`).
4. The code goes out by SMS. To send it on WhatsApp instead, set `VITE_OTP_CHANNEL=whatsapp` (works with Twilio / Twilio Verify only).
5. SMS to Indian numbers needs DLT registration with the provider; start that early.

Until the phone provider is on, the login screen says so and people can use **Use email instead**. Old email accounts keep working.

### 3. Run it on your laptop
```bash
cp .env.example .env      # then paste your Project URL + anon key from Settings -> API
npm install
npm run dev               # opens http://localhost:5173
```

### 4. Put it online (Cloudflare, test address first)
V2 runs at its own address while V1 keeps running. Cloudflare now builds these as Workers; `wrangler.jsonc` in this folder is the config.
1. Cloudflare dashboard -> **Workers & Pages** -> **Create** -> **Import a repository** -> pick `Vivaham-App` (same repository as V1).
2. Project name: `vivaham-v2`. Under **Build** set:
   - Root directory: `vivaham-v2`
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
3. Under **Variables** (build variables) add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the publishable key, never the secret key).
4. Push the code (`git push`) and start the build. The address looks like `https://vivaham-v2.<your-subdomain>.workers.dev`.
5. Supabase -> **Authentication -> URL Configuration** -> add that address (with `/**` at the end) to Redirect URLs. Keep the V1 address there too while both run.
6. Invite links are made from the address the app is opened on, so no extra setting is needed for them.

**Switching the main address to V2 later:** in the existing `vivaham-app` Cloudflare project change Root directory to `vivaham-v2` and Build command to `npm run build`, add the two `VITE_...` variables, and rebuild. Old V1 links like `/join/CODE` open V2's Join screen (V1 codes themselves do not work in V2; send new invites). To go back, set Root directory to `vivaham` and Build command to `npm run build:web` again.

## Tests
`npm test` runs three checks: the SQL rules (roles, prices, invites by code and by mobile number, last-admin), a frontend-vs-backend parity check
(every table, column and function the app uses exists), and the real screens in a simulated browser against the real database rules.

## What is where
| Screen | Tables / functions |
|---|---|
| Login (mobile number + code), email login, Sign up, Forgot / Reset | Supabase Auth, `profiles` (created automatically), `claim_phone_invites` |
| Onboarding (create wedding + invite family), Join with code | `create_wedding`, `invite_phone`, `get_invite_preview`, `accept_invite` |
| Home | `weddings`, `events` |
| Events (+ photos) | `events`, `event_photos`, Storage bucket `vivaham` |
| Shopping | `shopping_items`, `item_people`, `categories`, `prices` |
| Budget | `budget_settings`, `payments`, `prices`, view `v_bookings`, `budget_summary` |
| Stays / Food / Transport / Vendors | `stays`+`stay_guests`, `meals`, `vehicles`, `vendors`+`vendor_events`, each with `save_price` |
| Guests & RSVPs | `guests`, `guest_events` |
| Materials, To-do | `materials`, `tasks` |
| Profile | `update_my_name`, `members`, `invite_phone`, `phone_invites`, `get_invite`, `weddings`, `profiles.language` |

## Who can do what (enforced in the database, not just hidden in the app)
| | Admin | Family | Helper |
|---|---|---|---|
| See all plans | yes | yes | yes |
| Tick tasks and materials | yes | yes | yes |
| Add / edit / delete anything else, add names | yes | yes | no |
| See and edit Budget and all prices | yes | yes | **no** |
| Wedding name and date, invite by mobile number, invite codes, change roles, remove people | yes | no | no |

A wedding always keeps at least one admin.
