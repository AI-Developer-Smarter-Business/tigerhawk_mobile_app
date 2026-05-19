# Supabase auth redirect URLs (PP2 mobile)

Add these in **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:

| Environment | URL |
|-------------|-----|
| Dev (Expo Go) | Copy from login screen footer in `__DEV__` (e.g. `exp://…/--/auth/callback`) |
| Standalone / APK | `pp2://auth/callback` |

**Site URL** can remain the TMS web URL; mobile uses its own redirect for magic links.

After changing redirect URLs, magic-link sign-in from the app uses `signInWithOtp` with `emailRedirectTo` from `getAuthRedirectUri()` (`lib/auth/redirect-uri.ts`).
