import { Bell } from 'lucide-react';
import Tabs from '../ui/Tabs.jsx';
import { MODE_TYPE_TABS } from '../../data/jobs.js';

/**
 * Work-mode filter row (All / On-site / Hybrid / Remote — the real
 * `modeType` values on every job) + job alert button. Sits below
 * JobSearchCard, in normal document flow (does not float).
 */
export default function JobFilterBar({ category, onCategoryChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs variant="pill" tabs={MODE_TYPE_TABS} value={category} onChange={onCategoryChange} />

      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        Create job alert
      </button>
    </div>
  );
}
