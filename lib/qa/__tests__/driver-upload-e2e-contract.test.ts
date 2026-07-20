import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Guards driver upload E2E contract: routes, TIR types, validation, TMS mobile path.
 */
describe('driver upload E2E contract (F.1–F.5 / 6.4)', () => {
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
    expect(screen).toContain('forceTirUpload');
  });

  it('upload hook validates file, normalizes POD→Driver, and queues offline', () => {
    const hook = readSource('hooks', 'useLoadDocumentUpload.ts');
    expect(hook).toContain('enqueueDocumentUpload');
    expect(hook).toContain('validateDriverUploadFile');
    expect(hook).toContain('normalizeDriverUploadDocumentType');
    expect(hook).toContain('uploadDriverLoadDocument');
    expect(hook).toContain('invalidateLoadDocuments');

    const routing = readSource('lib', 'loads', 'upload-driver-load-document.ts');
    expect(routing).toContain('shouldUploadDriverDocumentViaTms');
    expect(routing).toContain("documentType === 'TIR Out'");
    expect(routing).toContain('uploadLoadDocument');
  });

  it('TMS upload uses mobile documents API path', () => {
    const request = readSource('lib', 'tms', 'document-upload-request.ts');
    expect(request).toContain('mobileLoadDocumentsPath');
    expect(request).toContain('buildDocumentUploadPath');

    const routes = readSource('lib', 'tms', 'mobile-api-routes.ts');
    expect(routes).toContain('/api/mobile/loads/');
    expect(routes).toContain('/documents');

    const upload = readSource('lib', 'tms', 'upload-load-document.ts');
    expect(upload).toContain('buildDocumentUploadPath');
    expect(upload).toContain('assertDriverUploadDocumentType');
  });

  it('PortPro Documents block mounts TIR rows and Sign on device', () => {
    const portPro = readSource('components', 'loads', 'DocumentsPortProSection.tsx');
    expect(portPro).toContain('DocumentPhotoUploader');
    expect(portPro).toContain('PodLegalSection');
    expect(portPro).toContain('TIR_OUT_DOCUMENT_TYPE');
    expect(portPro).toContain('TIR_IN_DOCUMENT_TYPE');

    const detail = readSource('components', 'loads', 'LoadDetailContent.tsx');
    expect(detail).toContain('DocumentsPortProSection');
  });

  it('PodUploadSection is driver evidence only (no POD chip / no signature pad)', () => {
    const section = readSource('components', 'loads', 'PodUploadSection.tsx');
    expect(section).toContain('prepareDriverUploadImage');
    expect(section).toContain('validateDriverUploadFile');
    expect(section).toContain('useNetwork');
    expect(section).toContain('DRIVER_DOCUMENT_TYPE_OPTIONS');
    expect(section).toContain('openAppSettings');
    expect(section).toContain('strings.loadDetail.podAddPhoto');
    expect(section).not.toContain('SignatureCaptureModal');
    expect(section).not.toContain('driverUploadTmsRequired');

    const options = readSource('lib', 'tms', 'driver-document-types.ts');
    expect(options).not.toContain("value: 'POD'");
  });

  it('LoadDocumentsSection mounts PodUploadSection for optional evidence', () => {
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
