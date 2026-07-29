/**
 * Small icon tile used in the "Search Jobs / Apply / AI Screening..." grid.
 * iconBg / iconColor let each tile carry its own accent color, matching the mock.
 */
export default function FeatureCard({ icon, iconBg, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
