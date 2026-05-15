import { ChangeDetectorRef, Component } from '@angular/core';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { statusOptions } from '../../../../shared/constants/reusbale-filter';
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-jobs',
  imports: [ApprovalLayoutComponent, ReusableTableComponent,CommonModule],
  templateUrl: './all-jobs.component.html',
  styleUrl: './all-jobs.component.scss',
})
export class AllJobsComponent {

  cards = [
    {
      label: 'Total Jobs',
      subLabel: 'All time',
      value: 28,
      percentage: '',
      description: '',
      iconClass: 'fa-solid fa-briefcase',
      iconBgColor: '#eaf2ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Total Assignees',
      subLabel: 'Across all jobs',
      value: 52,
      percentage: '',
      description: '',
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#f3e8ff',
      iconColor: '#9333ea',
    },
    {
      label: 'Accepted',
      subLabel: 'Assignee ',
      value: 23,
      percentage: '44.2%',
      description: '',
      iconClass: 'fa-regular fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#22c55e',
    },
    {
      label: 'Declined',
      subLabel: 'Assignee',
      value: 14,
      percentage: '26.9%',
      description: '',
      iconClass: 'fa-regular fa-circle-xmark',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
    },
    {
      label: 'Pending Response',
      subLabel: 'Assignee',
      value: 15,
      percentage: '28.8%',
      description: '',
      iconClass: 'fa-regular fa-clock',
      iconBgColor: '#fff7ed',
      iconColor: '#f59e0b',
    },
  ];
  dropDownData = statusOptions;

  ableColumns: any[] = [
    { key: 'jobDetails', label: 'Job Details', custom: true, width: '220px' },
    { key: 'department', label: 'Department', width: '140px' },
    { key: 'targetStartDate', label: 'Target Start Date', width: '150px' },
    { key: 'assignees', label: 'Assignees', custom: true, width: '120px', align: 'center' },
    { key: 'accepted', label: 'Accepted', custom: true, width: '100px', align: 'center' },
    { key: 'pending', label: 'Pending', custom: true, width: '100px', align: 'center' },
    { key: 'declined', label: 'Declined', custom: true, width: '100px', align: 'center' },
    { key: 'action', label: 'Action', custom: true, width: '120px', align: 'center' },
  ];

  private allJobs: any[] = [
    { id: '1', title: 'Software Developer - Backend', code: 'ENG-BE-0062', icon: 'code', iconBg: '#e8f0fe', iconColor: '#1a73e8', department: 'Engineering', targetStartDate: '01 Jun 2026', assignees: 5, accepted: 3, pending: 1, declined: 1 },
    { id: '2', title: 'Frontend Developer', code: 'ENG-FE-0041', icon: 'web', iconBg: '#e8f0fe', iconColor: '#1a73e8', department: 'Engineering', targetStartDate: '10 Jun 2026', assignees: 3, accepted: 1, pending: 1, declined: 1 },
    { id: '3', title: 'QA Engineer', code: 'QA-0015', icon: 'bug_report', iconBg: '#fce8e6', iconColor: '#ea4335', department: 'Quality Assurance', targetStartDate: '15 Jun 2026', assignees: 2, accepted: 2, pending: 0, declined: 0 },
    { id: '4', title: 'DevOps Engineer', code: 'ENG-DV-0033', icon: 'cloud', iconBg: '#e6f4ea', iconColor: '#34a853', department: 'Engineering', targetStartDate: '20 Jun 2026', assignees: 2, accepted: 1, pending: 1, declined: 0 },
    { id: '5', title: 'Data Analyst', code: 'DS-0027', icon: 'bar_chart', iconBg: '#f3e8fd', iconColor: '#9c27b0', department: 'Data Science', targetStartDate: '25 Jun 2026', assignees: 3, accepted: 2, pending: 0, declined: 1 },
    { id: '6', title: 'UI/UX Designer', code: 'DSN-0045', icon: 'palette', iconBg: '#fef3e2', iconColor: '#f9ab00', department: 'Design', targetStartDate: '28 Jun 2026', assignees: 2, accepted: 0, pending: 0, declined: 2 },
    { id: '7', title: 'Business Analyst', code: 'BA-0018', icon: 'analytics', iconBg: '#e8f0fe', iconColor: '#1a73e8', department: 'Product', targetStartDate: '05 Jul 2026', assignees: 3, accepted: 2, pending: 1, declined: 0 },
    { id: '8', title: 'Product Manager', code: 'PM-0009', icon: 'manage_accounts', iconBg: '#e6f4ea', iconColor: '#34a853', department: 'Product', targetStartDate: '10 Jul 2026', assignees: 2, accepted: 1, pending: 1, declined: 0 },
    { id: '9', title: 'HR Specialist', code: 'HR-0031', icon: 'people', iconBg: '#fce8e6', iconColor: '#ea4335', department: 'Human Resources', targetStartDate: '15 Jul 2026', assignees: 4, accepted: 3, pending: 1, declined: 0 },
    { id: '10', title: 'Security Engineer', code: 'ENG-SE-0011', icon: 'security', iconBg: '#e6f4ea', iconColor: '#34a853', department: 'Engineering', targetStartDate: '20 Jul 2026', assignees: 2, accepted: 1, pending: 0, declined: 1 },
  ];
  filteredData: any[] = this.allJobs;
  pagedData: any[] = [];
  totalItems=this.allJobs.length;
  currentPage = 1;
  pageSize = 10;
  constructor(private cdr: ChangeDetectorRef) {}

   onPageChange(page: number): void {
    this.currentPage = page;

    this.cdr.markForCheck();
  }
}
