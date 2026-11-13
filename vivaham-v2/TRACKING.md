# Vivaham · what is recorded about app use

Purpose: see how families really use the app (which parts, in what order, for how long), so the next changes are based on facts.

Rule: we record **what people do, never what they type**. No names, mobile numbers, amounts, wedding content or photos leave the phone.
A test (`npm test`) fails if any typed text shows up in what is sent.

## Switching it on
1. Create a PostHog project with **EU hosting** and copy the project key (`phc_...`).
2. Cloudflare -> the `vivaham-v2` project -> build variables: `VITE_POSTHOG_KEY` = the key. Optional: `VITE_OPERATOR`, `VITE_CONTACT` (shown in the privacy notice).
3. Rebuild. Without the key nothing is recorded.

People agree by tapping a log-in button (the line under it says so and links to the privacy notice). They can switch it off in
Profile -> "Help improve Vivaham". Until someone has agreed, nothing is stored on their phone.

## Sent with every event
| Property | Meaning |
|---|---|
| `distinct_id` | a random id; after login the account id |
| `$session_id` | one visit. A new one starts after 30 quiet minutes |
| `screen` | the screen the person is on (`home`, `guests`, `events/detail`, ...) |
| `role` | admin / family / helper |
| `wedding_id` | which wedding (an id, not the name) |
| `lang` | en / te |
| `installed` | true when opened from the home-screen icon |
| `flyer` | the tag in the QR link (`?f=1`), to tell flyer batches apart later |

## Events
| Event | When | Extra | Question it answers |
|---|---|---|---|
| `session_start` | first action of a visit | | How often do people come back? |
| `$pageview` | a screen opens | `screen` | Which parts are used most and least? |
| `screen_left` | the person moves on | `seconds` | How long do they stay on each part? |
| `app_hidden` / `app_shown` | app goes to the background / comes back | `seconds` | Real session length |
| `tap` | any tap on a control | `kind` (menu, tile, add, tab, button, link, card, chip, tick, back), `label` for built-in buttons only, `in_form` | Where do people tap? |
| `form_opened` / `form_saved` / `form_failed` / `form_deleted` | add or edit forms | `form` (e.g. `Add guest`) | Which things get added? Where do people give up? |
| `login_code_sent` / `login_code_not_sent` / `login_code_wrong` / `login_code_sent_again` | login steps | `channel`, `country` | Where does login fail? |
| `login_success` | logged in | `how` (mobile, email) | |
| `name_given` | first-time name step done | | |
| `wedding_created` | onboarding done | `has_date`, `invited`, `invite_failed` | Do people invite family straight away? |
| `joined_by_number` / `joined_by_code` | an invited person got in | | Does inviting work? |
| `install_offered` / `install_started` / `install_accepted` / `install_declined` / `install_later` / `app_installed` | "Put Vivaham on your phone" | `how` (android, ios) | How many install it? |
| `stats_off` | statistics switched off in Profile | | |
| `logged_out` | | | |

## First things to build in PostHog
- Funnel: `$pageview` (login) -> `login_code_sent` -> `login_success` -> `wedding_created` -> `form_saved`.
- Trend: `$pageview` broken down by `screen` (most and least used parts).
- Trend: `form_saved` broken down by `form`.
- Retention: `session_start`, weekly.
- Average of `seconds` on `screen_left`, by `screen`.
