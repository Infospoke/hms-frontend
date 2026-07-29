import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Vite-friendly worker setup — `?url` resolves to a hashed, servable asset
// URL both in dev and in the production build, instead of relying on a CDN.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const MIN_SCALE = 0.75;
const MAX_SCALE = 1.75;
const SCALE_STEP = 0.25;

/**
 * Renders a PDF Blob as an actual paginated document (via react-pdf/pdf.js)
 * instead of dropping it into a raw <iframe> — gives page-by-page
 * navigation, zoom, and a consistent "paper" look across browsers.
 */
export default function OfferLetterViewer({ file }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [docError, setDocError] = useState('');

  const handleLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
    setPageNumber(1);
    setDocError('');
  };

  const handleLoadError = () => {
    setDocError('Could not render the offer letter. Please try downloading it instead.');
  };

  return (
    <div className="flex flex-col items-center">
      {numPages > 1 && (
        <div className="mb-4 flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-600">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="flex h-[60vh] w-[min(90vw,640px)] items-center justify-center text-sm text-slate-500">
              Rendering offer letter…
            </div>
          }
          error={
            <div className="flex h-[60vh] w-[min(90vw,640px)] items-center justify-center px-6 text-center text-sm font-medium text-rose-600">
              {docError || 'Could not render the offer letter.'}
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-sm ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))}
          disabled={scale <= MIN_SCALE}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs font-semibold text-slate-600">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))}
          disabled={scale >= MAX_SCALE}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
