import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';

export interface RecruiterRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedDate: string;
  assignedTime: string;
  status: 'Accepted' | 'Declined' | 'Pending';
  respondedDate: string;
  respondedTime: string;
  comments: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-recruiters-and-response',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent],
  templateUrl: './recruiters-and-response.component.html',
  styleUrl: './recruiters-and-response.component.scss',
})
export class RecruitersAndResponseComponent implements OnInit {

  // ── Cards ──────────────────────────────────────────────────────
  cards = [
    {
      label:       'Total Assigned',
      subLabel:    'Recruiters',
      value:       2,
      iconClass:   'fa-solid fa-user-check',
      iconBgColor: '#eaf2ff',
      iconColor:   '#3b82f6',
    },
    {
      label:       'Accepted',
      subLabel:    'Recruiters',
      value:       1,
      iconClass:   'fa-regular fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor:   '#22c55e',
    },
    {
      label:       'Pending',
      subLabel:    'Recruiters',
      value:       0,
      iconClass:   'fa-regular fa-clock',
      iconBgColor: '#fff7ed',
      iconColor:   '#f59e0b',
    },
    {
      label:       'Declined',
      subLabel:    'Recruiters',
      value:       1,
      iconClass:   'fa-regular fa-circle-xmark',
      iconBgColor: '#fef2f2',
      iconColor:   '#ef4444',
    },
  ];

  // ── Table columns ──────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'recruiter',   label: 'Recruiter',    custom: true, width: '200px'                 },
    { key: 'role',        label: 'Role',                       width: '150px'                 },
    { key: 'assignedOn',  label: 'Assigned On',  custom: true, width: '140px'                 },
    { key: 'status',      label: 'Status',       custom: true, width: '130px', align: 'center'},
    { key: 'respondedOn', label: 'Responded On', custom: true, width: '140px'                 },
    { key: 'comments',    label: 'Comments',     custom: true                                 },
  ];

  // ── Data ───────────────────────────────────────────────────────
  private allData: RecruiterRecord[] = [
    {
      id:            '1',
      name:          'Rohit Sharma',
      email:         'rohit.sharma@nexushms.com',
      role:          'Senior Recruiter',
      assignedDate:  '17 May 2026',
      assignedTime:  '01:25 PM',
      status:        'Accepted',
      respondedDate: '19 May 2026',
      respondedTime: '09:15 AM',
      comments:      'Great opportunity.\nHappy to proceed.',
    },
    {
      id:            '2',
      name:          'Neha Patel',
      email:         'neha.patel@nexushms.com',
      role:          'Recruiter',
      assignedDate:  '17 May 2026',
      assignedTime:  '01:25 PM',
      status:        'Declined',
      respondedDate: '19 May 2026',
      respondedTime: '10:40 AM',
      comments:      'Over capacity this month.\nUnable to take this up.',
    },
  ];

  filteredData: RecruiterRecord[] = [];
  totalItems   = 0;
  pageSize     = 10;
  currentPage  = 1;

  ngOnInit(): void {
    this.filteredData = [...this.allData];
    this.totalItems   = this.filteredData.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  addAssignees(): void {
    // open modal or navigate to add-assignee flow
  }
}