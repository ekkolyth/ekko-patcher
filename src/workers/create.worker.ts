// @ts-nocheck - BinFile/RomPatcher are JS-style constructor functions
import { BinFile } from '../lib/rom-patcher/BinFile';
import RomPatcher from '../lib/rom-patcher/RomPatcher';

const ctx: Worker = self as unknown as Worker;

ctx.onmessage = (event: MessageEvent) => {
  const {
    originalRomU8Array,
    modifiedRomU8Array,
    format,
    metadata,
  } = event.data;

  const originalFile = new BinFile(originalRomU8Array);
  const modifiedFile = new BinFile(modifiedRomU8Array);

  try {
    const patch = RomPatcher.createPatch(originalFile, modifiedFile, format, metadata);
    const patchFile = patch.export('patch');

    ctx.postMessage({
      success: true,
      patchFileU8Array: patchFile._u8array,
      patchFileName: patchFile.fileName,
      originalRomU8Array,
      modifiedRomU8Array,
    }, [
      originalRomU8Array.buffer,
      modifiedRomU8Array.buffer,
      patchFile._u8array.buffer,
    ]);
  } catch (err) {
    ctx.postMessage({
      success: false,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      originalRomU8Array,
      modifiedRomU8Array,
    }, [originalRomU8Array.buffer, modifiedRomU8Array.buffer]);
  }
};
