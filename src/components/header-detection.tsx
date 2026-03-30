import { Checkbox } from '@/components/retroui/Checkbox';
import { Label } from '@/components/retroui/Label';
import { Info } from 'lucide-react';

interface HeaderDetectionProps {
  headerName: string;
  headerSize: number;
  removeHeader: boolean;
  onToggle: (remove: boolean) => void;
}

export function HeaderDetection({ headerName, headerSize, removeHeader, onToggle }: HeaderDetectionProps) {
  return (
    <div className="flex items-center gap-3 border-2 border-border bg-muted px-4 py-3">
      <Info className="size-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground">
        {headerName} header detected ({headerSize} bytes)
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <Checkbox
          id="remove-header"
          checked={removeHeader}
          onCheckedChange={(checked: boolean | 'indeterminate') => onToggle(checked === true)}
        />
        <Label htmlFor="remove-header" className="text-sm cursor-pointer">
          Remove header before patching
        </Label>
      </div>
    </div>
  );
}
