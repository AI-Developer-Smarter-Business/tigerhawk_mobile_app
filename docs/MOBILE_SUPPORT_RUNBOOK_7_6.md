# Support runbook — Tigerhawk Mobile (task 7.6)

Short **operations guide** for dispatch, QA, and technical support after v0.1.0 handoff.  
**Not** a developer onboarding doc — see `README.md` for install and `docs/BUG_REPORTING.md` for issue templates.

---

## 1. Escalation tiers

| Tier | Who | Typical symptoms | First actions |
|------|-----|------------------|---------------|
| **L1 — Driver / dispatch** | Field + dispatcher | “Can’t see my loads”, slow list, upload failed once | Pull-to-refresh; confirm Wi‑Fi/mobile data; retry upload; note load **reference #** |
| **L2 — App support** | PM / internal support | Login works for some drivers only; View link expired; status blocked by hold | Use §2–§4 below; collect version + TMS URL (no secrets) |
| **L3 — Engineering** | Dev + DBA | RLS `42501`, all drivers see wrong data, Realtime never updates, TMS 401/403 on every action | `docs/BUG_REPORTING.md` P0/P1; `docs/ROLLBACK_PP2.md`; TMS patches in `docs/TMS_PATCH_*.md` |

**Custody:** production Expo/EAS and keystore → `docs/EAS_CREDENTIALS_HANDOFF_7_5.md`.

---

## 2. RLS (Row Level Security)

**Symptom:** empty **My Loads**, “permission denied”, or driver sees **no** documents on an assigned load.

| Check | Action |
|-------|--------|
| User is `role = driver` in `user_profiles` | Fix profile in TMS admin / Supabase |
| Load has `driver_id =` that user’s UUID | Reassign in TMS dispatcher |
| PP2 policies applied | Run `supabase/sql-editor/VERIFY_pp2_driver_rls_policies.sql` in SQL Editor |
| Client tried direct `UPDATE` on `loads` | **Expected to fail** — status must go through TMS API (`docs/MOBILE_API.md`) |

**Do not** revert RLS without DBA + written approval — wrong policy can expose all loads (`docs/ROLLBACK_PP2.md` §3).

**Reference:** `docs/RLS_MOBILE_REVIEW.md`, migration `20260518120000_pp2_driver_scoped_load_messages_documents.sql`.

---

## 3. Storage and documents

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| **View** opens then “link expired” | Signed URL TTL (~1 h) | Pull-to-refresh on load detail; tap **View** again |
| Upload fails immediately offline | By design | Wait for network; banner **Offline** |
| Upload fails online (50 MB / type) | Validation | Only images for driver photo; max **50 MB** (`validate-driver-upload-file`) |
| Upload 401/403 online | TMS Bearer / route | Confirm `TMS_PATCH_MOBILE_BEARER_AUTH` + `TMS_PATCH_4_1_DRIVER_DOCUMENTS` on **production** TMS |
| File in app but missing in TMS | TMS POST failed after Storage | Check TMS logs; QA matrix `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` |

**Read path:** Supabase `load_documents` + signed URLs (RLS-scoped).  
**Write path (v1):** TMS `POST /api/mobile/loads/{id}/documents` type **`Driver`** — not direct Storage INSERT from mobile.

---

## 4. TMS API and auth

| HTTP | Meaning | Support hint |
|------|---------|----------------|
| **401** | Session / Bearer | Driver re-login; confirm TMS accepts Supabase JWT |
| **403** | Transition or hold | Active **hold** blocks status — dispatch clears in TMS |
| **404** | Wrong load id or route | Confirm load assigned to driver; TMS mobile routes deployed |
| **5xx** | TMS or Supabase outage | Escalate L3; check Netlify/host status |

Field actions use **mobile rules** (`lib/loads/driver-actions.ts`), not a live TMS “menu API”. TMS rule changes require an **app update** until v1.1 dynamic rules (if ever).

---

## 5. Realtime and refresh

| Symptom | Check |
|---------|--------|
| Status/documents stale until manual refresh | `loads` + `load_documents` in publication — `enable_realtime_pp2_driver_sync.sql` |
| Updates after reconnect only | Normal — `QueryNetworkRecovery` refetches; foreground throttle 30 s / 15 s docs |

---

## 6. Quick triage commands (support engineers)

```bash
npm run qa:7.1          # automated release gate
npm run build:preflight # EAS config before APK
```

Manual matrices: `docs/QA_RELEASE_SIGNOFF_7_1.md`, `docs/QA_SMOKE_E2E_5_7.md`.

**Telemetry (no PII in logs):** `docs/MOBILE_TELEMETRY.md` — use `safeLog` only in dev builds.

---

## 7. When to open an incident

| Severity | Examples | Doc |
|----------|----------|-----|
| **P0** | Wrong driver sees another’s loads; cannot login fleet-wide | `docs/ROLLBACK_PP2.md` decision template |
| **P1** | All uploads fail; all status changes fail on production TMS | Same + TMS deploy rollback (TMS repo) |
| **P2/P3** | Copy, slow list, single device | `docs/BUG_REPORTING.md` |

**Post–v1.1 features** (push, live map, messages): `docs/BACKLOG_V1_1_7_7.md` — not in L1 scope for v0.1.0.

---

## 8. Contacts (fill at handoff)

| Role | Name | Channel |
|------|------|---------|
| Primary app support | | |
| TMS / Netlify deploy | | |
| Supabase DBA | | |
| EAS / APK distribution | | |

---

**Related:** `docs/DRIVER_TMS_CAPABILITIES_5_7.md`, `docs/QA_DRIVER_UPLOAD_E2E_6_4.md`, `docs/GPS_V1_DECISION.md`, `docs/OFFLINE_V1.md`.
