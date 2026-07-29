import { ChevronDown } from 'lucide-react';

/**
 * Reusable labeled dropdown, styled to match TextField's input chrome.
 * icon: a lucide-react component (already sized) passed as JSX, e.g. <MapPin className="h-4 w-4" />
 * options: array of strings, or [{ value, label }] objects.
 */
export default function SelectField({
  label,
  icon,
  id,
  hint,
  error,
  options = [],
  containerClassName = '',
  className = '',
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-4 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <select
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full cursor-pointer appearance-none rounded-xl border bg-white py-3 text-sm text-slate-900 transition focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          } ${icon ? 'pl-11' : 'pl-4'} pr-9 ${className}`}
          {...props}
        >
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
