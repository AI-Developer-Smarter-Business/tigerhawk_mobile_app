import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Guards task 5.6 route consistency: load detail screen and document hooks share id normalization.
 */
describe('load detail routes (5.6)', () => {
  const root = path.join(__dirname, '..', '..', '..');

  it('load detail screen uses normalizeLoadIdParam', () => {
    const screenPath = path.join(root, 'app', 'load', '[id].tsx');
    const source = fs.readFileSync(screenPath, 'utf8');
    expect(source).toContain('normalizeLoadIdParam');
    expect(source).toContain('LoadDetailContent');
    expect(source).toContain('useLoadDocumentsQuery');
    expect(source).toContain('useLoadDocumentUpload');
    expect(source).toContain('usePullToRefresh');
  });

  it('documents query uses the same load id normalization', () => {
    const hookPath = path.join(root, 'hooks', 'useLoadDocumentsQuery.ts');
    const source = fs.readFileSync(hookPath, 'utf8');
    expect(source).toContain('normalizeLoadIdParam');
    expect(source).toContain('queryKeys.loads.documents');
  });

  it('documents section wires View to openLoadDocument', () => {
    const sectionPath = path.join(root, 'components', 'loads', 'LoadDocumentsSection.tsx');
    const source = fs.readFileSync(sectionPath, 'utf8');
    expect(source).toContain('openLoadDocument');
    expect(source).toContain('PodUploadSection');
    expect(source).toContain('onUploadDocument');
    expect(source).toContain('strings.loadDetail.documentView');
  });
});
