import { Component, OnInit } from '@angular/core';
import { DashboardLayoutComponent, RequisitionsTableConfig } from '../dashboard-layout/dashboard-layout.component';
import { TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
 
@Component({
  selector: 'app-hiring-manager-new-dashboard',
  imports: [DashboardLayoutComponent],
  templateUrl: './hiring-manager-new-dashboard.html',
  styleUrl: './hiring-manager-new-dashboard.scss',
})
export class HiringManagerNewDashboard implements OnInit {
  ngOnInit(): void {
   
  }
 
   heading = 'Good morning,  👋';
  subHeading = "Here's what's happening with your hiring.";
 
  cards = [
  {
    label: 'Open SRs',
    value: 6,
    iconClass: 'fa-solid fa-briefcase',
    iconBgColor: '#DBEAFE',
    iconColor: '#3B82F6',
    trend: 'up' as const,
  },
  {
    label: 'Total Candidates',
    value: 141,

    iconClass: 'fa-solid fa-users',
    iconBgColor: '#D1FAE5',
    iconColor: '#10B981',
  },
  {
    label: 'Interviews',
    value: 18,

    iconClass: 'fa-solid fa-user-check',
    iconBgColor: '#EDE9FE',
    iconColor: '#8B5CF6',
    trend: 'up' as const,
  },
  {
    label: 'Offers',
    value: 8,

    iconClass: 'fa-solid fa-file-signature',
    iconBgColor: '#FFEDD5',
    iconColor: '#F97316',
    trend: 'up' as const,
  },
  {
    label: 'Average Hiring Age',
    value: '21 Days',

    iconClass: 'fa-solid fa-clock',
    iconBgColor: '#E0E7FF',
    iconColor: '#6366F1',
    trend: 'down' as const,
  },
 
 
];
  showTable = true;
 
requisitionsColumns: TableColumn[] = [
    { key: 'position', label: 'Position', width: '20%' },
    { key: 'openings', label: 'Openings', width: '12%' },
    { key: 'offersReleased', label: 'Offers Released', width: '14%', align: 'center' },
    { key: 'offersPending', label: 'Offers Pending', width: '14%', align: 'center' },
    { key: 'priority', label: 'Priority', width: '14%', align: 'center', custom: true },
    { key: 'slaStatus', label: 'SLA Status', width: '14%', align: 'center', custom: true },
    { key: 'dueDate', label: 'Due Date', width: '12%', align: 'center', custom: true },
    {key:'daysRemaining',label:'Days Remaining', width:'12%',align:'center'}
  ];
 
  requisitionsData = [
    { position: 'Backend Engineer', openings: 5, offersReleased: 3, offersPending: 1, priority: 'High', slaStatus: 'On Track', dueDate: 'Dec 12',daysRemaining:'2 days'},
    { position: 'QA Lead', openings: 2, offersReleased: 1, offersPending: 0, priority: 'Medium', slaStatus: 'At Risk', dueDate: 'Dec 18',daysRemaining:'21 days' },
    { position: 'HR Executive', openings: 3, offersReleased: 2, offersPending: 1, priority: 'High', slaStatus: 'Overdue', dueDate: 'Dec 05',daysRemaining:'3 days' },
    { position: 'Data Analyst', openings: 2, offersReleased: 1, offersPending: 0, priority: 'Medium', slaStatus: 'At Risk', dueDate: 'Dec 20',daysRemaining:'15 days' },
    { position: 'SAP Consultant', openings: 2, offersReleased: 1, offersPending: 0, priority: 'Low', slaStatus: 'On Track', dueDate: 'Dec 28',daysRemaining:'10 days' },
    { position: 'Frontend Developer', openings: 3, offersReleased: 0, offersPending: 0, priority: 'Low', slaStatus: 'On Track', dueDate: 'Jan 05',daysRemaining:'5 days' },
  ];
tableConfig: RequisitionsTableConfig = {
    title: 'My Requisitions',
    columns: this.requisitionsColumns,
    data: this.requisitionsData,
  };

  showPipeline = true;
  // Renders app-candidate-pipeline-graph (ApexCharts funnel + conversion
  // circles) instead of the plain funnel — it's currently self-contained
  // with its own dummy data, no config object needed here yet.
  pipelineGraph = true;

}