import { Badge } from '@/components/retroui/Badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface ValidationStatusProps {
  valid: boolean | null;
}

export function ValidationStatus({ valid }: ValidationStatusProps) {
  if (valid === null) return null;

  return valid ? (
    <Badge variant="surface" size="sm" className="inline-flex items-center gap-1.5 w-fit">
      <CheckCircle className="size-3.5" />
      ROM validated
    </Badge>
  ) : (
    <Badge variant="outline" size="sm" className="inline-flex items-center gap-1.5 w-fit text-destructive border-destructive">
      <XCircle className="size-3.5" />
      ROM mismatch
    </Badge>
  );
}
