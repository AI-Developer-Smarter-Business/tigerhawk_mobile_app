# A.0 — Preview URL, SQL gate, mobile API smoke matrix

**Task:** `z-feedback_cliente/TASKS.md` → **A.0**  
**Contract:** `z-feedback_cliente/RESPUESTAS_CLIENTE.md` (14 Jul 2026)  
**Updated:** 14 July 2026

---

## 1. What A.0 confirms

| # | Check | How |
|---|--------|-----|
| 1 | Host exposes the **14 Jul** `/api/mobile/*` surface (preview until Ian merges to main) | `npm run smoke:a0` |
| 2 | SQL: clock columns + `20260714_driver_acceptance_and_pod.sql` | `supabase/sql-editor/VERIFY_driver_clock_and_acceptance_a0.sql` |
| 3 | Endpoint → expected unauthenticated status matrix documented | This file §3–§4 |

App path builders (avoid route drift): `lib/tms/mobile-api-routes.ts`.

**Código TMS (fuente actual):** `C:\Users\ariel\OneDrive\Escritorio\RECRUITING_SMARTER___BRASIL\TMS_fusion` — comparar contratos ahí.  
**Runtime Netlify:** `EXPO_PUBLIC_TMS_API_URL` (puede no incluir aún todo lo que ya está en `TMS_fusion`).

---

## 2. Preview vs production URL

| Host | Role |
|------|------|
| `EXPO_PUBLIC_TMS_API_URL` in `.env.local` / EAS today | Often **production Netlify** (e.g. `tigerhawkv2.netlify.app`) — **may lack** 14 Jul routes until main merges |
| Netlify/Vercel **preview** of Ian’s working branch | Use for A.1+ until cutover (**RESPUESTAS Q1**) |

**Actions**

1. Ask Ian for the **preview deploy URL** of the branch with auth login, `driver/loads`, accept/reject, pod/pod-signature.
2. Point local/EAS temporarily:
   ```bash
   # .env.local
   EXPO_PUBLIC_TMS_API_URL=https://<preview-host>
   ```
3. Re-run `npm run smoke:a0 -- --require-preview` until it exits 0.
4. After merge to main: point `EXPO_PUBLIC_TMS_API_URL` back to production (task **A.5**).

Optional: set `EXPO_PUBLIC_TMS_API_URL` to preview only in EAS **preview** profile when you cut over (A.5 docs).

---

## 3. Expected matrix (unauthenticated)

Smoking **without** a JWT must **not** mutate data. A **present** July-14 route returns auth/validation errors — **not** `404`.

| Probe id | Method | Path | Expect (no auth) | Meaning if `404` |
|----------|--------|------|------------------|------------------|
| `auth.login` | `POST` | `/api/mobile/auth/login` | `401` or `400` | Login not on this host |
| `driver.clock.get` | `GET` | `/api/mobile/driver/clock` | `401` / `403` | Clock missing |
| `driver.clock.post` | `POST` | `/api/mobile/driver/clock` | `401` / `403` | Clock missing |
| `driver.loads` | `GET` | `/api/mobile/driver/loads` | `401` / `403` | List missing (need 20260714 + deploy) |
| `loads.progress.get` | `GET` | `/api/mobile/loads/{id}/progress` | `401` / `403` | Progress missing |
| `loads.progress.post` | `POST` | `/api/mobile/loads/{id}/progress` | `401` / `403` | Progress missing |
| `loads.pod.get` | `GET` | `/api/mobile/loads/{id}/pod` | `401` / `403` | POD GET missing |
| `loads.pod-signature` | `POST` | `/api/mobile/loads/{id}/pod-signature` | `401` / `403` | POD stamp missing |
| `loads.accept` | `POST` | `/api/mobile/loads/{id}/accept` | `401` / `403` | Accept missing |
| `loads.reject` | `POST` | `/api/mobile/loads/{id}/reject` | `401` / `403` | Reject missing |
| `loads.documents` | `POST` | `/api/mobile/loads/{id}/documents` | `401`/`403`/`400`/`415`/`422` (or legacy `500`) | Upload route oddity |

