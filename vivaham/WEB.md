# WEB.md — Vivaham web/PWA build + invite link

Read CLAUDE.md first. All its rules still apply: no secret keys in the app, never commit `.env`, run `npx tsc --noEmit` after each item, local commits only, NEVER push.
Goal: the same app runs in a phone browser (installable via "Add to Home Screen"), is hosted free on Netlify, and the WhatsApp invite contains a real link.
One allowed exception to the "no new packages" rule: the web packages in item W1.

## W1. Web packages and config
- Run: `npx expo install react-dom react-native-web @expo/metro-runtime`
- In app.json add:
  ```json
  "web": { "bundler": "metro", "output": "single", "favicon": "./assets/favicon.png", "name": "Vivaham", "shortName": "Vivaham", "themeColor": "#7A1F2B", "backgroundColor": "#FBF6EC" }
  ```
- Confirm `npx expo export -p web` succeeds and creates `dist/`. Fix any build error before moving on.

## W2. Make every screen web-safe
Audit all screens and fix:
- `Alert.alert` (does nothing useful on web): create `src/lib/dialog.ts` with `confirm(title, message)` and `notify(title, message)` that use `window.confirm/alert` on web (`Platform.OS === 'web'`) and `Alert` on native. Replace every Alert call (deletes, errors, success).
- `Share` and `Linking`: WhatsApp sharing must use `https://wa.me/?text=<encoded>` via `Linking.openURL` (works on web and native). No `Share.share` on web.
- Contacts import (expo-contacts): not available in browsers. On web hide or disable the button and show the note "Contact import works in the phone app. Add guests manually or paste a list."
- Image picker: library picking works on web; camera option should fall back to library on web. Photo upload to Supabase storage must be tested on web.
- Date/time pickers: if a native-only picker is used, provide a web fallback (`<input type="date|time">` through a small wrapper component).
- Safe area, keyboard avoiding, haptics, and any other native-only API: guard with `Platform.OS !== 'web'`.
- Layout: on wide screens centre the app in a column with max width 480px and background `#FBF6EC`, so it looks right on laptops.
- AsyncStorage session persistence must work on web (it uses localStorage).

## W3. PWA files
- `public/manifest.json`: name "Vivaham", short_name "Vivaham", start_url "/", display "standalone", background_color "#FBF6EC", theme_color "#7A1F2B", icons logo192.png and logo512.png.
- Generate `public/logo192.png`, `public/logo512.png` and `public/apple-touch-icon.png` (180x180, OPAQUE background #7A1F2B, no transparency) from the existing app icon.
- Run `npx expo customize public/index.html`, then in `<head>` add:
  ```html
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Vivaham" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#7A1F2B" />
  ```
  Keep the viewport meta tag that the template already has.
- No service worker for now (avoids stale-cache bugs during the wedding).
- Create `public/_redirects` containing exactly: `/* /index.html 200`

## W4. Invite links
- Add `EXPO_PUBLIC_APP_URL` to `.env` and `.env.example` (placeholder `https://your-site.netlify.app`). Read it in one place: `src/lib/config.ts`.
- Add react-navigation `linking` config so `https://<site>/join/<code>` opens the Join screen with the code prefilled (also keep `vivaham://join/<code>`). If the user is not signed in, they log in or sign up first, then land on Join with the code kept.
- Update the invite WhatsApp message in Settings (`src/lib/messages.ts`) to:
  ```
  You're invited to help with {wedding name} on Vivaham 🎉
  1. Open: {APP_URL}/join/{code}
  2. Sign up with your email
  3. On iPhone: Share > Add to Home Screen. On Android: menu > Install app.
  Invite code (if asked): {code}
  ```
  If `EXPO_PUBLIC_APP_URL` is empty, fall back to the old message.
- Add a "Copy link" button next to the WhatsApp button for each invite.

## W5. Build and local check
- Add npm scripts: `"build:web": "expo export -p web"`, `"serve:web": "npx serve dist -s"`.
- Run `npm run build:web`, then serve and test in Chromium with Playwright at phone size (390x844): login, Home, one screen per module, join link `/join/TESTCODE` direct load (must not 404), refresh on a deep route.
- Write results to `WEB_REPORT.md` (what works, what is disabled on web, known issues).

## W6. Docs
- Add `DEPLOY_WEB.md` with the exact manual steps for the user (below). Do not run deploy commands yourself and do not log in to Netlify.

## Manual steps for the user (put in DEPLOY_WEB.md)
1. Create a free account at netlify.com.
2. Terminal in the project: `npm install -g netlify-cli`, then `netlify login`.
3. `npm run build:web`
4. `netlify deploy --dir dist` (first time: create a new site, name e.g. vivaham-yourname). Check the draft URL, then `netlify deploy --dir dist --prod`.
5. Put the production URL in `.env` as `EXPO_PUBLIC_APP_URL=https://vivaham-yourname.netlify.app`, then rebuild and redeploy (the value is baked in at build time).
6. Supabase > Authentication > URL Configuration: set Site URL and add the same URL to Redirect URLs.
7. Open the URL on iPhone Safari and Android Chrome. iPhone: Share > Add to Home Screen. Android: menu > Install app.
8. Redeploy every time the code changes (steps 3 and 4 with `--prod`).

## Test checklist (WEB_REPORT.md must tick each)
- [ ] Opens on iPhone Safari and Android Chrome; add to Home Screen shows maroon Vivaham icon, opens full screen
- [ ] Sign up, log in, stay logged in after closing and reopening
- [ ] Create wedding, add an event, a guest, a shopping item
- [ ] Photo upload and delete on web (no black screen)
- [ ] Delete confirmations appear (no silent Alert)
- [ ] Settings > invite: WhatsApp opens with link + code; Copy link works
- [ ] Opening `/join/<code>` on a fresh browser leads to sign-up, then joins the wedding with the right role
- [ ] Refresh on any deep link does not 404
- [ ] Contact import shows the web note, no crash
- [ ] Vehicle share by WhatsApp works

## Caveats to state in the report
- Contacts import is phone-app only. Camera capture is limited on web.
- iPhone PWAs need Safari "Add to Home Screen" (Chrome on iPhone also works on recent iOS).
- No push notifications.
- Free Netlify tier is plenty for this use.
