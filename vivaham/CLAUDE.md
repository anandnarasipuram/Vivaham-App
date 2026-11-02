# Vivaham: guide for Claude Code

Vivaham is a wedding planning app for Indian families (first users: an Arya Vysya family, April 2027). It is a React Native app built with Expo SDK 58 and TypeScript, with Supabase as the backend. The owner, Anand, is a product manager and not a professional app developer, so report results in plain language.

The visual design is in `DESIGN.md` (23 screens, 390 px wide mockups). It is the source of truth for layout, spacing, text and colours. Read it before building a screen. Colours and fonts are already in `src/theme.ts`.

## How to work

- Work through the build list below in order, on your own, until it is finished. Do not stop to ask questions. When a detail is unclear, choose the simplest sensible option, and list that choice in your final report.
- After finishing each module, run `npx tsc --noEmit` and fix every error. Then commit locally: `git add -A && git commit -m "<module name>"`. Never run `git push`.
- Do not add or upgrade packages. Use only what is already installed (react-native, expo, react-navigation, react-native-svg, react-native-safe-area-context, supabase-js, AsyncStorage, expo-font, expo-status-bar). Use `Linking` from react-native for maps, calls and WhatsApp. If a package is truly needed, stop that screen, tell me why in the final report, and move on.
- Never use a Supabase secret or service_role key. The app only uses the publishable key through `src/lib/supabase.ts`.
- Do not start the dev server. Do not run `npm audit fix`. Never commit `.env`.
- Keep code plain and consistent with the existing files. Few comments. Build shared pieces once and reuse them.
- UI text is English and comes from the design.

## What already exists (check before creating anything)

- `App.tsx`: loads fonts, handles the Supabase session, shows `LoginScreen` or the main app inside `SafeAreaProvider` and `WeddingProvider`.
- `src/theme.ts`: `colors` (cream, ink, muted, maroon, gold, goldDark, goldLight, border, tileBorder, placeholder, white, green, goldInk, brownInk, tintGold, tintGreen, tintRose, tintSand) and `fonts` (heading = Playfair Display bold; medium, semibold, bold, extrabold = Plus Jakarta Sans).
- `src/lib/supabase.ts`: the Supabase client.
- `src/lib/wedding.tsx`: `WeddingProvider` and `useWedding()` returning `{ wedding, loading, error, access }`. `wedding` has `id`, `name`, `weddingDate`, `role`, `modules`. `access(module)` returns `'none' | 'view' | 'edit'`. Extend it (add `budgetLimit`, a `reload()` function) when needed.
- `src/components/Icon.tsx`: icons home, calendar, guests, bag, diya, wallet, bowl, stays, check.
- `src/navigation/AppNavigator.tsx`: bottom tabs Home, Events, Guests, Shopping, Todo, plus root stack screens Requirements, Budget, Food, Stays. Tapping a Home tile navigates to the screen with that route name.
- `src/screens/LoginScreen.tsx`, `HomeScreen.tsx`, `PlaceholderScreen.tsx`.
- Possibly also (the Events list step may or may not have been applied): `src/lib/format.ts` (date and rupee helpers), `src/components/TopStrip.tsx`, `BackPill.tsx`, `Chevron.tsx`, `src/screens/EventsListScreen.tsx`, a placeholder `EventDetailScreen.tsx`, `src/navigation/EventsStack.tsx`.

If any of these shared pieces is missing, create it. Replace `PlaceholderScreen` usages with real screens as you build them. Home tiles and tabs keep their current route names (`Events`, `Guests`, `Shopping`, `Todo`, `Requirements`, `Budget`, `Food`, `Stays`).

Navigation pattern: every module is a small native stack (list screen, then add/edit screens pushed on top). Tab modules (Events, Guests, Shopping, Todo) are stacks inside their tab. Non-tab modules (Requirements, Budget, Food, Stays) are stacks registered in the root stack. Add and edit screens are full pages with a "Cancel" back pill, as in the design.

Shared components to create once and reuse: screen shell with the top strip, back pill, primary pill button, secondary button, card, labelled text field, stepper (minus, value, plus), selectable chips, month calendar picker, time picker (hour, minute, AM/PM as in design 2.2), select row, tick circle, collapsible "Completed" section, confirm-delete.

## Database (Supabase Postgres)

Every table below has `wedding_id uuid not null` (references weddings). **Every insert must include `wedding_id: wedding.id`.** Reads and writes are limited by row level security to weddings the signed-in user belongs to and to the modules they may use, so always handle empty results and errors. Dates are `YYYY-MM-DD`, times are `HH:MM:SS`.

