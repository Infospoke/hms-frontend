import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipeLineStagesComponent } from "../../../../shared/components/pipe-line-stages/pipe-line-stages.component";
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { aiInterview } from '../../../../shared/constants/reusbale-filter';
import { ReusableTableComponent, TableColumn } from "../../../../shared/components/reusable-table/reusable-table.component";

@Component({
  selector: 'app-ai-interview-zone',
  imports: [CommonModule, PipeLineStagesComponent, ApprovalLayoutComponent, ReusableTableComponent],
  templateUrl: './ai-interview-zone.component.html',
  styleUrl: './ai-interview-zone.component.scss',
})
export class AiInterviewZoneComponent {

  stages: any[] = [
    {
      id: 'qg',
      label: 'Generate AI Questions',
      icon: 'fa-solid fa-file-lines',
      count: 48,
      countColor: 'purple'
    },
    {
      id: 'is',
      label: 'Schedule AI Interview',
      icon: 'fa-solid fa-calendar-days',
      count: 26,
      countColor: 'blue'
    },
    {
      id: 'si',
      label: 'Upcoming AI Interview',
      icon: 'fa-solid fa-clock',
      count: 17,
      countColor: 'teal'
    }
  ];

  aiInterview = aiInterview;
  activeStageId = 'qg';

  // ── Table columns ──────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', width: '200px', custom: true },
    { key: 'jobTitle', label: 'Job Title', width: '130px' },

    { key: 'questionStatus', label: 'Question Status', width: '150px', custom: true },
    { key: 'totalQuestions', label: 'Total Questions', width: '100px', align: 'center' },
    { key: 'lastUpdated', label: 'Last Updated', width: '110px', custom: true },
    { key: 'actions', label: 'Actions', width: '150px', custom: true, align: 'center' },
  ];

  // ── Table data ─────────────────────────────────────────────────────────────
  tableData: any[] = [
    {
      initials: 'RM', initialsColor: '#7c6fcd',
      name: 'Rahul Mehta', email: 'rahul.mehta@email.com',
      jobTitle: 'Data Scientist', interviewPlan: '4 Round Plan',
      questionStatus: 'Questions Generated', statusType: 'generated',
      totalQuestions: 12, lastUpdatedDate: '20 May 2026', lastUpdatedTime: '10:30 AM',
      actionLabel: 'Manage Questions',
    },
    {
      initials: 'PS', initialsColor: '#6ab0f5',
      name: 'Priya Sharma', email: 'priya.sharma@email.com',
      jobTitle: 'Backend Developer', interviewPlan: '3 Round Plan',
      questionStatus: 'Questions Generated', statusType: 'generated',
      totalQuestions: 10, lastUpdatedDate: '19 May 2026', lastUpdatedTime: '04:15 PM',
      actionLabel: 'Manage Questions',
    },
    {
      initials: 'AR', initialsColor: '#e07b54',
      name: 'Arjun Rao', email: 'arjun.rao@email.com',
      jobTitle: 'QA Engineer', interviewPlan: '4 Round Plan',
      questionStatus: 'Generating Questions', statusType: 'generating',
      totalQuestions: null, lastUpdatedDate: '18 May 2026', lastUpdatedTime: '11:20 AM',
      actionLabel: 'Generating...',
    },
    {
      initials: 'SR', initialsColor: '#5bbf8a',
      name: 'Sneha Reddy', email: 'sneha.reddy@email.com',
      jobTitle: 'Product Manager', interviewPlan: '5 Round Plan',
      questionStatus: 'Questions Generated', statusType: 'generated',
      totalQuestions: 15, lastUpdatedDate: '17 May 2026', lastUpdatedTime: '03:45 PM',
      actionLabel: 'Manage Questions',
    },
    {
      initials: 'VS', initialsColor: '#d4a017',
      name: 'Vikram Singh', email: 'vikram.singh@email.com',
      jobTitle: 'DevOps Engineer', interviewPlan: '4 Round Plan',
      questionStatus: 'Draft Saved', statusType: 'draft',
      totalQuestions: 8, lastUpdatedDate: '16 May 2026', lastUpdatedTime: '01:10 PM',
      actionLabel: 'Manage Questions',
    },
    {
      initials: 'NJ', initialsColor: '#4a90d9',
      name: 'Neha Jain', email: 'neha.jain@email.com',
      jobTitle: 'UX Designer', interviewPlan: '3 Round Plan',
      questionStatus: 'Questions Generated', statusType: 'generated',
      totalQuestions: 9, lastUpdatedDate: '15 May 2026', lastUpdatedTime: '09:20 AM',
      actionLabel: 'Manage Questions',
    },
    {
      initials: 'AD', initialsColor: '#e05c7a',
      name: 'Aditya Verma', email: 'aditya.verma@email.com',
      jobTitle: 'Data Analyst', interviewPlan: '3 Round Plan',
      questionStatus: 'Draft Saved', statusType: 'draft',
      totalQuestions: 6, lastUpdatedDate: '14 May 2026', lastUpdatedTime: '05:35 PM',
      actionLabel: 'Manage Questions',
    },
    {
      initials: 'PK', initialsColor: '#8e6bbf',
      name: 'Pooja Kulkarni', email: 'pooja.kulkarni@email.com',
      jobTitle: 'HR Executive', interviewPlan: '3 Round Plan',
      questionStatus: 'Questions Generated', statusType: 'generated',
      totalQuestions: 10, lastUpdatedDate: '13 May 2026', lastUpdatedTime: '02:40 PM',
      actionLabel: 'Manage Questions',
    },
  ];

  sortableColumns: string[] = ['name', 'jobTitle', 'lastUpdated', 'totalQuestions'];

  onStageSelected(stage: any): void {
    this.activeStageId = stage.id;
  }

  filterChange(event: any): void { }

  onRowClick(row: any): void {
    console.log('Row clicked:', row);
  }

  onSortChange(event: { col: string; dir: 'asc' | 'desc' }): void {
    console.log('Sort changed:', event);
  }
}