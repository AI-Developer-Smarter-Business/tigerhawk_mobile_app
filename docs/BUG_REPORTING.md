# Bug reporting — Tigerhawk Mobile (task 7.3)

Use this template for QA, drivers, or dispatch when something fails in the **installed app** or **Expo Go**.

## Before reporting

1. Note **app version** (Account screen or APK label) — e.g. **0.1.0**.
2. Note **environment:** production TMS URL, Supabase project name (not keys).
3. Try **pull-to-refresh** on **My Loads** or load detail.
4. For uploads: confirm **internet** (offline blocks upload).

## Report template (copy to email / issue)

```
Product: Tigerhawk Mobile (PP2 driver app)
Version: 0.1.0
Build: preview APK | production APK | Expo Go
Device: Android &lt;model&gt; / iOS &lt;model&gt;
OS version:

Driver email (no password):
Load reference # (if applicable):
Screen: Login | My Loads | Load detail | POD/Documents | Field actions | Account

Steps:
1.
2.
3.

Expected:
Actual:

Screenshot or screen recording: yes/no
Time (timezone):
```

## Severity guide

| Level | Examples |
|-------|----------|
| **P0** | Cannot login; crash on open; data leak across drivers |
| **P1** | Cannot upload photo; status change always fails; list empty for assigned loads |
| **P2** | Wrong copy, slow refresh, View link expired after long idle |
| **P3** | Cosmetic |

## What not to send

- Passwords, magic links, Supabase **service role** key, JWT tokens, full `.env.local`

## Dev reproduction

```bash
npm run ci
npm run qa:7.1
```

Reference QA matrices: `docs/QA_RELEASE_SIGNOFF_7_1.md`, `docs/QA_DRIVER_UPLOAD_E2E_6_4.md`.

**Support triage (RLS, Storage, escalation):** `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md`.
