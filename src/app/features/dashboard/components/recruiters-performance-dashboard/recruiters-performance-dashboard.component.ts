import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { recruitersPerformanceFilter } from '../../../../shared/constants/reusbale-filter';
import { JobAssignmentsTableComponent, JobAssignmentRow } from '../../../../shared/components/job-assignments-table/job-assignments-table.component';
import { SourcePerformanceGridComponent, SourceTile } from '../../../../shared/components/source-performance-grid/source-performance-grid.component';
import { FunnelChartComponent, FunnelStageData } from '../../../../shared/components/funnel-chart/funnel-chart.component';
import { MultiLineChartComponent, LineSeriesInput } from '../../../../shared/components/multi-line-chart/multi-line-chart.component';
import { CandidatePipelineComponent } from '../../../../shared/components/candidate-pipeline/candidate-pipeline.component';
import { FlowStage } from '../../../../shared/components/hiring-flow-progress/hiring-flow-progress.component';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-recruiters-performance-dashboard',
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    JobAssignmentsTableComponent,
    SourcePerformanceGridComponent,
    MultiLineChartComponent,
    CandidatePipelineComponent
  ],
  templateUrl: './recruiters-performance-dashboard.component.html',
  styleUrl: './recruiters-performance-dashboard.component.scss',
})
export class RecruitersPerformanceDashboardComponent implements OnInit {

  heading = 'Recruiter Performance Drill-down';
  subHeading = "Track recruiter execution from job assignment to hiring outcome";

  private dashboardService=inject(DashboardService);

  // Recruiters + Date filters — same app-common-filter dropdowns used in
  // recruiter-assignment/approval-layout/etc. Dummy recruiter options for
  // now.
  filterDropdowns = recruitersPerformanceFilter;

ngOnInit(): void {
  this.getDashboardCount();
}
  onFilterChange(event: any): void {
    // Dummy data for now — nothing to re-query yet, but this is where the
    // selected recruiter/date-range would drive a real API call.
    console.log('recruiter dashboard filters changed', event);
  }

  pipelineConfig = {
  layout: 'funnel' as const,

  title: 'Recruitment Funnel',

  periods: ['This Month'],

  selectedPeriod: 'This Month',

  stages: [
    {
      label: 'Applications Added',
      value: 425,
      conversionPct: 100,
      iconClass: '',
      iconColor: '#3B82F6',
      iconBgColor: '',
    },
    {
      label: 'Screened',
      value: 250,
      conversionPct: 58.8,
      iconClass: '',
      iconColor: '#8B5CF6',
      iconBgColor: '',
    },
    {
      label: 'Shortlisted',
      value: 120,
      conversionPct: 48,
      iconClass: '',
      iconColor: '#F97316',
      iconBgColor: '',
    },
    {
      label: 'Interviewed',
      value: 60,
      conversionPct: 50,
      iconClass: '',
      iconColor: '#22C55E',
      iconBgColor: '',
    },
    {
      label: 'Offers Released',
      value: 18,
      conversionPct: 30,
      iconClass: '',
      iconColor: '#EF4444',
      iconBgColor: '',
    },
    {
      label: 'Offers Accepted',
      value: 12,
      conversionPct: 66.7,
      iconClass: '',
      iconColor: '#14B8A6',
      iconBgColor: '',
    },
    {
      label: 'Hired',
      value: 19,
      conversionPct: 66.7,
      iconClass: '',
      iconColor: '#16A34A',
      iconBgColor: '',
    }
  ],

  overallConversionLabel: 'Overall Conversion Rate',


  overallConversionRate: 2.1
};
  cards = [
    {
      label: 'Assignments',
      value: 0,
      iconClass: 'fa-solid fa-briefcase',
      iconBgColor: '#DBEAFE',
      iconColor: '#3B82F6',
    },
    {
      label: 'Applications Added',
      value: 0,
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#F3E8FF',
      iconColor: '#9333EA',
    },
    {
      label: 'Offers Released',
      value: 0,
      iconClass: 'fa-solid fa-gift',
      iconBgColor: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      label: 'Hired',
      value: 0,
      iconClass: 'fa-solid fa-user',
      iconBgColor: '#DCFCE7',
      iconColor: '#22C55E',
    },
    {
      label: 'SLA Compliance',
      value: '0',
      iconClass: 'fa-solid fa-shield-halved',
      iconBgColor: '#DBEAFE',
      iconColor: '#2563EB',
    },
  ];

  // ── Job Assignments table ─────────────────────────────────────────────────
  jobAssignments: JobAssignmentRow[] =[];

  // ── SLA Compliance by Hiring Flow ────────────────────────────────────────
  flowStages: FlowStage[] = [
    { icon: 'fa-solid fa-briefcase', iconBg: '#EAF3FF', color: '#2E9E9E', label: '1. Assignment Acceptance', percent: 94, fraction: '18 / 19', subLabel: 'Within SLA' },
    { icon: 'fa-solid fa-user-group', iconBg: '#F3E8FF', color: '#8B5CF6', label: '2. Screening to Interview', percent: 91, fraction: '388 / 425', subLabel: 'Within SLA' },
    { icon: 'fa-solid fa-star', iconBg: '#FFEDD5', color: '#F59E0B', label: '3. Interview to Offer', percent: 94, fraction: '17 / 18', subLabel: 'Within SLA' },
    { icon: 'fa-solid fa-user-check', iconBg: '#DCFCE7', color: '#22C55E', label: '4. Offer Release', percent: 93, fraction: '14 / 15', subLabel: 'Within SLA' },
  ];
  overallSlaCompliance = '94%';

