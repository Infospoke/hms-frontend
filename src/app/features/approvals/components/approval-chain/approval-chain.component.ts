import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../approval-layout/approval-layout.component';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonTableActionsComponent } from '../../../../shared/components/common-table-actions/common-table-actions.component';
import { ApprovalService } from '../../services/approval-service';
import { chainOptions, statusOptions } from '../../../../shared/constants/reusbale-filter';

type TabKey = 'all' | 'in_progress' | 'approved' | 'rejected';


const TAB_APPROVAL_MAP: Record<TabKey, string> = {
  in_progress: 'in_progress',
  approved: 'Approved',
  rejected: 'Rejected',
  all: ''
};


const ICON_PALETTE = [
  { iconClass: 'fa-solid fa-link', iconBgColor: '#eff6ff', iconColor: '#3b82f6' },
  { iconClass: 'fa-solid fa-layer-group', iconBgColor: '#f5f3ff', iconColor: '#7c3aed' },
  { iconClass: 'fa-solid fa-sitemap', iconBgColor: '#ecfdf5', iconColor: '#059669' },
  { iconClass: 'fa-solid fa-code-branch', iconBgColor: '#fff7ed', iconColor: '#ea580c' },
  { iconClass: 'fa-solid fa-diagram-project', iconBgColor: '#fdf4ff', iconColor: '#a855f7' },
];

@Component({
  selector: 'app-approval-chain',
  imports: [
    ApprovalLayoutComponent,
    CommonModule,
    ReusableTableComponent,
    CommonTableActionsComponent,
  ],
  templateUrl: './approval-chain.component.html',
  styleUrl: './approval-chain.component.scss',
})
export class ApprovalChainComponent implements OnInit {

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private approvalService = inject(ApprovalService);


  activeTab: TabKey = 'all';

  tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'in_progress', label: 'In Progress', count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 },

  ];

  dropDownData = chainOptions;
  cards = [
    {
      label: 'Total',
      subLabel: 'All  chains',
      value: 0,
      iconClass: 'fa-solid fa-user-check',
      iconBgColor: '#eaf2ff',
      iconColor: '#3b82f6',
    },
    {
      label: 'Approved',
      subLabel: 'Approved chains',
      value: 0,
      iconClass: 'fa-regular fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#22c55e',
    },
    {
      label: 'In Progress',
      subLabel: 'Awaiting your approval',
      value: 0,
      iconClass: 'fa-regular fa-clock',
      iconBgColor: '#fff7ed',
      iconColor: '#f59e0b',
    },
    {
      label: 'Rejected',
      subLabel: 'Rejected chains',
      value: 0,
      iconClass: 'fa-regular fa-circle-xmark',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
    },
  ];



  columns: any[] = [
    { key: 'chainName', label: 'Chain Name', width: '200px', custom: true },
    { key: 'description', label: 'Description', width: 'auto', custom: true },
    { key: 'functionalityName', label: 'Functionality Name', width: 'auto', },
    { key: 'levels', label: 'Levels', width: '90px', custom: true, align: 'center' },
    { key: 'createdOn', label: 'Created On', width: '150px', custom: true },
    { key: 'status', label: 'Status', width: '150px', custom: true, align: 'center' },
    { key: 'actions', label: 'Action', width: '90px', custom: true, align: 'center' },
  ];


  filteredData: any[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  loading = false;


  private activeFilters: Partial<any> = { dateFilter: 'thisMonth' };

  get rangeStart(): number { return (this.currentPage - 1) * this.pageSize + 1; }
  get rangeEnd(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }


  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadCounts(), this.loadList()]);
  }

  setTab(key: any): void {
    console.log('Selected tab:', key);
    this.activeTab = key;
    this.currentPage = 1;
    this.loadList();
  }


  private async loadCounts(): Promise<void> {
    try {
      const res: any = await this.approvalService.chainCount();
      const d = res?.data ?? {};

      this.cards[0].value = d.total ?? 0;
      this.cards[1].value = d.approved ?? 0;
      this.cards[2].value = d.pending ?? 0;
      this.cards[3].value = d.rejected ?? 0;


      this.cdr.markForCheck();
    } catch (err) {
      console.error('[chainCount]', err);
    }
  }


  private async loadList(): Promise<void> {
    this.loading = true;
    this.cdr.markForCheck();

    try {
      const payload = this.buildPayload();
      const res: any = await this.approvalService.approvalChainList(payload);
      const d = res?.data ?? {};

      this.totalItems = d.totalElements ?? 0;
      this.filteredData = (d.approvalChains ?? []).map((c: any, i: number) =>
        this.mapChain(c, i)
      );

      this.tabs = this.tabs.map(t => ({
        ...t,
        count:
          t.key === 'all' ? (d?.counts?.total ?? 0) :
            t.key === 'in_progress' ? (d?.counts?.inProgress ?? 0) :
              t.key === 'approved' ? (d?.counts?.approved ?? 0) :
                t.key === 'rejected' ? (d?.counts?.rejected ?? 0) :
                  t.count
      }));
    } catch (err) {
      console.error('[approvalChainList]', err);
      this.filteredData = [];
      this.totalItems = 0;
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }


  private buildPayload(): object {

    const f: any = this.activeFilters || {};
    console.log(this.activeTab)
    const filters: any = {
      approval: TAB_APPROVAL_MAP[this.activeTab],
    };

    // direct filters
    if (f.chainName?.trim()) {
      filters['chainName'] = f.chainName.trim();
    }

    if (f.status) {
      filters['status'] = f.status;
    }

    if (f.approval) {
      filters['approval'] = f.approval;
    }

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
      sortBy: 'createdAt',
      direction: 'desc',
      filters,
    };
  }


  private mapChain(c: any, index: number): any {
    const icon = ICON_PALETTE[index % ICON_PALETTE.length];

    const createdDate = c.createdAt
      ? new Date(c.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
      : '—';

    const updatedDate = c.updatedAt
      ? new Date(c.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
      : null;

    return {
      id: c.id,
      chainName: c.chainName ?? '—',
      description: c.description ?? '—',
      levels: c.levels ?? 0,
      createdOnDate: createdDate,
      createdOnTime: updatedDate ? `Updated ${updatedDate}` : `By ${c.createdBy ?? '—'}`,
      status: c.approval ?? c.status ?? '—',
      chainStatus: c.status ?? '—',
      levelConfig: c.levelConfig ?? [],
      functionality: c.functionality,
      functionalityName:c.functionalityName ?? '—',
      ...icon,
    };
  }


  filtersResponse(event: any): void {
    this.activeFilters = event;

    this.currentPage = 1;
    this.loadList();
  }


  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();
  }

  onView(row: any): void {
    this.router.navigateByUrl('/approval/chains/view', {
      state: { type: 'view', chainId: row?.id, url: "/approval/chains" },
    });
  }

  onEdit(row: any): void {
    this.router.navigateByUrl('/approval/chains/approve', {
      state: { type: 'approve', chainId: row?.id, url: "/approval/chains" },
    });
  }

  truncate(value: string, limit = 10): string {
    if (!value || value === '—') return value;
    return value.length > limit ? value.slice(0, limit) + '..' : value;
  }
}