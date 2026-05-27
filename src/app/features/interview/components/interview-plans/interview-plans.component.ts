import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonTableActionsComponent } from "../../../../shared/components/common-table-actions/common-table-actions.component";
import { interview } from '../../../../shared/constants/reusbale-filter';

export interface InterviewPlan {
  id: number;
  planName: string;
  description: string;
  rounds: number;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdOn: string;
}

@Component({
  selector: 'app-interview-plans',
  standalone: true,
  imports: [CommonModule, ApprovalLayoutComponent, ReusableTableComponent, CommonTableActionsComponent],
  templateUrl: './interview-plans.component.html',
  styleUrl: './interview-plans.component.scss',
})
export class InterviewPlansComponent {

  cards = [
    {
      label: 'All Interview Plans',
      subLabel: 'Total plans',
      value: 24,
      percentage: 'Total plans',
      iconClass: 'fa-regular fa-clipboard',
      iconBgColor: '#eaf2ff',
      iconColor: '#2563eb'
    },
    {
      label: 'Active Plans',
      subLabel: 'Plans available for use',
      value: 16,
      percentage: 'Plans available for use',
      iconClass: 'fa-regular fa-circle-check',
      iconBgColor: '#ecfdf5',
      iconColor: '#22c55e'
    },
    {
      label: 'Inactive Plans',
      subLabel: 'Plans not available',
      value: 8,
      percentage: 'Plans not available',
      iconClass: 'fa-regular fa-circle-pause',
      iconBgColor: '#fff7ed',
      iconColor: '#f59e0b'
    }
  ];

  tabs: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'All Plans', count: 24 },
    { key: 'active', label: 'Active Plans', count: 16 },
    { key: 'inactive', label: 'Inactive Plans', count: 8 },
  ];

  activeTab = 'all';

  columns: TableColumn[] = [
    { key: 'planName', label: 'Plan Name', width: '180px', custom: true },
    { key: 'description', label: 'Description', width: '220px', custom: true },
    { key: 'rounds', label: 'Rounds', width: '80px', align: 'center' },
    { key: 'status', label: 'Status', width: '100px', align: 'center', custom: true },
    { key: 'createdBy', label: 'Created By', width: '130px' },
    { key: 'createdOn', label: 'Created On', width: '120px' },
    { key: 'actions', label: 'Actions', width: '90px', align: 'center', custom: true },
  ];

  allPlans: InterviewPlan[] = [
    { id: 1, planName: 'Software Engineer Plan', description: 'Standard interview plan for Software Engineer roles', rounds: 4, status: 'Active', createdBy: 'Demo Admin', createdOn: 'May 20, 2025' },
    { id: 2, planName: 'Backend Developer Plan', description: 'Interview plan for Backend Developer positions', rounds: 5, status: 'Active', createdBy: 'Demo Admin', createdOn: 'May 18, 2025' },
    { id: 3, planName: 'Product Manager Plan', description: 'Comprehensive plan for Product Manager roles', rounds: 4, status: 'Active', createdBy: 'Demo Admin', createdOn: 'May 15, 2025' },
    { id: 4, planName: 'Data Scientist Plan', description: 'Interview plan for Data Scientist roles', rounds: 4, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'May 10, 2025' },
    { id: 5, planName: 'DevOps Engineer Plan', description: 'Plan for DevOps Engineer positions', rounds: 4, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'May 8, 2025' },
    { id: 6, planName: 'QA Engineer Plan', description: 'Interview plan for QA Engineer roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'May 5, 2025' },
    { id: 7, planName: 'Mobile Developer Plan', description: 'Plan for Mobile App Developer roles', rounds: 4, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'May 1, 2025' },
    { id: 8, planName: 'UI/UX Designer Plan', description: 'Interview plan for UI/UX Designer roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Apr 28, 2025' },
    { id: 9, planName: 'Frontend Engineer Plan', description: 'Plan for Frontend Engineer roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Apr 24, 2025' },
    { id: 10, planName: 'Cloud Architect Plan', description: 'Interview plan for Cloud Architect positions', rounds: 5, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'Apr 20, 2025' },
    { id: 11, planName: 'Scrum Master Plan', description: 'Interview plan for Scrum Master roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Apr 15, 2025' },
    { id: 12, planName: 'Business Analyst Plan', description: 'Plan for Business Analyst positions', rounds: 4, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Apr 10, 2025' },
    { id: 13, planName: 'Security Engineer Plan', description: 'Interview plan for Security Engineer roles', rounds: 4, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'Apr 5, 2025' },
    { id: 14, planName: 'ML Engineer Plan', description: 'Plan for Machine Learning Engineer positions', rounds: 5, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Mar 28, 2025' },
    { id: 15, planName: 'Tech Lead Plan', description: 'Interview plan for Tech Lead roles', rounds: 5, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Mar 20, 2025' },
    { id: 16, planName: 'Fullstack Developer Plan', description: 'Plan for Fullstack Developer roles', rounds: 4, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Mar 15, 2025' },
    { id: 17, planName: 'Database Admin Plan', description: 'Interview plan for DBA positions', rounds: 3, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'Mar 10, 2025' },
    { id: 18, planName: 'Network Engineer Plan', description: 'Plan for Network Engineer roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Mar 5, 2025' },
    { id: 19, planName: 'Systems Analyst Plan', description: 'Interview plan for Systems Analyst roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Feb 28, 2025' },
    { id: 20, planName: 'Embedded Systems Plan', description: 'Plan for Embedded Systems Engineer roles', rounds: 4, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'Feb 20, 2025' },
    { id: 21, planName: 'DevRel Plan', description: 'Interview plan for Developer Relations roles', rounds: 3, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Feb 15, 2025' },
    { id: 22, planName: 'Solution Architect Plan', description: 'Plan for Solution Architect positions', rounds: 5, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'Feb 10, 2025' },
    { id: 23, planName: 'CTO Interview Plan', description: 'Executive interview plan for CTO roles', rounds: 6, status: 'Active', createdBy: 'Demo Admin', createdOn: 'Feb 5, 2025' },
    { id: 24, planName: 'Intern Engineering Plan', description: 'Interview plan for Engineering Interns', rounds: 2, status: 'Inactive', createdBy: 'Demo Admin', createdOn: 'Jan 30, 2025' },
  ];

  pageSize = 8;
  currentPage = 1;
  dropDownData=interview;
  get filteredPlans(): InterviewPlan[] {
    if (this.activeTab === 'active') return this.allPlans.filter(p => p.status === 'Active');
    if (this.activeTab === 'inactive') return this.allPlans.filter(p => p.status === 'Inactive');
    return this.allPlans;
  }

  get pagedPlans(): InterviewPlan[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPlans.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredPlans.length;
  }

  handleCreateNewPlan(): void {
    // TODO: open create plan dialog/route
  }

  handleTabChange(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
  }

  handleView(row:any): void {
    console.log('View plan:');
  }

  handleEdit(row:any): void {
    console.log('Edit plan:');
  }

  filtersChange(data:any){
    console.log(data);
  }
}