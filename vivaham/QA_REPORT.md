# Vivaham QA report

Static audit of TESTPLAN.md sections 1 to 19 against the code at commit `525e5b0`, plus unit tests for the pure logic.

- Cases: **216**
- Likely pass: **159**, Fixed: **15**, Likely fail: **2**, Needs device: **40**
- Unit tests: **29 passed** (`npm test`), type check clean (`npx tsc --noEmit`)

"Likely pass" means I read the code path named in the evidence column. "Fixed" means it was a defect and is changed in one of the commits below. "Needs device" means the result depends on the phone, the network, another app or the database rules.

## Results

| ID | Result | Evidence |
| --- | --- | --- |
| SM-01 | Likely pass | App.tsx `App`: no session → `LoginScreen` |
| SM-02 | Likely pass | HomeScreen: `countdown` (format.ts, tested), tiles filtered by `access` |
| SM-03 | Needs device | AppNavigator + all stacks; back pills use goBack/popTo. Visual check needed |
| SM-04 | Likely pass | EventFormScreen `save` → goBack; EventsListScreen reloads on focus |
| SM-05 | Likely pass | GuestsListScreen `setRsvp`, `total('yes')` sums party_size |
| SM-06 | Likely pass | ShoppingScreen `act` status 'bought'; totals recomputed |
| SM-07 | Likely pass | RequirementsListScreen `toggle` needed↔done, counts from rows |
| SM-08 | Likely pass | TodoScreen tick → status 'done', Completed section |
| SM-09 | Likely pass | AddExpenseScreen `save`; budget.ts `budgetTotals` (tested) |
| SM-10 | Likely pass | lib/supabase.ts persistSession + AsyncStorage |
| SM-11 | Likely pass | App.tsx `onAuthStateChange`; WeddingProvider remounts per login |
| SM-12 | Fixed | AppNavigator `Tabs`: tabs for hidden modules were still shown (Events, Guests, Shopping) |
| AC-01 | Likely pass | LoginScreen `handleLogin` maps 'Invalid login credentials' |
| AC-02 | Likely pass | LoginScreen `handleLogin` early return with message |
| AC-03 | Likely pass | LoginScreen trims email; Supabase compares emails case-insensitively |
| AC-04 | Likely pass | LoginScreen `showPassword` toggle |
| AC-05 | Likely pass | LoginScreen button `disabled={loading}`, label 'Logging in…' |
| AC-06 | Likely pass | persistSession; App.tsx `getSession` on start |
| AC-07 | Fixed | lib/supabase.ts: added AppState start/stopAutoRefresh (Supabase React Native guidance). Confirm on device |
| AC-08 | Likely pass | ForgotPasswordScreen `send` → 'Check your email' |
| AC-09 | Likely pass | ForgotPasswordScreen shows Supabase error text; unknown emails are not revealed |
| AC-10 | Needs device | App.tsx deep link `linkParams` + SetPasswordScreen; needs redirect URLs in Supabase |
| AC-11 | Likely pass | SetPasswordScreen `save` checks length ≥ 8 and match |
| AC-12 | Likely pass | App.tsx `Main`: no wedding → OnboardingScreen |
| AC-13 | Likely pass | OnboardingScreen `save` → create_wedding → `reload` |
| AC-14 | Likely pass | OnboardingScreen `save` validation |
| AC-15 | Likely pass | WeddingProvider unmounts on logout; wedding row filtered by user_id |
| AC-16 | Needs device | WeddingProvider error → Home error state with Log out |
| JN-01 | Likely pass | SettingsScreen `createInvite`, open invites list reload |
| JN-02 | Likely pass | JoinScreen `join` (signUp → accept_invite) → step 3 → fresh WeddingProvider |
| JN-03 | Needs device | Message comes from accept_invite (database) |
| JN-04 | Needs device | Message comes from accept_invite (database) |
| JN-05 | Needs device | JoinScreen `cleanCode` removes spaces and upper-cases. Fails if the database stores lower-case codes and compares case-sensitively |
| JN-06 | Needs device | Message comes from accept_invite (database) |
| JN-07 | Likely pass | JoinScreen `join` signInWithPassword branch |
| JN-08 | Needs device | Depends on Supabase email confirmation setting (no error is returned when it is on) |
| JN-09 | Likely pass | JoinScreen `join` length check |
| JN-10 | Likely pass | OnboardingScreen `join` → `acceptInvite` → `reload` |
| JN-11 | Likely pass | SettingsScreen invite delete |
| JN-12 | Needs device | SettingsScreen `openWhatsApp(fill(JOIN_MESSAGE))` |
| HM-01 | Likely pass | format.ts `countdown`, `parseDate` (tested) |
| HM-02 | Likely pass | format.ts `countdown` (tested today/tomorrow/past) |
| HM-03 | Likely pass | HomeScreen `loadSummary` (Guests = guest rows = families) |
| HM-04 | Likely pass | HomeScreen `useFocusEffect` reloads summary |
| HM-05 | Likely pass | `?? 0` on every count; `rupees` NaN guard (tested) |
| HM-06 | Likely pass | Tiles filtered by `access` |
| HM-07 | Likely pass | HomeScreen `tileWide` on last odd tile |
| HM-08 | Likely pass | format.ts `rupees` (tested) |
| HM-09 | Likely pass | `parseDate` builds local dates, never UTC parsing (tested) |
| EV-01 | Likely pass | lib/data.ts `fetchEvents` order event_date, start_time; EventsListScreen `subtitle` |
| EV-02 | Likely pass | EventFormScreen `save` |
| EV-03 | Likely pass | Chips.tsx `EditableChips.add` |
| EV-04 | Likely fail | TimePicker offers minutes :00/:15/:30/:45 only (as designed), so 11:59 PM cannot be entered. 12 AM/12 PM conversion is correct (tested) |
| EV-05 | Likely pass | Calendar `shift` uses new Date(year, month + delta, 1) |
| EV-06 | Likely pass | Calendar builds cells from the real days in each month; selected value is an ISO string |
| EV-07 | Likely pass | EventFormScreen saves dress_code only when Yes and text given |
| EV-08 | Likely pass | EventFormScreen vendors insert/delete diff; loaded again in edit |
| EV-09 | Likely pass | EventFormScreen decor → requirements, category 'Decor' (needs Requirements edit access) |
| EV-10 | Likely pass | EventFormScreen `save` validation |
| EV-11 | Likely pass | `saving` disables button; `createdId` prevents a second event on retry |
| EV-12 | Likely pass | EventDetailScreen |
| EV-13 | Likely pass | EventDetailScreen loader: confirmed = sum party_size where rsvp 'yes' |
| EV-14 | Likely pass | EventDetailScreen links navigate with nested `screen` + eventId |
| EV-15 | Likely pass | schedule_items ordered by start_time; `removeTime` |
| EV-16 | Likely pass | EventFormScreen update path |
| EV-17 | Likely pass | EventFormScreen `remove`: photos (storage + rows), vendors, schedule, invitations, requirements, shopping, meals, dishes deleted; tasks/expenses set to no event |
| EV-18 | Likely pass | `canEdit` guards on list, detail and form |
| EV-19 | Needs device | Layout |
| PH-01 | Needs device | EventPhotos `pick` now waits for the popup to close before opening the picker |
| PH-02 | Needs device | EventPhotos `pick('camera')` |
| PH-03 | Likely pass | EventPhotos `closeViewer` |
| PH-04 | Likely pass | Fixed earlier (71e7341): confirmation inside the viewer, no nested Modal |
| PH-05 | Likely pass | EventPhotos 'Keep it' sets confirming false |
| PH-06 | Fixed | Permission message was rendered behind the open 'Add photos' popup; popup now closes first |
| PH-07 | Needs device | `selectionLimit: 20`; platform support differs |
| PH-08 | Needs device | Network and memory |
| PH-09 | Likely pass | EventPhotos `upload` uses the same caption for the batch |
| PH-10 | Likely pass | `canEdit` hides Add and Delete |
| RQ-01 | Likely pass | RequirementsListScreen `ByEvent` groups by category |
| RQ-02 | Likely pass | `toggle` + reload |
| RQ-03 | Likely pass | AddRequirementScreen `save` |
| RQ-04 | Likely pass | `BuyOnce` key = trimmed lower-case item + unit, sums quantity, collects events |
| RQ-05 | Likely pass | Unit is part of the key |
| RQ-06 | Likely pass | Case and outer spaces ignored; double spaces inside a name are not merged |
| RQ-07 | Likely pass | Stepper `min={1}` |
| RQ-08 | Likely pass | EditableChips `remove` only changes local options |
| RQ-09 | Likely pass | Status shown as Arranged only when 'done' |
| RQ-10 | Needs device | Helper has Events hidden. If the database hides events from Helpers, Requirements shows 'Add an event first'. SQL proposed in sql/members_can_read_event_names.sql |
| GU-01 | Likely pass | GuestsListScreen `total` sums party_size |
| GU-02 | Likely pass | `setRsvp` optimistic + reload |
| GU-03 | Likely pass | Lower-case `includes` filter |
| GU-04 | Likely pass | AddGuestScreen `save` guest + one guest_events row per event |
| GU-05 | Likely pass | phone optional |
| GU-06 | Likely pass | AddGuestScreen requires at least one event |
| GU-07 | Likely pass | `name.trim()` check |
| GU-08 | Likely pass | No uniqueness check on names |
| GU-09 | Likely pass | `saving` + `createdId` guard |
| GU-10 | Likely pass | SIDES keys "Groom's side" / "Bride's side" |
| GU-11 | Needs device | FlatList; performance |
| GU-12 | Likely pass | `canEdit` from access |
| IM-01 | Needs device | ImportContactsScreen `Contact.getAllDetails` |
| IM-02 | Likely pass | Fixed earlier (71e7341): stable keys, extraData, functional updates, 'N selected' |
| IM-03 | Likely pass | `importGuests` |
| IM-04 | Likely pass | Event required |
| IM-05 | Likely pass | `existing` flag by name or last 10 digits; not pre-ticked |
| IM-06 | Needs device | Batches of 200; needs a real address book |
| IM-07 | Likely pass | Phone optional, 'no phone' shown |
| IM-08 | Likely pass | First phone with a number |
| IM-09 | Fixed | Added 'Open Settings' button after a denied permission |
| IM-10 | Needs device | Display of other scripts |
| IM-11 | Likely pass | Imported rows marked existing; reloaded list flags them |
| IM-12 | Fixed | If invitations failed after guests were saved, retry created duplicates; now the batch's guests are removed again |
| WA-01 | Likely pass | SendMessagesScreen invite rows |
| WA-02 | Needs device | `openWhatsApp` then `mark` |
| WA-03 | Likely pass | messages.ts `fill` (tested) |
| WA-04 | Likely pass | messages.ts `whatsappNumber` (tested: 10 digits, +91, leading 0, 0091, +49) |
| WA-05 | Fixed | Button was shown greyed out; now hidden for guests without a phone |
| WA-06 | Likely pass | `mark(row, false)` deletes share_log row |
| WA-07 | Likely pass | Filters combine: rsvp, search, only-not-sent |
| WA-08 | Likely pass | STAY_MESSAGE / TRANSPORT_MESSAGE builders |
| WA-09 | Needs device | wa.me falls back to the browser |
| WA-10 | Likely pass | `encodeURIComponent`; `fill` keeps & (tested) |
| WA-11 | Likely pass | TickBox `disabled={!canMark}` |
| WA-12 | Needs device | Performance |
| ST-01 | Likely pass | AddStayScreen `save`; StaysScreen summary |
| ST-02 | Likely pass | Range picker cannot choose check-out on or before check-in; `stayNights` never negative (tested) |
| ST-03 | Likely pass | `daysBetween` across month end (tested) |
| ST-04 | Needs device | Linking to maps |
| ST-05 | Likely pass | Picker lists only unplaced guests |
| ST-06 | Likely pass | Delete placement + reload |
| ST-07 | Fixed | Fast taps on the rooms stepper could be lost (each tap used the old value); stepper now waits for the save |
| ST-08 | Needs device | WhatsApp |
| ST-09 | Likely pass | `deleteStay` removes placements then the stay |
| ST-10 | Likely pass | `mapsLink` falls back to a search by place name |
| SH-01 | Likely pass | AddShoppingItemScreen; ShoppingScreen totals |
| SH-02 | Likely pass | Tick → 'bought' |
| SH-03 | Likely pass | Untick → 'to buy' |
| SH-04 | Likely pass | `filter` state |
| SH-05 | Likely pass | `saveTable` updates changed rows |
| SH-06 | Likely pass | `rupees` (tested up to ₹9,99,99,999) |
| SH-07 | Likely pass | open = status ≠ 'bought' |
| SH-08 | Likely pass | Same formulas in Home and EventDetail |
| SH-09 | Likely pass | Family preset shopping edit |
| BU-01 | Likely pass | BudgetScreen `saveLimit` + wedding `reload` |
| BU-02 | Likely pass | budget.ts `expenseStatus`, `budgetTotals` (tested) |
| BU-03 | Likely pass | Paid above total is blocked in AddExpenseScreen; status tested |
| BU-04 | Likely pass | `budgetTotals` committed (tested) |
| BU-05 | Likely pass | `budgetTotals` paid counts only bought items (tested) |
| BU-06 | Fixed | 'Left' over the limit printed '₹-,500'; `rupees` now prints '-₹500' (tested) |
| BU-07 | Likely pass | byEvent and categories built from the same rows as committed |
| BU-08 | Likely pass | `ratio` is 0 for null or 0 limit (tested); admin button label |
| BU-09 | Likely pass | Edit button only for role admin |
| BU-10 | Likely pass | EventFormScreen `remove` sets expenses.event_id to null |
| BU-11 | Likely pass | `rupees` rounds (tested) |
| BU-12 | Likely pass | Tile filtered; BudgetScreen access guard |
| FD-01 | Likely pass | food.ts `foodPlan` (tested) |
| FD-02 | Likely fail | `foodPlan` uses expected guests without the 10% (follows CLAUDE.md; TESTPLAN expects ×1.1). Not changed, see conflicts |
| FD-03 | Likely pass | AddMealScreen `save` meal + dishes |
| FD-04 | Likely pass | headcount saved only when different from the plan |
| FD-05 | Likely pass | FoodScreen `addDish` / dish remove |
| FD-06 | Likely pass | `deleteMeal` removes dishes then meal |
| FD-07 | Likely pass | AddMealScreen `MEAL_TIMES` |
| FD-08 | Likely pass | Plan recomputed on focus |
| TD-01 | Likely pass | TodoScreen sort puts no-deadline last |
| TD-02 | Likely pass | `overdue` = due_date < today |
| TD-03 | Likely pass | Tick/untick + progress |
| TD-04 | Likely pass | Filters applied before progress |
| TD-05 | Likely pass | Strictly before today (string compare of local ISO dates) |
| TD-06 | Likely pass | EditableChips add own name; owner filter built from tasks |
| TD-07 | Likely pass | Home counts status ≠ 'done' |
| TD-08 | Likely pass | EventFormScreen `remove` sets tasks.event_id to null |
| TD-09 | Needs device | Layout |
| TR-01 | Likely pass | VehicleFormScreen `save`; TransportScreen card |
| TR-02 | Needs device | `tel:` link |
| TR-03 | Likely pass | `available_to: to ?? from` |
| TR-04 | Likely pass | Edit form + ConfirmDialog delete |
| TR-05 | Likely pass | `share([vehicle])` |
| TR-06 | Likely pass | `selected` from ticked ids that still exist |
| TR-07 | Likely pass | Label switches on `selected.length` |
| TR-08 | Likely pass | Home vehicles count |
| TR-09 | Likely pass | `vehicleBlock` omits empty driver phone (tested) |
| SE-01 | Fixed | Members list did not refresh after saving your own name; now reloaded |
| SE-02 | Likely pass | `saveWedding` + `reload` |
| SE-03 | Likely pass | `weddingTag` (tested) |
| SE-04 | Fixed | Access was read only at app start; Home now reloads role and modules each time it opens |
| SE-05 | Likely pass | `changeRole` applies PRESETS |
| SE-06 | Likely pass | No remove button for yourself; only-admin guard in `changeRole` and the dialog |
| SE-07 | Fixed | Removed member now sees Onboarding the next time Home opens (was only after restart) |
| SE-08 | Likely pass | Admin-only sections behind `isAdmin` |
| SE-09 | Likely pass | signOut → session null → Login |
| AX-01 | Likely pass | Tile + screen guard; budget not a tab |
| AX-02 | Likely pass | Family preset guests edit |
| AX-03 | Likely pass | `canEdit` guards in Events, Stays, Transport, Food |
| AX-04 | Needs device | Edit access in app; event names depend on database rules (see RQ-10) |
| AX-05 | Fixed | Hidden modules' tabs are now removed |
| AX-06 | Likely pass | Every change control checks access; database rules also apply |
| AX-07 | Fixed | Updated on the next visit to Home (not instantly on the open screen) |
| IS-01 | Needs device | Row level security in the database |
| IS-02 | Needs device | Row level security in the database |
| IS-03 | Needs device | Settings queries filter by the user's wedding id; database rules decide the rest |
| IS-04 | Needs device | accept_invite adds a second membership; the app then shows one of the two weddings |
| IS-05 | Needs device | WeddingProvider loads one membership (limit 1, no order) — known limitation |
| RB-01 | Needs device | useFocusData shows error text; no endless spinner in code |
| RB-02 | Likely pass | `createdId` guards in two-step saves; single-step saves only run once |
| RB-03 | Fixed | Token refresh tied to app state (see AC-07) |
| RB-04 | Likely pass | `saving`/`busy` disable buttons; deletes go through dialogs with busy |
| RB-05 | Needs device | KeyboardAvoidingView in Screen |
| RB-06 | Needs device | Layout |
| RB-07 | Needs device | Layout |
| RB-08 | Needs device | Text handling |
| RB-09 | Likely pass | app.json orientation portrait |
| RB-10 | Likely pass | app.json userInterfaceStyle light; fixed colours |
| RB-11 | Needs device | Android |
| RB-12 | Needs device | Network |
| RB-13 | Needs device | Navigation |
| RB-14 | Fixed | Blank screen while the wedding loaded; now shows 'Loading your wedding…' |