| Table | Module | Columns (besides wedding_id) |
| --- | --- | --- |
| events | events | id, name, event_date, start_time, expected_guests, dress_code, highlights, notes |
| event_vendors | events | id, event_id, name, role, phone, created_at |
| event_photos | events | id, event_id, path, caption, created_at (not used yet) |
| schedule_items | events | id, event_id, start_time, activity, who, notes, created_at |
| guests | guests | id, name, phone, side, notes |
| guest_events | guests | guest_id, event_id, rsvp ('pending' / 'yes' / 'no'), party_size (primary key guest_id + event_id) |
| share_log | guests | id, guest_id, kind, created_at (not used yet) |
| accommodations | stays | id, name, address, maps_url, rooms, checkin_date, checkin_time, checkout_date, checkout_time, contact_name, contact_phone, created_at |
| accommodation_guests | stays | id, accommodation_id, guest_id (unique), people, created_at |
| vehicles | transport | id, vehicle_name, vehicle_number, seats, driver_name, driver_phone, available_from, available_to, notes, created_at (not used yet) |
| shopping_items | shopping | id, event_id, person, item, price, status ('to buy' / 'ordered' / 'bought'), created_at |
| requirements | requirements | id, event_id, category, item, quantity, unit, assigned_to, status ('needed' / 'ordered' / 'done'), created_at |
| expenses | budget | id, event_id (nullable = whole wedding), description, category, amount, paid, paid_by, created_at |
| meals | food | id, event_id, name, meal_time, diet_notes, headcount (nullable), created_at |
| dishes | food | id, meal_id, name, dish_type, created_at |
| tasks | todo | id, event_id (nullable = general), title, owner, due_date, status ('open' / 'done'), created_at |
| weddings | n/a | id, name, wedding_date, budget_limit (numeric, nullable), created_at |
| wedding_members | n/a | wedding_id, user_id, role ('admin' / 'family' / 'helper'), modules (jsonb like {"guests": "view", "budget": "edit"}) |

Tables without `created_at`: events, guests, guest_events. Order those by their own columns.

Access: the module names are events, guests, stays, transport, shopping, requirements, food, todo, budget. `useWedding().access(module)` gives `'edit'` (admins always), `'view'` or `'none'`. Hide add, edit, delete and tick controls when access is `'view'`. A module with `'none'` is already hidden on Home; also guard the screens.

Database functions that exist: `create_wedding(p_name text, p_date date) returns uuid` creates a wedding with the caller as admin. Call it with `supabase.rpc('create_wedding', { p_name, p_date })`. Also `is_member`, `is_admin`, `member_access` (used by the security rules; do not call them from the app). The column `weddings.budget_limit` exists; admins can update it.

Photos use a private Storage bucket `event-photos`. Photos are out of scope for now.

## Build list (do in this order)

