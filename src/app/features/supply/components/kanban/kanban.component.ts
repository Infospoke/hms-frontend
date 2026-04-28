import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
// TODO: Update these import paths to match your project structure
// import { ApiService } from '../services/api.service';
// import { API } from '../constants/api.constants';

type Stage = 'Applied' | 'Screened' | 'Shortlisted' | 'Interview' | 'Offer' | 'Hired';
type SlaStatus = 'BREACHED' | 'WARNING' | 'OK';
type ApplicantFilter = 'all' | 'referrals' | 'non-referrals';
type SlaFilter = 'green' | 'orange' | 'red' | null;
type DateFilter = 'today' | 'lastweek' | 'lastmonth' | 'custom' | null;

export interface Job {
  id: string | number;
  title?: string;
  code?: string;
  [key: string]: any;
}

interface Candidate {
  id: number;
  name: string;
  sla: SlaStatus;
  days: number;
  percent?: number;
  ref?: boolean;
  jr?: string;
  selected: boolean;
}

interface FilterChip {
  label: string;
  key: string;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, NzModalModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent implements OnInit {
  private modalRef?: NzModalRef;

  constructor(
    private modal: NzModalService,
    // TODO: inject your ApiService
    // private api: ApiService
  ) {}

  @ViewChild('showRejectConfirm', { static: true }) rejectConfirmModal!: TemplateRef<any>;
  @ViewChild('moveConfirmModal', { static: true }) moveConfirmModal!: TemplateRef<any>;

  // ─── Stages & Candidates ──────────────────────────────
  stages: Stage[] = ['Applied', 'Screened', 'Shortlisted', 'Interview', 'Offer', 'Hired'];

  candidates: Record<Stage, Candidate[]> = {
    Applied: [
      { id: 1, name: 'Venkat R.',  sla: 'BREACHED', days: 8,  percent: 133, ref: true,  jr: 'QAT-01', selected: false },
      { id: 2, name: 'Arun C.',    sla: 'WARNING',  days: 5,  percent: 83,               jr: 'QAT-02', selected: false },
      { id: 3, name: 'Sri V.',     sla: 'OK',       days: 2,  percent: 22,               jr: 'QAT-01', selected: false },
    ],
    Screened: [
      { id: 4, name: 'Pooja K.',  sla: 'OK',      days: 1, percent: 15, ref: true, jr: 'QAT-03', selected: false },
      { id: 5, name: 'Rahul B.',  sla: 'WARNING', days: 4, percent: 70,            jr: 'QAT-02', selected: false },
    ],
    Shortlisted: [
      { id: 6, name: 'Ajay S.', sla: 'OK', days: 3, percent: 40, jr: 'QAT-01', selected: false },
    ],
    Interview: [],
    Offer: [],
    Hired: [],
  };


  jobsList: Job[] = [];
  selectedJrIds: Set<string | number> = new Set();
  showJrDropdown = false;
  jobsLoading = false;

  showFilterPanel = false;
  activeFilterSection = 'Applicants';
  filterSections = ['Applicants', 'Date Filters', 'Source', 'SLA'];

  sourceOptions = [
    'Naukri', 'LinkedIn', 'Website','Agency / Rpo', 
  
  ];

  filterApplicantType: ApplicantFilter = 'all';
  filterDateType: DateFilter = null;
  filterSources: string[] = [];
  filterSla: SlaFilter = null;

  // Temp (working) filter state – changes while panel is open
  tempApplicantType: ApplicantFilter = 'all';
  tempDateType: DateFilter = null;
  tempSources: string[] = [];
  tempSla: SlaFilter = null;

  // ─── Bulk selection ───────────────────────────────────
  selectedStage: Stage | null = null;
  pendingMoveStage: Stage | null = null;

  // ─── Notifications ────────────────────────────────────
  notifications = [
    { type: 'breach',  title: 'SLA Breach — Venkat R.',      sub: 'Applied · 8d · 133%',           dismissable: true  },
    { type: 'warn',    title: 'SLA Warning — Arun C.',        sub: 'Applied · 5d · 83%',             dismissable: true  },
    { type: 'success', title: 'Referral received',            sub: 'Rahul T. submitted a referral',  dismissable: false },
  ];

  // ─── Lifecycle ────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    await this.loadJobs();
  }

