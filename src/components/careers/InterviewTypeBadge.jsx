import { Bot, Laptop2, Users, MessageCircle, Briefcase } from 'lucide-react';

const TYPE_STYLES = {
  ai: { icon: Bot, className: 'bg-violet-50 text-violet-600' },
  technical: { icon: Laptop2, className: 'bg-brand-50 text-brand-600' },
  managerial: { icon: Users, className: 'bg-amber-50 text-amber-700' },
  hr: { icon: MessageCircle, className: 'bg-emerald-50 text-emerald-700' },
  other: { icon: Briefcase, className: 'bg-slate-100 text-slate-600' },
};

export default function InterviewTypeBadge({ type, label }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.other;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
