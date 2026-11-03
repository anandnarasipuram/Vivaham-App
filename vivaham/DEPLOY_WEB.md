# Deploy Vivaham to the web (Cloudflare Workers)

The site is a Cloudflare Worker that serves the built app from `dist`. `wrangler.jsonc` in this folder tells Cloudflare to answer every unknown address (for example `/join/<code>` or a refresh on `/events/...`) with the app, so deep links never 404. The address will be `https://vivaham-app.<your-subdomain>.workers.dev`.

## Option A: automatic builds from GitHub (the project you created in the dashboard)

1. Push the code: in the `Vivaham-App` folder run `git push`. Cloudflare builds what is on GitHub.
2. In the Cloudflare dashboard, open Workers & Pages > vivaham > Settings > Build and set:
   - Root directory: `vivaham`
   - Build command: `npm run build:web`
   - Deploy command: `npx wrangler deploy`
3. In the same place, under Variables, add (as build variables):
   - `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`: the same values as in your `.env` (the publishable key only, never the secret key).
   - `EXPO_PUBLIC_APP_URL`: the site address, once you know it (step 5).
4. Start a build (Deployments > Retry, or push again). When it finishes, open the address shown on the project page and check the app.
5. Set `EXPO_PUBLIC_APP_URL` to that address (in the Cloudflare variables and in your `.env`), then build again. The value is baked in at build time, so invite links only work after this rebuild.
6. In Supabase, go to Authentication > URL Configuration: set Site URL to the same address and add it to Redirect URLs (for example `https://vivaham-app.<your-subdomain>.workers.dev/**`).
7. Open the address on iPhone Safari and Android Chrome. iPhone: Share > Add to Home Screen. Android: menu > Install app.
8. Every time you push, Cloudflare builds and deploys again.

## Option B: deploy from your Mac

1. Log in once: `npx wrangler login` (opens the browser; allow access).
2. Build: `npm run build:web` (uses the values in your `.env`).
3. Deploy: `npx wrangler deploy`. It prints the site address.
4. Steps 5 to 7 of option A apply in the same way (here `EXPO_PUBLIC_APP_URL` only needs to be in `.env`).
5. Every time the code changes: `npm run build:web`, then `npx wrangler deploy`.

To check the build on your Mac before deploying: `npm run build:web`, then `npm run serve:web`, and open the address it prints.
