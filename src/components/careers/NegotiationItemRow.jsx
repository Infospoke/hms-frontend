import { CreditCard, Briefcase, MapPin, Calendar, Clock, MessageCircle, Check } from 'lucide-react';

const ICONS = { CreditCard, Briefcase, MapPin, Calendar, Clock, MessageCircle };

export default function NegotiationItemRow({ item, selected, value, onToggle, onChange, isLast }) {
  const Icon = ICONS[item.icon] ?? MessageCircle;
  const isOther = item.id === 'other';

  return (
    <div className={`${!isLast ? 'border-b border-slate-100' : ''} ${selected ? 'bg-brand-50/60' : ''}`}>
      <label
        htmlFor={`negotiate-${item.id}`}
        className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 sm:px-8"
      >
        <span className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              selected ? 'bg-white text-brand-600 shadow-sm' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">{item.label}</span>
            {item.offered && <span className="text-sm text-slate-400">Offered: {item.offered}</span>}
            {isOther && <span className="text-sm text-slate-400">{item.description}</span>}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          {selected && <span className="text-sm font-semibold text-brand-600">Change requested</span>}
          <span className="relative flex h-5 w-5 items-center justify-center">
            <input
              id={`negotiate-${item.id}`}
              type="checkbox"
              checked={selected}
              onChange={() => onToggle(item.id)}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-brand-600 checked:bg-brand-600 transition"
            />
            <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
          </span>
        </span>
      </label>

      {selected && (
        <div className="px-6 pb-6 sm:px-8">
          {isOther ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Describe your request {!item.optional && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={value.reason}
                onChange={(e) => onChange(item.id, { ...value, reason: e.target.value })}
                placeholder={item.reasonPlaceholder ?? "Tell us what else you'd like us to consider."}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{value.reason.length} / 1000</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Offered {item.label.replace(' (Total Compensation)', '')}
                </label>
                <div className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  {item.offered}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  {item.requestedLabel} {!item.optional && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type={item.inputType || 'text'}
                  value={value.requested}
                  onChange={(e) => onChange(item.id, { ...value, requested: e.target.value })}
                  placeholder={item.placeholder}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Reason / Justification {!item.optional && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={value.reason}
                  onChange={(e) => onChange(item.id, { ...value, reason: e.target.value })}
                  placeholder={item.reasonPlaceholder ?? 'Tell us why this change matters to you.'}
                  className="w-full min-h-[92px] resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="mt-1 text-right text-xs text-slate-400">{value.reason.length} / 1000</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}