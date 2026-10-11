import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractText, imageDimensions, MAX_IMAGE_BYTES, OcrError, rasterizeImage } from './ocr';

function png(width = 100, height = 100) {
  const bytes = new Uint8Array(33); bytes.set([137,80,78,71,13,10,26,10]);
  const view = new DataView(bytes.buffer); view.setUint32(8,13); bytes.set([73,72,68,82],12); view.setUint32(16,width); view.setUint32(20,height); return bytes;
}
function file(bytes: Uint8Array, size = bytes.length): File {
  return { size, arrayBuffer: async () => bytes.buffer } as File;
}
function decoding() {
  const bitmap = { width: 100, height: 100, close: vi.fn() };
  const canvas = { width: 0, height: 0, getContext: () => ({ fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn() }), toBlob: (callback: (blob: Blob) => void) => callback(new Blob([png()])) };
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
  vi.stubGlobal('document', { createElement: () => canvas });
  vi.stubGlobal('location', { origin: 'http://clearmessage.invalid' });
  return { bitmap, canvas };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('image content limits', () => {
  it('accepts PNG dimensions independently of the filename', () => expect(imageDimensions(png())).toEqual({ width: 100, height: 100, type: 'image/png' }));
  it('accepts a bounded JPEG SOF header', () => expect(imageDimensions(new Uint8Array([255,216,255,192,0,8,8,0,10,0,20,3]))).toEqual({ width: 20, height: 10, type: 'image/jpeg' }));
  it.each([['format', new Uint8Array([60,115,118,103])], ['pixels', png(4000,4000)], ['pixels', png(16385,1)], ['corrupt', png(0,100)], ['corrupt', new Uint8Array([255,216,255,192,255])]])('rejects %s before decoding', (key, bytes) => expect(() => imageDimensions(bytes as Uint8Array)).toThrow(new OcrError(key as 'format')));
  it('rejects empty files and byte overflow before reading', async () => {
    await expect(rasterizeImage(file(png(),0), new AbortController().signal)).rejects.toMatchObject({ key: 'empty' });
    await expect(rasterizeImage(file(png(),MAX_IMAGE_BYTES + 1), new AbortController().signal)).rejects.toMatchObject({ key: 'bytes' });
  });
  it('maps corrupt decoding to a fixed private error and releases canvas', async () => {
    const {canvas}=decoding(); vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('PRIVATE_FILENAME_CANARY')));
    await expect(rasterizeImage(file(png()), new AbortController().signal)).rejects.toEqual(new OcrError('corrupt'));
    expect(canvas.width).toBe(0); expect(canvas.height).toBe(0);
  });
  it('closes decoded images and clears the raster canvas', async () => {
    const {bitmap,canvas}=decoding(); await rasterizeImage(file(png()), new AbortController().signal);
    expect(bitmap.close).toHaveBeenCalledOnce(); expect(canvas.width).toBe(0); expect(canvas.height).toBe(0);
  });
});

function workerMock(failedAction?: string, hangAction?: string, text = 'Fictional extracted text.') {
  const workers: FakeWorker[] = [];
  class FakeWorker {
    onmessage: ((event: {data: unknown}) => void) | null = null;
    onerror: unknown; onmessageerror: unknown; terminate = vi.fn();
    constructor() { workers.push(this); }
    postMessage(packet: {action: string; jobId: string}) {
      if (packet.action === hangAction) return;
      queueMicrotask(() => this.onmessage?.({ data: { ...packet, status: packet.action === failedAction ? 'reject' : 'resolve', data: packet.action === failedAction ? 'PRIVATE_OCR_FAILURE_CANARY' : packet.action === 'recognize' ? { text } : {} } }));
    }
  }
  vi.stubGlobal('Worker', FakeWorker); return workers;
}
describe('worker lifecycle', () => {
  it.each(['load','loadLanguage','initialize','recognize'])('terminates on %s rejection without echoing private diagnostics', async action => {
    decoding(); const workers=workerMock(action);
    await expect(extractText(file(png()), new AbortController().signal, vi.fn())).rejects.toEqual(new OcrError(action === 'recognize' ? 'processing' : 'initialization'));
    expect(workers[0].terminate).toHaveBeenCalledOnce();
  });
  it('terminates after real-protocol success and keeps the complete extracted text', async () => {
    decoding(); const workers=workerMock(undefined,undefined,'x'.repeat(2100)); const reading=vi.fn();
    expect(await extractText(file(png()),new AbortController().signal,reading)).toHaveLength(2100);
    expect(reading).toHaveBeenCalledOnce(); expect(workers[0].terminate).toHaveBeenCalledOnce();
  });
  it('rejects blank OCR and terminates', async () => {
    decoding(); const workers=workerMock(undefined,undefined,'  \n'); await expect(extractText(file(png()),new AbortController().signal,vi.fn())).rejects.toMatchObject({key:'unreadable'}); expect(workers[0].terminate).toHaveBeenCalledOnce();
  });
  it('terminates a hanging initialization on timeout', async () => {
    decoding(); vi.useFakeTimers(); const workers=workerMock(undefined,'load');
    const result=extractText(file(png()),new AbortController().signal,vi.fn()); const assertion=expect(result).rejects.toMatchObject({key:'initialization'});
    await vi.runAllTimersAsync(); await assertion; expect(workers[0].terminate).toHaveBeenCalledOnce();
  });
  it('aborts an active job and releases its native worker', async () => {
    decoding(); const workers=workerMock(undefined,'load'); const controller=new AbortController();
    const result=extractText(file(png()),controller.signal,vi.fn()); const assertion=expect(result).rejects.toMatchObject({key:'cancelled'});
    while (!workers.length) await Promise.resolve(); controller.abort(); await assertion; expect(workers[0].terminate).toHaveBeenCalled();
  });
});
