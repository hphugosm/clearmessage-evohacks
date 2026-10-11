/** Bounded local OCR using the inspected Tesseract.js 6.0.1 worker protocol.
 * Owning the native worker permits termination even during initialization failure.
 * Never format worker errors, filenames, image bytes or extracted text as diagnostics.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 12_000_000;
export const MAX_IMAGE_SIDE = 16_384;
export type OcrErrorKey = 'empty' | 'format' | 'bytes' | 'pixels' | 'corrupt' | 'initialization' | 'processing' | 'unreadable' | 'cancelled';
export class OcrError extends Error {
  constructor(public readonly key: OcrErrorKey) { super(key); }
}

export function imageDimensions(bytes: Uint8Array): { width: number; height: number; type: string } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0, height = 0, type = '';
  if ([137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)) {
    if (bytes.length < 33 || view.getUint32(8) !== 13 || String.fromCharCode(...bytes.slice(12,16)) !== 'IHDR') throw new OcrError('corrupt');
    width = view.getUint32(16); height = view.getUint32(20); type = 'image/png';
  } else if (bytes[0] === 255 && bytes[1] === 216) {
    type = 'image/jpeg';
    for (let offset = 2; offset < bytes.length;) {
      if (bytes[offset++] !== 255) throw new OcrError('corrupt');
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > bytes.length) throw new OcrError('corrupt');
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) throw new OcrError('corrupt');
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        if (length < 8) throw new OcrError('corrupt');
        height = view.getUint16(offset + 3); width = view.getUint16(offset + 5); break;
      }
      offset += length;
    }
    if (!width || !height) throw new OcrError('corrupt');
  } else throw new OcrError('format');
  if (!width || !height) throw new OcrError('corrupt');
  if (width * height > MAX_IMAGE_PIXELS || width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) throw new OcrError('pixels');
  return { width, height, type };
}

export async function rasterizeImage(file: File, signal: AbortSignal): Promise<Uint8Array> {
  if (file.size === 0) throw new OcrError('empty');
  if (file.size > MAX_IMAGE_BYTES) throw new OcrError('bytes');
  if (signal.aborted) throw new OcrError('cancelled');
  let bytes: Uint8Array<ArrayBuffer> | undefined;
  let bitmap: ImageBitmap | undefined;
  const canvas = document.createElement('canvas');
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
    const dimensions = imageDimensions(bytes);
    if (signal.aborted) throw new OcrError('cancelled');
    bitmap = await createImageBitmap(new Blob([bytes], { type: dimensions.type }));
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_IMAGE_PIXELS || bitmap.width > MAX_IMAGE_SIDE || bitmap.height > MAX_IMAGE_SIDE) throw new OcrError('pixels');
    if (signal.aborted) throw new OcrError('cancelled');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new OcrError('corrupt');
    context.fillStyle = '#FFFFFF'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new OcrError('corrupt')), 'image/png'));
    if (signal.aborted) throw new OcrError('cancelled');
    return new Uint8Array(await blob.arrayBuffer());
  } catch (error) {
    throw error instanceof OcrError ? error : new OcrError('corrupt');
  } finally {
    bitmap?.close(); canvas.width = 0; canvas.height = 0; bytes?.fill(0);
  }
}

export async function extractText(file: File, signal: AbortSignal, onReading: () => void): Promise<string> {
  const image = await rasterizeImage(file, signal);
  if (signal.aborted) { image.fill(0); throw new OcrError('cancelled'); }
  let worker: Worker;
  try { worker = new Worker('/assets/ocr/worker.min.js'); }
  catch { image.fill(0); throw new OcrError('initialization'); }
  let sequence = 0;
  let phase: OcrErrorKey = 'initialization';
  let rejectActive: ((error: OcrError) => void) | undefined;
  const cancel = () => { worker.terminate(); rejectActive?.(new OcrError('cancelled')); };
  signal.addEventListener('abort', cancel, { once: true });
  function job(action: string, payload: object, timeout: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const jobId = String(++sequence);
      const finish = (value: unknown, failure?: OcrError) => {
        clearTimeout(timer); rejectActive = undefined; worker.onmessage = null; worker.onerror = null; worker.onmessageerror = null;
        if (failure) reject(failure); else resolve(value);
      };
      const timer = setTimeout(() => finish(undefined, new OcrError(phase)), timeout);
      rejectActive = error => finish(undefined, error);
      worker.onerror = event => { event.preventDefault(); finish(undefined, new OcrError(phase)); };
      worker.onmessageerror = () => finish(undefined, new OcrError(phase));
      worker.onmessage = event => {
        const packet = event.data;
        if (!packet || packet.jobId !== jobId || packet.action !== action) return;
        if (packet.status === 'resolve') finish(packet.data);
        else if (packet.status === 'reject') finish(undefined, new OcrError(phase));
      };
      if (signal.aborted) { finish(undefined, new OcrError('cancelled')); return; }
      try { worker.postMessage({ workerId: 'clearmessage-local-ocr', jobId, action, payload }); }
      catch { finish(undefined, new OcrError(phase)); }
    });
  }
  try {
    await job('load', { options: { lstmOnly: true, corePath: new URL('/assets/ocr', location.origin).href, logging: false } }, 30_000);
    await job('loadLanguage', { langs: 'eng', options: { langPath: new URL('/assets/ocr', location.origin).href, cacheMethod: 'none', gzip: true, lstmOnly: true } }, 30_000);
    await job('initialize', { langs: 'eng', oem: 1, config: {} }, 30_000);
    await job('setParameters', { params: { user_defined_dpi: '300' } }, 10_000);
    phase = 'processing'; onReading();
    const output = await job('recognize', { image, options: {}, output: { text: true } }, 60_000);
    if (typeof output !== 'object' || output === null || !('text' in output) || typeof output.text !== 'string') throw new OcrError('processing');
    if (!output.text.trim()) throw new OcrError('unreadable');
    return output.text;
  } finally {
    signal.removeEventListener('abort', cancel); worker.terminate(); image.fill(0);
  }
}
