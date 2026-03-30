import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUp, X } from 'lucide-react';

interface PatchFilePickerProps {
  file: { name: string; size: number } | null;
  format: string | null;
  loading: boolean;
  onPick: () => void;
  onClear: () => void;
}

export function PatchFilePicker({ file, format, loading, onPick, onClear }: PatchFilePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={onPick} disabled={loading} variant="outline" className="gap-2">
        <FileUp className="size-4" />
        Select Patch File
      </Button>
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-foreground">{file.name}</span>
          {format && (
            <Badge variant="secondary" className="text-xs">{format}</Badge>
          )}
          <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
