import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { interview } from '../../../../shared/constants/reusbale-filter';
import { TableColumn, ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { Router } from '@angular/router';

export interface Candidate {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  roundsCompleted: number;
  totalRounds: number;
  currentStage: string;
  stageStatus: 'Completed' | 'In Progress';
  lastActivity: string;
  lastActivityTime: string;
}

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent, CanDirective],
  templateUrl: './offer-management.component.html',
  styleUrl: './offer-management.component.scss',
})
export class OfferManagementComponent {

  cards = [
    {
      label: 'Selected Candidates',
      value: 18,
      percentage: '',
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#eaf2ff',
      iconColor: '#3b82f6',
      description: 'Completed all interview rounds'
    },
    {
      label: 'AI Interview',
      value: 4,
      percentage: '',
      iconClass: 'fa-regular fa-calendar-check',
      iconBgColor: '#fff7ed',
      iconColor: '#f97316',
      description: 'Completed'
    },
    {
      label: 'Technical Round',
      value: 7,
      percentage: '',
      iconClass: 'fa-solid fa-code',
      iconBgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      description: 'Completed'
    },
    {
      label: 'Managerial Round',
      value: 12,
      percentage: '',
      iconClass: 'fa-regular fa-calendar-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#16a34a',
      description: 'Completed'
    },
    {
      label: 'HR Round',
      value: 15,
      percentage: '',
      iconClass: 'fa-regular fa-user',
      iconBgColor: '#fef2f2',
      iconColor: '#ef4444',
      description: 'Completed'
    }
  ];

  dropDownData = interview;
  currentPage: number = 1;
  totalItems: number = 18;
  pageSize: number = 10;
  private router=inject(Router);
  columns: TableColumn[] = [
    { key: 'candidate',       label: 'Candidate',        width: '220px', custom: true },
    { key: 'jobTitle',        label: 'Job Title',        width: '180px', custom: true },
    { key: 'roundProgress',   label: 'Round Progress',   width: '220px', custom: true, align: 'center' },
    { key: 'currentStage',    label: 'Current Stage',    width: '160px', custom: true },
    { key: 'lastActivity',    label: 'Last Activity',    width: '140px', custom: true },
    { key: 'actions',         label: 'Actions',          width: '100px', custom: true, align: 'center' },
  ];

  candidates: Candidate[] = [
    { firstName: 'Rahul',  lastName: 'Mehta',   email: 'rahul.mehta@email.com',   jobTitle: 'Data Scientist',      roundsCompleted: 4, totalRounds: 4, currentStage: 'Completed',      stageStatus: 'Completed',  lastActivity: '22 May 2026', lastActivityTime: '10:30 AM' },
    { firstName: 'Priya',  lastName: 'Sharma',  email: 'priya.sharma@email.com',  jobTitle: 'Backend Developer',   roundsCompleted: 3, totalRounds: 4, currentStage: 'HR Round',       stageStatus: 'In Progress', lastActivity: '21 May 2026', lastActivityTime: '04:15 PM' },
    { firstName: 'Neha',   lastName: 'Verma',   email: 'neha.verma@email.com',    jobTitle: 'Product Manager',     roundsCompleted: 4, totalRounds: 4, currentStage: 'Completed',      stageStatus: 'Completed',  lastActivity: '20 May 2026', lastActivityTime: '11:20 AM' },
    { firstName: 'Arjun',  lastName: 'Rao',     email: 'arjun.rao@email.com',     jobTitle: 'QA Engineer',         roundsCompleted: 2, totalRounds: 4, currentStage: 'Managerial Round', stageStatus: 'In Progress', lastActivity: '18 May 2026', lastActivityTime: '02:30 PM' },
    { firstName: 'Sneha',  lastName: 'Reddy',   email: 'sneha.reddy@email.com',   jobTitle: 'UX Designer',         roundsCompleted: 4, totalRounds: 4, currentStage: 'Completed',      stageStatus: 'Completed',  lastActivity: '19 May 2026', lastActivityTime: '09:45 AM' },
    { firstName: 'Vikram', lastName: 'Singh',   email: 'vikram.singh@email.com',  jobTitle: 'DevOps Engineer',     roundsCompleted: 3, totalRounds: 4, currentStage: 'HR Round',       stageStatus: 'In Progress', lastActivity: '22 May 2026', lastActivityTime: '01:10 PM' },
    { firstName: 'Ankita', lastName: 'Sharma',  email: 'ankita.sharma@email.com', jobTitle: 'HR Business Partner', roundsCompleted: 4, totalRounds: 4, currentStage: 'Completed',      stageStatus: 'Completed',  lastActivity: '21 May 2026', lastActivityTime: '03:00 PM' },
    { firstName: 'Karan',  lastName: 'Malhotra',email: 'karan.malhotra@email.com',jobTitle: 'Frontend Developer',  roundsCompleted: 2, totalRounds: 4, currentStage: 'Technical Round',stageStatus: 'In Progress', lastActivity: '17 May 2026', lastActivityTime: '05:25 PM' },
  ];

  /** First letter of first name + first letter of last name */
  getInitials(candidate: Candidate): string {
    return (candidate.firstName.charAt(0) + candidate.lastName.charAt(0)).toUpperCase();
  }

  /** Deterministic background colour derived from name */
  getAvatarBg(candidate: Candidate): string {
    const palette = [
      '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
      '#f97316', '#10b981', '#14b8a6', '#f59e0b',
    ];
    const seed = (candidate.firstName.charCodeAt(0) + candidate.lastName.charCodeAt(0)) % palette.length;
    return palette[seed];
  }

  /** Build round-progress dot states for a candidate */
  getRoundStates(candidate: Candidate): Array<'done' | 'active' | 'pending'> {
    return Array.from({ length: candidate.totalRounds }, (_, i) => {
      if (i < candidate.roundsCompleted) return 'done';
      if (i === candidate.roundsCompleted && candidate.stageStatus === 'In Progress') return 'active';
      return 'pending';
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewDetails(candidate: Candidate): void {
    this.router.navigate(['/supply/applicant-management/view-ai-interview-details'])
  }
}