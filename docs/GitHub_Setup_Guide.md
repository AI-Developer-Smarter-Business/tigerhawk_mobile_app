# PP2 mobile — GitHub & CI setup

Short guide for the **mobile repo** (not the full TMS monorepo). For TMS collaboration workflow, see `PROYECTO_MUESTRA/docs/GitHub_Setup_Guide.md` (read-only reference).

---

## Repository

1. Create a **private** GitHub repo for `pp2-mobile` (or use the client’s org).
2. Default branch: `main` or `develop` (both are wired in CI).
3. Never commit `.env.local` — it is in `.gitignore`.

---

## First clone (developer)

```bash
git clone <repo-url>
cd proyecto_PP2_app_mobile
npm ci
cp .env.example .env.local
# Edit .env.local: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
npm start
```

---

## CI (automatic on push / PR)

File: `.github/workflows/ci.yml`

Runs on branches `main`, `master`, `develop`:

1. `npm ci`
2. `npm run lint` — TypeScript (`tsc --noEmit`)
3. `npm run check:secrets` — no service role / admin client in mobile source
4. `npm test -- --ci --coverage`

Run the same locally before opening a PR:

```bash
npm run ci
```

---

## Branch protection (recommended)

On GitHub → Settings → Branches → rule for `main`:

- Require status check **quality** (CI job) before merge.
- Require pull request review (optional).

---

## Secrets on GitHub

| Secret | Use in PP2 mobile CI? |
|--------|------------------------|
| None required today | Current workflow only installs and tests |
| `EXPO_TOKEN` | Only when adding EAS build workflow (week 6–8) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Do not add** for mobile CI |

Privileged keys stay on developer machines (`scripts/`) and on the **TMS** Netlify deployment.

---

## Pull request checklist

- [ ] `npm run ci` passes locally
- [ ] No `EXPO_PUBLIC_` prefix on service role or DB password
- [ ] Functional change logged in `REPORTES_DIARIOS.md` and `DAILY_REPORTS.md` (same day)
- [ ] No edits under `PROYECTO_MUESTRA/`

---

## Related docs

- `docs/SECRETS_AND_BFF.md` — full secrets & BFF matrix (task 1.8)
- `README.md` — env vars and scripts
