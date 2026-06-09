import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonTableActionsComponent } from '../../../../shared/components/common-table-actions/common-table-actions.component';
import { ApprovalLayoutComponent } from '../approval-layout/approval-layout.component';
import { chainOptions } from '../../../../shared/constants/reusbale-filter';
import { ApprovalService } from '../../services/approval-service';
import { AuthService } from '../../../../core/auth/auth.service';

const TAB_APPROVAL_MAP: Record<string, string> = {
  in_progress: 'in progress',
  approved: 'Completed',
  rejected: 'Rejected',
  pending:'Pending',
  all: '',
};

@Component({
  selector: 'app-approval-srs',
  imports: [CommonModule, ReusableTableComponent, CommonTableActionsComponent, ApprovalLayoutComponent],
  templateUrl: './approval-srs.component.html',
  styleUrl: './approval-srs.component.scss',
})
export class ApprovalSrsComponent {

  // ── Summary cards ─────────────────────────────────────────────────────────────
  // cards = [
  //   { label: 'Total', value: 0, iconClass: 'fa-regular fa-file-lines', iconBgColor: '#eef2ff', iconColor: '#6366f1' },
  //   { label: 'Pending', value: 0, iconClass: 'fa-regular fa-circle-dot', iconBgColor: '#fffbeb', iconColor: '#f59e0b' },
  //   { label: 'Completed', value: 0, iconClass: 'fa-solid fa-circle-check', iconBgColor: '#f0fdf4', iconColor: '#22c55e' },
  //   { label: 'Rejected', value: 0, iconClass: 'fa-solid fa-circle-xmark', iconBgColor: '#fef2f2', iconColor: '#ef4444' },
  // ];

  dropDownData = chainOptions;

 
  // tabs: { key: string; label: string; count: number }[] = [
  //   { key: 'all', label: 'All', count: 0 },
  //   { key: 'pending', label: 'Pending', count: 0 },
  //   { key: 'approved', label: 'Completed', count: 0 },
  //   { key: 'rejected', label: 'Rejected', count: 0 },

  // ];

  // activeTab = 'all';
  currentUserRole: string | null = null;

  constructor() {
    // Resolve the logged-in user's role immediately at construction so the
    // edit-permission expression in the template has a value before the first
    // data load completes.
    this.currentUserRole = inject(AuthService).getRole();
  }
  // ── Table columns ─────────────────────────────────────────────────────────────
  columns: any[] = [
    { key: 'srId', label: 'SR ID', width: '148px', custom: true },
    { key: 'jobTitle', label: 'Job Title', width: '120px', custom: true },
    { key: 'department', label: 'Department', width: '120px', custom: true, hideOnMobile: true },
    { key: 'currentStage', label: 'Current Stage', width: '150px', custom: true },
    { key: 'overallStatus', label: 'Overall Status', width: '130px', custom: true, align: 'center' },
    { key: 'submittedOn', label: 'Submitted On', width: '110px', custom: true, hideOnMobile: true },
    { key: 'actions', label: 'Action', width: '90px', custom: true, align: 'center' },
  ];

  data: any[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;

  private activeFilters: Partial<any> = { dateFilter: 'thisMonth' };
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private approvalService = inject(ApprovalService);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadList()]);
  }


  truncate(value: string, limit = 10): string {
    if (!value || value === '—') return value;
    return value.length > limit ? value.slice(0, limit) + '..' : value;
  }


  getStatusClass(status: string): string {
    if (!status || status === '—') return '';
    const normalized = status.trim().toLowerCase().replace(/\s+/g, '-');
    const map: Record<string, string> = {
      'pending': 'pending',
      'in-progress': 'in-progress',
      'approved': 'approved',
      'completed': 'approved',
      'rejected': 'rejected',
    };
    return map[normalized] ?? normalized;
  }

  // ── Data loading ──────────────────────────────────────────────────────────────
  // private async loadCounts(): Promise<void> {
  //   try {
  //     const res: any = await this.approvalService.getSrCount();
  //     const d = res?.data ?? {};
  //     this.cards[0].value = d.totalSrs ?? d.all ?? 0;
  //     this.cards[1].value = d.inProgress ?? d.in_progress ?? 0;
  //     this.cards[2].value = d.approved ?? 0;
  //     this.cards[3].value = d.rejected ?? 0;
  //     this.cdr.markForCheck();
  //   } catch (err) {
  //     console.error('[srCount]', err);
  //   }
  // }

  private async loadList(): Promise<void> {
    this.cdr.markForCheck();
    try {
      const res: any = await this.approvalService.getSRList(this.buildPayload());
      const d = res?.data ?? {};

      this.data = (d.content ?? []).map((item: any) => ({
        srId: item.srId ?? '—',
        jobTitle: item.jobTitle ?? '—',
        department: item.Department ?? '—',
        currentStage: item.CurrentStage ?? '—',
       
        currentRole: item.CurrentStage ?? '—',
        stagePerson: item.stagePerson ?? null,
        overallStatus: item.overAllStatus ?? '—',
        submittedOn: item.submittedOn ?? '—',
      }));

      this.totalItems = d.totalItems ?? d.content?.length ?? 0;

      const counts = d.counts ?? {};
      // this.tabs = this.tabs.map(t => ({
      //   ...t,
      //   count:
      //     t.key === 'all' ? (counts.all ?? 0) :
      //     t.key=== 'pending' ? (counts.pending ?? 0) :
      //         t.key === 'approved' ? (counts.approved ?? 0) :
      //           t.key === 'rejected' ? (counts.rejected ?? 0) :
      //             t.count,
      // }));
    } catch (err) {
      console.error('[approvalSrList]', err);
      this.data = [];
      this.totalItems = 0;
    } finally {
      this.cdr.markForCheck();
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();
  }

  filtersResponse(event: any): void {
    this.activeFilters = event;
    this.currentPage = 1;
    this.loadList();
  }

  setTab(key: string): void {
    // this.activeTab = key;
    this.currentPage = 1;
    this.loadList();
  }

  onView(row: any): void {
    this.router.navigateByUrl(`/approval/view-sr/${row.srId}`, {
      state: { srId: row.srId, url: '/approval/sr-list' ,type:'view'},
    });
  }

  onEdit(row: any): void {
    this.router.navigateByUrl(`/approval/view-sr/${row.srId}`, {
      state: { srId: row.srId, url: '/approval/sr-list',type:'approve' },
    });
  }

  // ── Payload builder ───────────────────────────────────────────────────────────
  private buildPayload(): object {
    const f: any = this.activeFilters || {};
    // const filters: any = { status: TAB_APPROVAL_MAP[this.activeTab] ?? '' };
    const filters: any = { status: '' };
    if (f.chainName?.trim()) filters['search'] = f.chainName.trim();
    if (f.dateFilter) filters['dateFilter'] = f.dateFilter;
    if (f.dateFilter === 'CUSTOM') {
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: 'createdOn',
      direction: 'desc',
      filters,
    };
  }
}