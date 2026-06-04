# Driver capabilities — TMS audit (task 5.7)

Read-only review of **TMS TigerHawk** (`PROYECTO_MUESTRA/`) vs **Tigerhawk Mobile** v1. Informs smoke QA and backlog before **9 Jun 2026**.

## Driver identity and permissions (TMS)

| Layer | Driver can | Driver cannot |
|-------|------------|---------------|
| **Supabase RLS** | Read **own** assigned `loads` (`driver_id` = user); read `load_documents` for those loads | Update loads directly from mobile client (status goes through TMS API) |
| **TMS API** | `PATCH …/loads/[id]/status` for **field** statuses (when Bearer works) | Dispatcher-only transitions (`Dispatched`, `Assigned`, `Completed`, etc.) |
| **TMS API** | `GET/POST …/loads/[id]/documents` when patches deployed | Admin, finance, planner, equipment modules |
| **Holds** | See active holds; blocked from status change (same as web non-admin) | Clear holds (dispatch/admin) |

Reference: `DriverActionPanel.tsx` → `DRIVER_STATUSES` vs dispatcher buttons; mobile mirrors via `lib/loads/driver-actions.ts`.

---

## TMS features relevant to drivers

| TMS area | What dispatch uses | Mobile v1 | Recommendation |
|----------|-------------------|-----------|----------------|
| **Load board / detail** | Full load panel | **My Loads** + load detail | ✅ Keep |
| **Driver Action Panel** | Field status buttons | **Field actions** card | ✅ Blocked until `TMS_PATCH_MOBILE_BEARER_AUTH` |
| **Documents tab** | Upload/view POD, Photo | **View** + list; upload **Semana 6** | ✅ 6.2–6.4 |
| **Driver Itinerary** | Day view of moves per driver | Not built | **v1.1** — optional sort/filter “today” on My Loads |
| **Messages / notes** | Load notes, comms | Notes read-only; messages **mock** | **v1.1** — real messages API if TMS adds driver channel |
| **Notifications** | Bell, status toasts | Not in app | **v1.1** push |
| **GPS / tracking** | No per-load GPS table yet | **Share location** (foreground) | ✅ v1 share-only |
| **Customer contact** | Phone/address on load | Shown on detail | **Quick win:** tap-to-call `tel:` (v1.1) |
| **Maps** | External maps | **Open in Maps** for driver GPS | **v1.1:** directions to pickup/delivery address |
| **Pay / settlements** | Driver pay modules | Out of scope | ❌ Not driver app |
| **Portal** | Customer portal | Out of scope | ❌ |

---

## Mobile v1 — implemented driver flows

| Flow | Route / module |
|------|----------------|
| Login | `app/(auth)/login.tsx` → Supabase |
| Assigned loads | `app/(drawer)/loads.tsx` |
| Load detail | `app/load/[id].tsx` → `LoadDetailContent` |
| Field actions | `DriverActionBar` → TMS `PATCH` status |
| Documents | `LoadDocumentsSection` → Supabase + TMS GET URLs |
| Share GPS | `LoadLocationSection` |
| Account / session | `app/(drawer)/account.tsx` |
| Offline | `OfflineBanner`, `QueryNetworkRecovery` |

---

## Suggested additions (prioritized)

| Priority | Feature | Effort | Depends on |
|----------|---------|--------|------------|
| **P0** | TMS Bearer on status + documents API | **7.1:** verify on production TMS; mobile paths in **6.2** | `docs/QA_RELEASE_SIGNOFF_7_1.md` §P0 |
| **P1** | Driver photo upload (Semana 6) | **✅ 6.1–6.6** code complete | `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` §D |
| **P2** | **Call customer** — `Linking.openURL('tel:…')` on phone row | Small | None |
| **P2** | **HOT** badge already on list — filter “hot only” | Small | None |
| **P3** | Sort loads by pickup/delivery appointment | Small | Data in `loads` |
| **v1.1** | Push notifications for assignment/status | Medium | Expo notifications + TMS events |
| **v1.1** | Real load messages (replace mock) | Medium | TMS/API design |
| **v1.1** | Directions to pickup/delivery (not only current GPS) | Medium | Maps deep link |

**Not recommended for v1:** full Driver Itinerary clone, dispatcher planner, financial screens.

---

## Refetch / performance (5.7)

| Mechanism | Behavior |
|-----------|----------|
| Realtime `loads` + `load_documents` | Debounced **750 ms** (`driver-loads-subscription.ts`) |
| Reconnect | `QueryNetworkRecovery` debounced **400 ms** |
| App foreground | `invalidateDriverLoads` at most every **30 s** (`foreground-refetch-throttle.ts`) |
| Load detail focus | Document refetch at most every **15 s** per load |

---

**Related:** `docs/QA_RELEASE_SIGNOFF_7_1.md`, `docs/QA_SMOKE_E2E_5_7.md`, `docs/MVP_SCOPE.md`, `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`.  
**v1.1 backlog (task 7.7):** `docs/BACKLOG_V1_1_7_7.md` · **Support (7.6):** `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md`.