## Defects found and fixed

| # | Defect | Change | Commit |
| --- | --- | --- | --- |
| 1 | Negative amounts printed as `₹-,500`, e.g. Budget "Left" when over the limit; `NaN` could print as `₹NaN` | `rupees` in src/lib/format.ts handles the sign and non-numbers; Home now uses the shared `rupees` | `abab320` |
| 2 | Role and module changes reached a user only after restarting the app; a removed member kept seeing the wedding | Home reloads the wedding context each time it opens | `561f39a` |
| 3 | Bottom tabs for hidden modules (Events, Guests, Shopping) were shown to Helpers | Tabs filtered by `access` in AppNavigator | `561f39a` |
| 4 | Members list did not show your new name after saving it | Settings reloads members after saving | `561f39a` |
| 5 | Contacts import: if invitations failed after guests were saved, retrying created duplicate guests | The batch's guests are removed again before the error is shown | `525e5b0` |
| 6 | Contacts permission denied: no way to open Settings | "Open Settings" button | `525e5b0` |
| 7 | Send messages: greyed-out WhatsApp button for guests without a phone | Button hidden; "no phone" stays | `525e5b0` |
| 8 | Stays rooms stepper: fast taps were lost | Stepper disabled while saving | `525e5b0` |
| 9 | Blank screen while the wedding was loading | "Loading your wedding…" | `525e5b0` |
| 10 | Session token refresh not tied to the app being in the foreground (Supabase React Native guidance) | AppState start/stopAutoRefresh in src/lib/supabase.ts | `525e5b0` |
| 11 | Photos: the picker opened while the "Add photos" popup was still open (iOS risk), and permission messages were hidden behind the popup | Popup closes first, picker opens after | `525e5b0` |

