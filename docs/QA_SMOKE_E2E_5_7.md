# QA — End-to-end smoke (task 5.7)

Short **happy-path** matrix after `npm run ci`, before release sign-off. Run on **physical device** + **production** (or staging mirror).

**Automated gate:**

```bash
npm run smoke:5.7
```

Runs full `npm run ci` (lint + secrets + all Jest suites).

**Capability / backlog context:** `docs/DRIVER_TMS_CAPABILITIES_5_7.md`.

---

## Prerequisites

| Item | Check |
|------|-------|
| `npm run smoke:5.7` green | |
| `.env` → production Supabase + `EXPO_PUBLIC_TMS_API_URL` (public TMS URL) | |
| Driver user with ≥1 assigned load | |
| Known: Field actions need TMS Bearer patch | `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md` |

---

## Smoke path (≈10 min)

| Step | Action | Pass |
|------|--------|------|
| S1 | Open app → **Login** with driver credentials | Lands on **My Loads** |
| S2 | List shows assigned loads (count badge if >0) | No endless spinner |
| S3 | Tap a load → detail opens (reference in header) | Route, status badge, customer/route cards |
| S4 | Scroll **POD / Documents** | List or empty state; no crash |
| S5 | If document exists → **View** | Opens or clear error (expired link message OK) |
| S6 | Scroll **Your location** → **Share location** (device only) | Permission flow or web disclaimer |
| S7 | Scroll **Field actions** → tap one button | **Expected today:** Bearer error until TMS patch; document result |
| S8 | **Pull down** on detail → spinner stops | No stuck refresh |
| S9 | Drawer → **Account** → name/role visible | No “No profile found” flash |
| S10 | Drawer → **Log Out** → login screen | Session cleared |

---

## Regression pointers (deeper QA)

| Topic | Doc |
|-------|-----|
| Documents production | `docs/QA_PRODUCTION_SIGNOFF_5_6.md` §A–C |
| Driver actions | `docs/QA_DRIVER_ACTIONS_3_7.md` |
| Offline / reconnect | `docs/QA_NETWORK_RECONNECT_5_5.md` |
| GPS | `docs/QA_DRIVER_LOCATION_5_4.md` |

---

## Sign-off

| Role | Date | Build | S1–S10 |
|------|------|-------|--------|
| Dev | | `npm run smoke:5.7` | |
| QA | | Device + prod TMS | |
