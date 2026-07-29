import { Check } from 'lucide-react';

/**
 * Checkmark bullet list - reused for "What you'll do" and
 * "What we're looking for" sections on the job detail page.
 */
export default function Checklist({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-slate-600">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
