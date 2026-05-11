import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ApprovalLayoutComponent } from "../approval-layout/approval-layout.component";
import { CommonModule } from '@angular/common';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonTableActionsComponent } from '../../../../shared/components/common-table-actions/common-table-actions.component';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApprovalService } from '../../services/approval-service';
import { chainOptions, filterDropdowns, statusOptions } from '../../../../shared/constants/reusbale-filter';


const CHAIN_ICON_PALETTE = [
  { iconClass: 'fa-solid fa-share-nodes', iconBgColor: '#eef2ff', iconColor: '#6366f1' },
  { iconClass: 'fa-solid fa-code-branch', iconBgColor: '#ecfdf5', iconColor: '#22c55e' },
  { iconClass: 'fa-solid fa-sitemap', iconBgColor: '#fdf4ff', iconColor: '#a855f7' },
  { iconClass: 'fa-solid fa-diagram-project', iconBgColor: '#fff7ed', iconColor: '#f97316' },
  { iconClass: 'fa-solid fa-network-wired', iconBgColor: '#eff6ff', iconColor: '#3b82f6' },
];

@Component({
  selector: 'app-approval-chain-config',
  imports: [
    ApprovalLayoutComponent,
    CommonModule,
    ReusableTableComponent,
    CommonTableActionsComponent,
  ],
  templateUrl: './approval-chain-config.component.html',
  styleUrls: [
    './approval-chain-config.component.scss',
    '../approval-srs/approval-srs.component.scss',
  ],
})
export class ApprovalChainConfigComponent implements OnInit {

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private approvalService = inject(ApprovalService);

  cards: any[] = [];

  columns: any[] = [
    { key: 'chainName', label: 'Chain Name', width: 'auto', custom: true },
    { key: 'levels', label: 'Levels', width: '150px', custom: true },
    { key: 'lastUpdated', label: 'Last Updated', width: '150px', custom: true },
    { key: 'status', label: 'Status', width: '120px', custom: true, align: 'center' },
    { key: 'actions', label: 'Actions', width: '90px', custom: true, align: 'center' },
  ];
  activeTab = 'all';
  dropDownData = chainOptions;
  data: any[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;


  tabs: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'active', label: 'Active', count: 0 },
    { key: 'inactive', label: 'Inactive', count: 0 },


  ];
  private activeFilters: Partial<any> = { dateFilter: 'thisMonth' };


  ngOnInit(): void {
    this.loadData();
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


  private buildPayload(): object {
    const f: any = this.activeFilters || {};

    const filters: any = {};

    if (f.chainName?.trim()) {
      filters['chainName'] = f.chainName.trim();
    }

    if (this.activeTab!=='all') {
      filters['status'] = this.activeTab;
    }

    if (f.dateFilter) {
      filters['dateFilter'] = f.dateFilter;
    }

    if (f.dateFilter === 'CUSTOM') {
      if (f.fromDate) { filters['fromDate'] = f.fromDate; }
      if (f.toDate) { filters['toDate'] = f.toDate; }
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: 'createdAt',
      direction: 'desc',
      filters,
    };
  }


  private loadData(): void {

    this.cdr.markForCheck();

    forkJoin({
      count: this.approvalService.chainCount(),
      list: this.approvalService.approvalChainList(this.buildPayload()),
    }).subscribe({
      next: (res: any) => {


        const countData = res?.count?.data ?? {};
        this.cards = [
          {
            label: 'Total Chains',
            value: countData?.total ?? 0,
            iconClass: 'fa-solid fa-share-nodes',
            iconBgColor: '#eef2ff',
            iconColor: '#6366f1',
          },
          {
            label: 'Active Chains',
            value: countData?.active ?? 0,
            iconClass: 'fa-regular fa-circle-check',
            iconBgColor: '#ecfdf5',
            iconColor: '#22c55e',
          },
          {
            label: 'Deactive Chains',
            value: countData?.deactive ?? 0,
            iconClass: 'fa-solid fa-circle-pause',
            iconBgColor: '#fdf4ff',
            iconColor: '#a855f7',
          },
        ];

        const listPayload = res?.list?.data ?? {};
        const rawChains: any[] = listPayload?.approvalChains ?? [];

        this.totalItems = listPayload?.totalElements ?? 0;
        this.data = rawChains.map((chain: any, index: number) =>
          this.mapChain(chain, index)
        );

        this.tabs = this.tabs.map(t => ({
          ...t,
          count:
            t.key === 'all' ? (listPayload?.counts?.total ?? 0) :
              t.key === 'active' ? (listPayload?.counts?.active ?? 0) :
                t.key === 'inactive' ? (listPayload?.counts?.deactive ?? 0) :
                  t.count
        }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load approval chains:', err);

        this.cdr.markForCheck();
      },
    });
  }

  private async loadList(): Promise<void> {


    this.cdr.markForCheck();

    try {

      const res: any = await this.approvalService
        .approvalChainList(this.buildPayload());

      const listPayload = res?.data ?? {};

      this.totalItems = listPayload?.totalElements ?? 0;

      this.data = (listPayload?.approvalChains ?? []).map(
        (chain: any, index: number) =>
          this.mapChain(chain, index)
      );

      this.tabs = this.tabs.map(t => ({
        ...t,
        count:
          t.key === 'all' ? (listPayload?.counts?.total ?? 0) :
            t.key === 'active' ? (listPayload?.counts?.active ?? 0) :
              t.key === 'inactive' ? (listPayload?.counts?.deactive ?? 0) :
                t.count
      }));

    } catch (err) {

      console.error(err);

    } finally {

      this.cdr.markForCheck();
    }
  }
  private mapChain(chain: any, index: number): any {
    const palette = CHAIN_ICON_PALETTE[index % CHAIN_ICON_PALETTE.length];
    const displayDate = chain.updatedAt ?? chain.createdAt ?? '—';
    const displayBy = chain.updatedBy ?? chain.createdBy ?? '—';
    const statusLabel = chain.status?.toUpperCase() === 'ACTIVE' ? 'Active' : 'Deactivated';

    return {
      id: chain.id,
      levelConfig: chain.levelConfig ?? [],

      chainName: chain.chainName,
      description: chain.description ?? '',
      levels: chain.levels,
      lastUpdated: displayDate,
      updatedBy: displayBy,
      status: statusLabel,

      iconClass: palette.iconClass,
      iconBgColor: palette.iconBgColor,
      iconColor: palette.iconColor,
    };
  }

  setTab(key: any): void {
    this.activeTab = key;
    this.currentPage = 1;
    this.loadList();
  }

  onView(row: any): void {
    this.router.navigateByUrl('/approval/chain-config/new-chain/view', {
      state: { chainId: row.id, type: 'view', url: '/approval/chain-config' },
    });
  }

  onEdit(row: any): void {
    this.router.navigateByUrl('/approval/chain-config/new-chain/edit', {
      state: { chainId: row.id, type: 'edit', url: '/approval/chain-config' },
    });
  }

  onCreate(): void {
    this.router.navigateByUrl('/approval/chain-config/new-chain/create', {
      state: { type: 'create', url: '/approval/chain-config' },
    });
  }
}