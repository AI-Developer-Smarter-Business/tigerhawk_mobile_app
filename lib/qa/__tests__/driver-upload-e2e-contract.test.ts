import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Guards task 6.4 upload E2E contract: routes, Driver type, validation, TMS mobile path.
 */
describe('driver upload E2E contract (6.4)', () => {
  const root = path.join(__dirname, '..', '..', '..');

  function readSource(...segments: string[]): string {
    return fs.readFileSync(path.join(root, ...segments), 'utf8');
  }

  it('load detail wires upload hook and documents query with shared load id', () => {
    const screen = readSource('app', 'load', '[id].tsx');
    expect(screen).toContain('useLoadDocumentUpload');
    expect(screen).toContain('useLoadDocumentsQuery');
    expect(screen).toContain('normalizeLoadIdParam');
    expect(screen).toContain('uploadDocument');
  });

  it('upload hook validates online + file and uses Driver document type', () => {
    const hook = readSource('hooks', 'useLoadDocumentUpload.ts');
    expect(hook).toContain('assertOnlineForDocumentUpload');
    expect(hook).toContain('validateDriverUploadFile');
    expect(hook).toContain("documentType: 'Driver'");
    expect(hook).toContain('uploadDriverLoadDocumentViaSupabase');
    expect(hook).toContain('uploadLoadDocument');
    expect(hook).toContain('invalidateLoadDocuments');
  });

  it('TMS upload uses mobile documents API path', () => {
    const request = readSource('lib', 'tms', 'document-upload-request.ts');
    expect(request).toContain('/api/mobile/loads/');
    expect(request).toContain('documents');

    const upload = readSource('lib', 'tms', 'upload-load-document.ts');
    expect(upload).toContain('buildDocumentUploadPath');
    expect(upload).toContain('assertDriverUploadDocumentType');
  });

  it('PodUploadSection prepares, validates on pick, and respects network context', () => {
    const section = readSource('components', 'loads', 'PodUploadSection.tsx');
    expect(section).toContain('prepareDriverUploadImage');
    expect(section).toContain('validateDriverUploadFile');
    expect(section).toContain('useNetwork');
    expect(section).toContain('strings.loadDetail.podAddPhoto');
    expect(section).toContain('strings.loadDetail.podUpload');
    expect(section).not.toContain('driverUploadTmsRequired');
  });

  it('LoadDocumentsSection always mounts PodUploadSection (no TMS patch gate)', () => {
    const section = readSource('components', 'loads', 'LoadDocumentsSection.tsx');
    expect(section).toContain('<PodUploadSection');
    expect(section).not.toContain('driverUploadTmsRequired');
    expect(section).toContain('isDriverUploadedDocument');
  });

  it('realtime subscription handles load_documents changes', () => {
    const realtime = readSource(
      'lib',
      'supabase',
      'realtime',
      'driver-loads-subscription.ts',
    );
    expect(realtime).toContain('load_documents');
    expect(realtime).toContain('onDocumentsChange');
  });
});
