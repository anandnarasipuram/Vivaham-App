# Vivaham web / PWA report

Build: `npm run build:web` (Expo export, single-page output in `dist/`), served locally with `npx serve dist -s` and tested in Chromium with Playwright at 390×844 (mobile, touch) and at 1280×800.

## Automated test results (Playwright, 390×844)

| Check | Result |
| --- | --- |
| Log in screen loads at `/` | ✔ |
| Empty log in shows "Enter your email and password." and sends no request | ✔ |
| Wrong password shows "Email or password is not correct." (email with capitals and spaces is trimmed) | ✔ |
| Eye icon shows and hides the password | ✔ |
| Forgot password opens and goes back to Log in | ✔ |
| "Have an invite code? Join": short code rejected, `test code` becomes `TESTCODE`, step 2 shows name, email, password and "I already have an account" | ✔ |
| Direct load of `/join/TESTCODE` opens Join with the code filled in | ✔ |
| Refresh on `/join/TESTCODE` (no 404) | ✔ |
| Cancel on Join returns to Log in and resets the address to `/` | ✔ |
| Direct load of `/events/abc` (no 404) asks to log in first | ✔ |
| Refresh on `/settings` (no 404) | ✔ |
| `manifest.json`, `logo192.png`, `logo512.png`, `apple-touch-icon.png` served; manifest, apple and viewport tags in `index.html` | ✔ |
| Browser storage (localStorage) usable for the saved session | ✔ |
| Laptop width: app centred in a 480px column on the cream background | ✔ |

Console: no JavaScript errors. One expected network 400 from Supabase for the deliberately wrong password.

Not tested automatically: anything after logging in (Home, the modules, photo upload, invites, vehicle share). That needs a test account, and I did not create users in your Supabase project. These are in the checklist below for you to run after deploying.

## Checklist from WEB.md

| Item | Status |
| --- | --- |
| Opens on iPhone Safari and Android Chrome; Add to Home Screen shows maroon Vivaham icon, opens full screen | ☐ Phone after deploy. Icon files, manifest (`display: standalone`) and apple tags are in place and served |
| Sign up, log in, stay logged in after closing and reopening | ☐ Phone after deploy. Session storage uses localStorage (checked), log-in errors work |
| Create wedding, add an event, a guest, a shopping item | ☐ Phone after deploy. Same screens as the app, no native-only APIs on these paths |
| Photo upload and delete on web (no black screen) | ☐ Phone after deploy. Web opens the file chooser straight from the tap; delete confirmation is inside the viewer |
| Delete confirmations appear (no silent Alert) | ✔ in code. The app never used `Alert`; all deletes use the in-app confirm popup, which works in browsers |
| Settings > invite: WhatsApp opens with link + code; Copy link works | ☐ Phone after deploy. Needs `EXPO_PUBLIC_APP_URL` set before the build, otherwise the old code-only message is used and the button reads "Copy code" |
| Opening `/join/<code>` on a fresh browser leads to sign-up, then joins with the right role | ✔ up to sign-up (tested). Joining itself needs a real code |
| Refresh on any deep link does not 404 | ✔ (`/join/…`, `/events/…`, `/settings`; Netlify uses `public/_redirects`) |
| Contact import shows the web note, no crash | ✔ in code. Guests shows the note instead of the button; the import screen shows it too |
| Vehicle share by WhatsApp works | ☐ Phone after deploy. Uses `https://wa.me/?text=…` |

## Disabled or different on web

- **Import from contacts**: hidden. Guests shows "Contact import works in the phone app. Add guests manually or paste a list." There is no paste-a-list feature yet, so on web guests are added one by one.
- **Take a photo**: the button is hidden; "Choose from gallery" opens the browser's file chooser. On a phone browser that chooser usually also offers the camera.
- **"Share another way"** (system share sheet) for invites: hidden on web. WhatsApp and Copy link remain.
- **Copy link**: copies to the clipboard on web; in the phone app it opens the share sheet, which has Copy. If the clipboard is blocked, the browser shows the link to copy by hand.
- **Open Settings** after a denied permission: only in the phone app.
- **Permission texts** (photos, camera, contacts): phone app only.

## Known issues and caveats

- `EXPO_PUBLIC_APP_URL` is empty in `.env` until the site is deployed, so invites use the old message without a link. Set it, rebuild and redeploy (DEPLOY_WEB.md step 5).
- The value is baked in at build time; changing `.env` needs a rebuild.
- Password reset on web sends people back to `<site>/reset-password`; add the site URL in Supabase (DEPLOY_WEB.md step 6).
- Contacts import is phone-app only. Camera capture on web is limited to what the browser's file chooser offers.
- iPhone: installing needs Safari "Add to Home Screen" (Chrome on recent iOS also works).
- No push notifications. No service worker (no offline mode), on purpose.
- Netlify's free tier is plenty for this use.
- Wide screens: popups (confirmations, pickers) still cover the whole browser window rather than only the 480px column.
