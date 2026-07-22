# Versioning — Tigerhawk Mobile (task 7.3)

## Semver

| Part | When to bump | Examples |
|------|----------------|----------|
| **MAJOR** | Breaking driver flows, min TMS/Supabase contract change | New auth provider, removed screens |
| **MINOR** | New features, backward compatible | Upload types, new drawer item |
| **PATCH** | Fixes, copy, perf, no contract change | Validation message, throttle tweak |

**Sources of truth (must match on release):**

- `package.json` → `"version"`
- `app.json` → `expo.version`
- `CHANGELOG.md` → new section
- `docs/RELEASE_NOTES_<major>_<minor>_<patch>.md` (user-facing summary)

## Release checklist (dev)

1. Bump version in `package.json` and `app.json`.
2. Add `CHANGELOG.md` section and `docs/RELEASE_NOTES_*.md` matching that version.
3. `npm run qa:k1` (oleada 1) and/or `npm run qa:7.1`; then `npm run build:preflight`.
4. EAS build `preview` / `production` with updated store build number (EAS remote version).
5. Tag git: `git tag v0.1.2` (when repo tags releases).

## EAS / stores

- `eas.json` uses `"appVersionSource": "remote"` — store build numbers managed by EAS.
- Android **preview** = internal APK; **production** = release APK profile in this repo.
- iOS: bump **marketing version** when TestFlight already has the same `version`+build (see K.3 / `docs/MOBILE_BUILDS.md`).

**Related:** `docs/MOBILE_BUILDS.md`, `docs/QA_OLEADA1_MATRIX_K1.md`, `docs/ROLLBACK_PP2.md`.
