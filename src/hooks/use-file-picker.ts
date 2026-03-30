import { useState, useCallback } from 'react';

interface FileData {
  name: string;
  path: string;
  buffer: ArrayBuffer;
  u8array: Uint8Array;
  size: number;
}

interface UseFilePickerOptions {
  filters?: { name: string; extensions: string[] }[];
}

export function useFilePicker(options?: UseFilePickerOptions) {
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.openFile({
        filters: options?.filters,
      });
      if (result) {
        const u8array = new Uint8Array(result.buffer);
        setFile({
          name: result.name,
          path: result.path,
          buffer: result.buffer,
          u8array,
          size: u8array.byteLength,
        });
        return { ...result, u8array };
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [options?.filters]);

  const clear = useCallback(() => setFile(null), []);

  return { file, loading, pickFile, clear };
}
