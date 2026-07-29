import { useRef, useState } from 'react';
import { X, Upload, FileCheck2 } from 'lucide-react';
import Checkbox from '../ui/Checkbox.jsx';

export default function ESignModal({ offer, totalCompLabel, onClose, onConfirm }) {
  const [tab, setTab] = useState('type'); // 'type' | 'upload'
  const [typedName, setTypedName] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const canConfirm = agreed && (tab === 'type' ? typedName.trim().length > 1 : Boolean(signatureFile));

  const handleFiles = (files) => {
    if (files && files[0]) setSignatureFile(files[0]);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm?.({ method: tab, typedName, signatureFile });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Accept and e-sign your offer"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Accept &amp; e-sign your offer</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign below to confirm you accept this offer. We&apos;ll email you a countersigned copy.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5">
          <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-sm text-slate-700">
            <span className="font-bold text-slate-900">{offer.jobTitle}</span> · {totalCompLabel}/year
            {offer.joiningDateLabel ? ` · Starting ${offer.joiningDateLabel}` : ''}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setTab('type')}
              className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                tab === 'type'
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Type signature
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                tab === 'upload'
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Upload e-signature
            </button>
          </div>

          {tab === 'type' ? (
            <div className="mt-6">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full name"
                className="w-full border-b-2 border-slate-300 bg-transparent pb-2 font-signature text-4xl text-slate-800 placeholder:text-slate-300 focus:border-brand-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                This will be used as your legal signature on the offer letter.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                  dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                  {signatureFile ? (
                    <FileCheck2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-brand-600" />
                  )}
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {signatureFile ? signatureFile.name : 'Upload your signature'}
                </p>
                <p className="text-xs text-slate-500">
                  {signatureFile ? 'Click to replace' : 'PNG, JPG or PDF · up to 5MB · or click to browse'}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 px-4 py-4">
            <Checkbox
              id="esign-agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label="I agree to the terms of this offer letter and confirm this is my signature."
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Confirm &amp; sign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
