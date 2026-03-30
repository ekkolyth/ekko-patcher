import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Badge } from '@/components/retroui/Badge';
import { HashPanel } from '@/components/hash-panel';
import { HeaderDetection } from '@/components/header-detection';
import { ValidationStatus } from '@/components/validation-status';
import { useFilePicker } from '@/hooks/use-file-picker';
import { useFileSaver } from '@/hooks/use-file-saver';
import { useHashCalculator } from '@/hooks/use-hash-calculator';
import { usePatchApplier } from '@/hooks/use-patch-applier';
import { BinFile } from '@/lib/rom-patcher/BinFile';
import RomPatcher from '@/lib/rom-patcher/RomPatcher';
import { Play, Loader2, FileOutput, X } from 'lucide-react';

export const Route = createFileRoute('/apply')({
  component: ApplyPage,
});

function getExtension(filename: string): string {
  const match = filename.match(/\.\w+$/);
  return match ? match[0] : '';
}

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

function ApplyPage() {
  const romPicker = useFilePicker({
    filters: [{ name: 'ROM Files', extensions: ['*'] }],
  });
  const patchPicker = useFilePicker({
    filters: [
      { name: 'Patch Files', extensions: ['ips', 'ups', 'bps', 'aps', 'rup', 'ppf', 'bdf', 'pmsr', 'vcdiff', 'xdelta', 'zip'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  const fileSaver = useFileSaver();
  const hashCalc = useHashCalculator();
  const patchApplier = usePatchApplier();

  const [headerInfo, setHeaderInfo] = useState<{ name: string; size: number } | null>(null);
  const [removeHeader, setRemoveHeader] = useState(false);
  const [patchFormat, setPatchFormat] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [outputName, setOutputName] = useState('');
  const [outputExt, setOutputExt] = useState('');

  // When ROM is loaded, compute hashes and detect header
  useEffect(() => {
    if (romPicker.file) {
      hashCalc.calculate(romPicker.file.u8array, romPicker.file.name);

      const binFile = new (BinFile as any)(new Uint8Array(romPicker.file.u8array));
      binFile.fileName = romPicker.file.name;
      const header = RomPatcher.isRomHeadered(binFile);
      setHeaderInfo(header);
      setRemoveHeader(false);
    } else {
      hashCalc.reset();
      setHeaderInfo(null);
      setRemoveHeader(false);
    }
  }, [romPicker.file]);

  // When patch is loaded, detect format, validate, and generate output name
  useEffect(() => {
    if (patchPicker.file) {
      const binFile = new (BinFile as any)(new Uint8Array(patchPicker.file.u8array));
      binFile.fileName = patchPicker.file.name;
      const patch = RomPatcher.parsePatchFile(binFile);

      if (patch) {
        setPatchFormat(patch.constructor?.name || 'Unknown');

        if (romPicker.file && typeof patch.validateSource === 'function') {
          const romBin = new (BinFile as any)(new Uint8Array(romPicker.file.u8array));
          romBin.fileName = romPicker.file.name;
          const skipHeader = removeHeader && headerInfo ? headerInfo.size : 0;
          setValidationResult(RomPatcher.validateRom(romBin, patch, skipHeader));
        } else {
          setValidationResult(null);
        }

        // Generate default output name from patch filename, keep ROM extension
        if (romPicker.file) {
          const ext = getExtension(romPicker.file.name);
          setOutputExt(ext);
          const patchBase = patchPicker.file.name.replace(/\.\w+$/, '');
          setOutputName(patchBase);
        }
      } else {
        setPatchFormat(null);
        setValidationResult(null);
      }
    } else {
      setPatchFormat(null);
      setValidationResult(null);
      setOutputName('');
      setOutputExt('');
    }
  }, [patchPicker.file, romPicker.file, removeHeader, headerInfo]);

  // When patching completes, trigger save with user-specified name
  useEffect(() => {
    if (patchApplier.result?.success && patchApplier.result.patchedRomU8Array) {
      const saveName = (outputName.trim() || 'patched_rom') + outputExt;
      fileSaver.saveFile(
        patchApplier.result.patchedRomU8Array.buffer,
        saveName
      );
    }
  }, [patchApplier.result]);

  const handleApply = () => {
    if (!romPicker.file || !patchPicker.file) return;
    patchApplier.apply(
      romPicker.file.u8array,
      romPicker.file.name,
      patchPicker.file.u8array,
      patchPicker.file.name,
      {
        removeHeader,
        outputSuffix: false,
      }
    );
  };

  const canApply = romPicker.file && patchPicker.file && !patchApplier.loading && outputName.trim().length > 0;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-4">
        {/* Step 1: ROM File */}
        <div className="flex gap-4 items-start border-2 border-border bg-card p-5 shadow-md transition-all">
          <StepNumber n={1} active={!!romPicker.file} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">ROM File</div>
              <Button onClick={romPicker.pickFile} disabled={romPicker.loading} variant="outline" size="sm">
                Browse
              </Button>
            </div>
            {romPicker.file && (
              <>
                <Badge variant="default" className="gap-1.5 text-sm font-mono py-1 px-3 w-fit">
                  {romPicker.file.name}
                  <span className="text-muted-foreground font-sans text-xs">
                    ({(romPicker.file.size / 1048576).toFixed(1)} MB)
                  </span>
                  <button
                    onClick={() => { romPicker.clear(); patchApplier.reset(); setOutputName(''); }}
                    className="text-muted-foreground hover:text-foreground ml-1"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
                <div className="mt-3">
                  <HashPanel loading={hashCalc.loading} hashes={hashCalc.hashes} />
                </div>
                {headerInfo && (
                  <HeaderDetection
                    headerName={headerInfo.name}
                    headerSize={headerInfo.size}
                    removeHeader={removeHeader}
                    onToggle={setRemoveHeader}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Step 2: Patch File — shown after ROM is loaded */}
        {romPicker.file && (
          <div className="flex gap-4 items-start border-2 border-border bg-card p-5 shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StepNumber n={2} active={!!patchPicker.file} />
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Patch File</div>
                <Button onClick={patchPicker.pickFile} disabled={patchPicker.loading} variant="outline" size="sm">
                  Browse
                </Button>
              </div>
              {patchPicker.file && (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1.5 text-sm font-mono py-1 px-3 w-fit">
                      {patchPicker.file.name}
                      {patchFormat && (
                        <span className="text-xs font-sans text-muted-foreground">({patchFormat})</span>
                      )}
                      <button
                        onClick={() => { patchPicker.clear(); patchApplier.reset(); setOutputName(''); }}
                        className="text-muted-foreground hover:text-foreground ml-1"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  </div>
                  <ValidationStatus valid={validationResult} />
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Output — shown after both ROM and patch are loaded */}
        {romPicker.file && patchPicker.file && (
          <div className="flex gap-4 items-start border-2 border-border bg-card p-5 shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StepNumber n={3} active={outputName.trim().length > 0} />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <FileOutput className="size-4 text-muted-foreground" />
                <div className="font-semibold">Output</div>
              </div>
              <div className="flex">
                <Input
                  value={outputName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutputName(e.target.value)}
                  placeholder="Output filename..."
                  className="font-mono !border-r-0 !shadow-none"
                />
                <div className="flex items-center px-3 border-2 border-l-0 border-border bg-muted text-sm font-mono text-muted-foreground shrink-0">
                  {outputExt}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apply button — shown after all steps are complete */}
        {romPicker.file && patchPicker.file && outputName.trim().length > 0 && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Button
              onClick={handleApply}
              disabled={!canApply}
              size="lg"
              className="gap-2"
            >
              {patchApplier.loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Patching...
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Apply Patch
                </>
              )}
            </Button>

            {patchApplier.result?.success === false && patchApplier.result.errorMessage && (
              <span className="text-sm text-destructive">{patchApplier.result.errorMessage}</span>
            )}
            {patchApplier.error && (
              <span className="text-sm text-destructive">{patchApplier.error}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
