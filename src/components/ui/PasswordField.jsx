import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

/**
 * Password input with a lock icon and a show/hide toggle.
 * error: validation message shown under the field in place of `hint`, with a red border.
 */
export default function PasswordField({
  label,
  id,
  hint,
  error,
  containerClassName = '',
  className = '',
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-4 flex items-center text-slate-400">
          <Lock className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 flex items-center text-slate-400 hover:text-slate-600"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
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
