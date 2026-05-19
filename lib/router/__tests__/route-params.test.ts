import { resolveRouteParam } from '../route-params';

describe('resolveRouteParam', () => {
  it('returns trimmed string param', () => {
    expect(resolveRouteParam('load-1')).toBe('load-1');
  });

  it('uses first element when param is an array', () => {
    expect(resolveRouteParam(['a', 'b'])).toBe('a');
  });

  it('returns undefined for empty values', () => {
    expect(resolveRouteParam(undefined)).toBeUndefined();
    expect(resolveRouteParam('')).toBeUndefined();
    expect(resolveRouteParam(['  '])).toBeUndefined();
  });
});
