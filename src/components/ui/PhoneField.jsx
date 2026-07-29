import { Phone, ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
];

/**
 * Phone number input with a country-code dropdown, matching the Nexus HMS signup form.
 * error: validation message shown under the field, with a red border on the number input.
 */
export default function PhoneField({
  label = 'Phone Number',
  id,
  countryCode,
  onCountryCodeChange,
  error,
  containerClassName = '',
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange?.(e.target.value)}
            className="h-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-8 text-sm text-slate-900 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative flex flex-1 items-center">
          <span className="pointer-events-none absolute left-4 flex items-center text-slate-400">
            <Phone className="h-4 w-4" />
          </span>
          <input
            id={id}
            type="tel"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:ring-2 ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
            {...props}
          />
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
