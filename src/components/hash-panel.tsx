import { Loader2 } from 'lucide-react';

interface HashPanelProps {
  loading: boolean;
  hashes: {
    crc32: string;
    md5: string;
    sha1: string;
  } | null;
}

export function HashPanel({ loading, hashes }: HashPanelProps) {
  if (!loading && !hashes) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        <span>Computing checksums...</span>
      </div>
    );
  }

  if (!hashes) return null;

  return (
    <div className="font-mono text-[11px] leading-relaxed text-muted-foreground space-y-0.5">
      <div><span className="opacity-60">CRC32:</span> {hashes.crc32}</div>
      <div><span className="opacity-60">MD5:</span> {hashes.md5}</div>
      <div className="break-all"><span className="opacity-60">SHA-1:</span> {hashes.sha1}</div>
    </div>
  );
}
