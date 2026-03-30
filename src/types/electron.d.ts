interface FileOpenResult {
  name: string;
  path: string;
  buffer: ArrayBuffer;
}

interface FileSaveResult {
  path: string;
}

interface FileFilter {
  name: string;
  extensions: string[];
}

interface ElectronAPI {
  openFile: (options?: {
    filters?: FileFilter[];
  }) => Promise<FileOpenResult | null>;
  saveFile: (options: {
    defaultName: string;
    buffer: ArrayBuffer;
    filters?: FileFilter[];
  }) => Promise<FileSaveResult | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
