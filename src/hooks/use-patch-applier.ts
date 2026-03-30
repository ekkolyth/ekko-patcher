import { useCallback } from 'react';
import { useWorker } from './use-worker';

interface ApplyInput {
  romFileU8Array: Uint8Array;
  romFileName: string;
  patchFileU8Array: Uint8Array;
  patchFileName: string;
  options: {
    requireValidation?: boolean;
    removeHeader?: boolean;
    addHeader?: boolean;
    fixChecksum?: boolean;
    outputSuffix?: boolean;
  };
}

interface ApplyOutput {
  success: boolean;
  patchedRomU8Array?: Uint8Array;
  patchedRomFileName?: string;
  errorMessage?: string;
  romFileU8Array: Uint8Array;
  patchFileU8Array: Uint8Array;
}

export function usePatchApplier() {
  const worker = useWorker<ApplyInput, ApplyOutput>(
    () => new Worker(new URL('../workers/apply.worker.ts', import.meta.url), { type: 'module' })
  );

  const apply = useCallback((
    romU8Array: Uint8Array,
    romFileName: string,
    patchU8Array: Uint8Array,
    patchFileName: string,
    options: ApplyInput['options'] = {}
  ) => {
    const romCopy = new Uint8Array(romU8Array);
    const patchCopy = new Uint8Array(patchU8Array);
    worker.run(
      {
        romFileU8Array: romCopy,
        romFileName,
        patchFileU8Array: patchCopy,
        patchFileName,
        options,
      },
      [romCopy.buffer, patchCopy.buffer]
    );
  }, [worker.run]);

  return {
    loading: worker.loading,
    error: worker.error,
    result: worker.result,
    apply,
    reset: worker.reset,
  };
}
