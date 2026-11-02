# Vivaham test plan

Written from a tester's point of view. Use it two ways: Claude Code audits the code against every case (see the prompt in the chat), and Anand runs the cases marked **Phone** on a real device and records the result.

Priority: **P0** = must work before any family uses the app, **P1** = important, **P2** = polish and rare cases.
Result column: ☐ not run, ✔ pass, ✘ fail (write the bug number in the notes).

## 0. Setup

**Accounts** (create in Supabase, Authentication, Users, Auto Confirm User):
- **ADMIN**: Anand's login. Role admin.
- **FAMILY**: test user. Join through an invite with the Family preset.
- **HELPER**: test user. Join through an invite with the Helper preset.
- **OUTSIDER**: test user with no invite. Used to test a second, separate wedding.

**Test data** (enter as ADMIN before testing the modules):
- 3 events: Mehandi (22 Apr 2027, 12:00 PM, 20 guests), Haldi (26 Apr 2027, 10:00 AM, 70 guests), Reception (27 Apr 2027, 7:00 PM, 1000 guests).
- 6 guests: 2 invited to Haldi only, 2 to Haldi and Reception, 2 to Reception only; party sizes 1, 2, 3, 4, 1, 5; at least one with no phone number.
- 2 requirements per event, 2 shopping items per event, 2 expenses, 1 meal with 2 dishes, 3 tasks (one overdue, one general, one done), 2 stays, 2 vehicles.

**Devices:** one iPhone (current iOS) is required. Also try a small screen (iPhone SE size) and, if possible, one Android phone.

## 1. Smoke test (about 10 minutes, run after every change)

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| SM-01 | P0 | Open the app cold | Log in screen shows, no crash | ☐ |
| SM-02 | P0 | Log in as ADMIN | Home shows wedding name, days to go, 8–9 tiles | ☐ |
| SM-03 | P0 | Tap each Home tile and each bottom tab | Every screen opens, no blank or black screen, back works | ☐ |
| SM-04 | P0 | Add an event and open it | It appears in the list and opens | ☐ |
| SM-05 | P0 | Add a guest to an event, set Coming | Confirmed count rises by the party size | ☐ |
| SM-06 | P0 | Add a shopping item and tick it | Moves to Already bought, totals update | ☐ |
| SM-07 | P0 | Add a requirement, toggle it | Needed ↔ Arranged, counts update | ☐ |
| SM-08 | P0 | Add a task, tick it | Moves to Completed | ☐ |
| SM-09 | P0 | Add an expense | Budget committed and by-category update | ☐ |
| SM-10 | P0 | Kill the app and reopen | Still logged in, same data | ☐ |
| SM-11 | P0 | Log out, log in again | Works, no stale data | ☐ |
| SM-12 | P0 | Log in as HELPER | Only Requirements and To-do visible | ☐ |

## 2. Account and session

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| AC-01 | P0 | Log in with wrong password | Maroon message "Email or password is not correct." | ☐ |
| AC-02 | P1 | Tap Log in with both fields empty | Message asking for email and password, no request sent | ☐ |
| AC-03 | P1 | Email with capital letters and trailing space | Logs in (email trimmed) | ☐ |
| AC-04 | P1 | Tap the eye icon | Password shows and hides | ☐ |
| AC-05 | P1 | Tap Log in twice quickly | One request, button shows "Logging in…" and is disabled | ☐ |
| AC-06 | P0 | Log in, force-close, reopen after 5 minutes | Still logged in | ☐ |
| AC-07 | P1 | Stay logged in for over an hour, then use the app | No forced logout, data still loads (token refresh) | ☐ |
| AC-08 | P1 | Forgot password: valid email | "Check your email" confirmation | ☐ |
| AC-09 | P2 | Forgot password: unknown or invalid email | No crash; sensible message | ☐ |
| AC-10 | P1 | Open the reset link on the phone | Set a new password screen opens; both rules turn green when satisfied | ☐ |
| AC-11 | P1 | Set new password with mismatch or under 8 characters | Save blocked, clear message | ☐ |
| AC-12 | P0 | Log in as a user with no wedding | Onboarding screen shows (not an empty Home) | ☐ |
| AC-13 | P1 | Complete onboarding with a name and date | Lands on Home with the right name and countdown | ☐ |
| AC-14 | P1 | Onboarding with empty name | Cannot continue | ☐ |
| AC-15 | P1 | Log out, log in as another user | No data from the first user is visible | ☐ |
| AC-16 | P2 | Airplane mode, open the app | Error message or cached state, no crash | ☐ |