**A. Events** (tab `Events`; modules: events)
1. 2.1 Events list (build if missing) plus the "+ Add an event" button (edit access only).
2. 2.3 One event: header with name, `Mon 26 Apr 2027 · 10:00`, dress code line if set, and `notes` as the venue line when present. Card rows: Schedule (list the event's schedule_items by time, "Nothing planned yet." when empty, "+ Add a time" adds one: time, what happens, who), Guests ("N expected · M confirmed", confirmed = sum of party_size with rsvp 'yes' for this event; tap opens the Guests tab), Requirements (open count for this event; tap opens Requirements), Shopping (item count and ₹ total for this event; tap opens Shopping). "Edit event" opens 2.6. Hide rows for modules the user cannot access.
3. 2.2 Add an event: event name chips (from the design, with "add your own"), month calendar, time (hour, minute, AM/PM), dress code Yes/No (when Yes show a text field and save it to `events.dress_code`), expected guests stepper, vendors (name, service, phone saved to `event_vendors`: service goes in `role`), decor items (saved as `requirements` rows with category 'Decor', quantity 1, status 'needed'). Save the event first, then its vendors and decor rows.
4. 2.6 Edit event: the same form filled with existing values. Save updates the event and applies vendor and decor changes (insert new, delete removed).

**B. Requirements** (root stack `Requirements`; module: requirements)
5. 2.4 list with the "By event" and "Buy once, use many" views. The design shows two states, Needed and Arranged: Arranged = status 'done'; 'needed' and 'ordered' both show as Needed. Tapping the circle toggles. "Buy once": group by item name and unit across events, show total quantity and the events using it.
6. 2.5 Add a requirement: event, category, item, quantity stepper, unit, who arranges it (chips plus "add your own"), status.

**C. Guests** (tab `Guests`; module: guests)
7. 3.1 Guests and RSVPs: event selector, Invited / Confirmed / Pending counts (sum of party_size by rsvp), guest rows with Coming / Pending / Not coming (rsvp yes / pending / no) updating `guest_events`. For long lists use FlatList. Search by name if the design allows, otherwise add a simple search field.
8. 3.2 Add a guest: name, phone, side (Groom or Bride, stored as "Groom's side" / "Bride's side"), invite-to events (multiple), number of people, notes. Insert the guest, then one `guest_events` row per chosen event (rsvp 'pending', party_size).

**D. Stays** (root stack `Stays`; module: stays)
9. 3.3 Accommodation: summary card (rooms, places, nights, guests), a card per stay (name, area/address, nights, check-in, check-out, rooms stepper, "Open in Maps" via `Linking.openURL` using `maps_url`, or a Google Maps search link made from the address), guests staying here with add (pick from guests not placed anywhere) and remove, "Share on WhatsApp" (build the message shown in the design preview, then `Linking.openURL('https://wa.me/?text=' + encodeURIComponent(message))` so the user chooses the chat), and "Delete this stay".
10. 3.4 Add a stay: place name, location, dates (range picker as in design), rooms, who is staying. Contact person, contact number and map link are filled in the share preview and saved on the stay (`contact_name`, `contact_phone`, `maps_url`).

**E. Shopping** (tab `Shopping`; module: shopping)
11. 4.1 Shopping list: event filter ("All events" or one), totals (total cost, already bought, items to buy), progress, open items with tick circles (tick = status 'bought'), collapsible "Already bought", "Edit details" section for changing event, person, item, price, status.
12. 4.2 Add a shopping item: event, person, item, price, status.

**F. Budget** (root stack `Budget`; module: budget)
13. 4.3 Budget: limit (from `weddings.budget_limit`, admins can edit it; when null show "Set your budget limit"), committed (sum of expenses.amount plus shopping_items.price), paid so far (expenses.paid plus bought shopping prices), left, percent used, "By event" (Shopping and Other per event, plus Whole wedding), "By category", and the expenses list with status derived from amounts (quoted when paid is 0, advance paid when part paid, settled when fully paid).
14. 4.4 Add an expense: description, category, event (or whole wedding), total amount, paid so far, paid by.

**G. Food** (root stack `Food`; module: food)
15. 5.1 Food and menus: event selector, "Plan food for N guests" where N = ceil((confirmed + pending party_size) x 1.1), or the event's expected_guests when nobody is invited; show the breakdown line from the design. Meals with their dishes; add and delete dishes.
16. 5.2 Add a meal: name, time, diet notes, headcount (optional), first dishes.

**H. To-do** (tab `Todo`; module: todo)
17. 5.3 To-do: filters "Show tasks for" (person) and "Show tasks in" (event / general), progress, open tasks sorted by deadline (overdue in maroon), tick circle toggles status 'open' / 'done', collapsible Completed.
18. 5.4 Add a task: task, who does it, belongs to (general or an event), optional deadline.

**I. Account screens**
19. 1.4 Onboarding: shown when the signed-in user has no wedding yet. Two questions as in the design (whose wedding, when). Call `create_wedding`, then reload the wedding context and go to Home.
20. 1.2 Forgot password: `supabase.auth.resetPasswordForEmail(email)`, show a confirmation. 1.3 Set a new password: `supabase.auth.updateUser({ password })`. Wire the "Forgot password?" link on the login screen. The reset link opens the app through a deep link; implement what works in Expo Go, and describe in the report anything that needs configuration.

People lists ("who does it", "paid by", "person"): there is no people table yet. Offer chips made of names already used in the wedding's rows plus a field to add a new name, as in the design.

## Out of scope for now

Transport, Import guests, event photos, per-guest WhatsApp invitations and the sent tracker, invite links and roles management, a settings or profile screen (the temporary Log out link on Home stays), push notifications, app icon and splash.

## Quality rules

- Every screen has a loading state, an error state (maroon text) and the empty-state text from the design.
- Reload data when a screen gains focus (`useFocusEffect`) and after every write.
- Disable buttons while saving, so nothing is saved twice.
- Touch targets are at least 44 dp. Inputs use `keyboardType` and `autoCapitalize` sensibly.
- Money uses `rupees()` (Indian grouping, for example ₹15,00,000).
- Respect `access(module)` for every control that changes data.

## Final report

When everything is built, reply with: 1) the screens built, per module, 2) choices you made where the spec was unclear, 3) anything skipped or needing my action (SQL, configuration), 4) a short manual test checklist per module: what to tap and what should happen, 5) the type check result.
