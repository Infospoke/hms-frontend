export default function BenefitCard({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h4 className="font-bold text-slate-900">{title}</h4>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
