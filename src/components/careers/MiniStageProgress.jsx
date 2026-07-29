import { HIRING_STAGES } from './HiringStepper.jsx';

/**
 * Compact dot-and-line progress line for a single application card.
 * `totalSteps` defaults to the mock's fixed 8-stage HIRING_STAGES list, but
 * can be overridden so this can also render a real application's actual
 * round count from the API (which varies per job and doesn't map neatly
 * onto that fixed list).
 */
export default function MiniStageProgress({
  activeIndex,
  totalSteps = HIRING_STAGES.length,
  tone = 'brand',
  className = '',
}) {
  const dotColor = tone === 'muted' ? 'bg-slate-400' : 'bg-brand-600';
  const lineColor = tone === 'muted' ? 'bg-slate-400' : 'bg-brand-600';
  const steps = Math.max(totalSteps, 1);

  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      {Array.from({ length: steps }, (_, i) => (
        <div key={i} className="flex items-center">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${i <= activeIndex ? dotColor : 'bg-slate-200'}`}
          />
          {i < steps - 1 && (
            <span
              className={`h-px w-6 shrink-0 transition-colors ${i < activeIndex ? lineColor : 'bg-slate-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