`{id}` in smoke = nil UUID `00000000-0000-0000-0000-000000000000` (safe placeholder).

**Class labels** from `npm run smoke:a0`: `present` · `missing` · `server_error` · `unexpected` · `network_error`.

Authenticated `200` / business `409`/`422` belong to **A.1** (with QA driver).

---

## 4. Recorded smoke — production Netlify (14 Jul 2026)

**Host probed:** `tigerhawkv2.netlify.app` (value of `EXPO_PUBLIC_TMS_API_URL` in local env)  
**Method:** unauthenticated; status codes only (no response bodies stored).

| Probe id | Method | Status | Class |
|----------|--------|--------|-------|
| `auth.login` | POST | 404 | missing |
| `driver.clock.get` | GET | 404 | missing |
| `driver.clock.post` | POST | 404 | missing |
| `driver.loads` | GET | 404 | missing |
| `loads.progress.get` | GET | 404 | missing |
| `loads.progress.post` | POST | 404 | missing |
| `loads.pod.get` | GET | 404 | missing |
| `loads.pod-signature` | POST | 404 | missing |
| `loads.accept` | POST | 404 | missing |
| `loads.reject` | POST | 404 | missing |
| `loads.documents` | POST | 500 | server_error (legacy route reacts; not July-14 gate) |

**Verdict:** July-14 surface is **not** on this production host yet → **blocked for A.1+ against prod URL**. Unblock by setting `EXPO_PUBLIC_TMS_API_URL` to Ian’s **preview** deploy, then re-run:

```bash
npm run smoke:a0 -- --base-url=https://<preview-host> --require-preview
```

Paste the new table under **§4b Preview smoke** when available.

### §4b Preview smoke (fill when URL known)

| Probe id | Status | Class |
|----------|--------|-------|
| _(pending preview URL)_ | — | — |

---

## 5. SQL checklist

1. Open Supabase SQL Editor (shared Tigerhawk project).  
2. Run `supabase/sql-editor/VERIFY_driver_clock_and_acceptance_a0.sql`.  
3. Confirm:
   - **§1** returns `clock_status`, `clocked_in_at`, `mobile_enabled` (RESPUESTAS Q10).  
   - **§2** objects from `20260714_driver_acceptance_and_pod.sql` (ask Ian for the file if not in mobile repo).  
4. Record pass/fail here:

| Check | Result (14 Jul) | Notes |
|-------|----------------|-------|
| Clock columns on `drivers` | ⏸ run in SQL Editor | Client states applied; verify before Clock UI |
| `20260714_driver_acceptance_and_pod.sql` | ⏸ | Required for accept / pod / `driver/loads` |
| ≥1 `mobile_enabled` driver | ⏸ | Needed for A.6 |

---

## 6. Commands

```bash
# Against .env.local EXPO_PUBLIC_TMS_API_URL
npm run smoke:a0

# Explicit preview
npm run smoke:a0 -- --base-url=https://<preview> --require-preview

# Machine-readable
npm run smoke:a0 -- --json
```

Route unit tests: `lib/tms/__tests__/mobile-api-routes.test.ts`.

---

## 7. Done criteria (A.0)

- [x] Expected endpoint matrix documented (this file §3).  
- [x] Smoke tool + recorded result against current EAS/prod host (§4).  
- [x] SQL verify script checked into `supabase/sql-editor/`.  
- [x] Canonical mobile paths in `lib/tms/mobile-api-routes.ts`.  
- [ ] Preview host re-smoke `present` for all July-14 probes (**external** — needs Ian’s URL).  
- [ ] SQL §1–§2 verified on shared Supabase by a human with Editor access.

**Status in TASKS:** `[~]` until the two external checks above are filled. Local engineering deliverable for A.0 is complete; A.1 starts once `smoke:a0 --require-preview` passes on the preview host.
