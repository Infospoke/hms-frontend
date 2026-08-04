import { Component, OnInit } from '@angular/core';
import { DashboardLayoutComponent, RequisitionsTableConfig } from '../dashboard-layout/dashboard-layout.component';
import { TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';

@Component({
  selector: 'app-recruiter-dashboard-component',
  imports: [DashboardLayoutComponent],
  templateUrl: './recruiter-dashboard-component.component.html',
  styleUrl: './recruiter-dashboard-component.component.scss',
})
export class RecruiterDashboardComponentComponent implements OnInit {

  ngOnInit(): void {
    
  }

  cards = [
  {
    label: 'My Assigned SRs',
    value: 12,
    iconClass: 'fa-solid fa-users',
    iconBgColor: '#E8F8EE',   // Light Green
    iconColor: '#16A34A',     // Green
    trend: 'up' as const,
  },
  {
    label: 'Active Candidates',
    value: 248,
    iconClass: 'fa-solid fa-user-group',
    iconBgColor: '#E8F8EE',   // Light Green
    iconColor: '#16A34A',     // Green
  },
  {
    label: 'Total Openings',
    value: 36,
    iconClass: 'fa-regular fa-clipboard',
    iconBgColor: '#F3E8FF',   // Light Purple
    iconColor: '#7C3AED',     // Purple
    trend: 'up' as const,
  },
  {
    label: 'Filled (My vs Team)',
    value: '18 / 48',
    iconClass: 'fa-solid fa-users',
    iconBgColor: '#E8F0FF',   // Light Blue
    iconColor: '#2563EB',     // Blue
    trend: 'up' as const,
  },
  {
    label: 'Yet to Fill',
    value: 18,
    iconClass: 'fa-regular fa-clock',
    iconBgColor: '#FFF4E5',   // Light Orange
    iconColor: '#F59E0B',     // Orange
    trend: 'down' as const,
  },
  {
    label: 'In Progress',
    value: 20,
    iconClass: 'fa-solid fa-chart-line',
    iconBgColor: '#E6FFFB',   // Light Teal
    iconColor: '#0F9D9A',     // Teal
    trend: 'down' as const,
  }
];

 showTable = true;

requisitionsColumns: TableColumn[] = [
    { key: 'srName', label: 'SR Name', width: '20%' },
    { key: 'priority', label: 'priority', width: '12%' },
    { key: 'openings', label: 'Openings', width: '14%', align: 'center' },
    { key: 'filled', label: 'filled', width: '14%', align: 'center' },
    { key: 'inProgress', label: 'In Progress', width: '14%', align: 'center'},
    { key: 'daysRemaining', label: 'Days Remianing', width: '14%', align: 'center'},
    { key: 'slaStatus', label: 'Sla Status', width: '12%', align: 'center', custom: true }
  ];

 requisitionsData = [
  {
    srName: 'Backend Engineer',
    priority: 'High',
    openings: 5,
    filled: 3,
    inProgress: 1,
    daysRemaining: '5',
    slaStatus: 'On Track'
  },
  {
    srName: 'QA Lead',
    priority: 'High',
    openings: 2,
    filled: 1,
    inProgress: 0,
    daysRemaining: '5',
    slaStatus: 'On Track'
  },
  {
    srName: 'HR Executive',
    priority: 'Medium',
    openings: 3,
    filled: 1,
    inProgress: 1,
    daysRemaining: '12',
    slaStatus: 'At Risk'
  },
  {
    srName: 'Data Analyst',
    priority: 'Medium',
    openings: 2,
    filled: 2,
    inProgress: 0,
    daysRemaining: '12',
    slaStatus: 'On Track'
  },
  {
    srName: 'SAP Consultant',
    priority: 'Low',
    openings: 2,
    filled: 1,
    inProgress: 1,
    daysRemaining: '-2',
    slaStatus: 'Overdue'
  },
  {
    srName: 'Frontend Developer',
    priority: 'High',
    openings: 3,
    filled: 2,
    inProgress: 1,
    daysRemaining: '18',
    slaStatus: 'On Track'
  }
];
tableConfig: RequisitionsTableConfig = {
    title: 'My Assigned SRs',
    columns: this.requisitionsColumns,
    data: this.requisitionsData,
  };

  pipelineConfig = {
  layout: 'funnel' as const,

  title: 'My Conversion Funnel',

  periods: ['This Month'],

  selectedPeriod: 'This Month',

  stages: [
    {
      label: 'Applications',
      value: 120,
      iconClass: '',
      iconColor: '#2563EB',
      iconBgColor: '',
    },
    {
      label: 'Screening',
      value: 82,
      conversionPct: 68,
      iconClass: '',
      iconColor: '#0EA5E9',
      iconBgColor: '',
    },
    {
      label: 'Shortlisted',
      value: 55,
      conversionPct: 67,
      iconClass: '',
      iconColor: '#10B981',
      iconBgColor: '',
    },
    {
      label: 'Interview',
      value: 35,
      conversionPct: 64,
      iconClass: '',
      iconColor: '#F59E0B',
      iconBgColor: '',
    },
    {
      label: 'Offer',
      value: 18,
      conversionPct: 51,
      iconClass: '',
      iconColor: '#8B5CF6',
      iconBgColor: '',
    },
    {
      label: 'Hired',
      value: 12,
      conversionPct: 67,
      iconClass: '',
      iconColor: '#3B82F6',
      iconBgColor: '',
    }
  ],

  overallConversionLabel: 'Overall Conversion Rate',

  overallConversionRate: 10
};


offerStatusChart = {
  title: 'Offer Status Flow (This Month)',
  centerLabel: 'Total',
  size: 300,
  segments: [
    { label: 'offer Requests by HR', value: 8, color: '#2563EB' },
    { label: 'Under Review & Approval', value: 8, color: '#22C1C3' },
    { label: 'Offer Released', value: 4, color: '#F59E0B' },
    { label: 'Offer Accepted', value: 4, color: '#7C3AED' },
    { label: 'Offer Rejected', value: 1, color: '#EF4444' }
   
  ]
};

negotiationChart = {
  title: 'Negotiation Flow (This Month)',
  centerLabel: 'Total',
  size: 250,
  segments: [
    { label: 'Negotiation Request', value: 4, color: '#2563EB' },
    { label: 'HR Review', value: 2, color: '#22C1C3' },
    { label: 'Under Review & Approval ', value: 2, color: '#22C1C3' },
    { label: 'Re-release Offer', value: 2, color: '#6CC24A' },
    { label: 'Candidate Accepted', value: 1, color: '#7C3AED' },
    { label: 'Candidate Rejected', value: 1, color: '#F59E0B' }
  ]
};
pieCharts = [
  this.offerStatusChart,
  this.negotiationChart
];
bubbleChart = {
  title: 'Source Performance (This Month)',

  bubbles: [
    { label: 'LinkedIn', value: 160, color: '#2563eb', size: 120 },
    { label: 'Naukri', value: 120, color: '#14b8a6', size: 105 },
    { label: 'Referral', value: 80, color: '#22c55e', size: 95 },
    { label: 'Career Portal', value: 60, color: '#f59e0b', size: 80 },
    { label: 'Others', value: 30, color: '#ec4899', size: 72 }
  ],

  tableData: [
    { source: 'LinkedIn', hires: 160, cost: '33.3%' },
    { source: 'Naukri', hires: 120, cost: '25.0%' },
    { source: 'Employee Referral', hires: 80, cost: '16.7%' },
    { source: 'Career Portal', hires: 60, cost: '12.5%' },
    { source: 'Others', hires: 30, cost: '6.3%' }
  ]
};
}
