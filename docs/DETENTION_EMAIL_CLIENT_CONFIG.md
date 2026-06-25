# Detention customer emails — client config (WT.33)

**Scope:** TMS dev repo · templates in Supabase `email_templates` · recipient `customers.email`.

## Recipients

| Setting | Default | Purpose |
|---------|---------|---------|
| Primary | `loads.customers.email` | Customer on file for the load |
| `DETENTION_EMAIL_CC` | _(empty)_ | Optional comma-separated CC (e.g. dispatch inbox) |

Drivers **cannot** set the customer email from the mobile app.

## Timezone

| Env | Default | Purpose |
|-----|---------|---------|
| `DETENTION_EMAIL_TIMEZONE` | `America/New_York` | Timestamps in email body (`wait_start_time`, `wait_end_time`) |

## Forgotten timer (open wait too long)

| Env | Default | Purpose |
|-----|---------|---------|
| `DETENTION_FORGOTTEN_TIMER_MAX_MINUTES` | `480` (8 h) | One-time `activity_log` `delivery_wait_forgotten_timer_alert` for dispatch review |

Does **not** auto-close the timer — manual **Check Out** or e-POD (WT.28) still required.

## Templates (editable in TMS Admin → Email Templates)

| Key | When | Task |
|-----|------|------|
| `detention_warning_45` | Open wait ≥ 45 min | WT.29 |
| `detention_started` | Open wait ≥ free time (60 min) | WT.30 |
| `detention_completed` | Wait closed (`end_time` set) | WT.31 |

**Legal copy** in `detention_completed` includes dispute contact language — client/legal may edit in Supabase.

## Triggers

1. **Mobile PATCH** `…/wait-time` (~60 s while timer open)
2. **Cron** `POST /api/cron/wait-time-detention-emails` every 5 min (WT.32) — uses server clock when mobile offline

Configure on Netlify: scheduled function + `Authorization: Bearer CRON_SECRET` (same pattern as Port Houston rotate).

## Supabase SQL

Apply in order (idempotent):

1. `supabase/sql-editor/seed_detention_warning_45_email_template.sql` (WT.29)
2. `supabase/sql-editor/seed_detention_started_completed_email_templates.sql` (WT.30–31)

**SUPABASE:** no new tables — `email_templates` + `activity_log` only.
