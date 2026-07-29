import { Check, X } from 'lucide-react';
import { getPasswordIssues } from '../../utils/validators.js';

const ALL_RULES = [
  'At least 8 characters',
  'A lowercase letter',
  'An uppercase letter',
  'A number',
  'A special character',
];

/** Live checklist shown under a new-password field so candidates see exactly what's missing. */
export default function PasswordRequirements({ password }) {
  const issues = new Set(getPasswordIssues(password));

  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {ALL_RULES.map((rule) => {
        // "No more than 64 characters" is intentionally not listed as a
        // positive rule to chase — only the ones users actively type toward.
        if (rule.startsWith('No more than')) return null;
        const met = !issues.has(rule);
        return (
          <li
            key={rule}
            className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            {met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {rule}
          </li>
        );
      })}
    </ul>
  );
}
