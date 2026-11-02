# Deploy Vivaham to the web (Netlify)

Do these steps yourself in the Terminal, in the `vivaham` folder.

1. Create a free account at netlify.com.
2. Install the Netlify tool and log in: `npm install -g netlify-cli`, then `netlify login`.
3. Build the web version: `npm run build:web`
4. Deploy a draft: `netlify deploy --dir dist`. The first time, choose "Create & configure a new site" and give it a name, e.g. `vivaham-yourname`. Open the draft URL it prints and check the app. Then publish: `netlify deploy --dir dist --prod`.
5. Put the production URL in `.env` as `EXPO_PUBLIC_APP_URL=https://vivaham-yourname.netlify.app`, then rebuild and redeploy (steps 3 and 4 with `--prod`). The value is baked in at build time, so invite links only work after this rebuild.
6. In Supabase, go to Authentication > URL Configuration: set Site URL to the same URL and add it to Redirect URLs (for example `https://vivaham-yourname.netlify.app/**`).
7. Open the URL on iPhone Safari and Android Chrome. iPhone: Share > Add to Home Screen. Android: menu > Install app.
8. Every time the code changes, redeploy: `npm run build:web`, then `netlify deploy --dir dist --prod`.

To check the build on your Mac before deploying: `npm run build:web`, then `npm run serve:web`, and open the address it prints.
