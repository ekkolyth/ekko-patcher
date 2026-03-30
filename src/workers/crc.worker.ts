// @ts-nocheck
import { BinFile } from '../lib/rom-patcher/BinFile';
import RomPatcher from '../lib/rom-patcher/RomPatcher';

const ctx: Worker = self as unknown as Worker;

ctx.onmessage = async (event: MessageEvent) => {
  const { u8array, fileName, checksumStartOffset = 0 } = event.data;

  const binFile = new BinFile(u8array);
  binFile.fileName = fileName;

  const crc32 = binFile.hashCRC32(checksumStartOffset);
  const md5 = binFile.hashMD5(checksumStartOffset);

  let sha1 = '';
  try {
    sha1 = await binFile.hashSHA1(checksumStartOffset);
  } catch (e) {
    // Web Crypto may not be available in all contexts
  }

  ctx.postMessage({
    crc32,
    md5,
    sha1,
    checksumStartOffset,
    additionalChecksum: RomPatcher.getRomAdditionalChecksum(binFile),
  });
};
