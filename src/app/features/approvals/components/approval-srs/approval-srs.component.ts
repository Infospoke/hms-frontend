import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonModule } from '@angular/common';
import { CommonFilterComponent } from "../../../../shared/components/common-filter/common-filter.component";
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonTableActionsComponent } from "../../../../shared/components/common-table-actions/common-table-actions.component";
import { Router } from '@angular/router';
import { ApprovalLayoutComponent } from "../approval-layout/approval-layout.component";
import { chainOptions, statusOptions } from '../../../../shared/constants/reusbale-filter';
import { ApprovalService } from '../../services/approval-service';

const TAB_APPROVAL_MAP: Record<any, string> = {
  pending: 'in_progress',
  approved: 'Approved',
  rejected: 'Rejected',
  all: ''
};

@Component({
  selector: 'app-approval-srs',
  imports: [CommonModule, ReusableTableComponent, CommonTableActionsComponent, ApprovalLayoutComponent],
  templateUrl: './approval-srs.component.html',
  styleUrl: './approval-srs.component.scss',
})
export class ApprovalSrsComponent {
  cards = [
    {
      label: 'Total SRs',
      value: 0,
      iconClass: 'fa-regular fa-file-lines',
      iconBgColor: '#eef2ff',
      iconColor: '#6366f1',
    },
    {
      label: 'In Progress',
      value: 0,
      iconClass: 'fa-regular fa-circle-dot',
      iconBgColor: '#fffbeb',
      iconColor: '#f59e0b',
    },
    {
      label: 'Approved',
      value: 0,
      iconClass: 'fa-solid fa-circle-check',
      iconBgColor: '#f0fdf4',
      iconColor: '#22c55e',
    },
    {
      label: 'Rejected',
      value: 0,
      iconClass: 'fa-solid fa-circle-xmark',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
    },
  ];
  dropDownData = chainOptions;

  tabs: any[] = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'in_progress', label: 'In progress', count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 },

  ];
  private router = inject(Router);
  columns: any[] = [
    { key: 'srId', label: 'SR ID', width: '148px', custom: true, },
    { key: 'jobTitle', label: 'Job Title', width: 'auto' },
    { key: 'department', label: 'Department', width: '120px', hideOnMobile: true },
    { key: 'currentStage', label: 'Current Stage', width: '190px', custom: true },
    { key: 'overallStatus', label: 'Overall Status', width: '130px', custom: true, align: 'center' },
    { key: 'createdOn', label: 'Created On', width: '110px', hideOnMobile: true , custom: true,},
    { key: 'actions', label: 'Action', width: '90px', align: 'center', custom: true },
  ];
  data: any[] = []
  private activeFilters: Partial<any> = { dateFilter: 'thisMonth' };
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  private cdr = inject(ChangeDetectorRef);
  private approvalService = inject(ApprovalService);

  activeTab = 'all'
  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadCounts(), this.loadList()]);
  }
  private async loadCounts(): Promise<void> {
    try {
      const res: any = await this.approvalService.getSrCount();
      const d = res?.data ?? {};

      this.cards[0].value = d.totalSrs    ?? d.all        ?? 0;
      this.cards[1].value = d.inProgress  ?? d.in_progress ?? 0;
      this.cards[2].value = d.approved    ?? 0;
      this.cards[3].value = d.rejected    ?? 0;


      this.cdr.markForCheck();
    } catch (err) {
      console.error('[chainCount]', err);
    }
  }
  private async loadList(): Promise<void> {
    this.cdr.markForCheck();

    try {
      const payload = this.buildPayload();
      const res: any = await this.approvalService.getSRList(payload);
      const d = res?.data ?? {};
      this.data = (d.content ?? []).map((item: any) => ({
        srId:          item.srId          ?? '—',
        jobTitle:      item.jobTitle       ?? '—',
        department:    item.Department     ?? '—',
        currentStage:  item.CurrentStage   ?? '—',
        stagePerson:   item.stagePerson    ?? null,
        overallStatus: item.overAllStatus  ?? '—',
        createdOn:     item.createdOn      ?? '—',
      }));

      this.totalItems = d.totalElements ?? d.content?.length ?? 0;

     
      const counts = d.counts ?? {};
      this.tabs = this.tabs.map(t => ({
        ...t,
        count:
          t.key === 'all'         ? (counts.all        ?? 0) :
          t.key === 'in_progress' ? (counts.inProgress ?? 0) :
          t.key === 'approved'    ? (counts.approved   ?? 0) :
          t.key === 'rejected'    ? (counts.rejected   ?? 0) :
          t.count
      }));

    } catch (err) {
      console.error('[approvalSrList]', err);
      this.data       = [];
      this.totalItems = 0;
    } finally {
      this.cdr.markForCheck();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();
  }





  filtersResponse(event: any): void {
    this.activeFilters = event;

    this.currentPage = 1;
    this.loadList();
  }

  setTab(key: any): void {
    this.activeTab = key;
    this.currentPage = 1;
    this.loadList();
  }
  onView(row: any): void {
    this.router.navigateByUrl(`/approval/view-sr/${row.srId}`, {
      state: { srId: row.srId, url: '/approval/sr-list' }
    });
  }

  onEdit(row: any): void {
    this.router.navigateByUrl(`/approval/view-sr/${row.srId}`, {
      state: { srId: row.srId, url: '/approval/sr-list' }
    });
  }

  private buildPayload(): object {

    const f: any = this.activeFilters || {};
    console.log(this.activeTab)
    const filters: any = {
      approval: TAB_APPROVAL_MAP[this.activeTab],
    };

    // direct filters
    if (f.chainName?.trim()) {
      filters['search'] = f.chainName.trim();
    }

    if (f.approval && f.approval!=="") {
      filters['status'] = f.approval;
    }

    // if (f.approval) {
    //   filters['approval'] = f.approval;
    // }

    if (f.dateFilter) {
      filters['dateFilter'] = f.dateFilter;
    }

    if (f.dateFilter === 'CUSTOM') {

      if (f.fromDate) {
        filters['fromDate'] = f.fromDate;
      }

      if (f.toDate) {
        filters['toDate'] = f.toDate;
      }
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