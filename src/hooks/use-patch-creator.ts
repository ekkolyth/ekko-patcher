import { useCallback } from 'react';
import { useWorker } from './use-worker';

interface CreateInput {
  originalRomU8Array: Uint8Array;
  modifiedRomU8Array: Uint8Array;
  format: string;
  metadata?: Record<string, string>;
}

interface CreateOutput {
  success: boolean;
  patchFileU8Array?: Uint8Array;
  patchFileName?: string;
  errorMessage?: string;
  originalRomU8Array: Uint8Array;
  modifiedRomU8Array: Uint8Array;
}

export function usePatchCreator() {
  const worker = useWorker<CreateInput, CreateOutput>(
    () => new Worker(new URL('../workers/create.worker.ts', import.meta.url), { type: 'module' })
  );

  const create = useCallback((
    originalU8Array: Uint8Array,
    modifiedU8Array: Uint8Array,
    format: string,
    metadata?: Record<string, string>
  ) => {
    const origCopy = new Uint8Array(originalU8Array);
    const modCopy = new Uint8Array(modifiedU8Array);
    worker.run(
      {
        originalRomU8Array: origCopy,
        modifiedRomU8Array: modCopy,
        format,
        metadata,
      },
      [origCopy.buffer, modCopy.buffer]
    );
  }, [worker.run]);

  return {
    loading: worker.loading,
    error: worker.error,
    result: worker.result,
    create,
    reset: worker.reset,
  };
}
