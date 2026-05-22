# TMS patch — task 4.1 (driver POD upload)

**Scope:** `app/api/dispatcher/loads/[id]/documents/route.ts` (apply in the **TMS repo**, not in PP2 mobile).

**Prerequisite:** `createClient(request)` forwards `Authorization: Bearer` — see `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`. Without it, mobile gets **401** (not Supabase RLS).

**Decision (option A):** extend the existing `POST` so the **assigned driver** can upload documents, mirroring `PATCH …/status` permission checks. Reuse admin Storage upload + `load_documents` insert (no new route, no client-side Storage RLS).

**Rejected for PP2 v1:**

| Option | Reason |
|--------|--------|
| **(B)** Storage + RLS INSERT | Would expose `service_role` patterns to mobile; bucket policies and signed URL refresh differ from current TMS flow. |
| **(C)** Dedicated mobile route | Duplicates validation, size limits, and activity logging already in `documents/route.ts`. |

---

## Permission change (POST)

Replace the staff-only role gate (lines ~89–98) with assignment-aware checks:

```typescript
// After auth + before load fetch — select driver_id on load
const { data: profile } = await supabase
  .from("user_profiles")
  .select("role")
  .eq("id", user.id)
  .single()

// Verify load exists (include driver_id for assignment check)
const { data: load, error: loadError } = await supabase
  .from("loads")
  .select("id, reference_number, driver_id")
  .eq("id", id)
  .single()

if (loadError || !load) {
  return NextResponse.json({ error: "Load not found" }, { status: 404 })
}

const isStaff = profile && ["admin", "dispatcher"].includes(profile.role)
const isAssignedDriver =
  profile?.role === "driver" && load.driver_id === user.id

if (!isStaff && !isAssignedDriver) {
  return NextResponse.json(
    { error: "You don't have permission to upload documents for this load" },
    { status: 403 },
  )
}
```

Remove the earlier block:

```typescript
if (!profile || !["admin", "dispatcher"].includes(profile.role)) {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
}
```

Move the **load existence** query so it runs once (with `driver_id`) before permission checks, as in the snippet above.

---

## Driver document type restriction (recommended)

After `documentTypeSchema.safeParse`, restrict drivers to field uploads only:

```typescript
const DRIVER_UPLOAD_DOCUMENT_TYPES = new Set(["POD", "Photo"])

if (profile?.role === "driver" && !DRIVER_UPLOAD_DOCUMENT_TYPES.has(documentType)) {
  return NextResponse.json(
    {
      error: "Drivers may only upload POD or Photo documents.",
      code: "DRIVER_DOCUMENT_TYPE_FORBIDDEN",
    },
    { status: 403 },
  )
}
```

Staff (`admin` / `dispatcher`) keep all enum values from `documentTypeSchema`.

**PP2 mobile:** `lib/tms/assert-driver-document-type.ts` enforces the same set before calling the API.

---

## Unchanged server rules (parity)

| Rule | Value |
|------|--------|
| Max file size | **50 MB** (`52428800` bytes) |
| Max filename length | **255** characters |
| Storage path | `{loadId}/{timestamp}_{sanitizedName}` |
| Bucket | `load-documents` |
| Body fields | `file` (required), `document_type` (optional, default `Other`) |

---

## GET route

No change required: GET already allows any authenticated user with load access; drivers read via RLS on `load_documents`.

---

## Test plan (TMS / staging)

1. Deploy patch to Netlify staging TMS.
2. As `driver_test@test.com`, `POST` multipart to `/api/dispatcher/loads/{assignedLoadId}/documents` with `document_type=POD` and a small JPEG → **201** + `load_documents` row.
3. Same user, unassigned load id → **403**.
4. `document_type=Invoice` as driver → **403** + `DRIVER_DOCUMENT_TYPE_FORBIDDEN`.
5. File > 50 MB → **400** `"File exceeds 50MB limit"`.
6. As dispatcher, `document_type=Invoice` still → **201**.

**PP2 mobile (after TMS deploy):** `npm run ci` + manual upload in task 4.2.
