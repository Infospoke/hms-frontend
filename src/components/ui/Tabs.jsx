import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Generic, reusable tab strip with an animated sliding indicator.
 *
 * Three visual variants so the SAME component can drive:
 *  - the top-level page nav ("Open roles / My applications / Interviews / Offer")
 *  - the role-category filter row ("All roles / Engineering / Design ...")
 *  - a classic underline strip, for reuse elsewhere
 *
 * The indicator's position/width is measured from the active tab's DOM node
 * and animated with a CSS transition whenever `value` changes - no extra
 * animation library required.
 *
 * tabs: [{ id, label, badge?: boolean, icon?: ReactNode }]
 * value: id of the active tab (controlled)
 * onChange: (id) => void
 * variant: 'nav' | 'underline' | 'pill'
 */
export default function Tabs({ tabs, value, onChange, variant = 'nav', className = '' }) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const activeEl = tabRefs.current[value];
    const containerEl = containerRef.current;
    if (!activeEl || !containerEl) {
      // No tab matches the current value (e.g. CareersNav on a page like
      // Change Password that isn't one of the 4 nav tabs) - hide the
      // indicator instead of leaving it stuck at its last position, which
      // would otherwise jump from that stale spot the next time a real tab
      // becomes active.
      setIndicator((prev) => (prev.ready ? { left: 0, width: 0, ready: false } : prev));
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
      ready: true,
    });
  }, [value, tabs, variant]);

  const isPill = variant === 'pill';
  const isUnderline = variant === 'underline';

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative flex items-center ${isPill ? 'flex-wrap gap-2' : 'gap-8'} ${className}`}
    >
      {/* Sliding indicator - shared across variants, styled per variant.
          Uses `ring` (box-shadow) instead of `border` for the outline: a
          border is part of the box model, so even with box-sizing:border-box
          a 1px border still nudges the element's painted edge outside the
          exact pixel rect we measured from the tab button, which shows up as
          a tiny layout "jump" the moment a tab becomes active. A ring is
          drawn as a box-shadow, so it never affects layout/box size - the
          indicator always matches the measured width exactly. */}
      {indicator.ready && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute box-border transition-all duration-300 ease-out ${
            isUnderline
              ? 'bottom-0 h-[2px] rounded-full bg-brand-600'
              : isPill
                ? 'inset-y-0 rounded-full ring-1 ring-inset ring-brand-600 bg-brand-50'
                : 'inset-y-0 rounded-full ring-1 ring-inset ring-brand-600 bg-white'
          }`}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}

      {tabs.map((tab) => {
        const active = tab.id === value;

        if (variant === 'nav') {
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              role="tab"
              aria-selected={active}
              onClick={() => onChange?.(tab.id)}
              className={`relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge ? (
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
              ) : null}
            </button>
          );
        }

        if (isUnderline) {
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              role="tab"
              aria-selected={active}
              onClick={() => onChange?.(tab.id)}
              className={`relative z-10 flex items-center gap-2 pb-1 text-sm font-semibold transition-colors duration-200 ${
                active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge ? (
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
              ) : null}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(tab.id)}
            className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              active ? 'text-brand-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
