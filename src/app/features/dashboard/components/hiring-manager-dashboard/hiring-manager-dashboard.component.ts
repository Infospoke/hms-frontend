import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashboardLayoutComponent } from "../dashboard-layout/dashboard-layout.component";
import { CommonModule } from '@angular/common';
import { DonutSegment } from '../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component';
import { PieChartConfig } from '../dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-hiring-manager-dashboard',
  imports: [DashboardLayoutComponent, CommonModule],
  templateUrl: './hiring-manager-dashboard.component.html',
  styleUrl: './hiring-manager-dashboard.component.scss',
})
export class HiringManagerDashboardComponent implements OnInit, OnChanges {

  ngOnInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  heading = 'Good morning, Divya! 👋';
  subHeading = "Here's what's happening with your hiring.";

  cards = [
    {
      label: 'Open SRs',
      value: 6,
      subLabel: '1 this week',
      iconClass: 'briefcase',
      iconBgColor: '#DBEAFE',
      iconColor: '#3B82F6',
    },
    {
      label: 'Total Candidates',
      value: 141,
      subLabel: 'In pipeline',
      iconClass: 'users',
      iconBgColor: '#D1FAE5',
      iconColor: '#10B981',
    },
    {
      label: 'Interviews',
      value: 18,
      subLabel: '2 this week',
      iconClass: 'user-check',
      iconBgColor: '#EDE9FE',
      iconColor: '#8B5CF6',
    },
    {
      label: 'Offers',
      value: 8,
      subLabel: '1 this week',
      iconClass: 'file-text',
      iconBgColor: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      label: 'Average Hiring Age',
      value: '21 Days',
      subLabel: '3 days vs last month',
      iconClass: 'clock',
      iconBgColor: '#E0E7FF',
      iconColor: '#6366F1',
    },
  ];

  table = true;

requisitionColumns = [
  { key: 'position', label: 'Position' },
  { key: 'openings', label: 'Openings' },
  { key: 'offersReleased', label: 'Offers Released' },
  { key: 'offersPending', label: 'Offers Pending' },
  { key: 'targetStartDate', label: 'Target Start Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'slaStatus', label: 'SLA Status' },
  {key: 'daysRemaining', label:'Days Remaining' }
];

requisitionData = [
  {
    position: 'Backend Engineer',
    openings: 5,
    offersReleased: 3,
    offersPending: 1,
    targetStartDate: '30 Jun 2026',
    priority: 'High',
    slaStatus: 'On Track',
    daysRemaining: '5 Days'

  },
  {
    position: 'QA Lead',
    openings: 2,
    offersReleased: 1,
    offersPending: 0,
    targetStartDate: '15 Jul 2026',
    priority: 'Medium',
    slaStatus: 'At Risk',
    daysRemaining: '3 Days'
  },
  {
    position: 'HR Executive',
    openings: 3,
    offersReleased: 2,
    offersPending: 1,
    targetStartDate: '01 Jul 2026',
    priority: 'High',
    slaStatus: 'Overdue',
     daysRemaining: '6 Days'
  },
  {
    position: 'Data Analyst',
    openings: 2,
    offersReleased: 1,
    offersPending: 0,
    targetStartDate: '20 Jul 2026',
    priority: 'Medium',
    slaStatus: 'At Risk',
     daysRemaining: '3 Days'
  },
  {
    position: 'SAP Consultant',
    openings: 2,
    offersReleased: 1,
    offersPending: 0,
    targetStartDate: '10 Aug 2026',
    priority: 'Low',
    slaStatus: 'On Track',
    daysRemaining: '3 Days'
  }
];



  offerStatusSegments: DonutSegment[] = [
    {
      label: 'Offer Requests',
      value: 5,
      color: '#3B82F6',
    },
    {
      label: 'Pending Approval',
      value: 3,
      color: '#F59E0B',
    },
    {
      label: 'Approved',
      value: 3,
      color: '#22C55E',
    },
    {
      label: 'Offer Released',
      value: 8,
      color: '#8B5CF6',
    },
    {
      label: 'Offer Accepted',
      value: 2,
      color: '#10B981',
    },
    {
      label: 'Declined',
      value: 1,
      color: '#EF4444',
    },
  ];

  offerNegotiationSegments: DonutSegment[] = [
    {
      label: 'Negotiation Started',
      value: 3,
      color: '#3B82F6',
    },
    {
      label: 'Manager Review',
      value: 2,
      color: '#F59E0B',
    },
    {
      label: 'Counter Offered',
      value: 2,
      color: '#8B5CF6',
    },
    {
      label: 'Final Offer Pending',
      value: 1,
      color: '#F97316',
    },
    {
      label: 'Closed (Accepted)',
      value: 2,
      color: '#22C55E',
    },
    {
      label: 'Closed (Declined)',
      value: 1,
      color: '#EF4444',
    },
  ];

  candidateQualitySegments: DonutSegment[] = [
    {
      label: 'Excellent (90 - 100)',
      value: 12,
      color: '#10B981',
    },
    {
      label: 'Good (80 - 89)',
      value: 18,
      color: '#3B82F6',
    },
    {
      label: 'Average (70 - 79)',
      value: 9,
      color: '#F59E0B',
    },
    {
      label: 'Needs Review (<70)',
      value: 3,
      color: '#EF4444',
    },
  ];
  pieCharts: PieChartConfig[] = [
    {
      title: 'Offer Status (Offer Requests & Approvals)',
      segments: this.offerStatusSegments,
      centerLabel: 'Total Offers',
      size: 200,
    },
    {
      title: 'Offer Negotiation Flow',
      segments: this.offerNegotiationSegments,
      centerLabel: 'Total Cases',
      size: 200,
    },
    {
      title:"Candidate Quality Distribution",
      segments: this.candidateQualitySegments,
      centerLabel: 'Total Candidates',
      size: 200,
    }
  ];

}