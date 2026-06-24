-- WT.29 — Seed email template `detention_warning_45` (customer notice at 45 min wait).
-- Apply in Supabase SQL Editor (shared prod TMS + mobile).
-- Idempotent: ON CONFLICT DO NOTHING — safe to re-run.

INSERT INTO public.email_templates (template_key, name, subject, body_html, variables)
VALUES (
  'detention_warning_45',
  'Detention Warning (45 minutes)',
  'Load {{reference_number}} — 45 minutes waiting at delivery',
  '<h2>Delivery wait notice</h2>
<p>Hi {{customer_name}},</p>
<p>Your shipment <strong>{{reference_number}}</strong> has been waiting at <strong>{{delivery_location}}</strong> for <strong>{{minutes_elapsed}} minutes</strong>.</p>
<p>Billable <strong>detention</strong> will begin in <strong>{{minutes_until_billable}} minutes</strong> (after {{free_minutes}} minutes of free waiting time).</p>
<p>Container: {{container_number}}</p>
<p>Wait started: {{wait_start_time}}</p>
<p>Questions? Contact us at {{company_contact_email}} or {{company_phone}}.</p>
<p>— TigerHawk Logistics</p>',
  ARRAY[
    'customer_name',
    'reference_number',
    'container_number',
    'delivery_location',
    'wait_start_time',
    'free_minutes',
    'minutes_elapsed',
    'minutes_until_billable',
    'company_contact_email',
    'company_phone'
  ]
)
ON CONFLICT (template_key) DO NOTHING;

-- Verify:
-- SELECT template_key, is_active FROM public.email_templates WHERE template_key = 'detention_warning_45';