## 3. Join with invite code (and invites in Settings)

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| JN-01 | P0 | ADMIN: Settings, Invite someone, Family preset | A code is shown and listed under open invites | ☐ |
| JN-02 | P0 | New user: Log in screen, Have an invite code? Join, enter code, name, new email and password | "You've joined the wedding", Home shows the Family tiles | ☐ |
| JN-03 | P0 | Use the same code again | "This invite was already used" | ☐ |
| JN-04 | P1 | Enter a wrong or made-up code | "Invite code not found" | ☐ |
| JN-05 | P1 | Enter the code in lower case or with spaces | Accepted | ☐ |
| JN-06 | P2 | Expired invite (set expires_at in the past in Supabase) | "This invite has expired" | ☐ |
| JN-07 | P1 | Join with "I already have an account" using an existing user | Joins without creating a new account | ☐ |
| JN-08 | P1 | Join with an email that already has an account but no switch | Clear error, not a crash | ☐ |
| JN-09 | P1 | Password under 8 characters when joining | Blocked with a message | ☐ |
| JN-10 | P1 | Onboarding screen: Have an invite code? | Same joining works for a signed-in user with no wedding | ☐ |
| JN-11 | P2 | ADMIN deletes an unused invite | It disappears; the code no longer works | ☐ |
| JN-12 | P1 | Share invite on WhatsApp | WhatsApp opens with the message and the code | ☐ |

## 4. Home

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| HM-01 | P0 | Open Home | Days to go equals the number of days to the wedding date; date line matches (weekday, day, month, year) | ☐ |
| HM-02 | P1 | Wedding date is today / tomorrow / yesterday | "Today is the big day!" / "1 day to go" / "days since the wedding" | ☐ |
| HM-03 | P0 | Compare every tile number with its module | Events, Guests (families), Shopping (to buy), Requirements (needed), Budget (committed), Food (meals), Stays (rooms and places), To-do (tasks left), Transport (vehicles) all match | ☐ |
| HM-04 | P1 | Add something in a module, go back to Home | Tile number updates without restarting | ☐ |
| HM-05 | P1 | Home with no data at all | Tiles show 0, no crash, no "NaN" | ☐ |
| HM-06 | P1 | As HELPER | Only Requirements and To-do tiles, laid out neatly | ☐ |
| HM-07 | P2 | Odd number of tiles | Last tile spans the full width | ☐ |
| HM-08 | P1 | Money format | Indian grouping, for example ₹15,00,000 | ☐ |
| HM-09 | P2 | Phone timezone set to a far-away timezone | Days to go and date label do not shift by a day | ☐ |

