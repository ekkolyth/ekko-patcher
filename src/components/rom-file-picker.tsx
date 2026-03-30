import { Button } from '@/components/ui/button';
import { FileUp, X } from 'lucide-react';

interface FileData {
  name: string;
  size: number;
}

interface RomFilePickerProps {
  label: string;
  file: FileData | null;
  loading: boolean;
  onPick: () => void;
  onClear: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function RomFilePicker({ label, file, loading, onPick, onClear }: RomFilePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={onPick} disabled={loading} variant="outline" className="gap-2">
        <FileUp className="size-4" />
        {label}
      </Button>
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-foreground">{file.name}</span>
          <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
          <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