  // ─── API: Load Jobs ───────────────────────────────────
  async loadJobs(): Promise<void> {
    this.jobsLoading = true;
    try {
      // TODO: Replace mock with real API call:
      // const res: any = await firstValueFrom(
      //   this.api.hrmsget(API.JOBS.GET_ALL_JOBS(true))
      // );
      // this.jobsList = res?.data || [];

      // ── Mock data for development ──
      this.jobsList = [
        { id: 'QAT-01', code: 'QAT-01', title: 'QA Test Engineer' },
        { id: 'QAT-02', code: 'QAT-02', title: 'Senior QA Analyst' },
        { id: 'QAT-03', code: 'QAT-03', title: 'Automation Engineer' },
        { id: 'QAT-04', code: 'QAT-04', title: 'QA Lead' },
        { id: 'QAT-05', code: 'QAT-05', title: 'Test Architect' },
        { id: 'QAT-06', code: 'QAT-06', title: 'Performance Tester' },
      ];

      // Auto-select first job
      if (this.jobsList.length > 0) {
        this.selectedJrIds.add(this.jobsList[0].id);
        this.onJrSelectionChange();
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      this.jobsLoading = false;
    }
  }

  // ─── JR Dropdown ──────────────────────────────────────
  toggleJrDropdown(): void {
    this.showJrDropdown = !this.showJrDropdown;
  }

  closeJrDropdown(): void {
    this.showJrDropdown = false;
  }

  toggleJrSelection(jobId: string | number, event: Event): void {
    event.stopPropagation();
    if (this.selectedJrIds.has(jobId)) {
      this.selectedJrIds.delete(jobId);
    } else {
      this.selectedJrIds.add(jobId);
    }
    this.onJrSelectionChange();
  }

  onJrSelectionChange(): void {
    // TODO: Re-fetch candidates for selected JR IDs
    // const ids = Array.from(this.selectedJrIds);
    // this.api.hrmsget(API.CANDIDATES.GET_BY_JR(ids)).subscribe(...)
  }

  getSelectedJrLabel(): string {
    if (this.selectedJrIds.size === 0) return 'Select JR';
    if (this.selectedJrIds.size === 1) {
      const id = Array.from(this.selectedJrIds)[0];
      const job = this.jobsList.find(j => j.id === id);
      return `JR: ${job?.code ?? id}`;
    }
    return `JR: ${this.selectedJrIds.size} selected`;
  }

  isJrSelected(jobId: string | number): boolean {
    return this.selectedJrIds.has(jobId);
  }

  // ─── Filter Panel ─────────────────────────────────────
  openFilterPanel(): void {
    this.tempApplicantType = this.filterApplicantType;
    this.tempDateType      = this.filterDateType;
    this.tempSources       = [...this.filterSources];
    this.tempSla           = this.filterSla;
    this.activeFilterSection = 'Applicants';
    this.showFilterPanel   = true;
  }

  closeFilterPanel(): void {
    this.showFilterPanel = false;
  }

  applyFilters(): void {
    this.filterApplicantType = this.tempApplicantType;
    this.filterDateType      = this.tempDateType;
    this.filterSources       = [...this.tempSources];
    this.filterSla           = this.tempSla;
    this.showFilterPanel     = false;
    // TODO: reload/filter candidates with new filter state
  }

  resetFilters(): void {
    this.tempApplicantType = 'all';
    this.tempDateType      = null;
    this.tempSources       = [];
    this.tempSla           = null;
  }

  toggleTempSource(src: string, checked: boolean): void {
    if (checked) {
      if (!this.tempSources.includes(src)) this.tempSources.push(src);
    } else {
      this.tempSources = this.tempSources.filter(s => s !== src);
    }
  }

  isTempSourceSelected(src: string): boolean {
    return this.tempSources.includes(src);
  }

  get tempActiveChips(): FilterChip[] {
    const chips: FilterChip[] = [];
    if (this.tempApplicantType !== 'all') {
      chips.push({ label: this.capitalize(this.tempApplicantType), key: 'applicant' });
    }
    if (this.tempDateType) {
      const labels: Record<string, string> = {
        today: 'Today', lastweek: 'Last week', lastmonth: 'Last month', custom: 'Custom'
      };
      chips.push({ label: labels[this.tempDateType] ?? this.tempDateType, key: 'date' });
    }
    this.tempSources.forEach(s => chips.push({ label: s, key: `source_${s}` }));
    if (this.tempSla) {
      chips.push({ label: this.capitalize(this.tempSla), key: 'sla' });
    }
    return chips;
  }

  removeTempChip(key: string): void {
    if (key === 'applicant') { this.tempApplicantType = 'all'; }
    else if (key === 'date') { this.tempDateType = null; }
    else if (key === 'sla')  { this.tempSla = null; }
    else if (key.startsWith('source_')) {
      const src = key.replace('source_', '');
      this.tempSources = this.tempSources.filter(s => s !== src);
    }
  }

  get appliedFilterCount(): number {
    let count = 0;
    if (this.filterApplicantType !== 'all') count++;
    if (this.filterDateType) count++;
    count += this.filterSources.length;
    if (this.filterSla) count++;
    return count;
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ─── Bulk Selection ───────────────────────────────────
  toggleSelect(stage: Stage, candidate: Candidate): void {
    if (this.selectedStage && this.selectedStage !== stage) return;
    this.selectedStage = stage;
    candidate.selected = !candidate.selected;
    if (!this.candidates[stage].some(c => c.selected)) this.selectedStage = null;
  }

  getSelected(): Candidate[] {
    if (!this.selectedStage) return [];
    return this.candidates[this.selectedStage].filter(c => c.selected);
  }

  getSelectedCount(): number {
    return this.getSelected().length;
  }

  getNextStages(): Stage[] {
    if (!this.selectedStage) return [];
    const index = this.stages.indexOf(this.selectedStage);
    return this.stages.slice(index + 1);
  }

  // ─── Move Stage ───────────────────────────────────────
  onMoveStageSelect(value: string): void {
    if (!value) return;
    this.pendingMoveStage = value as Stage;
    this.modalRef = this.modal.create({
      nzTitle: 'Move Stage',
      nzContent: this.moveConfirmModal,
      nzFooter: [
        { label: 'Cancel',       onClick: () => this.cancelMove()   },
        { label: 'Confirm Move', type: 'primary', onClick: () => this.confirmMove() },
      ],
    });
  }

  confirmMove(): void {
    if (!this.selectedStage || !this.pendingMoveStage) return;
    const selected = this.getSelected();
    this.candidates[this.selectedStage] = this.candidates[this.selectedStage].filter(c => !c.selected);
    selected.forEach(c => {
      c.selected = false;
      this.candidates[this.pendingMoveStage!].push(c);
    });
    this.selectedStage    = null;
    this.pendingMoveStage = null;
    this.modalRef?.destroy();
  }

  cancelMove(): void { this.modalRef?.destroy(); }

  // ─── Reject ───────────────────────────────────────────
  rejectSelected(): void {
    this.modalRef = this.modal.create({
      nzTitle: 'Reject Candidates',
      nzContent: this.rejectConfirmModal,
      nzFooter: [
        { label: 'Cancel',         onClick: () => this.cancelReject() },
        { label: 'Confirm Reject', danger: true, type: 'primary', onClick: () => this.confirmReject() },
      ],
    });
  }

  confirmReject(): void {
    if (!this.selectedStage) return;
    this.candidates[this.selectedStage] = this.candidates[this.selectedStage].filter(c => !c.selected);
    this.selectedStage = null;
    this.modalRef?.destroy();
  }

  cancelReject(): void { this.modalRef?.destroy(); }

  // ─── Notifications ────────────────────────────────────
  dismissNotification(i: number): void {
    this.notifications.splice(i, 1);
  }

  // ─── Avatar helpers ───────────────────────────────────
  avatarPalette     = ['#FEE2E2','#DBEAFE','#DCFCE7','#FEF3C7','#EDE9FE','#FCE7F3','#E0F2FE','#F0FDF4'];
  avatarTextPalette = ['#DC2626','#2563EB','#16A34A','#D97706','#7C3AED','#DB2777','#0284C7','#15803D'];

  getAvatarBg(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
  }

  getAvatarText(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarTextPalette[Math.abs(hash) % this.avatarTextPalette.length];
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  // ─── Stage color helpers ──────────────────────────────
  getStageColor(stage: Stage): string {
    const map: Record<Stage, string> = {
      Applied: '#2563EB', Screened: '#16A34A', Shortlisted: '#D97706',
      Interview: '#7C3AED', Offer: '#0891B2', Hired: '#15803D',
    };
    return map[stage];
  }

  getStageHeaderBg(stage: Stage): string {
    const map: Record<Stage, string> = {
      Applied: '#EFF6FF', Screened: '#F0FDF4', Shortlisted: '#FFFBEB',
      Interview: '#F5F3FF', Offer: '#ECFEFF', Hired: '#F0FDF4',
    };
    return map[stage];
  }

  // ─── Close dropdowns on outside click ───────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.jr-dropdown-wrap')) {
      this.showJrDropdown = false;
    }
    if (!target.closest('.filter-modal') && !target.closest('.btn-outline')) {
      // overlay handles this via (click) on the overlay div
    }
  }

  // ─── SLA accent colour (for filter panel) ────────────
  getSlaAccent(val: string): string {
    const map: Record<string, string> = { green: '#22C55E', orange: '#F59E0B', red: '#EF4444' };
    return map[val] ?? '#94A3B8';
  }

  getStageDotColor(stage: Stage): string {
    if (this.candidates[stage].length === 0) return '';
    const breached = this.candidates[stage].some(c => c.sla === 'BREACHED');
    const warned   = this.candidates[stage].some(c => c.sla === 'WARNING');
    if (breached) return '#EF4444';
    if (warned)   return '#F59E0B';
    return '#22C55E';
  }
}