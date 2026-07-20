import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.join(__dirname, '..', '..', '..');

const REQUIRED_ROUTES = [
  'app/index.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/_layout.tsx',
  'app/(drawer)/loads.tsx',
  'app/(drawer)/clock.tsx',
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
    expect(source).toContain('clock');
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

  it('wires Clock screen to /api/mobile/driver/clock (I.1–I.4)', () => {
    const routes = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mobile-api-routes.ts'),
      'utf8',
    );
    expect(routes).toContain('MOBILE_DRIVER_CLOCK_PATH');
    expect(routes).toContain('/api/mobile/driver/clock');

    const screen = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', 'clock.tsx'),
      'utf8',
    );
    expect(screen).toContain('useDriverClockQuery');
    expect(screen).toContain('useDriverClockAction');
    expect(screen).toContain('useFocusEffect');
    expect(screen).toContain("runEvent('in')");
    expect(screen).toContain("runEvent('out')");
    expect(screen).toContain('formatCentralLongDate');
    expect(screen).not.toContain('strings.waitTime.checkIn');
    expect(screen).not.toContain('strings.waitTime.checkOut');

    const nav = fs.readFileSync(
      path.join(ROOT, 'constants', 'navigation.ts'),
      'utf8',
    );
    expect(nav).toContain("'clock'");
    expect(nav).toContain('clock-o');

    const stringsSource = fs.readFileSync(
      path.join(ROOT, 'constants', 'strings.ts'),
      'utf8',
    );
    expect(stringsSource).toContain(
      "You're off duty. Your loads stay assigned to you.",
    );
    expect(stringsSource).toContain("America/Chicago");

    const central = fs.readFileSync(
      path.join(ROOT, 'lib', 'time', 'central.ts'),
      'utf8',
    );
    expect(central).toContain("America/Chicago");

    const mutate = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-driver-clock.ts'),
      'utf8',
    );
    expect(mutate).toContain("event: params.event");
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

  it('uses canonical documents + TIR routes and PortPro rows (F.1–F.5)', () => {
    const routes = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mobile-api-routes.ts'),
      'utf8',
    );
    expect(routes).toContain('mobileLoadDocumentsPath');
    expect(routes).toContain('/documents');

    const assertTypes = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'assert-driver-document-type.ts'),
      'utf8',
    );
    expect(assertTypes).toContain("'TIR Out'");
    expect(assertTypes).toContain("'TIR In'");
    expect(assertTypes).toContain('normalizeDriverUploadDocumentType');

    const uploadRouting = fs.readFileSync(
      path.join(ROOT, 'lib', 'loads', 'upload-driver-load-document.ts'),
      'utf8',
    );
    expect(uploadRouting).toContain("documentType === 'TIR Out'");
    expect(uploadRouting).toContain("documentType === 'TIR In'");

    const portPro = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'DocumentsPortProSection.tsx'),
      'utf8',
    );
    expect(portPro).toContain('TIR Out');
    expect(portPro).toContain('TIR In');
    expect(portPro).toContain('PodLegalSection');
    expect(portPro).toContain('documents-row-tir-out');
    expect(portPro).toContain('documents-row-pod-sign');
    expect(portPro).toContain('documents-row-tir-in');

    const evidenceOptions = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'driver-document-types.ts'),
      'utf8',
    );
    expect(evidenceOptions).not.toContain("value: 'POD'");
    expect(evidenceOptions).toContain("value: 'Driver'");
    expect(evidenceOptions).toContain("value: 'Photo'");

    const progressUi = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'DriverProgressActions.tsx'),
      'utf8',
    );
    expect(progressUi).toContain('formatMissingRequirements');
    expect(progressUi).toContain('onOpenTirDocuments');
    expect(progressUi).toContain('tir_out_photo');
    expect(progressUi).toContain('driver-progress-complete-load');
    expect(progressUi).toContain('checklistTitle');
  });

  it('uses canonical POD stamp routes and not documents for legal signature (G.1–G.6)', () => {
    const routes = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mobile-api-routes.ts'),
      'utf8',
    );
    expect(routes).toContain('mobileLoadPodPath');
    expect(routes).toContain('mobileLoadPodSignaturePath');

    const mutatePod = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'mutate-pod-signature.ts'),
      'utf8',
    );
    expect(mutatePod).toContain('client_signature_id');
    expect(mutatePod).toContain('signer_name');
    expect(mutatePod).toContain('signed_at');
    expect(mutatePod).toContain('STAMP_PENDING');

    const fetchPod = fs.readFileSync(
      path.join(ROOT, 'lib', 'tms', 'fetch-load-pod.ts'),
      'utf8',
    );
    expect(fetchPod).toContain('mobileLoadPodPath');

    const progressHook = fs.readFileSync(
      path.join(ROOT, 'hooks', 'useDriverProgressAction.ts'),
      'utf8',
    );
    expect(progressHook).toContain('flushPodSignaturesForLoad');

    const progressUi = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'DriverProgressActions.tsx'),
      'utf8',
    );
    expect(progressUi).toContain("error?.appAction === 'open_signature'");
    expect(progressUi).toContain('onOpenSignature');

    const uploadUi = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'PodUploadSection.tsx'),
      'utf8',
    );
    expect(uploadUi).not.toContain('SignatureCaptureModal');
    expect(uploadUi).toContain("documentType === 'POD' ? 'Driver'");

    const legalUi = fs.readFileSync(
      path.join(ROOT, 'components', 'loads', 'PodLegalSection.tsx'),
      'utf8',
    );
    expect(legalUi).toContain('SignatureCaptureModal');
    expect(legalUi).toContain('podNoSkipHint');
  });
});
