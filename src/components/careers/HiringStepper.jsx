import { Send, FileText, Sparkles, Code2, Users, MessageCircle, Mail, Trophy } from 'lucide-react';

/**
 * The 8-stage hiring journey, shared by the hero (compact) and the
 * body of the page (full, with labels + group headers).
 *
 * Pass `activeId` to highlight the candidate's current stage.
 * Pass `showLabels` to switch between the two visual densities seen
 * in the mock — same data, same component, different rendering.
 */
export const HIRING_STAGES = [
  { id: 'applied', label: 'Applied', group: 'Application', icon: Send },
  { id: 'resume-screened', label: 'Resume Screened', group: 'Application', icon: FileText },
  { id: 'ai-interview', label: 'AI Interview', group: 'Application', icon: Sparkles },
  { id: 'technical-interview', label: 'Technical Interview', group: 'Interview rounds', icon: Code2 },
  { id: 'managerial-interview', label: 'Managerial Interview', group: 'Interview rounds', icon: Users },
  { id: 'hr-interview', label: 'HR Interview', group: 'Interview rounds', icon: MessageCircle },
  { id: 'offer', label: 'Offer', group: 'Decision', icon: Mail },
  { id: 'hired', label: 'Hired', group: 'Decision', icon: Trophy },
];

export default function HiringStepper({ activeIds, showLabels = true, className = '' }) {
  const groups = ['Application', 'Interview rounds', 'Decision'];
  const activeTabs=activeIds
  return (
    <div className={className}>
      <div className="mb-3 flex text-xs font-bold uppercase tracking-wider text-white/60">
        {groups.map((group) => {
          const span = HIRING_STAGES.filter((s) => s.group === group).length;
          return (
            <div key={group} style={{ flex: span }} className="text-center first:text-left last:text-right">
              {group}
            </div>
          );
        })}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/25" aria-hidden="true" />
        <span
          className="animate-travel-dot absolute top-1/2 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"
          style={{ transform: 'translate(-50%, -50%)' }}
          aria-hidden="true"
        />
        {HIRING_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeTabs?.includes(stage?.id);
          return (
            <div key={stage.id} className=" relative z-10 flex flex-1 flex-col items-center gap-2
    transform transition-all duration-300 ease-in-out
    hover:-translate-y-2">
              <span
                className={`flex items-center justify-center rounded-full border transition mt-4 ${
                  showLabels ? 'h-12 w-12' : 'h-9 w-9'
                } ${
                  isActive
                    ? 'border-white bg-white text-brand-600 shadow-md'
                    : 'border-white/50 bg-brand-600 text-white/85'
                }`}
              >
                <Icon className={showLabels ? 'h-5 w-5 ' : 'h-4 w-4'} />
              </span>
              {showLabels && (
                <span className={`text-center text-xs font-semibold ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {stage.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