## 5. Events

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| EV-01 | P0 | Events list | Cards sorted by date then time, date block and "Mon · 10:00 · 70 guests" correct | ☐ |
| EV-02 | P0 | Add event: chip, date, time, guests, Save | Event saved with the right values | ☐ |
| EV-03 | P1 | Add an own event name via "Add your own" | Chip appears, selectable, saved as the name | ☐ |
| EV-04 | P1 | Time edge cases: 12:00 AM, 12:00 PM, 12:30 AM, 11:59 PM | Saved and shown correctly (12 AM is 00:00, 12 PM is 12:00) | ☐ |
| EV-05 | P1 | Calendar: change month forward across December to January | Year changes correctly; selected date label right | ☐ |
| EV-06 | P2 | Calendar: pick the 31st, then go to a 30-day month | No invalid date, no crash | ☐ |
| EV-07 | P1 | Dress code Yes with text; Dress code No | Saved text shows on the event; No saves nothing | ☐ |
| EV-08 | P1 | Add two vendors with name, service, phone | Saved as vendors; shown again in Edit | ☐ |
| EV-09 | P1 | Add decor items | They appear in Requirements under the Decor category for that event | ☐ |
| EV-10 | P1 | Save with no event name chosen | Blocked with a message | ☐ |
| EV-11 | P1 | Tap Save twice quickly | One event created | ☐ |
| EV-12 | P0 | Open an event | Name, date and time, dress code, Schedule, Guests, Requirements, Shopping rows show | ☐ |
| EV-13 | P1 | Event rows' numbers | Guests "N expected · M confirmed", Requirements open count, Shopping "N items · ₹total" match the modules for that event | ☐ |
| EV-14 | P1 | Tap Guests, Requirements, Shopping rows | Opens those modules (filtered to the event where possible) | ☐ |
| EV-15 | P1 | Add a schedule time, then another earlier | List sorted by time; remove with the bin works | ☐ |
| EV-16 | P1 | Edit event: change date, time, dress code, remove a vendor | Changes saved; removed vendor gone | ☐ |
| EV-17 | P0 | Delete an event | Back on the list without it; its schedule, vendors, invitations, requirements, shopping items, meals, dishes and photos are gone; its tasks become General and its expenses Whole wedding | ☐ |
| EV-18 | P1 | As FAMILY (events view only) | No add, edit or delete controls | ☐ |
| EV-19 | P2 | Event name with 60 characters or emoji | Layout holds, no overlap | ☐ |

## 6. Event photos

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| PH-01 | P0 | Add photos from gallery (select 3) | "Uploading 1 of 3…", then 3 thumbnails | ☐ |
| PH-02 | P1 | Take a photo with the camera | Uploaded and shown | ☐ |
| PH-03 | P0 | Open a photo full screen, close it | Back to the event screen | ☐ |
| PH-04 | P0 | Open a photo, delete, confirm | Returns to the event screen (no black screen); photo gone from the grid | ☐ |
| PH-05 | P1 | Cancel the delete confirmation | Photo stays; viewer still usable | ☐ |
| PH-06 | P1 | Deny camera or photo permission | Clear message, no crash | ☐ |
| PH-07 | P2 | Select more than 20 photos | Limited to 20 or a clear message | ☐ |
| PH-08 | P2 | Very large photo, slow network | Upload completes or shows an error, no freeze | ☐ |
| PH-09 | P1 | Caption typed before picking | Saved on every photo of that batch | ☐ |
| PH-10 | P1 | As FAMILY (events view) | Photos visible; no add or delete | ☐ |

## 7. Requirements

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| RQ-01 | P0 | Open Requirements, By event | Items grouped by category with quantity, unit, who | ☐ |
| RQ-02 | P0 | Tap Needed on an item | Becomes Arranged; counts update; tap again reverts | ☐ |
| RQ-03 | P1 | Add a requirement with all fields | Appears under the right event and category | ☐ |
| RQ-04 | P1 | Add the same item (same name and unit) to two events | Buy once, use many shows it once with the summed quantity and both events | ☐ |
| RQ-05 | P1 | Same item name, different unit | Shown as two lines, not summed | ☐ |
| RQ-06 | P2 | Item name differing only by capital letters or spaces | Treated as the same item in Buy once | ☐ |
| RQ-07 | P1 | Quantity stepper | Cannot go below the minimum; large values display | ☐ |
| RQ-08 | P1 | Remove a person chip | Only hidden on the screen; no data deleted | ☐ |
| RQ-09 | P1 | An item with status "ordered" in the database | Shows as Needed | ☐ |
| RQ-10 | P1 | As HELPER | Can add and toggle (edit access) | ☐ |

