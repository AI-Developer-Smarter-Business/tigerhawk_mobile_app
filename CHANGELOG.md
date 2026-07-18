# Changelog

All notable changes to **Tigerhawk Mobile** (`pp2-mobile`) follow [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Version alignment: `package.json`, `app.json` → `expo.version`, and `docs/RELEASE_NOTES_<version>.md`.

## [Unreleased]

### Added (mobile — receipt signature SIG.1–SIG.7 · 8 Jul 2026)

- DHL-style **Sign on device** pad (`SignaturePad` / `SignatureCaptureModal`) — finger/stylus → PNG
- Export via `lib/media/signature-export.ts`; upload through existing document path (complements photo POD)
- QA: `docs/QA_DRIVER_SIGNATURE.md`

### Changed (mobile — signature document type · 8 Jul 2026)

- **Sign on device** auto-selects **POD**; signature uploads always send `document_type: POD` (WT.28 wait auto-stop)
- TMS multipart upload reads signature PNG as `Blob` (fixes empty file body from expo-file-system cache URIs)

### Added (TMS — wait time emails WT.27–32)

- Customer detention emails at **45 min**, **60 min**, and **wait close** (`detention_warning_45`, `detention_started`, `detention_completed`)
- e-POD / POD upload auto-stop for open delivery wait (WT.28)
- Server cron for offline-safe email delivery (WT.32)
- Client config doc: `docs/DETENTION_EMAIL_CLIENT_CONFIG.md` (WT.33)

### Planned (v1.1)

- Push notifications, load messages API, E2E automation

---

## [0.1.0] - 2026-06-03

First production-ready **driver** release for field use (deadline 9 Jun 2026).

### Added

- Supabase Auth (password + magic link, `pp2://auth/callback`)
- **My Loads** with RLS, pagination, pull-to-refresh, Realtime on `loads` / `load_documents`
- Load detail: route, customer, container, timeline, holds, field actions
- **POD / Documents:** view TMS uploads; **Add driver photo** (type `Driver`)
- Client upload validation (MIME, 50 MB, offline block); light image resize/compress
- Foreground GPS + **Share location** (manual; not auto TMS tracking)
- Offline v1 banner and reconnect recovery
- TMS drawer chrome; driver-only role gate
- Jest suites + `npm run ci`; QA runbooks (`docs/QA_RELEASE_SIGNOFF_7_1.md`)

### Security

- Client secret guard (`npm run check:secrets`)
- Driver-scoped RLS on `load_messages` / `load_documents` (Supabase migrations)

### Documentation

- `docs/MOBILE_BUILDS.md`, `docs/RELEASE_NOTES_0_1_0.md`, `README` install/env/bugs

[0.1.0]: https://github.com/your-org/pp2-mobile/compare/v0.0.0...v0.1.0