Supporting change (no behaviour change): helpers moved out of screens so they can be tested — `countdown`, `toDbTime` (format.ts), `expenseStatus`, `budgetTotals` (budget.ts), `stayNights` (stays.ts), `accessFor` (roles.ts). Test setup: jest-expo, `npm test`, `tsconfig` types `jest` (TypeScript 6 no longer loads @types automatically). Commit `abab320`.

## Found but not fixed

| ID | Finding | Reason |
| --- | --- | --- |
| EV-04 | 11:59 PM cannot be entered; minutes are :00/:15/:30/:45 | This is the design (screen 2.2). Changing it is a design decision |
| FD-02 | With nobody invited, plates = expected guests, without the 10% extra | CLAUDE.md says "or the event's expected_guests"; TESTPLAN says × 1.1. Tell me which is right and it is a one-line change in src/lib/food.ts |
| RQ-10 / AX-04 | Helpers may not see event names, so Requirements could show "Add an event first" | Depends on the database rules. Suggested SQL in `sql/members_can_read_event_names.sql`; not run |
| JN-05 | Codes are upper-cased before `accept_invite` | Correct only if the database stores codes in capitals or compares case-insensitively; please check `create_invite` |
| IS-04 / IS-05 | A person in two weddings sees one of them, chosen without an order | Known limitation; a wedding switcher is a new feature |
| AX-07 | Access changes apply when Home is next opened, not on the screen already open | Smallest safe change; good enough for family use |

