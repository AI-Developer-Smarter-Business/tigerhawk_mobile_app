# QA — Production sign-off (task 5.6)

Execute **documents §A–C** and **driver actions regression (3.7)** against **live TMS** + same Supabase project as the mobile app.

**Sources (detail):**

| Area | Doc |
|------|-----|
| Documents TMS → mobile, View, offline | `docs/QA_DRIVER_DOCUMENTS_4_7.md` §A–C, §E |
| Field actions vs web panel | `docs/QA_DRIVER_ACTIONS_3_7.md` |
| Offline reconnect | `docs/QA_NETWORK_RECONNECT_5_5.md` (subset C3) |
| TMS Bearer (status + fresh doc URLs) | `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md` |

---

## 0 — Preflight (before manual QA)

```bash
npm run qa:5.6
```

Equivalent to `npm run ci` plus Jest focus on documents, actions, network, and route helpers.

| Check | Pass |
|-------|------|
| `EXPO_PUBLIC_SUPABASE_URL` / anon key → **production** Supabase | |
| `EXPO_PUBLIC_TMS_API_URL` → `https://tms.tigerhawklogistics.com` (no `localhost`) | |
| `enable_realtime_load_documents.sql` applied in Supabase SQL Editor | |
| Driver user with **assigned** loads (e.g. `driver_test@test.com`) | |
| Physical device or Expo Go on same network as TMS | |

**App path (all manual rows):** Login → **My Loads** → tap load → scroll **POD / Documents** / **Field actions**.

| Layer | Route / module |
|-------|----------------|
| Load detail screen | `app/load/[id].tsx` |
| Load id normalization | `normalizeLoadIdParam` in `lib/loads/document-load-association.ts` |
| Documents UI | `components/loads/LoadDocumentsSection.tsx` |
| Documents data | `hooks/useLoadDocumentsQuery.ts` → `fetchDriverLoadDocuments` |
| View open | `lib/loads/open-load-document.ts` |
| Field actions | `components/loads/DriverActionBar.tsx` → `PATCH …/status` |

---

## A — Documents §A (TMS → mobile)

Use matrix **A1–A5** in `docs/QA_DRIVER_DOCUMENTS_4_7.md`.

| Row | Production notes |
|-----|------------------|
| A1–A4 | Uses **Supabase Realtime** on `load_documents` + pull-to-refresh; TMS upload/delete does not require Bearer for list sync. |
| A5 **View** | Opens signed URL; if link stale, app refetches list. **Fresh URLs** work best when TMS **GET** documents accepts Bearer (`TMS_PATCH_MOBILE_BEARER_AUTH`). Without it, View may still work from Supabase `url` if not expired. |

| Row | Pass | Tester | Date |
|-----|------|--------|------|
| A1 | | | |
| A2 | | | |
| A3 | | | |
| A4 | | | |
| A5 | | | |

---

## B — Documents §B (View / signed URLs)

Use matrix **B1–B4** in `docs/QA_DRIVER_DOCUMENTS_4_7.md`.

| Row | Pass | Tester | Date |
|-----|------|--------|------|
| B1 | | | |
| B2 | | | |
| B3 | | | |
| B4 | | | |

**Skip §D** (driver upload) until Semana 6 / TMS 4.1 + UI 4.8.

---

## C — Documents §C + offline regression

Use matrix **C1–C3** in `docs/QA_DRIVER_DOCUMENTS_4_7.md`. Align with **R1–R3** in `docs/QA_NETWORK_RECONNECT_5_5.md` if needed.

| Row | Pass | Tester | Date |
|-----|------|--------|------|
| C1 | | | |
| C2 | | | |
| C3 | | | |

---

## E — Association (quick)

| Row | Pass | Tester | Date |
|-----|------|--------|------|
| E1 | | | |
| E2 | | | |

---

## F — Driver actions regression (task 3.7)

Use `docs/QA_DRIVER_ACTIONS_3_7.md` on **production TMS** + same load on mobile.

| Row | Expected in production (May 2026) |
|-----|-----------------------------------|
| 1–2 | **Blocked** until TMS deploys `TMS_PATCH_MOBILE_BEARER_AUTH` — mobile shows **Session expired** on PATCH (see `REPORTES_DIARIOS.md` Tarea 3, 28 may). Mark **N/A** or **Fail (TMS)** until patch. |
| 3 | **Holds** — can test if load has active hold; buttons disabled + banner. |
| 4–5 | UI parity only if status allows (may need dispatch to set status on web first). |

| Row | Pass | Tester | Date | Notes |
|-----|------|--------|------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

**Accessibility (3.7):** spot-check orange buttons ≥ 48dp on load detail.

---

## Sign-off summary (5.6)

| Scope | Required for 5.6 close | Status |
|-------|-------------------------|--------|
| Documents A1–A5 | Yes | |
| Documents B1–B4 | Yes | |
| Offline C1–C3 | Yes | |
| Association E1–E2 | Yes | |
| Actions 1–2 (status PATCH) | After TMS Bearer deploy | |
| Actions 3–5 | Best effort | |
| `npm run qa:5.6` | Yes | |

| Role | Date | Build / env | Notes |
|------|------|-------------|-------|
| Dev | | `npm run qa:5.6` | |
| QA / PM | | Production TMS + device | |
| Client | | | Bearer patch priority (see daily report Tarea 3) |
