# QA — Driver receipt signature (SIG.6 · 8 Jul 2026)

**Product:** Tigerhawk Mobile — finger/stylus signature complements POD photo (does not replace camera/gallery upload).

**Device:** physical phone (iOS or Android). Web shows unsupported message for the pad.

---

## Preconditions

| # | Check |
|---|--------|
| 1 | Assigned load; driver logged in |
| 2 | **Sign on device** auto-selects **POD**; signature upload always sends **POD** (WT.28) |
| 3 | Optional: open wait with **Check In** |

---

## Cases

| ID | Steps | Expected |
|----|-------|----------|
| S1 | Load detail → **Sign on device** | Full-screen white pad; Clear / Use signature / Cancel |
| S2 | Draw with finger → **Use signature** | Preview of PNG; filename `signature_*.png`; type chip locked on **POD** |
| S3 | Confirm upload while wait running | File in TMS Documents as **POD**; wait **Stopped** (WT.28); banner refresh |
| S4 | After S3, still tap **Add photo** and upload another POD/Driver/Photo | Second file appears — signature did **not** remove photo option |
| S5 | Upload photo POD only (no signature) | Still works as before |
| S6 | Offline → Sign → Use signature → Upload | Queued; sync on reconnect |
| S7 | Clear pad then confirm empty | No crash; pad stays (empty read) |
| S8 | Cancel / Discard | No upload |

---

## Automation

```bash
npm test -- --testPathPattern="signature-export|PodUploadSection|strings-driver-evidence"
npm run ci
```

---

**Related:** `PP2_TAREAS_DEV.md` SIG.1–SIG.7 · `docs/QA_WAIT_TIME_OVERAGE.md` · `docs/MOBILE_API.md`
