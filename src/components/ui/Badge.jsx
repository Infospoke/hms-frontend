/**
 * Small reusable pill used for job tags ("Remote (US)", "Senior"),
 * the highlighted "Remote" tag, and the "NEW" ribbon on job cards.
 * variant: 'default' | 'brand' | 'solid'
 */
export default function Badge({ children, icon, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    brand: 'bg-brand-50 text-brand-600 font-semibold',
    success: 'bg-emerald-50 text-emerald-600 font-semibold',
    warning: 'bg-amber-50 text-amber-700 font-semibold',
    solid: 'bg-orange-500 text-white font-bold uppercase tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
