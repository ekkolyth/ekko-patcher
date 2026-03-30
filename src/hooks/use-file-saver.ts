import { useState, useCallback } from 'react';

interface UseFileSaverOptions {
  filters?: { name: string; extensions: string[] }[];
}

export function useFileSaver(options?: UseFileSaverOptions) {
  const [saving, setSaving] = useState(false);

  const saveFile = useCallback(async (buffer: ArrayBuffer, defaultName: string) => {
    setSaving(true);
    try {
      const result = await window.electronAPI.saveFile({
        defaultName,
        buffer,
        filters: options?.filters,
      });
      return result;
    } finally {
      setSaving(false);
    }
  }, [options?.filters]);

  return { saving, saveFile };
}
