import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const VARIANTS = {
  error: {
    wrap: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  },
  info: {
    wrap: 'border-brand-200 bg-brand-50 text-brand-700',
    icon: <Info className="h-4 w-4 shrink-0" />,
  },
};

/** Small inline status banner used across the auth screens. */
export default function AlertBanner({ variant = 'info', children, className = '' }) {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${v.wrap} ${className}`}
    >
      {v.icon}
      <span>{children}</span>
    </div>
  );
}