  // ── Candidate Source Performance ──────────────────────────────────────────
  sourceTiles: SourceTile[] = [
    { name: 'LinkedIn', color: '#3B5BDB', stats: [
      { label: 'Added', value: 42 }, { label: 'Interviewed', value: 9 }, { label: 'Offered', value: 3 }, { label: 'Hired', value: 2 },
    ] },
    { name: 'Naukri', color: '#6D28D9', stats: [
      { label: 'Added', value: 58 }, { label: 'Interviewed', value: 10 }, { label: 'Offered', value: 4 }, { label: 'Hired', value: 3 },
    ] },
    { name: 'Employee Referral', color: '#15803D', stats: [
      { label: 'Added', value: 18 }, { label: 'Interviewed', value: 7 }, { label: 'Offered', value: 3 }, { label: 'Hired', value: 3 },
    ] },
    { name: 'Career Portal', color: '#EA580C', stats: [
      { label: 'Added', value: 22 }, { label: 'Interviewed', value: 5 }, { label: 'Offered', value: 1 }, { label: 'Hired', value: 1 },
    ] },
    { name: 'Others', color: '#0D9488', stats: [
      { label: 'Added', value: 10 }, { label: 'Interviewed', value: 1 }, { label: 'Offered', value: 0 }, { label: 'Hired', value: 0 },
    ] },
  ];
  sourceFootNote = 'Added / Interviewed / Offered / Hired counts per source';

  // ── Recruitment Funnel ────────────────────────────────────────────────────
  funnelStages: FunnelStageData[] = [
    { label: 'Applications Added', value: 425, color: '#3B82F6' },
    { label: 'Screened', value: 250, color: '#8B5CF6' },
    { label: 'Shortlisted', value: 120, color: '#F97316' },
    { label: 'Interviewed', value: 60, color: '#22C55E' },
    { label: 'Offers Released', value: 18, color: '#EF4444' },
    { label: 'Offers Accepted', value: 12, color: '#0D9488' },
    { label: 'Hired', value: 9, color: '#16A34A' },
  ];

  // ── Hiring Trend ───────────────────────────────────────────────────────────
  trendCategories = ['Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025'];
  trendSeries: LineSeriesInput[] = [
    { name: 'Hired', data: [10, 12, 15, 13, 14, 18], color: '#16A34A' },
    { name: 'Offers Released', data: [50, 55, 65, 60, 75, 85], color: '#F97316' },
    { name: 'Applications Added', data: [120, 135, 155, 145, 160, 190], color: '#8B5CF6' },
  ];

  async getDashboardCount(){

    const obj={
      "sortBy": "assignedAt",
  "direction": "DESC",
  "filters": {
   "recruiterId": "6",
   "fromDate": "2026-07-01",
   "toDate": "2026-07-31"
  }
    }
    
    const res: any = await this.dashboardService.getRecruiterPerformanceDashboardCount(obj);
    if (res.responsecode == '00') {
      const cardCount = res?.data?.dashboardCounts;
      const jobsList = res?.data?.assignments;


      this.cards = [
    {
      label: 'Assignments',
       value:cardCount?.totalAssignments,
      iconClass: 'fa-solid fa-briefcase',
      iconBgColor: '#DBEAFE',
      iconColor: '#3B82F6',
    },
    {
      label: 'Applications Added',
      value: cardCount?.applicationsAdded,
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#F3E8FF',
      iconColor: '#9333EA',
    },
    {
      label: 'Offers Released',
      value: cardCount?.offersReleased,
      iconClass: 'fa-solid fa-gift',
      iconBgColor: '#FFEDD5',
      iconColor: '#F97316',
    },
    {
      label: 'Hired',
      value: cardCount?.hired ?? 0,
      iconClass: 'fa-solid fa-user',
      iconBgColor: '#DCFCE7',
      iconColor: '#22C55E',
    },
    {
      label: 'SLA Compliance',
      value: '94%',
      iconClass: 'fa-solid fa-shield-halved',
      iconBgColor: '#DBEAFE',
      iconColor: '#2563EB',
    },
  ];
  
this.jobAssignments=this.jobAssignmentsList(jobsList);
console.log(this.jobAssignments)


    }


  }
  jobAssignmentsList(data:any){
    return data.map((item:any)=>({
        jobTitle: item.jobTitle, assignmentStatus: item.assignmentStatus, acceptedOn:item.acceptedOn, priority:item.priority, requestedOpenings:item.requestedOpenings, filled:item.filled, remaining:item.remaining, targetDate:item.targetDate, daysDue:item.daysLeft, slaStatus:item.sla,jobId:item.jobId,srId:item.srId
    }))
      
    
  }

}
