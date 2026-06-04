# Rollback plan — PP2 mobile + Supabase (task 7.4)

How to revert **Tigerhawk Mobile v0.1.0** and related **Supabase** changes if release QA fails.  
**TMS web** deploys are rolled back in the TMS repository — not in this repo.

---

## 1. Mobile app (APK)

| Action | Steps |
|--------|--------|
| **Stop new installs** | Do not distribute the failing APK link from EAS. |
| **Revert drivers** | Reinstall previous known-good APK (keep copy of last good `preview` build URL). |
| **Expo Go** | Pin testers to an earlier git tag / branch and `npx expo start` only for dev — not for production drivers. |

No server-side rollback for the app binary except shipping an older build.

---

## 2. Supabase — scripts touched by PP2

Apply changes only in **Supabase Dashboard → SQL Editor** on the **shared TMS project**.  
Files live in `supabase/sql-editor/` (run order) and `supabase/migrations/` (git history).

| Order | File | Purpose | Rollback impact |
|-------|------|---------|-----------------|
| 1 | `20260518120000_pp2_driver_scoped_load_messages_documents.sql` | Driver-scoped SELECT on `load_messages`, `load_documents` | Revert policies only with DBA review — see §3 |
| 2 | `20260601120000_pp2_driver_upload_load_documents.sql` | Driver INSERT/upload policies (if applied) | Drop PP2 upload policies if upload must be disabled |
| 3 | `enable_realtime_loads.sql` | `loads` in `supabase_realtime` | Optional: remove from publication (§4) |
| 4 | `enable_realtime_load_documents.sql` | `load_documents` in publication | Superseded by `enable_realtime_pp2_driver_sync.sql` |
| 5 | `enable_realtime_pp2_driver_sync.sql` | `loads` + `load_documents` in publication | Optional: remove tables from publication (§4) |

**Verify before/after:** `VERIFY_pp2_driver_rls_policies.sql`, `VERIFY_driver_tms_upload_prereqs.sql`.

---

## 3. RLS rollback (high risk — coordinate with TMS)

PP2 replaced broad **Authenticated read** policies with **staff** + **driver-on-assigned-load** policies.

Rollback is **not** a single button:

1. Export current policies from Supabase (Dashboard → Authentication → Policies).
2. If reverting mobile-only scope, restore previous policy definitions from TMS migration history **only** with approval — wrong policy can expose all loads to all drivers.
3. Preferred mitigation without policy revert: **disable mobile app** and keep tightened RLS (safer).

Document who approved policy revert: _______________

---

## 4. Realtime rollback (low risk)

To disable live sync without deleting data:

```sql
-- Only if you must disable PP2 live list refresh (run one at a time if present)
ALTER PUBLICATION supabase_realtime DROP TABLE public.load_documents;
ALTER PUBLICATION supabase_realtime DROP TABLE public.loads;
```

**Effect:** mobile and TMS stop receiving live events; **pull-to-refresh** still works.

Re-enable: run `enable_realtime_pp2_driver_sync.sql` again.

---

## 5. Storage / `load_documents` data

| Scenario | Action |
|----------|--------|
| Bad driver uploads | Delete rows in `load_documents` from TMS UI or SQL; remove object in Storage bucket `load-documents` if needed |
| Disable driver upload only | Revoke INSERT policies from `20260601120000_…` / `DRIVER_DOCUMENT_UPLOAD_NOTES.sql`; TMS dispatch upload unchanged |

---

## 6. TMS API (external)

| Feature | Rollback |
|---------|----------|
| Mobile Bearer / `/api/mobile/loads/…/documents` | Redeploy previous TMS build on Netlify/host |
| Status PATCH | Same — previous TMS commit |

Mobile env `EXPO_PUBLIC_TMS_API_URL` can point to a previous TMS host if DNS rollback is used.

---

## 7. Decision log (fill on incident)

| Field | Value |
|-------|--------|
| Date | |
| Symptom | |
| Rollback scope | App only / Realtime / RLS / TMS |
| Executed by | |
| Verified by | |
| Forward fix ticket | |

**Related:** `docs/QA_RELEASE_SIGNOFF_7_1.md`, `docs/MOBILE_BUILDS.md`, `docs/RLS_MOBILE_REVIEW.md`.
