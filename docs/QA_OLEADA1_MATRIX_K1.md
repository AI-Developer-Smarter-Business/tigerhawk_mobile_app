# QA — Oleada 1 matrix (K.1)

**Source:** `z-feedback_cliente/TABLE.jpeg` · `RESPUESTAS_CLIENTE.md` · `TASKS.md` K.1  
**App paths:** Login → tabs **Loads · Clock · Account** · load detail `/load/[id]`  
**API paths:** `lib/tms/mobile-api-routes.ts` · `docs/MOBILE_API.md`

**Automated gate (before device session):**

```bash
npm run qa:k1
```

Manual rows below must be signed on a **physical device** (or TestFlight / APK) against the live TMS host in `EXPO_PUBLIC_TMS_API_URL`.

---

## A — TABLE.jpeg row-by-row (Import/Export Pick and Run)

Render **server** `progress.label` / allowed actions only — do **not** invent status names on the phone.

| Row | Action (TABLE) | Starting → Ending (canonical strings) | Driver UI | Necessary actions | Pass | Tester / date |
|-----|----------------|----------------------------------------|-----------|-------------------|------|---------------|
| **1** | Container available | Pending → Available | (dispatch) | N/A on phone | | |
| **2A** | Assign driver | Available → Dispatched | Upcoming card appears | List refresh / Realtime | | |
| **2B** | Unassign | Dispatched → Available | Card leaves driver list | Refresh | | |
| **3** | Start move | Available → Enroute To Pick Container | **Start Move** / Accept & Start | `POST …/accept` or `…/progress` `start_move` | | |
| **4** | Arrived (pick) | Enroute To Pick Container → Arrived At Pick Container | **Arrived** | Chassis free-text ≤50; `CHASSIS_REQUIRED` prompt | | |
| **5A** | Enroute (to deliver) | Arrived At Pick Container → Enroute To Deliver Load | **Enroute** | | | |
| **5B/6** | Arrived (deliver) | Enroute To Deliver Load → Arrived At Deliver Load | **Arrived** | POD signature before leave (gate) | | |
| **7A** | Enroute (return) | Arrived At Deliver Load → Enroute To Return Empty | **Enroute** | Must have signed / pending POD | | |
| **7B/8** | Arrived (return) | Enroute To Return Empty → Arrived At Return Container | **Arrived** then **Complete** | | | |
| **9** | Complete | Arrived At Return Container → Completed | **Complete Load** | Checklist = server `missing[]` | | |

**Status label note:** TABLE spelling may vary slightly (“Arrived at” vs “Arrived At”); trust **TMS `progress.label`**. Phone never sends a raw status string.

---

## B — Accept / Reject per move (C.*)

| ID | Check | Route / UI | Pass | Tester / date |
|----|-------|------------|------|---------------|
| **B1** | Accept move (start later) | Upcoming → Accept → `POST /api/mobile/loads/{id}/accept` `{ move_id, start: false }` | | |
| **B2** | Accept & Start Move | One request `{ start: true }` (not two) | | |
| **B3** | Reject with reason | `POST …/reject` `{ move_id, reason }` | | |
| **B4** | Reject after started | `409 MOVE_ALREADY_STARTED` → “call dispatch” | | |
| **B5** | Cards are **moves**, not loads | Active / Upcoming from `GET /api/mobile/driver/loads` | | |

---

## C — POD gate + legal stamp (G.*)

| ID | Check | Route / UI | Pass | Tester / date |
|----|-------|------------|------|---------------|
| **C1** | Preview from server | `GET /api/mobile/loads/{id}/pod` — render `pod.*`; no on-device PDF | | |
| **C2** | Sign on device | Pad → `POST …/pod-signature` with `client_signature_id` (UUID once per capture) | | |
| **C3** | Pending = success | `202 STAMP_PENDING` — driver not asked to resign | | |
| **C4** | Gate leave delivery | `enroute`/`arrived` without signature → `422 POD_SIGNATURE_REQUIRED` → open signature | | |
| **C5** | Pending satisfies gate | After pending, can leave delivery | | |
| **C6** | Driver photo “POD” ≠ legal | Evidence upload stored as Driver; legal POD only via stamp | | |

---

## D — Offline signature order (G.5)

| ID | Check | Expected | Pass | Tester / date |
|----|-------|----------|------|---------------|
| **D1** | Capture signature offline | Queued `pod_signature` with stable `client_signature_id` | | |
| **D2** | Flush order | `pod-signature` **before** `enroute`/`arrived` that leaves delivery | | |
| **D3** | Retry same id | Re-POST identical `client_signature_id` → same POD (200), not a second legal doc | | |
| **D4** | Online again | Queue drains; progress actions succeed after stamp flush | | |

Code refs: offline queue + `flushPodSignaturesForLoad` before progress mutate.

---

## E — Complete + `missing[]` (H.*)

| ID | Check | Expected | Pass | Tester / date |
|----|-------|----------|------|---------------|
| **E1** | Complete Load button | `POST …/progress` `{ action: "complete" }` | | |
| **E2** | Requirements fail | `422` or `409` `REQUIREMENTS_NOT_MET` + `missing[]` | | |
| **E3** | Checklist exact | UI lists only server `missing[]` keys (chassis, container, seal, tir_out_photo, tir_in_photo, …) | | |
| **E4** | TIR Out / TIR In | Upload `document_type` `"TIR Out"` / `"TIR In"` via `POST …/documents` | | |
| **E5** | After all present | Complete succeeds; load leaves Active | | |

---

## F — Shell smoke (J / I) — quick

| ID | Check | Pass | Tester / date |
|----|-------|------|---------------|
| **F1** | Tabs Loads · Clock · Account | | |
| **F2** | Clock In/Out; Q11 copy on Clock Out; ≠ Wait Check In/Out | | |
| **F3** | Open in Maps = pin only (no turn-by-turn) | | |
| **F4** | Contact dispatch Call/Email (needs `EXPO_PUBLIC_DISPATCH_*`) | | |

---

## Master sign-off (K.1)

| Role | Build / env | `qa:k1` | Device matrix A–E | Date | Signature |
|------|-------------|---------|-------------------|------|-----------|
| Dev | | | N/A (automation) | | |
| QA / PM | APK or TestFlight + TMS URL | | | | |
| Client | | | | | |

**Related:** `docs/MOBILE_API.md` · `docs/MOBILE_BUILDS.md` · `docs/QA_RELEASE_SIGNOFF_7_1.md` (legacy Semana 5–6)
