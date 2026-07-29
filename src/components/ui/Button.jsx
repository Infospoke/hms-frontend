import { ArrowRight } from 'lucide-react';

/**
 * Primary call-to-action button used across auth flows.
 * variant: 'primary' | 'ghost'
 * showArrow: renders a trailing arrow icon (matches "Sign In ->" style)
 */
export default function Button({
  children,
  variant = 'primary',
  showArrow = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold transition duration-150 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary:
      'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  };

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {showArrow && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}
