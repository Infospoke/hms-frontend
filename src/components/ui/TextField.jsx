/**
 * Reusable labeled text input with an optional leading icon.
 * icon: a lucide-react component (already sized) passed as JSX, e.g. <Mail className="h-4 w-4" />
 * error: validation message shown under the field in place of `hint`, with a red border.
 */
export default function TextField({
  label,
  icon,
  id,
  hint,
  error,
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
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          } ${icon ? 'pl-11' : 'pl-4'} pr-4 ${className}`}
          {...props}
        />
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