## 20-minute phone test (ordered by risk)

1. **Access (4 min)** — SE-04, AX-05, AX-07, SM-12, RQ-10: as ADMIN set FAMILY Budget to Hidden and Guests to View; on the FAMILY phone go back to Home: Budget tile gone, Guests has no add button. Log in as HELPER: only Home and To-do tabs, Requirements shows event names and "+ Add a requirement".
2. **Isolation (3 min)** — IS-01, IS-02, IS-03: OUTSIDER onboarding, add an event and a guest; check neither wedding sees the other. Run the four SQL checks in TESTPLAN.
3. **Join (3 min)** — JN-03, JN-04, JN-05, JN-06, JN-08: used code, wrong code, lower-case code with spaces, expired code, existing email without the switch.
4. **Photos (2 min)** — PH-01, PH-02, PH-06, PH-07: gallery 3 photos, camera, deny permission once, try 25 photos.
5. **Contacts import (3 min)** — IM-01, IM-06, IM-09, IM-10: full address book, Select all new, import; deny permission and use Open Settings.
6. **WhatsApp (2 min)** — WA-02, WA-09, ST-08, JN-12, TR-02: send one invitation, one stay, one invite code; tap a driver phone.
7. **Session (1 min)** — AC-07, RB-03, AC-10: leave the app in the background 10 minutes, return and load a list; open a password reset link.
8. **Layout (2 min)** — RB-05, RB-06, EV-19, TD-09, RB-13: on a small screen open each Add form with the keyboard up; long names; swipe back on every screen.

Not covered in the 20 minutes (run when time allows): SM-03, AC-16, PH-08, GU-11, WA-12, ST-04, AX-04, IS-04, IS-05, RB-01, RB-07, RB-08, RB-11, RB-12.
