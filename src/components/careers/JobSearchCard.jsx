import { Search, MapPin, BarChart3 } from 'lucide-react';
import TextField from '../ui/TextField.jsx';
import SelectField from '../ui/SelectField.jsx';
import Button from '../ui/Button.jsx';
import { LEVEL_FILTER_OPTIONS } from '../../data/jobs.js';

/**
 * Keyword / Location / Level search card. Rendered with a negative top
 * margin by the page so it visually floats over the hero/body boundary.
 * Location and Level are real filters — CareersPage owns their state and
 * applies them alongside the work-mode/keyword filters. Location options
 * are derived from the actual job list (there's no fixed location enum in
 * the API), so they're passed in as a prop rather than imported statically.
 */
export default function JobSearchCard({
  keyword,
  onKeywordChange,
  location,
  onLocationChange,
  locationOptions = ['Anywhere'],
  level,
  onLevelChange,
  className = '',
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-brand-900/10 sm:grid-cols-[2fr_1.4fr_1.2fr_auto] ${className}`}
    >
      <TextField
        label="Keyword"
        id="keyword"
        placeholder="Role, skill, or team"
        icon={<Search className="h-4 w-4" />}
        value={keyword}
        onChange={(e) => onKeywordChange?.(e.target.value)}
      />
      <SelectField
        label="Location"
        id="location"
        icon={<MapPin className="h-4 w-4" />}
        value={location}
        onChange={(e) => onLocationChange?.(e.target.value)}
        options={locationOptions}
      />
      <SelectField
        label="Level"
        id="level"
        icon={<BarChart3 className="h-4 w-4" />}
        value={level}
        onChange={(e) => onLevelChange?.(e.target.value)}
        options={LEVEL_FILTER_OPTIONS}
      />
      <div className="flex items-end">
        <Button type="button" showArrow={false} className="!py-3">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
