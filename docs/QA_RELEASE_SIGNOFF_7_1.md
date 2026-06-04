# QA — Release sign-off (task 7.1)

Formal closure of **P0** and **P1** from **Semanas 5–6**, plus smoke, before **7.2** APK and **9 Jun 2026** deadline.

**Automated gate (dev, before manual session):**

```bash
npm run qa:7.1
```

Runs lint, secret guard, upload/documents/location/network tests, and route/release guards.

---

## P0 / P1 — closure matrix

| ID | Backlog item (5.7) | Code / deploy status | Manual proof required |
|----|-------------------|---------------------|------------------------|
| **P0** | TMS **Bearer** on status `PATCH` + documents `GET`/`POST` | TMS + mobile paths in **6.2** (`/api/mobile/loads/…/documents`, Bearer + `access_token`). Field actions still depend on TMS host matching patch. | **S7** smoke + **§F** actions 1–2 on **production TMS** with assigned load |
| **P1** | **Driver photo** upload (Semana 6) | **6.1–6.6** ✅ — upload, validation, QA runbook, compress | **§6.4** rows **D1, D2, D4, D6, D7** on device + TMS **Documents** |

**Out of 7.1 scope (v1.1):** push, messages, live GPS map (Semana 8), tap-to-call (P2) — see `docs/BACKLOG_V1_1_7_7.md`.

---

## Manual checklists (sign each block)

| Block | Document | Required rows |
|-------|----------|---------------|
| Smoke happy path | `docs/QA_SMOKE_E2E_5_7.md` | **S1–S10** |
| Documents production | `docs/QA_PRODUCTION_SIGNOFF_5_6.md` | **A1–A5**, **B1–B4**, **C1–C3**, **E1–E2** |
| Driver upload E2E | `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` | **D1–D7** (min); **D2–D3** for full E2E |
| Offline reconnect | `docs/QA_NETWORK_RECONNECT_5_5.md` | **R1–R3** (subset of §C) |
| GPS foreground | `docs/QA_DRIVER_LOCATION_5_4.md` | Spot-check on device |
| Field actions | `docs/QA_DRIVER_ACTIONS_3_7.md` | **1–2** after P0 Bearer verified; **3–5** best effort |

**App path (all rows):** Login → **My Loads** → load → **POD / Documents** / **Field actions** / **Your location** → drawer **Account** → **Log Out**.

---

## Master sign-off (7.1)

| Check | Dev (`npm run qa:7.1`) | QA / PM (device + prod) | Client |
|-------|------------------------|-------------------------|--------|
| Automated preflight green | | N/A | |
| P0 Bearer — status change works | | | |
| P0 Bearer — document View / upload | | | |
| P1 Upload — mobile → TMS + Realtime | | | |
| Smoke S1–S10 | | | |
| Documents A + offline C | | | |
| No P0 crash on load detail | | | |

| Role | Date | Build / env | Notes |
|------|------|-------------|-------|
| Dev | | `qa:7.1` + commit SHA | |
| QA / PM | | APK or Expo Go + `EXPO_PUBLIC_TMS_API_URL` prod | |
| Client | | | P0 TMS URL + Supabase project confirmed |

---

**Related:** `docs/DRIVER_TMS_CAPABILITIES_5_7.md`, `docs/QA_DRIVER_UPLOAD_E2E_6_4.md`, `docs/MOBILE_BUILDS.md` (7.2).
