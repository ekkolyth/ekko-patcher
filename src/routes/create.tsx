import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Badge } from '@/components/retroui/Badge';
import { FormatSelect } from '@/components/format-select';
import { useFilePicker } from '@/hooks/use-file-picker';
import { useFileSaver } from '@/hooks/use-file-saver';
import { usePatchCreator } from '@/hooks/use-patch-creator';
import { Hammer, Loader2, FileOutput, X } from 'lucide-react';

export const Route = createFileRoute('/create')({
  component: CreatePage,
});

function StepNumber({ n, active }: { n: number; active: boolean }) {
  return (
    <div
      className={`w-8 h-8 border-2 border-border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
        active
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {n}
    </div>
  );
}

function CreatePage() {
  const originalPicker = useFilePicker({
    filters: [{ name: 'ROM Files', extensions: ['*'] }],
  });
  const modifiedPicker = useFilePicker({
    filters: [{ name: 'ROM Files', extensions: ['*'] }],
  });
  const fileSaver = useFileSaver();
  const patchCreator = usePatchCreator();
  const [format, setFormat] = useState('ips');
  const [outputName, setOutputName] = useState('');

  // Generate default output name when both files are loaded
  useEffect(() => {
    if (originalPicker.file && modifiedPicker.file) {
      setOutputName(`patch.${format === 'ebp' ? 'ebp' : format}`);
    } else {
      setOutputName('');
    }
  }, [originalPicker.file, modifiedPicker.file, format]);

  // When creation completes, trigger save with user-specified name
  useEffect(() => {
    if (patchCreator.result?.success && patchCreator.result.patchFileU8Array) {
      let saveName = outputName.trim() || 'patch';
      const ext = format === 'ebp' ? '.ebp' : `.${format}`;
      if (!saveName.match(/\.\w+$/)) {
        saveName += ext;
      }
      fileSaver.saveFile(
        patchCreator.result.patchFileU8Array.buffer,
        saveName
      );
    }
  }, [patchCreator.result]);

  const handleCreate = () => {
    if (!originalPicker.file || !modifiedPicker.file) return;
    patchCreator.create(
      originalPicker.file.u8array,
      modifiedPicker.file.u8array,
      format
    );
  };

  const canCreate = originalPicker.file && modifiedPicker.file && format && !patchCreator.loading && outputName.trim().length > 0;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-4">
        {/* Step 1: Original ROM */}
        <div className="flex gap-4 items-start border-2 border-border bg-card p-5 shadow-md">
          <StepNumber n={1} active={!!originalPicker.file} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Original ROM</div>
              <Button onClick={originalPicker.pickFile} disabled={originalPicker.loading} variant="outline" size="sm">
                Browse
              </Button>
            </div>
            {originalPicker.file && (
              <Badge variant="default" className="gap-1.5 text-sm font-mono py-1 px-3 w-fit">
                {originalPicker.file.name}
                <span className="text-muted-foreground font-sans text-xs">
                  ({(originalPicker.file.size / 1048576).toFixed(1)} MB)
                </span>
                <button
                  onClick={() => { originalPicker.clear(); patchCreator.reset(); setOutputName(''); }}
                  className="text-muted-foreground hover:text-foreground ml-1"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Step 2: Modified ROM — shown after original is loaded */}
        {originalPicker.file && (
          <div className="flex gap-4 items-start border-2 border-border bg-card p-5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StepNumber n={2} active={!!modifiedPicker.file} />
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Modified ROM</div>
                <Button onClick={modifiedPicker.pickFile} disabled={modifiedPicker.loading} variant="outline" size="sm">
                  Browse
                </Button>
              </div>
              {modifiedPicker.file && (
                <Badge variant="default" className="gap-1.5 text-sm font-mono py-1 px-3 w-fit">
                  {modifiedPicker.file.name}
                  <span className="text-muted-foreground font-sans text-xs">
                    ({(modifiedPicker.file.size / 1048576).toFixed(1)} MB)
                  </span>
                  <button
                    onClick={() => { modifiedPicker.clear(); patchCreator.reset(); setOutputName(''); }}
                    className="text-muted-foreground hover:text-foreground ml-1"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Output — shown after both ROMs are loaded */}
        {originalPicker.file && modifiedPicker.file && (
          <div className="flex gap-4 items-start border-2 border-border bg-card p-5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StepNumber n={3} active={outputName.trim().length > 0} />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <FileOutput className="size-4 text-muted-foreground" />
                <div className="font-semibold">Output</div>
              </div>
              <div className="flex items-center gap-3">
                <FormatSelect value={format} onChange={setFormat} />
                <Input
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="Output filename..."
                  className="font-mono flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Create button — shown after all steps are complete */}
        {originalPicker.file && modifiedPicker.file && outputName.trim().length > 0 && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button
              onClick={handleCreate}
              disabled={!canCreate}
              size="lg"
              className="gap-2"
            >
              {patchCreator.loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Hammer className="size-4" />
                  Create Patch
                </>
              )}
            </Button>

            {patchCreator.result?.success === false && patchCreator.result.errorMessage && (
              <span className="text-sm text-destructive">{patchCreator.result.errorMessage}</span>
            )}
            {patchCreator.error && (
              <span className="text-sm text-destructive">{patchCreator.error}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
