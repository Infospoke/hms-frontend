import { useState } from 'react';
import { X, ArrowUp, AlertCircle } from 'lucide-react';


export default function ResumeUploadModal({ jobTitle, message, submitting = false, error = '', onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [setAsProfile, setSetAsProfile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    if (files && files[0]) setFile(files[0]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold text-slate-900">Upload new resume</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="shrink-0 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          for your application to <strong className="font-bold text-slate-700">{jobTitle}</strong>
        </p>

        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">{message}</p>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <label
          className={`mt-4 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
            <ArrowUp className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold text-slate-800">
            {file ? file.name : 'Drop your resume here'}
          </span>
          <span className="text-xs text-slate-400">PDF, DOCX or TXT &middot; up to 10 MB &middot; or click to browse</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={setAsProfile}
            onChange={(e) => setSetAsProfile(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            <span className="block text-sm font-bold text-slate-800">Also set this as my profile resume</span>
            <span className="mt-0.5 block text-sm text-slate-500">
              Updates the resume shown across your profile and future applications.
            </span>
          </span>
        </label>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || submitting}
            onClick={() => onSubmit({ file, setAsProfile })}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Uploading…' : 'Submit resume'}
          </button>
        </div>
      </div>
    </div>
  );
}