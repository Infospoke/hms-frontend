import { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2 } from 'lucide-react';

/**
 * Drag-and-drop / click resume uploader, plus a list of "additional documents".
 */
export default function FileUpload({
  label = 'Upload Resume',
  required = false,
  hint = 'PDF, DOC, DOCX (Max. 5MB)',
  accept = '.pdf,.doc,.docx',
  file,
  onFileChange,
  error,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    if (files && files[0]) onFileChange?.(files[0]);
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
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
          dragOver
            ? 'border-brand-500 bg-brand-50'
            : error
              ? 'border-rose-400 bg-rose-50/40'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
          <UploadCloud className="h-5 w-5 text-brand-600" />
        </span>
        <p className="text-sm font-semibold text-slate-800">Click to upload or drag and drop</p>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      {file && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
              <FileText className="h-4 w-4 text-rose-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500">{file.type || 'Document'} · {file.size}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileChange?.(null)}
            className="text-slate-400 hover:text-rose-500"
            aria-label="Remove document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
