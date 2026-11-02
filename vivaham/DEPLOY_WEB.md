# Deploy Vivaham to the web (Cloudflare Pages)

Do these steps yourself in the Terminal, in the `vivaham` folder.

1. Create a free account at cloudflare.com.
2. Log in from the Terminal: `npx wrangler login`. It opens the browser; allow access.
3. Build the web version: `npm run build:web`
4. Deploy: `npx wrangler pages deploy dist --project-name vivaham`. The first time, confirm creating the project `vivaham`. Open the URL it prints (for example `https://vivaham.pages.dev`) and check the app. If the name is taken, Cloudflare gives the site a slightly different address; use the one it prints.
5. Put the production URL in `.env` as `EXPO_PUBLIC_APP_URL=https://vivaham.pages.dev`, then rebuild and redeploy (steps 3 and 4). The value is baked in at build time, so invite links only work after this rebuild.
6. In Supabase, go to Authentication > URL Configuration: set Site URL to the same URL and add it to Redirect URLs (for example `https://vivaham.pages.dev/**`).
7. Open the URL on iPhone Safari and Android Chrome. iPhone: Share > Add to Home Screen. Android: menu > Install app.
8. Every time the code changes, redeploy: `npm run build:web`, then `npx wrangler pages deploy dist --project-name vivaham`.

To check the build on your Mac before deploying: `npm run build:web`, then `npm run serve:web`, and open the address it prints.