## 8. Guests and RSVPs

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| GU-01 | P0 | Open Guests, pick an event | Invited, Confirmed, Pending are sums of people (not number of families) | ☐ |
| GU-02 | P0 | Set Coming, Pending, Not coming on one guest | Counts update right away and after reload | ☐ |
| GU-03 | P1 | Search by part of a name, any capitalisation | List filters; clearing search restores it | ☐ |
| GU-04 | P0 | Add a guest: name, phone, side, two events, 3 people | One guest, invited to both events with 3 people each, status pending | ☐ |
| GU-05 | P1 | Add a guest without a phone | Allowed; shows "no phone" where relevant | ☐ |
| GU-06 | P1 | Add a guest with no events chosen | Message that at least one event is needed, or allowed per design; no crash | ☐ |
| GU-07 | P1 | Name with only spaces | Blocked | ☐ |
| GU-08 | P1 | Duplicate guest name | Allowed (families can share names); both show | ☐ |
| GU-09 | P1 | Save guest twice quickly | One guest | ☐ |
| GU-10 | P1 | Side Groom or Bride | Stored as "Groom's side" or "Bride's side" and shown | ☐ |
| GU-11 | P1 | 500 guests on one event (import or script) | List scrolls smoothly; search stays responsive | ☐ |
| GU-12 | P1 | As FAMILY (guests edit) | Can add and change RSVP | ☐ |

## 9. Import from contacts

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| IM-01 | P0 | Open Import, allow access | List of contacts loads (about 1,300 is fine) | ☐ |
| IM-02 | P0 | Tick 3 contacts, scroll, clear search, search again | The 3 stay ticked; "3 selected" shown; button says Import 3 guests | ☐ |
| IM-03 | P0 | Choose an event, side, people; tap Import | "Added 3 guests."; Guests shows them with the right people count | ☐ |
| IM-04 | P1 | Import without choosing an event | Blocked with the red message | ☐ |
| IM-05 | P1 | Contacts already on the guest list (same name or same last 10 digits) | Marked Already a guest and unticked | ☐ |
| IM-06 | P1 | Select all new | Ticks all new contacts; import of about 1,300 completes in batches without a crash | ☐ |
| IM-07 | P1 | Contact with no phone | Selectable, shows "no phone" | ☐ |
| IM-08 | P1 | Contact with several numbers | First number used | ☐ |
| IM-09 | P1 | Deny contacts permission | Clear message with a way to open Settings; no crash | ☐ |
| IM-10 | P2 | Contact names with emoji or other scripts | Display and save correctly | ☐ |
| IM-11 | P1 | Import the same contacts twice | Second time they show as Already a guest | ☐ |
| IM-12 | P2 | Network drops during import | Error shown; no duplicates after retrying | ☐ |

