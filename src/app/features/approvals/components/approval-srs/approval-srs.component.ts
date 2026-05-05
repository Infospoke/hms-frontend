import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonModule } from '@angular/common';
import { CommonFilterComponent } from "../../../../shared/components/common-filter/common-filter.component";
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonTableActionsComponent } from "../../../../shared/components/common-table-actions/common-table-actions.component";
import { Router } from '@angular/router';
import { ApprovalLayoutComponent } from "../approval-layout/approval-layout.component";

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
      value: 12,
      iconClass: 'fa-regular fa-file-lines',
      iconBgColor: '#eef2ff',
      iconColor: '#6366f1',
    },
    {
      label: 'In Progress',
      value: 5,
      iconClass: 'fa-regular fa-circle-dot',
      iconBgColor: '#fffbeb',
      iconColor: '#f59e0b',
    },
    {
      label: 'Approved',
      value: 4,
      iconClass: 'fa-solid fa-circle-check',
      iconBgColor: '#f0fdf4',
      iconColor: '#22c55e',
    },
    {
      label: 'Rejected',
      value: 2,
      iconClass: 'fa-solid fa-circle-xmark',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
    },
  ];
  dropDownData = [{
    key: 'status',
    label: 'Status',
    selected: 'all',
    options: [
      { label: 'All', value: 'all' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
    ]
  },
  {
    key: 'dateRange',
    label: 'Date Range',
    selected: 'all',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'Last Week', value: 'last week' },
      { label: 'Last Month', value: 'last month' },
      { label: 'Custom', value: 'custom' }
    ]
  }]
  private router=inject(Router);
  columns: any[] = [
    { key: 'srId', label: 'SR ID', width: '148px' ,custom: true,},
    { key: 'jobTitle', label: 'Job Title', width: 'auto' },
    { key: 'department', label: 'Department', width: '120px', hideOnMobile: true },
    { key: 'currentStage', label: 'Current Stage', width: '190px', custom: true },
    { key: 'overallStatus', label: 'Overall Status', width: '130px', custom: true, align: 'center' },
    { key: 'createdOn', label: 'Created On', width: '110px', hideOnMobile: true },
    { key: 'actions', label: 'Action', width: '90px', align: 'center', custom: true },
  ];
  data:any[]=[]
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  private cdr = inject(ChangeDetectorRef);
  private mockData: any[] = [
    { srId: 'SR-2026-ENG-0042', jobTitle: 'Senior Backend Engineer', department: 'Engineering', currentStage: 'HRBP (Pending)', stagePerson: 'Priya Sharma', overallStatus: 'In Progress', createdOn: '10 Apr 2026' },
    { srId: 'SR-2026-FIN-0031', jobTitle: 'QA Engineer', department: 'Quality', currentStage: 'Finance (Pending)', stagePerson: 'Neel Malhotra', overallStatus: 'In Progress', createdOn: '05 Apr 2026' },
    { srId: 'SR-2026-DA-0025', jobTitle: 'Data Analyst', department: 'Analytics', currentStage: 'Dept Head (Pending)', stagePerson: 'Neha Verma', overallStatus: 'In Progress', createdOn: '04 Apr 2026' },
    { srId: 'SR-2026-HR-0018', jobTitle: 'HRBP Manager', department: 'HR', currentStage: 'Completed', stagePerson: 'All stages approved', overallStatus: 'Approved', createdOn: '20 Mar 2026' },
    { srId: 'SR-2026-MKT-0016', jobTitle: 'Marketing Specialist', department: 'Marketing', currentStage: 'Rejected at Finance', stagePerson: 'Arun Gupta', overallStatus: 'Rejected', createdOn: '18 Mar 2026' },
    { srId: 'SR-2026-SLS-0009', jobTitle: 'Sales Executive', department: 'Sales', currentStage: 'Returned by HRBP', stagePerson: '', overallStatus: 'In Progress', createdOn: '16 Mar 2026' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.cdr.markForCheck();
    this.data=this.mockData;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  onStatusChange(event: Event): void {
    // this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onDateChange(event: Event): void {
    // this.selectedDateRange = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.mockData];

    // if (this.searchTerm) {
    //   filtered = filtered.filter(r =>
    //     r.srId.toLowerCase().includes(this.searchTerm) ||
    //     r.jobTitle.toLowerCase().includes(this.searchTerm)
    //   );
    // }

    

    this.data = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  onView(row: any): void {
    this.router.navigateByUrl('/approval-srs/view', { state: { srId: row.srId, type: 'view' } });
  }

  onEdit(row: any): void {
    this.router.navigateByUrl('/approval-srs/edit', { state: { srId: row.srId, type: 'edit' } });
  }
}
