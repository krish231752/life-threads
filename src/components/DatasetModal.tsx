import React, { useState, useEffect, useRef } from 'react';
import { Receipt } from '../types';
import { X, Upload, CheckCircle2, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { validateRawDatasetInput, MAX_DATASET_FILE_SIZE_BYTES } from '../data/validation';
import { normalizeDataset } from '../data/normalization';

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomDataset: (receipts: Receipt[]) => void;
  onResetToDefault: () => void;
  currentCount: number;
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomDataset,
  onResetToDefault,
  currentCount,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Close on Escape key and manage focus
  useEffect(() => {
    if (!isOpen) return;
    triggerElementRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus initial element
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      triggerElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_DATASET_FILE_SIZE_BYTES) {
      setErrorMessage('Dataset is too large to process safely in the browser (Maximum size: 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonInput(text);
        parseAndApply(text);
      } catch {
        setErrorMessage('Failed to read file. Please ensure it is valid UTF-8 JSON.');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const parseAndApply = (rawJson: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    try {
      // Validate input using the secure validation layer
      const validation = validateRawDatasetInput(rawJson);
      if (!validation.valid || !validation.sanitizedData) {
        setErrorMessage(validation.error || 'Invalid dataset structure.');
        setIsProcessing(false);
        return;
      }

      // Safe normalization & sanitization
      const normalized = normalizeDataset(validation.sanitizedData);
      if (normalized.length === 0) {
        setErrorMessage('No valid moments could be extracted from this dataset.');
        setIsProcessing(false);
        return;
      }

      onLoadCustomDataset(normalized);
      setSuccessMessage(`Successfully parsed, sanitized & normalized ${normalized.length} digital receipts!`);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error processing dataset. Please check format.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dataset-modal-title"
      aria-describedby="dataset-modal-desc"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl border border-white/[0.12] bg-[#0E111A] p-6 sm:p-8 shadow-2xl space-y-5 focus:outline-none"
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 rounded-full bg-white/[0.06] p-2 text-white/60 hover:bg-white/[0.12] hover:text-white transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-500/20">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>SECURE CLIENT-SIDE NORMALIZATION</span>
          </div>
          <h2 id="dataset-modal-title" className="text-xl sm:text-2xl font-bold text-white">
            Load Hackathon or Custom Dataset
          </h2>
          <p id="dataset-modal-desc" className="text-xs text-white/60 font-light">
            Paste your challenge JSON file or drop any life receipts payload below. All data is sanitized and analyzed 100% locally in your browser. (Current loaded count: {currentCount} moments)
          </p>
        </div>

        {/* Upload File button */}
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center">
          <div className="space-y-0.5 text-left">
            <p className="text-xs font-semibold text-white">Upload JSON file from disk</p>
            <p className="text-[11px] text-white/40">Accepts .json (Max 2MB)</p>
          </div>
          <label className="cursor-pointer rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-medium text-white transition border border-white/20 focus-within:ring-2 focus-within:ring-amber-400">
            <span>Browse File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="sr-only"
              aria-label="Upload JSON file from disk"
            />
          </label>
        </div>

        {/* Textarea Paste */}
        <div className="space-y-2">
          <label htmlFor="raw-json-textarea" className="text-xs font-mono uppercase tracking-wider text-white/50 block">
            Or Paste Raw JSON:
          </label>
          <textarea
            id="raw-json-textarea"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={6}
            placeholder='[ { "id": "1", "type": "music", "timestamp": "2024-10-14T23:42:00Z", "title": "...", ... } ]'
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs font-mono text-white placeholder-white/30 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            aria-label="Paste raw dataset JSON"
          />
        </div>

        {errorMessage && (
          <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              onResetToDefault();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:outline-none rounded px-2 py-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Elena Vance Master Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => parseAndApply(jsonInput)}
            disabled={!jsonInput.trim() || isProcessing}
            className="rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black px-4 py-2 text-xs font-bold transition shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            {isProcessing ? 'Processing...' : 'Apply Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
};
