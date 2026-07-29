export default function Checkbox({ id, label, checked, onChange, className = '' }) {
  return (
    <label htmlFor={id} className={`flex cursor-pointer items-center gap-2.5 select-none ${className}`}>
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-brand-600 checked:bg-brand-600 transition"
        />
        <svg
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-sm text-slate-600">{label}</span>
    </label>
  );
}
