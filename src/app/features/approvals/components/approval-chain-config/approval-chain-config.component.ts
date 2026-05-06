import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ApprovalLayoutComponent } from "../approval-layout/approval-layout.component";
import { CommonModule } from '@angular/common';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';

@Component({
  selector: 'app-approval-chain-config',
  imports: [ApprovalLayoutComponent, CommonModule, ReusableTableComponent],
  templateUrl: './approval-chain-config.component.html',
  styleUrls: ['./approval-chain-config.component.scss','../approval-srs/approval-srs.component.scss'],
})
export class ApprovalChainConfigComponent {

  dropDownData = [
    {
      key: 'status',
      label: 'Status',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Deactivated', value: 'deactivated' },
      ]
    },
    {
      key: 'levels',
      label: 'Levels',
      selected: 'all',
      options: [
        { label: 'All', value: 'all' },
        { label: '2 Levels', value: '2' },
        { label: '3 Levels', value: '3' },
        { label: '4 Levels', value: '4' },
      ]
    }
  ];

  cards = [
    {
      label: 'Total Chains',
      value: 13,
      iconClass: 'fa-solid fa-sitemap',
      iconBgColor: '#eef2ff',
      iconColor: '#6366f1',
    },
    {
      label: 'Active Chains',
      value: 10,
      iconClass: 'fa-solid fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#22c55e',
    },
    {
      label: 'Inactive Chains',
      value: 3,
      iconClass: 'fa-solid fa-circle-pause',
      iconBgColor: '#f5f3ff',
      iconColor: '#8b5cf6',
    }
  ];

  columns: any[] = [
    { key: 'chainName',    label: 'Chain Name',    width: 'auto',   custom: true },
    { key: 'levels',       label: 'Levels',         width: '140px',  custom: true },
    { key: 'lastUpdated',  label: 'Last Updated',   width: '150px',  custom: true },
    { key: 'status',       label: 'Status',         width: '120px',  custom: true, align: 'center' },
    { key: 'actions',      label: 'Actions',        width: '90px',   custom: true, align: 'center' },
  ];

  private mockData: any[] = [
    {
      chainName: 'Engineering Hiring Flow',
      description: 'Standard hiring approval for Engineering',
      iconClass: 'fa-solid fa-user-gear',
      iconBgColor: '#eff6ff',
      iconColor: '#3b82f6',
      levels: [1, 2, 3, 4],
      lastUpdated: '10 Apr 2026',
      updatedBy: 'Admin',
      status: 'Active',
    },
    {
      chainName: 'IT Hiring Flow',
      description: 'Approval chain for IT department',
      iconClass: 'fa-solid fa-laptop-code',
      iconBgColor: '#f5f3ff',
      iconColor: '#7c3aed',
      levels: [1, 2, 3],
      lastUpdated: '08 Apr 2026',
      updatedBy: 'Admin',
      status: 'Active',
    },
    {
      chainName: 'Leave Approval Flow',
      description: 'Employee leave request approvals',
      iconClass: 'fa-solid fa-calendar-check',
      iconBgColor: '#f0fdf4',
      iconColor: '#16a34a',
      levels: [1, 2],
      lastUpdated: '05 Apr 2026',
      updatedBy: 'Admin',
      status: 'Active',
    },
    {
      chainName: 'Expense Approval Flow',
      description: 'Employee expense claim approvals',
      iconClass: 'fa-solid fa-receipt',
      iconBgColor: '#fff7ed',
      iconColor: '#ea580c',
      levels: [1, 2, 3],
      lastUpdated: '02 Apr 2026',
      updatedBy: 'Admin',
      status: 'Active',
    },
    {
      chainName: 'Loan Approval Flow',
      description: 'Loan request approval process',
      iconClass: 'fa-solid fa-hand-holding-dollar',
      iconBgColor: '#f0fdfa',
      iconColor: '#0d9488',
      levels: [1, 2, 3, 4],
      lastUpdated: '28 Mar 2026',
      updatedBy: 'Admin',
      status: 'Active',
    },
    {
      chainName: 'Promotion Approval Flow',
      description: 'Employee promotion approvals',
      iconClass: 'fa-solid fa-arrow-trend-up',
      iconBgColor: '#eff6ff',
      iconColor: '#2563eb',
      levels: [1, 2, 3],
      lastUpdated: '22 Mar 2026',
      updatedBy: 'Admin',
      status: 'Deactivated',
    },
    {
      chainName: 'Transfer Approval Flow',
      description: 'Employee transfer request approvals',
      iconClass: 'fa-solid fa-arrows-left-right',
      iconBgColor: '#fff7ed',
      iconColor: '#f59e0b',
      levels: [1, 2],
      lastUpdated: '18 Mar 2026',
      updatedBy: 'Admin',
      status: 'Deactivated',
    },
  ];

  data: any[] = [];
  totalItems = 13;
  currentPage = 1;
  pageSize = 10;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.cdr.markForCheck();
    this.data = this.mockData;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }
}