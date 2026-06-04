/** Light resize/compress before driver photo upload (task 6.6). */
export const DRIVER_UPLOAD_IMAGE_MAX_EDGE_PX = 1920;

/** JPEG quality when re-encoding (0–1). */
export const DRIVER_UPLOAD_JPEG_QUALITY = 0.82;

/** Skip prepare when both edges ≤ max and file is already small. */
export const DRIVER_UPLOAD_SKIP_PREPARE_MAX_BYTES = 1_572_864; // 1.5 MB
