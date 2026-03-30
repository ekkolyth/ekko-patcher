// @ts-nocheck - BinFile/RomPatcher are JS-style constructor functions
import { BinFile } from '../lib/rom-patcher/BinFile';
import RomPatcher from '../lib/rom-patcher/RomPatcher';

const ctx: Worker = self as unknown as Worker;

ctx.onmessage = (event: MessageEvent) => {
  const {
    romFileU8Array,
    romFileName,
    patchFileU8Array,
    patchFileName,
    options,
  } = event.data;

  const romFile = new BinFile(romFileU8Array);
  romFile.fileName = romFileName;
  const patchFile = new BinFile(patchFileU8Array);
  patchFile.fileName = patchFileName;

  const patch = RomPatcher.parsePatchFile(patchFile);

  if (!patch) {
    ctx.postMessage({
      success: false,
      errorMessage: 'Invalid or unsupported patch file format',
      romFileU8Array,
      patchFileU8Array,
    }, [romFileU8Array.buffer, patchFileU8Array.buffer]);
    return;
  }

  try {
    const patchedRom = RomPatcher.applyPatch(romFile, patch, options);
    ctx.postMessage({
      success: true,
      patchedRomU8Array: patchedRom._u8array,
      patchedRomFileName: patchedRom.fileName,
      romFileU8Array,
      patchFileU8Array,
    }, [
      romFileU8Array.buffer,
      patchFileU8Array.buffer,
      patchedRom._u8array.buffer,
    ]);
  } catch (err) {
    ctx.postMessage({
      success: false,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      romFileU8Array,
      patchFileU8Array,
    }, [romFileU8Array.buffer, patchFileU8Array.buffer]);
  }
};
