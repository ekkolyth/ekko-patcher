import { useState, useCallback, useRef, useEffect } from 'react';

interface UseWorkerResult<TInput, TOutput> {
  loading: boolean;
  error: string | null;
  result: TOutput | null;
  run: (input: TInput, transfer?: Transferable[]) => void;
  reset: () => void;
}

export function useWorker<TInput, TOutput>(
  createWorker: () => Worker
): UseWorkerResult<TInput, TOutput> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TOutput | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const run = useCallback((input: TInput, transfer?: Transferable[]) => {
    workerRef.current?.terminate();

    const worker = createWorker();
    workerRef.current = worker;
    setLoading(true);
    setError(null);
    setResult(null);

    worker.onmessage = (event: MessageEvent<TOutput>) => {
      setResult(event.data);
      setLoading(false);
      worker.terminate();
    };

    worker.onerror = (event) => {
      setError(event.message || 'Worker error');
      setLoading(false);
      worker.terminate();
    };

    if (transfer) {
      worker.postMessage(input, transfer);
    } else {
      worker.postMessage(input);
    }
  }, [createWorker]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { loading, error, result, run, reset };
}
