import { useCallback } from 'react';
import { useWorker } from './use-worker';

interface HashInput {
  u8array: Uint8Array;
  fileName: string;
  checksumStartOffset?: number;
}

interface HashOutput {
  crc32: string;
  md5: string;
  sha1: string;
  checksumStartOffset: number;
  additionalChecksum: string | null;
}

export function useHashCalculator() {
  const worker = useWorker<HashInput, HashOutput>(
    () => new Worker(new URL('../workers/crc.worker.ts', import.meta.url), { type: 'module' })
  );

  const calculate = useCallback((u8array: Uint8Array, fileName: string, checksumStartOffset = 0) => {
    const copy = new Uint8Array(u8array);
    worker.run(
      { u8array: copy, fileName, checksumStartOffset },
      [copy.buffer]
    );
  }, [worker.run]);

  return {
    loading: worker.loading,
    error: worker.error,
    hashes: worker.result,
    calculate,
    reset: worker.reset,
  };
}
