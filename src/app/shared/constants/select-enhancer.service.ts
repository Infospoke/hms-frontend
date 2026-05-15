import { Inject, Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SelectEnhancerService implements OnDestroy {
  private domObserver!: MutationObserver;
  private enhanced = new WeakSet<HTMLSelectElement>();
  private activePanel: HTMLElement | null = null;
  private activePanelSelect: HTMLSelectElement | null = null;
  private globalCloseHandler: ((e: MouseEvent) => void) | null = null;

  constructor(@Inject(DOCUMENT) private doc: Document) {}

 
  init(): void {
    this.processAll();

    // Watch for new <select> elements added by Angular (routing, *ngIf, etc.)
    this.domObserver = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node.tagName === 'SELECT') {
            this.enhance(node as HTMLSelectElement);
          } else {
            node.querySelectorAll<HTMLSelectElement>('select').forEach(s => this.enhance(s));
          }
        });
      }
    });

    this.doc.body.addEventListener('scroll', () => this.repositionPanel(), true);
    this.doc.defaultView?.addEventListener('resize', () => this.closePanel());
   
    this.domObserver.observe(this.doc.body, { childList: true, subtree: true });
  }

  private processAll(): void {
    this.doc.querySelectorAll<HTMLSelectElement>('select').forEach(s => this.enhance(s));
  }

  private enhance(select: HTMLSelectElement): void {
    if (this.enhanced.has(select)) return;
    if (select.dataset['csEnhanced']) return;
    this.enhanced.add(select);
    select.dataset['csEnhanced'] = '1';

    // ── Build wrapper ────────────────────────────────────────────────────────
    const wrapper = this.doc.createElement('div');
    wrapper.className = 'cs-wrapper';
    select.parentNode!.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Hide native select but keep it in DOM for Angular Forms binding
    select.classList.add('cs-native');

    // ── Build visible trigger ────────────────────────────────────────────────
    const trigger = this.doc.createElement('div');
    trigger.className = 'cs-trigger';
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    wrapper.appendChild(trigger);

    this.syncTrigger(trigger, select);

    // ── Sync trigger when Angular Forms updates the value ───────────────────
    select.addEventListener('change', () => this.syncTrigger(trigger, select));

    // Observe select class changes (err, ng-invalid, ng-touched) → propagate to wrapper
    const classObserver = new MutationObserver(() => {
      const hasErr = select.classList.contains('err')
        || (select.classList.contains('ng-invalid') && select.classList.contains('ng-touched'));
      wrapper.classList.toggle('cs-error', hasErr);
      trigger.classList.toggle('cs-trigger--error', hasErr);

      // Disabled state
      const isDisabled = select.disabled || select.hasAttribute('disabled');
      wrapper.classList.toggle('cs-disabled', isDisabled);
      trigger.setAttribute('tabindex', isDisabled ? '-1' : '0');
    });
    classObserver.observe(select, { attributes: true, attributeFilter: ['class', 'disabled'] });

    // Also watch for option changes (dynamic options)
    const optionObserver = new MutationObserver(() => {
      this.syncTrigger(trigger, select);
      // Rebuild panel if currently open for this select
      if (this.activePanelSelect === select && this.activePanel) {
        this.rebuildPanelOptions(this.activePanel, select, trigger);
      }
    });
    optionObserver.observe(select, { childList: true, subtree: true });

    // ── Open / close panel ───────────────────────────────────────────────────
    trigger.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (select.disabled) return;
      if (this.activePanelSelect === select && this.activePanel) {
        this.closePanel();
      } else {
        this.closePanel();
        this.openPanel(select, trigger);
      }
    });

    trigger.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (select.disabled) return;
        this.activePanelSelect === select ? this.closePanel() : this.openPanel(select, trigger);
      }
      if (e.key === 'Escape') this.closePanel();
      // Arrow key navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateOption(select, trigger, e.key === 'ArrowDown' ? 1 : -1);
      }
    });
  }

  private syncTrigger(trigger: HTMLElement, select: HTMLSelectElement): void {
    const idx = select.selectedIndex;
    const opt = select.options[idx];
    const isPlaceholder = !select.value || (opt && opt.disabled);
    const label = opt?.text ?? '';

    trigger.innerHTML = `
      <span class="cs-label ${isPlaceholder ? 'cs-label--placeholder' : ''}">${label}</span>
      <span class="cs-chevron">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    `;
  }

  private openPanel(select: HTMLSelectElement, trigger: HTMLElement): void {
    const panel = this.doc.createElement('div');
    panel.className = 'cs-panel';
    panel.setAttribute('role', 'listbox');

    this.rebuildPanelOptions(panel, select, trigger);

    this.doc.body.appendChild(panel);
    this.activePanel = panel;
    this.activePanelSelect = select;

    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('cs-trigger--open');

    this.positionPanel(panel, trigger);

    // Close on outside click
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.contains(t) && !trigger.contains(t)) {
        this.closePanel();
        this.doc.removeEventListener('mousedown', close, true);
        this.globalCloseHandler = null;
      }
    };
    this.globalCloseHandler = close;
    setTimeout(() => this.doc.addEventListener('mousedown', close, true), 10);
  }

  private rebuildPanelOptions(
    panel: HTMLElement,
    select: HTMLSelectElement,
    trigger: HTMLElement
  ): void {
    panel.innerHTML = '';

    Array.from(select.options).forEach(opt => {
      // Skip disabled placeholder "Select xxx" first option
      if (opt.disabled && !opt.value) return;

      const item = this.doc.createElement('div');
      item.className = 'cs-option';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', opt.value);
      item.textContent = opt.text;

      if (opt.value === select.value) {
        item.classList.add('cs-option--selected');
        item.setAttribute('aria-selected', 'true');
      }
      if (opt.disabled) {
        item.classList.add('cs-option--disabled');
      }

      item.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (opt.disabled) return;

        // Update native select → Angular Forms picks this up automatically
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));

        this.syncTrigger(trigger, select);
        this.closePanel();
      });

      panel.appendChild(item);
    });
  }

  private positionPanel(panel: HTMLElement, trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelHeight = 240;

    const showAbove = spaceBelow < panelHeight && spaceAbove > spaceBelow;

    panel.style.position = 'fixed';
    panel.style.left = `${rect.left}px`;
    panel.style.width = `${rect.width}px`;
    panel.style.zIndex = '99999';

    if (showAbove) {
      panel.style.bottom = `${window.innerHeight - rect.top + 2}px`;
      panel.style.top = 'auto';
    } else {
      panel.style.top = `${rect.bottom + 2}px`;
      panel.style.bottom = 'auto';
    }
  }

  private repositionPanel(): void {
    if (!this.activePanel || !this.activePanelSelect) return;
    const wrapper = this.activePanelSelect.closest('.cs-wrapper');
    const trigger = wrapper?.querySelector<HTMLElement>('.cs-trigger');
    if (trigger) this.positionPanel(this.activePanel, trigger);
  }

  private navigateOption(select: HTMLSelectElement, trigger: HTMLElement, dir: 1 | -1): void {
    const opts = Array.from(select.options).filter(o => !o.disabled);
    const current = opts.findIndex(o => o.value === select.value);
    const next = Math.max(0, Math.min(opts.length - 1, current + dir));
    if (opts[next]) {
      select.value = opts[next].value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
      this.syncTrigger(trigger, select);

      // Highlight option in open panel
      if (this.activePanel) {
        this.activePanel.querySelectorAll('.cs-option').forEach(el => {
          el.classList.toggle(
            'cs-option--selected',
            (el as HTMLElement).dataset['value'] === opts[next].value
          );
        });
      }
    }
  }

  private closePanel(): void {
    if (this.activePanel) {
      this.activePanel.remove();
      this.activePanel = null;
    }
    if (this.activePanelSelect) {
      const wrapper = this.activePanelSelect.closest('.cs-wrapper');
      const trigger = wrapper?.querySelector<HTMLElement>('.cs-trigger');
      trigger?.setAttribute('aria-expanded', 'false');
      trigger?.classList.remove('cs-trigger--open');
      this.activePanelSelect = null;
    }
    if (this.globalCloseHandler) {
      this.doc.removeEventListener('mousedown', this.globalCloseHandler, true);
      this.globalCloseHandler = null;
    }
  }

  ngOnDestroy(): void {
    this.domObserver?.disconnect();
    this.closePanel();
  }
}