import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { SupplyService } from '../../services/supply-service';
import { JobService } from '../../../job/services/job.service';

type Stage = 'Shortlisted' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
type SlaStatus = 'BREACHED' | 'WARNING' | 'OK' | '';
type ApplicantFilter = 'all' | 'referral' | 'non-referral';
type SlaFilter = 'green' | 'orange' | 'red';
type DateFilter = 'today' | 'this week' | 'custom' | 'this month';


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

// API response types
interface ApiCandidate {
  id: number;
  firstName: string;
  lastName: string;
  currentStage: string;
  daysInStage: number | null;
  slaColor: string | null;
  referral: boolean;
  jobId: number;
  source: string;
  [key: string]: any;
  slaPercentage: any;
}

interface ApiResponse {
  data: {
    jobApplications: ApiCandidate[];
    counts: Record<string, number>;
  };
  message: string;
  responsecode: string;
}



// Map API stage strings → component Stage type
const STAGE_MAP: Record<string, Stage> = {
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

function mapSlaColor(color: string | null): SlaStatus {
  if (!color) return '';
  switch (color.toUpperCase()) {
    case 'RED': return 'BREACHED';
    case 'ORANGE': return 'WARNING';
    case 'GREEN': return 'OK';
    default: return '';
  }
}

function mapSlaPercent(color: string | null): number {
  if (!color) return 25;
  switch (color.toUpperCase()) {
    case 'RED': return 110;
    case 'ORANGE': return 75;
    default: return 25;
  }
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
  private supplyService = inject(SupplyService);
  private jobsService = inject(JobService);
  constructor(private modal: NzModalService) { }

  @ViewChild('showRejectConfirm', { static: true }) rejectConfirmModal!: TemplateRef<any>;
  @ViewChild('moveConfirmModal', { static: true }) moveConfirmModal!: TemplateRef<any>;

  stages: Stage[] = ['Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

  candidates: Record<Stage, Candidate[]> = {
    Shortlisted: [],
    Interview: [],
    Offer: [],
    Hired: [],
    Rejected: [],
  };
  stageCounts: any = {
    offer: 0,
    shortlisted: 0,
    hired: 0,
    interview: 0
  };
  candidatesLoading = false;

  jobsList: any[] = [];
  selectedJrIds: any = [];
  showJrDropdown = false;
  jobsLoading = false;

  showFilterPanel = false;
  activeFilterSection = 'Applicants';
  filterSections = ['Applicants', 'Date Filters', 'Source', 'SLA'];

  applicantOptions: { val: ApplicantFilter; lbl: string }[] = [
    { val: 'all', lbl: 'All' },
    { val: 'referral', lbl: 'Referrals' },
    { val: 'non-referral', lbl: 'Non Referrals' },
  ];

  dateOptions: { val: DateFilter; lbl: string }[] = [
    { val: 'today', lbl: 'Today' },
    { val: 'this week', lbl: 'This week' },
    { val: 'this month', lbl: 'This month' },
    { val: 'custom', lbl: 'Custom' },
  ];

  sourceOptions: string[] = ['All', 'Naukri', 'LinkedIn', 'Website', 'Agency / Rpo'];

  slaOptions: { val: SlaFilter; lbl: string }[] = [
    { val: 'green', lbl: 'Green' },
    { val: 'orange', lbl: 'Orange' },
    { val: 'red', lbl: 'Red' },
  ];

  filterApplicantType: ApplicantFilter = 'all';
  filterDateType: DateFilter = 'this month';
  filterSources: string[] = ['Naukri', 'LinkedIn', 'Website', 'Agency / Rpo'];
  filterSla: SlaFilter[] = [];
  filterStartDate = '';
  filterEndDate = '';

  tempApplicantType: ApplicantFilter = 'all';
  tempDateType: DateFilter = 'this month';
  tempSources: string[] = ['Naukri', 'LinkedIn', 'Website', 'Agency / Rpo'];
  tempSla: SlaFilter[] = [];
  tempStartDate = '';
  tempEndDate = '';

  selectedStage: Stage | null = null;
  pendingMoveStage: Stage | null = null;

  notifications = [
    { type: 'breach', title: 'SLA Breach — Venkat R.', sub: 'Applied · 8d · 133%', dismissable: true },
    { type: 'warn', title: 'SLA Warning — Arun C.', sub: 'Applied · 5d · 83%', dismissable: true },
    { type: 'success', title: 'Referral received', sub: 'Rahul T. submitted a referral', dismissable: false },
  ];

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadJobs()]);
  }


  async fetchFilteredCandidates(): Promise<void> {
    this.candidatesLoading = true;
    const payload = this.buildFilterPayload();

    try {
      const response: any = await this.supplyService.kanban(payload);



      if (response.responsecode === '00' && response.data?.jobApplications) {
        this.mapApiCandidates(response.data.jobApplications);
        this.stageCounts = response.data.counts || {};
        console.log(this.stageCounts);
      } else {
        console.error('Unexpected API response:', response);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      this.candidatesLoading = false;
    }
  }

  private mapApiCandidates(apiCandidates: ApiCandidate[]): void {
    // Reset all columns
    this.stages.forEach(stage => (this.candidates[stage] = []));

    for (const apiC of apiCandidates) {
      const stage = STAGE_MAP[apiC.currentStage?.toUpperCase()];
      if (!stage) continue;

      const candidate: Candidate = {
        id: apiC.id,
        name: `${apiC.firstName} ${apiC.lastName}`.trim(),
        sla: (stage === 'Hired' || stage === 'Offer') ? 'OK' : mapSlaColor(apiC.slaColor),
        days: apiC.daysInStage ?? 0,
        percent: apiC?.slaPercentage,
        ref: apiC.referral,
        jr: apiC.jobId ? `JR-${apiC.jobId}` : undefined,
        selected: false,
      };

      this.candidates[stage].push(candidate);
    }
  }

  getStageCount(stage: string): number {

    const key = stage?.toLowerCase();
    return this.stageCounts?.[key] ?? 0;
  }
  
  async loadJobs() {
    this.jobsLoading = true;
    try {
      const res = await this.jobsService.getJobsList();
      if (res?.responsecode == '00') {
        this.jobsList = res?.data;

        // Nothing selected yet on initial load — explicitly select every JR
        // and fetch candidates for all of them.
        if (this.selectedJrIds.length === 0 && this.jobsList.length > 0) {
          this.selectedJrIds = this.jobsList.map(j => j.jobId);
          this.onJrSelectionChange();
        }
      }


    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      this.jobsLoading = false;
    }
  }

  toggleJrDropdown(): void { this.showJrDropdown = !this.showJrDropdown; }
  closeJrDropdown(): void { this.showJrDropdown = false; }

  toggleJrSelection(jobId: any, event: Event): void {
    console.log(jobId,event);
    event.stopPropagation();

    // Use loose equality (==) to handle string vs number mismatch from API
    const alreadySelected = this.selectedJrIds.some((id: any) => id == jobId);
    if (alreadySelected) {
      this.selectedJrIds = this.selectedJrIds.filter((id: any) => id != jobId);
    } else {
      this.selectedJrIds = [...this.selectedJrIds, jobId];
    }

    // If that leaves nothing selected, fall back to "all selected" rather than
    // showing an empty board.
    if (this.selectedJrIds.length === 0) {
      this.selectedJrIds = this.jobsList.map(j => j.jobId);
    }

    // Keep dropdown open for multi-select; closes on outside click via HostListener
    this.onJrSelectionChange();
  }

  onJrSelectionChange(): void {
    this.fetchFilteredCandidates();
  }

  getSelectedJrLabel(): string {
    if (this.selectedJrIds.length === 0) return 'Select JR';
    if (this.jobsList.length > 0 && this.selectedJrIds.length === this.jobsList.length) return 'All JRs';
    if (this.selectedJrIds.length === 1) {
      const id = Array.from(this.selectedJrIds)[0];
      const job = this.jobsList.find(j => j.jobId === id);
      return `JR: ${job?.jobCode ?? id}`;
    }
    return `JR: ${this.selectedJrIds.length} selected`;
  }
  // getSelectedJrLabel(): string {
  //   if (this.selectedJrIds === null || this.selectedJrIds == undefined) return 'Select JR';

  //   const id = Number(this.selectedJrIds);
  //   const job = this.jobsList.find(j => j.jobId === id);
  //   return `JR: ${job?.jobCode ?? id}`;

  //   // return `JR: ${this.selectedJrIds} selected`;
  // }

  isJrSelected(jobId: string | number): boolean {
    return this.selectedJrIds.some((id: any) => id == jobId);
  }
  // isJrSelected(jobId: string | number): boolean { return this.selectedJrIds === jobId; }
  openFilterPanel(): void {
    this.tempApplicantType = this.filterApplicantType;
    this.tempDateType = this.filterDateType;
    this.tempSources = [...this.filterSources];
    this.tempSla = [...this.filterSla];
    this.tempStartDate = this.filterStartDate;
    this.tempEndDate = this.filterEndDate;
    this.activeFilterSection = 'Applicants';
    this.showFilterPanel = true;
  }

  closeFilterPanel(): void { this.showFilterPanel = false; }

  applyFilters(): void {
    this.filterApplicantType = this.tempApplicantType;
    this.filterDateType = this.tempDateType;
    this.filterSources = [...this.tempSources];
    this.filterSla = [...this.tempSla];
    this.filterStartDate = this.tempStartDate;
    this.filterEndDate = this.tempEndDate;
    this.showFilterPanel = false;
    this.fetchFilteredCandidates();
  }

  resetFilters(): void {
    this.tempApplicantType = 'all';
    this.tempDateType = 'this month';
    this.tempSources = ['Naukri', 'LinkedIn', 'Website', 'Agency / Rpo'];
    this.tempSla = [];
    this.tempStartDate = '';
    this.tempEndDate = '';
  }

  private buildFilterPayload(): object {
    const filters: Record<string, any> = {};

    filters['applicants'] = this.filterApplicantType;
    filters['jobIds'] = this.selectedJrIds;

    if (this.filterDateType) {
      if (this.filterDateType === 'custom') {
        filters['dateFilter'] = 'custom';
        if (this.filterStartDate) filters['startDate'] = this.filterStartDate;
        if (this.filterEndDate) filters['endDate'] = this.filterEndDate;
      } else {
        filters['dateFilter'] = this.filterDateType;
      }
    }


    const realSourceOptions = this.sourceOptions.filter(s => s !== 'All');
    const selectedSources = this.filterSources.filter(s => s !== 'All');
    const allSelected = realSourceOptions.every(s => selectedSources.includes(s));
    if (allSelected) {
      filters['sources'] = [];
    } else if (selectedSources.length > 0) {
      filters['sources'] = selectedSources.map(s => s.toLowerCase());
    }
    else {
      filters['sources'] = []
    }



    if (this.filterSla.length > 0) {
      filters['sla'] = this.filterSla;
    }
    else {
      filters['sla'] = []
    }

    return { filters };
  }

  toggleTempSource(src: string): void {
    const realSources = this.sourceOptions.filter(s => s !== 'All');
    if (src === 'All') {

      const allSelected = realSources.every(s => this.tempSources.includes(s));
      this.tempSources = allSelected ? [] : [...realSources];
    } else {
      if (this.tempSources.includes(src)) {
        this.tempSources = this.tempSources.filter(s => s !== src);
      } else {
        this.tempSources.push(src);
      }
    }
  }

  isTempSourceSelected(src: string): boolean {
    if (src === 'All') {
      const realSources = this.sourceOptions.filter(s => s !== 'All');
      return realSources.every(s => this.tempSources.includes(s));
    }
    return this.tempSources.includes(src);
  }

  toggleTempSla(val: SlaFilter): void {
    if (this.tempSla.includes(val)) {
      this.tempSla = this.tempSla.filter(s => s !== val);
    } else {
      this.tempSla.push(val);
    }
  }

  isTempSlaSelected(val: SlaFilter): boolean { return this.tempSla.includes(val); }

  get tempActiveChips(): FilterChip[] {
    const chips: FilterChip[] = [];

    if (this.tempApplicantType !== 'all') {
      chips.push({ label: this.capitalize(this.tempApplicantType), key: 'applicant' });
    }

    if (this.tempDateType) {
      const labels: Record<string, string> = {
        today: 'Today', thisweek: 'This week', thismonth: 'This month', custom: 'Custom',
      };
      chips.push({ label: labels[this.tempDateType] ?? this.tempDateType, key: 'date' });
    }

    const realSources = this.sourceOptions.filter(s => s !== 'All');
    const allSelected = realSources.every(s => this.tempSources.includes(s));
    if (!allSelected) {
      this.tempSources.filter(s => s !== 'All').forEach(s => chips.push({ label: s, key: `source_${s}` }));
    }

    this.tempSla.forEach(s => chips.push({ label: this.capitalize(s), key: `sla_${s}` }));

    return chips;
  }

  // Default filters that are always active (shown in chip panel so user knows)
  get tempDefaultChips(): { label: string; key: string }[] {
    const defaults: { label: string; key: string }[] = [];
    // "All" applicants is the baseline — no chip
    // "This month" date is the default — show it
    if (this.tempDateType === 'this month') {
      defaults.push({ label: 'This month', key: 'default_date' });
    }
    // All sources selected = default — show a summarised chip
    const real = this.sourceOptions.filter(s => s !== 'All');
    const allSel = real.every(s => this.tempSources.includes(s));
    if (allSel) {
      defaults.push({ label: 'All sources', key: 'default_sources' });
    }
    return defaults;
  }

  get tempAllChips(): { label: string; key: string }[] {
    return [...this.tempDefaultChips, ...this.tempActiveChips];
  }

  removeTempChip(key: string): void {
    if (key === 'applicant') {
      this.tempApplicantType = 'all';
    } else if (key === 'date') {
      this.tempDateType = 'this month';
      this.tempStartDate = '';
      this.tempEndDate = '';
    } else if (key.startsWith('source_')) {
      const src = key.replace('source_', '');
      this.tempSources = this.tempSources.filter(s => s !== src);
    } else if (key.startsWith('sla_')) {
      const val = key.replace('sla_', '') as SlaFilter;
      this.tempSla = this.tempSla.filter(s => s !== val);
    }
  }

  get appliedFilterCount(): number {
    let count = 0;
    if (this.filterApplicantType !== 'all') count++;
    if (this.filterDateType && this.filterDateType !== 'this month') count++;
    const realSources = this.sourceOptions.filter(s => s !== 'All');
    const allSelected = realSources.every(s => this.filterSources.includes(s));
    if (!allSelected) count += this.filterSources.filter(s => s !== 'All').length;
    count += this.filterSla.length;
    return count;
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }



  getSelected(): Candidate[] {
    if (!this.selectedStage) return [];
    return this.candidates[this.selectedStage].filter(c => c.selected);
  }

  getSelectedCount(): number { return this.getSelected().length; }

  getNextStages(): Stage[] {
    if (!this.selectedStage) return [];
    const index = this.stages.indexOf(this.selectedStage);
    return this.stages.slice(index + 1);
  }

  onMoveStageSelect(value: string): void {
    if (!value) return;
    this.pendingMoveStage = value as Stage;
    this.modalRef = this.modal.create({
      nzTitle: 'Move Stage',
      nzContent: this.moveConfirmModal,
      nzFooter: [
        { label: 'Cancel', onClick: () => this.cancelMove() },
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
    this.selectedStage = null;
    this.pendingMoveStage = null;
    this.modalRef?.destroy();
  }

  cancelMove(): void { this.modalRef?.destroy(); }

  rejectSelected(): void {
    this.modalRef = this.modal.create({
      nzTitle: 'Reject Candidates',
      nzContent: this.rejectConfirmModal,
      nzFooter: [
        { label: 'Cancel', onClick: () => this.cancelReject() },
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

  dismissNotification(i: number): void { this.notifications.splice(i, 1); }

  avatarPalette = ['#FEE2E2', '#DBEAFE', '#DCFCE7', '#FEF3C7', '#EDE9FE', '#FCE7F3', '#E0F2FE', '#F0FDF4'];
  avatarTextPalette = ['#DC2626', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DB2777', '#0284C7', '#15803D'];

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

  getStageColor(stage: Stage): string {
    if (stage === 'Hired' || stage === 'Offer') return '#22C55E';
    const map: Record<Stage, string> = {
      Shortlisted: '#D97706',
      Interview: '#7C3AED',
      Offer: '#0891B2',
      Hired: '#15803D',
      Rejected: '#DC2626',
    };
    return map[stage];
  }

  getStageHeaderBg(stage: Stage): string {
    const map: Record<Stage, string> = {
      Shortlisted: '#FFFBEB',
      Interview: '#F5F3FF',
      Offer: '#ECFEFF',
      Hired: '#F0FDF4',
      Rejected: '#FEF2F2',
    };
    return map[stage];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.jr-dropdown-wrap')) {
      this.showJrDropdown = false;
    }
  }

  getSlaAccent(val: string): string {
    const map: Record<string, string> = { green: '#22C55E', orange: '#F59E0B', red: '#EF4444' };
    return map[val] ?? '#94A3B8';
  }

  getStageDotColor(stage: Stage): string {
    if (this.candidates[stage].length === 0) return '';
    const breached = this.candidates[stage].some(c => c.sla === 'BREACHED');
    const warned = this.candidates[stage].some(c => c.sla === 'WARNING');
    if (breached) return '#EF4444';
    if (warned) return '#F59E0B';
    return '#22C55E';
  }

  // Returns how many options are active in each filter section tab (uses temp state, shown inside modal)
  getFilterSectionCount(sec: string): number {
    switch (sec) {
      case 'Applicants':
        return this.tempApplicantType !== 'all' ? 1 : 0;
      case 'Date Filters':
        return this.tempDateType && this.tempDateType !== 'this month' ? 1 : 0;
      case 'Source': {
        const real = this.sourceOptions.filter(s => s !== 'All');
        const allSel = real.every(s => this.tempSources.includes(s));
        return allSel ? 0 : this.tempSources.filter(s => s !== 'All').length;
      }
      case 'SLA':
        return this.tempSla.length;
      default:
        return 0;
    }
  }

  readonly maxVisibleJrChips = 3;

  get visibleJrChips(): any[] {
    return this.selectedJrIds.slice(0, this.maxVisibleJrChips);
  }

  get hiddenJrCount(): number {
    return Math.max(0, this.selectedJrIds.length - this.maxVisibleJrChips);
  }


  getJobById(jobId: any): any {
    return this.jobsList.find(j => j.jobId == jobId) ?? null;
  }


  removeJrChip(jobId: any, event: Event): void {
    event.stopPropagation();
    this.selectedJrIds = this.selectedJrIds.filter((id: any) => id != jobId);
    this.onJrSelectionChange();
  }
}