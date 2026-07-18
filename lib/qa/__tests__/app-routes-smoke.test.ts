import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.join(__dirname, '..', '..', '..');

const REQUIRED_ROUTES = [
  'app/index.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/_layout.tsx',
  'app/(drawer)/loads.tsx',
  'app/(drawer)/history.tsx',
  'app/(drawer)/account.tsx',
  'app/(drawer)/_layout.tsx',
  'app/load/[id].tsx',
  'app/auth/callback.tsx',
  'app/_layout.tsx',
] as const;

describe('app routes smoke (5.7)', () => {
  it.each(REQUIRED_ROUTES)('exists %s', (routePath) => {
    expect(fs.existsSync(path.join(ROOT, routePath))).toBe(true);
  });

  it('drawer layout wires auth redirect and screens', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', '_layout.tsx'),
      'utf8',
    );
    expect(source).toContain('Redirect');
    expect(source).toContain('loads');
    expect(source).toContain('history');
    expect(source).toContain('account');
  });

  it('root layout wires driver loads realtime bridge after auth bootstrap', () => {
    const source = fs.readFileSync(path.join(ROOT, 'app', '_layout.tsx'), 'utf8');
    expect(source).toContain('DriverLoadsRealtimeBridge');
    expect(source).toContain('AuthBootstrapGate');
  });

  it('root index redirects authenticated users to loads', () => {
    const source = fs.readFileSync(path.join(ROOT, 'app', 'index.tsx'), 'utf8');
    expect(source).toContain('/(drawer)/loads');
  });

  it('login screen uses hybrid username/email sign-in (A.2)', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(auth)', 'login.tsx'),
      'utf8',
    );
    expect(source).toContain('signInWithUsername');
    expect(source).toContain('strings.auth.usernameOrEmail');
    expect(source).not.toContain('signInWithMagicLink');
  });

  it('login keeps focused fields visible above the mobile keyboard', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(auth)', 'login.tsx'),
      'utf8',
    );
    const appConfig = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'),
    ) as { expo?: { android?: { softwareKeyboardLayoutMode?: string } } };

    expect(source).toContain('<KeyboardAvoidingView');
    expect(source).toContain("<ScrollView");
    expect(source).toContain("Platform.OS === 'ios' ? 'padding' : 'height'");
    expect(source).toContain('keyboardShouldPersistTaps="handled"');
    expect(appConfig.expo?.android?.softwareKeyboardLayoutMode).toBe('resize');
  });

  it('loads home uses Active / Upcoming tabs (B.1)', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'loads.tsx'),
      'utf8',
    );
    expect(source).toContain('LoadsBucketTabs');
    expect(source).toContain('useDriverLoadsBuckets');
    expect(source).toContain('tabActive');
    expect(source).toContain('activeEmptyTitle');
  });

  it('loads home renders move cards and opens load detail with move id (B.2)', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'loads.tsx'),
      'utf8',
    );
    expect(source).toContain('DriverMoveCardItem');
    expect(source).toContain('move_id');
    expect(source).toContain('/load/');
    expect(source).toContain('move=');
    expect(source).not.toContain('MoveCardPlaceholder');
    expect(source).not.toContain('LoadListItem');
  });

  it('driver loads buckets hook calls mobile API client (B.3)', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'hooks', 'useDriverLoadsBuckets.ts'),
      'utf8',
    );
    expect(source).toContain('fetchMobileDriverLoads');
    expect(source).toContain('mobileBuckets');
    expect(source).not.toContain('fetchDriverLoadsPage');
  });

  it('load history screen uses mobile history API (B.4)', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'history.tsx'),
      'utf8',
    );
    expect(source).toContain('useDriverLoadHistoryQuery');
    expect(source).toContain('LoadHistoryFilters');
    expect(source).toContain('/load/');
    expect(source).toContain('move=');
  });

  it('drawer navigation includes Load History route (B.4)', () => {
    const navSource = fs.readFileSync(
      path.join(ROOT, 'constants', 'navigation.ts'),
      'utf8',
    );
    expect(navSource).toContain("'history'");
    const routesSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mobile-api-routes.ts'),
      'utf8',
    );
    expect(routesSource).toContain('MOBILE_DRIVER_LOAD_HISTORY_PATH');
    expect(routesSource).toContain('/api/mobile/driver/loads/history');
  });

  it('Upcoming move offers call accept/reject by move id (C.1)', () => {
    const screenSource = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'loads.tsx'),
      'utf8',
    );
    expect(screenSource).toContain('useDriverMoveOfferActions');
    expect(screenSource).toContain("tab === 'upcoming'");
    expect(screenSource).toContain('item.accepted_at == null');
    expect(screenSource).toContain('moveId === item.move_id');

    const clientSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-move-offer.ts'),
      'utf8',
    );
    expect(clientSource).toContain('mobileLoadAcceptPath');
    expect(clientSource).toContain('mobileLoadRejectPath');
    expect(clientSource).toContain('move_id: params.moveId');
  });

  it('Accept Move opens one-request start choice (C.2)', () => {
    const screenSource = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'loads.tsx'),
      'utf8',
    );
    expect(screenSource).toContain('AcceptMoveActionSheet');
    expect(screenSource).toContain('acceptMove(acceptCard, start)');

    const sheetSource = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'AcceptMoveActionSheet.tsx'),
      'utf8',
    );
    expect(sheetSource).toContain('onConfirm(true)');
    expect(sheetSource).toContain('onConfirm(false)');
    expect(sheetSource).toContain('AppActionSheet');
  });

  it('accepted Upcoming moves start through progress and move id (C.3)', () => {
    const screenSource = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'loads.tsx'),
      'utf8',
    );
    expect(screenSource).toContain('item.accepted_at != null');
    expect(screenSource).toContain('item.started_at == null');
    expect(screenSource).toContain('startMove(item)');
    expect(screenSource).toContain('AppToast');

    const clientSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-progress.ts'),
      'utf8',
    );
    expect(clientSource).toContain('mobileLoadProgressPath');
    expect(clientSource).toContain("body.move_id = params.moveId");
    expect(clientSource).not.toContain('mobileLoadAcceptPath');
  });

  it('Reject collects a reason and preserves call-dispatch handling (C.4)', () => {
    const screenSource = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'loads.tsx'),
      'utf8',
    );
    expect(screenSource).toContain('RejectMoveActionSheet');
    expect(screenSource).toContain('rejectMove(rejectCard, reason)');

    const clientSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-move-offer.ts'),
      'utf8',
    );
    expect(clientSource).toContain('body.reason = reason');
    expect(clientSource).toContain('mobileLoadRejectPath');

    const errorSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'errors', 'map-mobile-api-error.ts'),
      'utf8',
    );
    expect(errorSource).toContain("case 'call_dispatch'");
    expect(errorSource).toContain('mobileCallDispatch');
  });

  it('driver progress client uses canonical GET/POST without PATCH (D.3)', () => {
    const fetchSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'fetch-driver-progress.ts'),
      'utf8',
    );
    expect(fetchSource).toContain('mobileLoadProgressPath');
    expect(fetchSource).toContain("method: 'GET'");
    expect(fetchSource).not.toContain("method: 'PATCH'");

    const mutateSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-progress.ts'),
      'utf8',
    );
    expect(mutateSource).toContain('mobileLoadProgressPath');
    expect(mutateSource).toContain("method: 'POST'");
    expect(mutateSource).not.toContain("method: 'PATCH'");
    expect(mutateSource).toContain('move_id');
    expect(mutateSource).toContain('chassis_number');
    expect(mutateSource).toContain('note');

    const hookSource = fs.readFileSync(
      path.join(ROOT, 'hooks', 'useDriverProgressQuery.ts'),
      'utf8',
    );
    expect(hookSource).toContain('fetchMobileDriverProgress');
    expect(hookSource).toContain('queryKeys.loads.progress');
  });

  it('load detail renders server-driven progress actions (D.1)', () => {
    const detailSource = fs.readFileSync(
      path.join(ROOT, 'app', 'load', '[id].tsx'),
      'utf8',
    );
    expect(detailSource).toContain('useDriverProgressQuery');
    expect(detailSource).toContain('useDriverProgressAction');
    expect(detailSource).toContain('DriverProgressActions');
    expect(detailSource).toContain('resolveRouteParam(rawMoveId)');
    expect(detailSource).not.toContain('<DriverActionBar');
    expect(detailSource).not.toContain('useDriverStatusChange');

    const actionSource = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'DriverProgressActions.tsx'),
      'utf8',
    );
    expect(actionSource).toContain('getNextDriverProgressAction');
    expect(actionSource).toContain('progress.label');
    expect(actionSource).toContain('AppActionSheet');
  });

  it('removes the legacy status-name driver flow (D.2)', () => {
    const removedPaths = [
      ['components', 'loads', 'DriverActionBar.tsx'],
      ['hooks', 'useDriverStatusChange.ts'],
      ['hooks', 'useLoadTransitionsQuery.ts'],
      ['lib', 'tms', 'fetch-load-transitions.ts'],
    ];

    for (const segments of removedPaths) {
      expect(fs.existsSync(path.join(ROOT, ...segments))).toBe(false);
    }

    const detailSource = fs.readFileSync(
      path.join(ROOT, 'app', 'load', '[id].tsx'),
      'utf8',
    );
    expect(detailSource).not.toContain('MOCK_LOAD_TRANSITIONS');
    expect(detailSource).not.toContain("method: 'PATCH'");

    const queryKeysSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'query', 'query-keys.ts'),
      'utf8',
    );
    expect(queryKeysSource).not.toContain('transitions:');
  });

  it('keeps GPS maps external and non-turn-by-turn (D.4)', () => {
    const locationSource = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'LoadLocationSection.tsx'),
      'utf8',
    );
    expect(locationSource).toContain('openCoordinatesInMaps');
    expect(locationSource).toContain('Linking.openURL');

    const mapsSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'location', 'maps-url.ts'),
      'utf8',
    );
    expect(mapsSource).toContain('https://maps.google.com/?q=');
    expect(mapsSource).not.toContain('dir_action=navigate');
    expect(mapsSource).not.toContain('/maps/dir');
  });

  it('preserves structured progress errors on the canonical route (D.6)', () => {
    const hookSource = fs.readFileSync(
      path.join(ROOT, 'hooks', 'useDriverProgressAction.ts'),
      'utf8',
    );
    expect(hookSource).toContain('mapDriverProgressError');
    expect(hookSource).toContain("mapped.appAction === 'refresh_list'");

    const errorSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'loads', 'driver-progress-error.ts'),
      'utf8',
    );
    expect(errorSource).toContain('TmsMobileApiError');

    const mutateSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-progress.ts'),
      'utf8',
    );
    expect(mutateSource).toContain('mobileLoadProgressPath');
    expect(mutateSource).not.toContain("method: 'PATCH'");
  });

  it('opens move-assigned loads even when loads.driver_id differs', () => {
    const detailScreen = fs.readFileSync(
      path.join(ROOT, 'app', 'load', '[id].tsx'),
      'utf8',
    );
    expect(detailScreen).toContain('useLoadDetailQuery(loadId, moveId)');

    const hookSource = fs.readFileSync(
      path.join(ROOT, 'hooks', 'useLoadDetailQuery.ts'),
      'utf8',
    );
    expect(hookSource).toContain('resolveLoadDetailForDriver');

    const resolverSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'loads', 'resolve-load-detail-for-driver.ts'),
      'utf8',
    );
    expect(resolverSource).toContain('fetchMobileDriverLoads');
    expect(resolverSource).toContain('mapDriverMoveCardToLoadDetail');
  });

  it('uses canonical progress payloads for E.1/E.2 and read-only E.3 info', () => {
    const actionsSource = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'DriverProgressActions.tsx'),
      'utf8',
    );
    expect(actionsSource).toContain('maxLength={50}');
    expect(actionsSource).toContain('maxLength={20}');
    expect(actionsSource).toContain("error?.appAction === 'prompt_chassis'");
    expect(actionsSource).toContain("error?.appAction === 'show_checklist'");

    const mutateSource = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-progress.ts'),
      'utf8',
    );
    expect(mutateSource).toContain('mobileLoadProgressPath');
    expect(mutateSource).toContain('container_number');
    expect(mutateSource).toContain('seal_number');
    expect(mutateSource).not.toContain("method: 'PATCH'");

    const detailSource = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'LoadDetailContent.tsx'),
      'utf8',
    );
    expect(detailSource).toContain('strings.loadDetail.readOnlyHint');
    expect(detailSource).not.toContain('<Input');
  });
});
