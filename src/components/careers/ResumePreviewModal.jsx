import { X, FileText, Download } from 'lucide-react';

/**
 * Simple centered modal that previews the resume currently on file.
 * Swap the placeholder page body for a real PDF/embed viewer once file
 * storage is wired up — this only needs `resume.name` to render.
 */
export default function ResumePreviewModal({ resume, onClose }) {
  if (!resume) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${resume.name}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50">
              <FileText className="h-4 w-4 text-rose-500" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{resume.name}</p>
              {(resume.uploadedLabel || resume.sizeLabel) && (
                <p className="text-xs text-slate-500">
                  {[resume.uploadedLabel, resume.sizeLabel].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto flex aspect-[8.5/11] w-full max-w-sm flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-2.5 w-1/3 rounded bg-slate-100" />
            <div className="mt-4 h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-11/12 rounded bg-slate-100" />
            <div className="h-2 w-4/5 rounded bg-slate-100" />
            <div className="mt-4 h-2.5 w-1/4 rounded bg-slate-100" />
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-10/12 rounded bg-slate-100" />
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="mt-4 h-2.5 w-1/4 rounded bg-slate-100" />
            <div className="h-2 w-9/12 rounded bg-slate-100" />
            <div className="h-2 w-full rounded bg-slate-100" />
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            {resume.pages ? `Page 1 of ${resume.pages} · ` : ''}preview only
          </p>
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
