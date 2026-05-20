import {
  buildStatusPatchBody,
  buildStatusPatchHeaders,
  buildStatusPatchPath,
  buildStatusPatchPayload,
  buildStatusPatchRequestInit,
} from '../status-patch-request';

describe('buildStatusPatchPath', () => {
  it('encodes load id in the path segment', () => {
    expect(buildStatusPatchPath('load/with spaces')).toBe(
      '/api/dispatcher/loads/load%2Fwith%20spaces/status',
    );
  });

  it('uses dispatcher loads status route', () => {
    expect(buildStatusPatchPath('abc-123')).toBe(
      '/api/dispatcher/loads/abc-123/status',
    );
  });
});

describe('buildStatusPatchPayload', () => {
  it('serializes only the status field', () => {
    expect(buildStatusPatchPayload('In Transit')).toEqual({ status: 'In Transit' });
  });
});

describe('buildStatusPatchBody', () => {
  it('matches TMS JSON contract', () => {
    expect(buildStatusPatchBody('Arrived At Pickup')).toBe(
      JSON.stringify({ status: 'Arrived At Pickup' }),
    );
  });
});

describe('buildStatusPatchHeaders', () => {
  it('sends bearer JWT and JSON accept/content types', () => {
    expect(buildStatusPatchHeaders('  my.jwt.token  ')).toEqual({
      Authorization: 'Bearer my.jwt.token',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  });

  it('does not include password or refresh_token keys', () => {
    const keys = Object.keys(buildStatusPatchHeaders('token'));
    expect(keys).not.toContain('password');
    expect(keys).not.toContain('refresh_token');
  });
});

describe('buildStatusPatchRequestInit', () => {
  it('builds a PATCH init aligned to patchLoadStatus', () => {
    expect(buildStatusPatchRequestInit('jwt', 'Delivered')).toEqual({
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer jwt',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status: 'Delivered' }),
    });
  });
});
