import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..', '..');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('release handoff docs (7.3–7.5)', () => {
  it('CHANGELOG and VERSIONING exist with semver reference', () => {
    const changelog = read('CHANGELOG.md');
    expect(changelog).toContain('[0.1.0]');
    expect(changelog).toMatch(/Semantic Versioning/i);

    const versioning = read('docs/VERSIONING.md');
    expect(versioning).toContain('MAJOR');
    expect(versioning).toContain('package.json');
  });

  it('README documents install, env table, and bug reporting', () => {
    const readme = read('README.md');
    expect(readme).toContain('## Installation');
    expect(readme).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(readme).toContain('docs/BUG_REPORTING.md');
    expect(readme).toContain('0.1.0');
  });

  it('rollback and EAS handoff docs reference Supabase sql-editor', () => {
    const rollback = read('docs/ROLLBACK_PP2.md');
    expect(rollback).toContain('enable_realtime_pp2_driver_sync.sql');
    expect(rollback).toContain('20260518120000_pp2_driver_scoped_load_messages_documents');

    const eas = read('docs/EAS_CREDENTIALS_HANDOFF_7_5.md');
    expect(eas).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(eas).toMatch(/keystore|Never.*commit/i);
    expect(eas).toContain('docs/ROLLBACK_PP2.md');
  });

  it('app and package versions stay aligned', () => {
    const pkg = JSON.parse(read('package.json'));
    const app = JSON.parse(read('app.json'));
    expect(pkg.version).toBe('0.1.0');
    expect(app.expo.version).toBe(pkg.version);
  });
});

describe('release handoff docs (7.6–7.7)', () => {
  it('support runbook covers RLS, Storage, and escalation', () => {
    const support = read('docs/MOBILE_SUPPORT_RUNBOOK_7_6.md');
    expect(support).toMatch(/RLS|Row Level Security/i);
    expect(support).toMatch(/Storage|documents/i);
    expect(support).toMatch(/Escalation|tier/i);
    expect(support).toContain('docs/RLS_MOBILE_REVIEW.md');
    expect(support).toContain('docs/ROLLBACK_PP2.md');
    expect(support).toContain('docs/BUG_REPORTING.md');
  });

  it('live GPS architecture doc states no external tracking API', () => {
    const arch = read('docs/GPS_LIVE_TRACKING_ARCHITECTURE.md');
    expect(arch).toMatch(/no third-party|sin API externa/i);
    expect(arch).toMatch(/30.?60|30–60/);
    expect(arch).toContain('current_latitude');
    expect(arch).toContain('docs/GPS_V1_DECISION.md');
    expect(arch).toContain('docs/TMS_DEV_REPOSITORY.md');
    expect(arch).toContain('20260605120000_pp2_driver_live_location_loads.sql');
  });

  it('GPS live location SQL is additive with verify script', () => {
    const sql = read('supabase/sql-editor/20260605120000_pp2_driver_live_location_loads.sql');
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS current_latitude');
    expect(sql).toContain('Drivers update live location on assigned loads');
    expect(sql).toContain('pp2_enforce_driver_location_update');
    expect(sql).toContain("- 'updated_at'");
    expect(sql).not.toMatch(/DROP POLICY.*Staff update shipments/i);

    const verify = read('supabase/sql-editor/VERIFY_pp2_driver_live_location.sql');
    expect(verify).toContain('current_latitude');
    expect(verify).toContain('Staff update shipments');
  });

  it('TMS dev repository doc defines editable path and map audit', () => {
    const tms = read('docs/TMS_DEV_REPOSITORY.md');
    expect(tms).toContain('tigerhawk-tms-main');
    expect(tms).toMatch(/PROYECTO_MUESTRA.*do not modify|no modificar/i);
    expect(tms).toContain('LoadSidebarMap');
    expect(tms).toMatch(/Implemented \(8\.12\)|useLoadLiveLocation/i);
    expect(tms).toMatch(/Does not exist|static route map/i);
  });

  it('v1.1 backlog references Semana 8 and deferred features', () => {
    const backlog = read('docs/BACKLOG_V1_1_7_7.md');
    expect(backlog).toMatch(/push|Push/i);
    expect(backlog).toMatch(/messages/i);
    expect(backlog).toMatch(/wait.?time/i);
    expect(backlog).toMatch(/geofenc/i);
    expect(backlog).toMatch(/E2E|Maestro|Detox/i);
    expect(backlog).toMatch(/8\.2|Semana 8|live GPS/i);
    expect(backlog).toContain('docs/GPS_LIVE_TRACKING_ARCHITECTURE.md');
    expect(backlog).toContain('docs/DRIVER_TMS_CAPABILITIES_5_7.md');
    expect(backlog).toContain('docs/MOBILE_SUPPORT_RUNBOOK_7_6.md');
  });

  it('README links support runbook and v1.1 backlog', () => {
    const readme = read('README.md');
    expect(readme).toContain('docs/MOBILE_SUPPORT_RUNBOOK_7_6.md');
    expect(readme).toContain('docs/BACKLOG_V1_1_7_7.md');
  });
});

describe('release handoff docs (9.5–9.7)', () => {
  it('Samsara live docs describe webhook env and live mode', () => {
    const samsara = read('docs/SAMSARA_GEOFENCE_SPIKE.md');
    expect(samsara).toMatch(/live-ready|live/i);
    expect(samsara).toContain('SAMSARA_ENABLED');
    expect(samsara).toContain('resolve-geofence-load.ts');
    expect(samsara).toContain('GeofenceExit');
  });

  it('GPS sign-off doc references QA matrix', () => {
    const signoff = read('docs/GPS_LIVE_TRACKING_SIGNOFF_8_17.md');
    expect(signoff).toContain('docs/QA_DRIVER_LIVE_TRACKING.md');
    expect(signoff).toMatch(/8\.17|9\.6/);
  });

  it('client handoff doc covers build env and checklist', () => {
    const handoff = read('docs/CLIENT_HANDOFF_9_7.md');
    expect(handoff).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(handoff).toContain('npm run build:android:preview');
    expect(handoff).toContain('docs/EAS_CREDENTIALS_HANDOFF_7_5.md');
    expect(handoff).toContain('SAMSARA_ENABLED');
  });

  it('HANDOFF_DEV points to client handoff 9.7', () => {
    const dev = read('HANDOFF_DEV.md');
    expect(dev).toContain('docs/CLIENT_HANDOFF_9_7.md');
    expect(dev).toContain('9.5');
  });
});
