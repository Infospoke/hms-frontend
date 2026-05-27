import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';

export interface PlanApproval {
  id: number;
  planName: string;
  planType: string;
  rounds: number;
  requestedBy: string;
  requestedByRole: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-interview-plain-aproval',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent],
  templateUrl: './interview-plain-aproval.component.html',
  styleUrl: './interview-plain-aproval.component.scss',
})
export class InterviewPlainAprovalComponent {

  columns: TableColumn[] = [
    { key: 'planName',     label: 'Plan Name',     width: '220px',  custom: true },
    { key: 'rounds',       label: 'Rounds',        width: '80px',   align: 'center' },
    { key: 'requestedBy',  label: 'Requested By',  width: '170px',  custom: true },
    { key: 'requestedOn',  label: 'Requested On',  width: '170px' },
    { key: 'status',       label: 'Status',        width: '100px',  align: 'center', custom: true },
    { key: 'action',       label: 'Action',        width: '180px',  align: 'center', custom: true },
  ];

  allPlans: PlanApproval[] = [
    { id: 1, planName: 'Data Science Interview Plan',    planType: 'Technical + HR + Managerial', rounds: 3, requestedBy: 'Rohit Sharma',  requestedByRole: 'HR Business Partner',  requestedOn: '20 May 2024, 11:20 AM', status: 'Pending' },
    { id: 2, planName: 'Sales Executive Interview Plan', planType: 'HR + Technical',              rounds: 2, requestedBy: 'Priya Mehta',   requestedByRole: 'Talent Acquisition',   requestedOn: '20 May 2024, 10:45 AM', status: 'Pending' },
    { id: 3, planName: 'Product Manager Plan',           planType: 'Technical + Case Study + HR', rounds: 3, requestedBy: 'Ankit Verma',   requestedByRole: 'HR Business Partner',  requestedOn: '19 May 2024, 04:30 PM', status: 'Pending' },
    { id: 4, planName: 'Backend Developer Plan',         planType: 'Technical + HR',              rounds: 2, requestedBy: 'Neha Kapoor',   requestedByRole: 'Talent Acquisition',   requestedOn: '19 May 2024, 02:15 PM', status: 'Pending' },
    { id: 5, planName: 'UI/UX Designer Plan',            planType: 'Portfolio Review + HR',       rounds: 2, requestedBy: 'Karan Singh',   requestedByRole: 'HR Business Partner',  requestedOn: '18 May 2024, 05:10 PM', status: 'Pending' },
  ];

  pageSize    = 10;
  currentPage = 1;

  get pagedPlans(): PlanApproval[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allPlans.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.allPlans.length;
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
  }

  handleReviewApprove(plan: PlanApproval): void {
    console.log('Review & Approve:', plan);
  }

  handleRowArrow(plan: PlanApproval): void {
    console.log('Navigate to plan:', plan);
  }
}