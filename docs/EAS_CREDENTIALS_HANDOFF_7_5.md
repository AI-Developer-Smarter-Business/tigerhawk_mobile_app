# EAS credentials & keystore handoff (task 7.5)

**Purpose:** clear **custody** of Expo/EAS and Android signing assets for **Tigerhawk Mobile** (`com.tigerhawk.pp2`).  
**Never** commit passwords, keystores (`.jks`), or `credentials.json` to git.

---

## 1. Ownership matrix (fill at handoff)

| Asset | Owner (org role) | Location | Backup |
|-------|------------------|----------|--------|
| Expo organization | | expo.dev → org | |
| EAS project `pp2` | | `app.json` → `extra.eas.projectId` | Screenshot in password manager |
| Expo account (build login) | | Shared vault entry | 2FA recovery codes |
| Android upload keystore | | EAS managed **or** local `.jks` | Encrypted backup offline |
| Google Play Console (future) | | N/A v0.1 APK sideload | |
| EAS secrets (`EXPO_PUBLIC_*`) | | Expo → Project → Secrets | Rotate if leaked |

**Custody rule:** client **owns** production credentials; dev team gets **least privilege** (build + submit) until handoff meeting.

---

## 2. EAS secrets (required for APK)

Set in Expo Dashboard or CLI — same values as `.env.local` but **public TMS URL**:

| Secret name | Description |
|-------------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | e.g. `https://tigerhawk.netlify.app` |

```bash
npx eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
npx eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
npx eas secret:create --name EXPO_PUBLIC_TMS_API_URL --value "https://..."
npx eas secret:list
```

**Do not** store `SUPABASE_SERVICE_ROLE_KEY` in EAS for the mobile app.

---

## 3. Android keystore

| Mode | Handoff |
|------|---------|
| **EAS managed** (recommended) | Download credentials once: `eas credentials -p android` → store encrypted zip in client vault; document Expo login used |
| **Custom keystore** | Deliver `.jks` + alias + passwords via **separate channel** (not email plaintext); register in EAS |

If keystore is lost, **cannot** update same Play App signing identity — new package or Play support required.

---

## 4. Build commands (reference)

```bash
npm run build:preflight
npm run build:android:preview      # internal QA APK
npm run build:android:production   # release-profile APK
```

Download artifact from [expo.dev](https://expo.dev) → project → Builds.

---

## 5. iOS (deferred)

When Apple Developer account exists:

- Add Apple credentials in EAS
- `eas build --platform ios --profile preview`
- Bundle ID: `com.tigerhawk.pp2` (`app.json`)

---

## 6. Handoff meeting checklist

| # | Item | Done |
|---|------|------|
| 1 | Client has Expo org admin | |
| 2 | `projectId` updated in `app.json` (not placeholder) | |
| 3 | All three `EXPO_PUBLIC_*` secrets set on EAS | |
| 4 | Keystore backup location documented | |
| 5 | Who can run `eas build` / `eas submit` | |
| 6 | Previous APK URL archived (rollback) | |
| 7 | `docs/ROLLBACK_PP2.md` reviewed | |

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Dev delivery | | | |
| Client receipt | | | |

---

**Related:** `docs/MOBILE_BUILDS.md`, `docs/RELEASE_NOTES_0_1_0.md`, `docs/VERSIONING.md`.
