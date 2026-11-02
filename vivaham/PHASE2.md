# Vivaham, phase 2 build list

This file extends `CLAUDE.md`. All rules in `CLAUDE.md` still apply (work autonomously, `npx tsc --noEmit` after each item, one local commit per item, never push, no secret keys, never commit `.env`, English UI, simple code, reuse shared components, respect `access(module)`, loading/error/empty states on every screen).

Changes to the rules for this phase:
- You may install exactly two new packages with `npx expo install`: `expo-image-picker` and `expo-contacts`. Add their permission texts to `app.json` plugins. Nothing else may be added. Use `Share` and `Linking` from react-native for sharing and WhatsApp.
- There are no design mockups for these screens. Follow the look of the existing screens: top strip, back pill, white cards with the `tileBorder` border, tinted icon boxes, maroon pill buttons, chips, steppers, popups, and the shared components that already exist in `src/components/`.
- Read the existing screens first and match their patterns for data loading, forms and navigation.

## New database objects (Anand has already run the SQL)

- `wedding_members.display_name text` (a member's name, shown in the members list).
- `wedding_invites` table (code, wedding_id, role, modules, expires_at, used_by, used_at). Admins can read and delete invites for their wedding. Creating and using invites only works through two functions:
  - `supabase.rpc('create_invite', { p_wedding, p_role, p_modules })` returns an 8-character code (admins only). `p_role` is 'admin', 'family' or 'helper'. `p_modules` is a JSON object such as `{"guests":"edit","budget":"none"}`.
  - `supabase.rpc('accept_invite', { p_code, p_name })` adds the signed-in user to the invite's wedding with the invite's role and modules, and returns the wedding id. It raises readable errors ('Invite code not found', 'This invite was already used', 'This invite has expired'); show the message to the user.
- Storage bucket `event-photos` (private) now has rules for members. Upload paths must be `<wedding_id>/<event_id>/<unique>.jpg`. Read photos with `createSignedUrl(path, 3600)`.
- `share_log` (guest_id, kind, wedding_id, unique on guest_id + kind) records which messages were sent. Kinds: `invite:<event_id>`, `stay`, `transport`.

Role presets (put them in `src/lib/roles.ts`; the admin can change any module afterwards):
- Admin: role 'admin', edit access to everything (modules is empty).
- Family: events view, guests edit, stays view, transport view, shopping edit, requirements edit, food view, todo edit, budget none.
- Helper: requirements edit, todo edit, everything else none.
Module labels in the UI: Events, Guests, Stays, Transport, Shopping, Requirements, Food, To-do, Budget. Access levels in the UI: Hidden (none), View, Edit.

## Build list

**21. Transport** (module: transport). Root stack screen `Transport`; add a "Transport" tile to Home (new `car` icon in `Icon.tsx`, subtitle "N vehicles"). List of vehicle cards (vehicle name and number, driver with a tap-to-call link, available dates, seats, notes), "+ Add a vehicle" and edit (all `vehicles` columns), delete with confirm, and "Share on WhatsApp" that builds a message listing all vehicles (name, number, driver and phone, dates) and opens `https://wa.me/?text=...`.

**22. Event photos** (module: events). On the One event screen add a "Photos" card: a 2-column grid of thumbnails, "Add photos" with choices Gallery (multiple selection) and Camera (`expo-image-picker`, quality about 0.6). Upload each image (read the file with `fetch(uri)` and `arrayBuffer()`, then `supabase.storage.from('event-photos').upload(path, buffer, { contentType: 'image/jpeg' })`), then insert an `event_photos` row (event_id, path, caption, wedding_id). Show images through signed URLs. Tap a thumbnail for a full-screen view with the caption and a delete button (edit access only, with confirm; remove the storage object and the row).

**23. Import guests from contacts** (module: guests). Reachable from the Guests screen ("Import from contacts"). Ask for contacts permission (`expo-contacts`), show a searchable list (FlatList) with a tick on each person and their phone. Flag people already in the guest list (same name, or same last 10 digits of the phone) and leave them unticked. Controls: "Select all new", events to invite them to (multiple chips), side (Groom or Bride), people per guest (stepper, default 1). Import in batches of 200 (insert `guests`, then `guest_events` with rsvp 'pending'; include `wedding_id` everywhere) and show how many were added.

**24. WhatsApp messages to guests** (module: guests). Put the message templates in `src/lib/messages.ts` as constants with `{name}`-style placeholders and a `fill()` helper that also removes empty lines:
- Invitation: "Namaste {name} 🙏 You are warmly invited to the {event} on {date} {time}. {dress} {details} We would love to have you with us!" (dress = "Dress code: ..." when set; details = the event's notes).
- Stay: "Hello {name} 🙏 Here are your stay details for the wedding: 🏨 {place} 📍 {map} Address: {address} Check-in: {checkin} Check-out: {checkout} Contact: {contact}".
- Transport: "Hello {name} 🙏 Vehicles available during the wedding: {vehicles} Please contact the driver directly for pickups."
Phone numbers: keep digits; a 10-digit number gets country code 91 (constant `DEFAULT_COUNTRY_CODE`). Open `https://wa.me/<digits>?text=<encoded>` with `Linking`.
Add a "Send messages" screen from the Guests screen with three tabs: Invitations (choose an event; guests invited to it, with RSVP filter chips for pending / yes / no), Stay (choose a stay; guests placed there), Transport (guests placed in any stay). Each row: guest name, a "WhatsApp" button, and a "Sent" tick that writes or removes the `share_log` row (kind as above). Show a progress bar "x of y sent", a name search, an "Only not sent yet" toggle, and use FlatList for long lists. Guests without a phone show "no phone". The wording of messages is a constant for now; later it may become editable.

**25. Settings and members** (admin only parts marked). Add a small gear button on the Home screen and a root stack screen `Settings`. Move "Log out" from Home into Settings (keep it working). Settings contains:
- Your name (edit `wedding_members.display_name` for yourself) and the wedding name and date (admin only, update `weddings`).
- Members (admin only): list of members with display name (fall back to "Member"), role badge, and for non-admins an access selector per module (Hidden / View / Edit) that updates `wedding_members.modules`; change role; remove a member with confirm. Prevent removing or demoting the last admin, and prevent removing yourself.
- Invite someone (admin only): choose a preset (Family, Helper, Admin), optionally adjust modules, call `create_invite`, then show the code with "Share on WhatsApp" using this message: "Join our wedding planner on Vivaham 💍 1. Open the app 2. Tap 'Have an invite code?' 3. Enter code {code}" and a copy-friendly display of the code. List open invites (code, role, expires) with delete.
After any change that affects the current user, reload the wedding context.

**26. Join with an invite code.** On the Log in screen add the link "Have an invite code? Join". The Join screen has three short steps: (1) enter the code, (2) your name, email and password, with a switch "I already have an account", (3) done. Creating an account uses `supabase.auth.signUp`; if sign-up returns no session (email confirmation is switched on), show "Check your email to confirm your account, then log in and enter the code again." After the user is signed in, call `accept_invite(code, name)`, reload the wedding context and go to Home. Also add "Have an invite code?" to the Onboarding screen (for signed-in users without a wedding), which calls `accept_invite` the same way. Parse a code from an opening URL of the form `vivaham://join/<code>` if one is present (best effort).

**27. Home screen.** Add the Transport tile and the Settings gear (see items 21 and 25). Keep the grid tidy with an odd number of tiles.

## Out of scope

Push notifications, app icon and splash, publishing to the App Store or Play Store, editing the message templates in the app, per-guest accommodation rooms.

## Final report

Same format as in `CLAUDE.md`: screens built, choices made, anything skipped or needing my action (Supabase settings, configuration), a short manual test checklist per item, and the type check result.
