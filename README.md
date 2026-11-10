# Vivaham

Two versions live side by side in this repository.

| Folder | Version | What it is | Status |
| --- | --- | --- | --- |
| `vivaham/` | V1 | Expo / React Native app (phone app in Expo Go + web build) | Frozen: bug fixes only. Git tag `v1.0` marks it. Live at the main Cloudflare address. |
| `vivaham-v2/` | V2 | Web app (Vite, plain JavaScript), roles Admin / Family / Helper, English and Telugu | Active. Test it at its own Cloudflare address first. |

Both use the same Supabase project and the same logins. V1 keeps its tables in the `public` schema; V2 keeps everything in its own `vivaham` schema, so they cannot interfere. V2 starts with empty data (nothing is copied from V1).

How to set up and deploy V2: see `vivaham-v2/README.md`. V1: `vivaham/DEPLOY_WEB.md`.

Plan:
1. Run `vivaham-v2/supabase/migrations/20261110_vivaham_v2.sql` in Supabase and expose the `vivaham` schema.
2. Deploy V2 to its own address, test it with the family.
3. When happy, point the main address to `vivaham-v2` (steps in `vivaham-v2/README.md`). Rolling back is the same setting in reverse.
4. Months later, once V2 has proven itself, remove V1's tables and the `vivaham/` folder (the `v1.0` tag keeps it recoverable).