## 10. Send messages on WhatsApp

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| WA-01 | P0 | Send messages, Invitations, pick an event | Guests invited to that event shown | ☐ |
| WA-02 | P0 | Tap WhatsApp on a guest | WhatsApp opens on the right chat with the invitation text; row marks Sent | ☐ |
| WA-03 | P1 | Message content | Name, event, date, time, dress code and details right; empty lines dropped | ☐ |
| WA-04 | P1 | Phone formats: 10 digits, +91 with spaces, leading 0, +49 | Chat opens correctly (10 digits get 91; others kept) | ☐ |
| WA-05 | P1 | Guest without a phone | Shows "no phone", no button | ☐ |
| WA-06 | P1 | Untick Sent | Row returns to not sent; progress updates | ☐ |
| WA-07 | P1 | "Only not sent yet" toggle and name search | Filter works and combines with RSVP chips | ☐ |
| WA-08 | P1 | Stay tab and Transport tab | Stay shows place, map link, check-in and out, contact; Transport lists the vehicles | ☐ |
| WA-09 | P1 | WhatsApp not installed | Sensible behaviour (browser or message), no crash | ☐ |
| WA-10 | P2 | Message with special characters (& # + accents) | Arrives intact | ☐ |
| WA-11 | P1 | As a user without Guests edit | Cannot change the Sent tick | ☐ |
| WA-12 | P2 | Very long guest list (500) | Smooth scrolling; progress correct | ☐ |

## 11. Stays

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| ST-01 | P0 | Add a stay: name, location, dates, rooms, guest | Card shows; summary rooms, places, nights, guests correct | ☐ |
| ST-02 | P1 | Dates: same day for check-in and check-out; check-out before check-in | Handled (0 or 1 night, or blocked), no negative nights | ☐ |
| ST-03 | P1 | Nights across month end | Correct count | ☐ |
| ST-04 | P1 | Open in Maps | Opens maps at the address or link | ☐ |
| ST-05 | P1 | Add a guest to a stay; the same guest to a second stay | A guest can be in one stay; the picker no longer offers placed guests | ☐ |
| ST-06 | P1 | Remove a guest from a stay | Returns to the pickable list | ☐ |
| ST-07 | P1 | Rooms stepper | Cannot go below 0 or 1; total updates | ☐ |
| ST-08 | P1 | Share location on WhatsApp: fill contact, Open WhatsApp | Message has place, map, dates, contact | ☐ |
| ST-09 | P1 | Delete a stay | Confirm; card and its guest placements gone | ☐ |
| ST-10 | P2 | Stay with no address | Open in Maps hidden or sensible | ☐ |

## 12. Shopping

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| SH-01 | P0 | Add item for ₹10,000 | Total cost ₹10,000; Items to buy +1 | ☐ |
| SH-02 | P0 | Tick it | Moves to Already bought; progress and "bought" amount update | ☐ |
| SH-03 | P1 | Untick from Already bought | Returns to the list; status back to to buy | ☐ |
| SH-04 | P1 | Event filter All events, then one event | Totals and list match the filter | ☐ |
| SH-05 | P1 | Edit details: change event, person, price, status, save | Totals update; item moves | ☐ |
| SH-06 | P1 | Price 0, price with many digits (₹9,99,99,999) | Saves; layout holds; formatted correctly | ☐ |
| SH-07 | P1 | Item with status "ordered" in the database | Shown as to buy | ☐ |
| SH-08 | P1 | Home shopping tile and event shopping row | Numbers agree with this screen | ☐ |
| SH-09 | P1 | As FAMILY | Can add and tick | ☐ |

## 13. Budget

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| BU-01 | P0 | As ADMIN set the limit to 2500000 | Shows ₹25,00,000; saved after restart | ☐ |
| BU-02 | P0 | Add expense ₹50,000 with ₹10,000 paid | Status Advance paid; committed +₹50,000; paid +₹10,000 | ☐ |
| BU-03 | P1 | Paid equals total / paid is 0 / paid above total | Settled / Quoted / handled sensibly | ☐ |
| BU-04 | P1 | Committed includes shopping items | Equals expenses total plus shopping total | ☐ |
| BU-05 | P1 | Paid so far includes only bought shopping items | Correct | ☐ |
| BU-06 | P1 | Left and percent used | Left = limit − committed; percent right; over the limit shows a clear warning and no negative-looking glitch | ☐ |
| BU-07 | P1 | By event and By category | Add up to committed; Whole wedding row for event-less expenses | ☐ |
| BU-08 | P1 | Limit not set | "Set your budget limit" for admin, "Not set yet" for others; no divide by zero | ☐ |
| BU-09 | P1 | Non-admin tries to edit the limit | No edit control | ☐ |
| BU-10 | P2 | Delete an event that has expenses | Expenses remain as Whole wedding | ☐ |
| BU-11 | P1 | Decimals and big numbers | Rounded and grouped correctly in every place | ☐ |
| BU-12 | P1 | As HELPER or FAMILY (budget none) | Tile and screen unavailable | ☐ |

## 14. Food

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| FD-01 | P0 | Pick an event with guests | Plate count = round up of (confirmed + pending people) × 1.1 | ☐ |
| FD-02 | P1 | Event with no invited guests | Uses the event's expected guests × 1.1 | ☐ |
| FD-03 | P1 | Add a meal with two dishes | Shown with the dishes and the right guest count | ☐ |
| FD-04 | P1 | Change the meal's headcount | Saved only if different from the suggestion; later guest changes no longer move it | ☐ |
| FD-05 | P1 | Add and remove a dish | Works; meal remains | ☐ |
| FD-06 | P1 | Delete a meal | Confirm; its dishes removed | ☐ |
| FD-07 | P1 | Picking Breakfast, Lunch, Snacks, Dinner | Typical time suggested | ☐ |
| FD-08 | P2 | Guests change after the meal is made | Plate count updates on next view | ☐ |

## 15. To-do

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| TD-01 | P0 | Add a task with no deadline | Shown; sorted after tasks with deadlines | ☐ |
| TD-02 | P0 | Add a task with a deadline in the past | Shown in maroon as overdue | ☐ |
| TD-03 | P0 | Tick a task | Moves to Completed; progress updates; untick returns it | ☐ |
| TD-04 | P1 | Filters: person, then event, then General | List and progress follow the filters | ☐ |
| TD-05 | P1 | Deadline today | Not shown as overdue | ☐ |
| TD-06 | P1 | Task for a person not in the chip list ("add your own") | Saved and filterable | ☐ |
| TD-07 | P1 | Home tile "tasks left" | Equals the open task count | ☐ |
| TD-08 | P1 | Delete an event with tasks | Tasks become General and remain | ☐ |
| TD-09 | P2 | Task text 120 characters | Wraps without breaking layout | ☐ |

## 16. Transport

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| TR-01 | P0 | Add a vehicle with all fields | Card shows name, number, seats, driver, dates | ☐ |
| TR-02 | P1 | Tap the driver phone | Dialler opens with the number | ☐ |
| TR-03 | P1 | One date only | Saved as both start and end | ☐ |
| TR-04 | P1 | Edit and delete a vehicle | Works with confirm on delete | ☐ |
| TR-05 | P0 | Per-vehicle WhatsApp button | Shares only that vehicle | ☐ |
| TR-06 | P0 | Tick two of three vehicles, bottom button | Reads "Share selected (2)" and sends exactly those two in one message | ☐ |
| TR-07 | P1 | Nothing ticked | Bottom button reads "Share all (N)" and sends all | ☐ |
| TR-08 | P1 | Vehicle count on Home | Matches | ☐ |
| TR-09 | P2 | Vehicle without a driver phone | No call link; message omits the phone | ☐ |

## 17. Settings, members and access

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| SE-01 | P1 | Change your name | Saved; shows in the members list | ☐ |
| SE-02 | P1 | ADMIN changes the wedding date | Home countdown updates | ☐ |
| SE-03 | P1 | ADMIN changes the wedding name | Heading on Home updates sensibly | ☐ |
| SE-04 | P0 | ADMIN sets FAMILY's Budget to Hidden and Guests to View | After FAMILY reopens the app (or returns to Home) the tiles and controls reflect it | ☐ |
| SE-05 | P1 | ADMIN changes a member's role | Their module access resets to that role's preset | ☐ |
| SE-06 | P0 | Try to remove yourself, or demote the only admin | Prevented with a message | ☐ |
| SE-07 | P1 | Remove a member | They lose access on next load and see onboarding | ☐ |
| SE-08 | P1 | Non-admin opens Settings | No members or invite sections | ☐ |
| SE-09 | P1 | Log out from Settings | Returns to Log in; no data left on screen | ☐ |

**Access matrix** (run for FAMILY and HELPER; "none" means tile and tab hidden and the screen not reachable; "view" means no add, edit, delete or tick controls):

| ID | Pri | Check | Expected | Result |
| --- | --- | --- | --- | --- |
| AX-01 | P0 | FAMILY: Budget | none | ☐ |
| AX-02 | P0 | FAMILY: Guests | can edit | ☐ |
| AX-03 | P0 | FAMILY: Events, Stays, Transport, Food | view only | ☐ |
| AX-04 | P0 | HELPER: Requirements, To-do | can edit | ☐ |
| AX-05 | P0 | HELPER: everything else | none; bottom tabs for hidden modules do not lead to usable data | ☐ |
| AX-06 | P1 | A view-only user attempts a change by any route | No change saved; no crash | ☐ |
| AX-07 | P1 | Change a module to View while the user is on that screen | After reload the controls disappear | ☐ |

## 18. Wedding isolation (security)

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| IS-01 | P0 | OUTSIDER logs in, completes onboarding (own wedding "B") | Home shows 0 everywhere; none of ADMIN's data visible | ☐ |
| IS-02 | P0 | OUTSIDER adds an event and guest | ADMIN's wedding does not show them; OUTSIDER does not see ADMIN's | ☐ |
| IS-03 | P0 | OUTSIDER cannot open ADMIN's Settings members or invites | Only their own wedding data | ☐ |
| IS-04 | P1 | OUTSIDER tries an ADMIN invite code after already having a wedding | Works as designed (joins) or is rejected clearly; document the behaviour | ☐ |
| IS-05 | P1 | Person in two weddings | Only one wedding is shown; note which one (known limitation) | ☐ |

Data integrity checks, run in the Supabase SQL Editor after testing. Every result should be 0:

```sql
select count(*) as guest_event_mismatch
from guest_events ge
join events e on e.id = ge.event_id
join guests g on g.id = ge.guest_id
where ge.wedding_id <> e.wedding_id or ge.wedding_id <> g.wedding_id;

select count(*) as stay_guest_mismatch
from accommodation_guests ag
join accommodations a on a.id = ag.accommodation_id
join guests g on g.id = ag.guest_id
where ag.wedding_id <> a.wedding_id or ag.wedding_id <> g.wedding_id;

select count(*) as meal_dish_mismatch
from dishes d join meals m on m.id = d.meal_id
where d.wedding_id <> m.wedding_id;

select count(*) as shopping_event_mismatch
from shopping_items s join events e on e.id = s.event_id
where s.wedding_id <> e.wedding_id;
```

## 19. Robustness

| ID | Pri | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| RB-01 | P1 | Airplane mode, then open each module | Clear error or empty state, no crash or endless spinner | ☐ |
| RB-02 | P1 | Save a form in airplane mode, then retry online | Error shown; one record after retry (no duplicates) | ☐ |
| RB-03 | P1 | Send the app to the background for 10 minutes, return | Still works | ☐ |
| RB-04 | P1 | Rapid double taps on every Save, Add and Delete | No double records, no double deletes | ☐ |
| RB-05 | P1 | Keyboard open on every form | Fields and Save button are not hidden by the keyboard | ☐ |
| RB-06 | P1 | Small screen (iPhone SE) | No clipped buttons; all screens scroll to the end | ☐ |
| RB-07 | P2 | Large text size in iOS settings | Layout still usable | ☐ |
| RB-08 | P1 | Text with emoji, apostrophes, quotes, ampersands, very long words | Saved and displayed intact; no layout break | ☐ |
| RB-09 | P1 | Rotate the phone | No crash (locked portrait is fine) | ☐ |
| RB-10 | P2 | Dark mode on the phone | Screens remain readable (cream background kept) | ☐ |
| RB-11 | P2 | Android phone: login, Home, one module, a photo, a WhatsApp share | Works the same | ☐ |
| RB-12 | P1 | Open the app on the cellular network | Works | ☐ |
| RB-13 | P1 | Back gesture or button on every screen | Goes to the previous screen, never to a black or empty screen | ☐ |
| RB-14 | P1 | Loading states on a slow network | Shown on every screen, never an empty flash | ☐ |

## 20. Known limitations (not defects)

- Invite deep links `vivaham://join/<code>` only work in a real build; in Expo Go people type the code.
- One wedding per person is shown.
- Permission texts show Expo Go's wording until a real build exists.
- The blue gear button on screens during testing is Expo Go's developer button, not the app.
- Not built: push notifications, editing message templates, app icon and splash.

## 21. Bug report template

```
Bug number:
Test case ID:
Screen:
What I did (steps):
What I expected:
What happened:
Screenshot or screen recording: yes / no
Phone and iOS version:
Logged in as: ADMIN / FAMILY / HELPER / OUTSIDER
How often: always / sometimes
Severity: blocker (cannot continue) / major / minor / cosmetic
```

## 22. Exit criteria

- All P0 cases pass on the iPhone.
- At least 90 percent of P1 cases pass; every failed P1 has a bug number and an owner.
- No data leaks between weddings (IS-01 to IS-03 pass and all four integrity queries return 0).
- Smoke test (SM-01 to SM-12) passes on the final build.
