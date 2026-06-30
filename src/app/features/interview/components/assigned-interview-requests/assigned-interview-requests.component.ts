import { Component, inject, OnInit } from '@angular/core';
import { PipeLineStagesComponent } from "../../../../shared/components/pipe-line-stages/pipe-line-stages.component";
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { CommonFilterComponent } from "../../../../shared/components/common-filter/common-filter.component";
import { TodayInterviewTableComponent } from "../today-interview-table/today-interview-table.component";
import { AssignedInterviewRequestsTableComponent } from "../assigned-interview-requests-table/assigned-interview-requests-table.component";
import { InterviewFeedbackTableComponent } from "../interview-feedback-table/interview-feedback-table.component";
import { CommonModule } from '@angular/common';
import { interviewPriority } from '../../../../shared/constants/reusbale-filter';
import { InterviewscheduledTableComponent } from "../interview-scheduled-table/interview-scheduled-table.component";
import { InterviewUpcommingTableComponent } from "../interview-upcomming-table/interview-upcomming-table.component";
import { InterviewServiceService } from '../../service/interview-service.service';

@Component({
  selector: 'app-assigned-interview-requests',
  imports: [
    PipeLineStagesComponent, HeadingComponent, CommonFilterComponent,
    TodayInterviewTableComponent, AssignedInterviewRequestsTableComponent,
    InterviewFeedbackTableComponent, CommonModule,
    InterviewscheduledTableComponent, InterviewUpcommingTableComponent
  ],
  templateUrl: './assigned-interview-requests.component.html',
  styleUrl: './assigned-interview-requests.component.scss',
})
export class AssignedInterviewRequestsComponent implements OnInit {
  interviewPriority = interviewPriority;

  stages: any[] = [
    { id: 'ti', label: "Today's Interviews", icon: 'fa-solid fa-calendar-check', count: 0, countLabel: 'Candidates', countColor: 'green' },
    { id: 'ar', label: 'Assigned Interview Requests', icon: 'fa-solid fa-file-lines', count: 0, countLabel: 'Candidates', countColor: 'purple' },
    { id: 'ts', label: 'To Schedule', icon: 'fa-solid fa-calendar-days', count: 0, countLabel: 'Candidates', countColor: 'blue' },
    { id: 'ui', label: 'Upcoming Interviews', icon: 'fa-solid fa-clock', count: 0, countLabel: 'Candidates', countColor: 'teal' },
    { id: 'fp', label: 'Feedback Pending', icon: 'fa-solid fa-user', count: 0, countLabel: 'Candidates', countColor: 'amber' },
  ];

  stageMeta = [
    { id: 'ti', heading: "Today's Interviews", subHeading: 'View and conduct interviews scheduled for today.' },
    { id: 'ar', heading: 'Assigned Interview Requests', subHeading: 'Review and manage interview requests assigned to you.' },
    { id: 'ts', heading: 'To Schedule', subHeading: 'Schedule interviews for candidates awaiting assignment.' },
    { id: 'ui', heading: 'Upcoming Interviews', subHeading: 'Track and prepare for upcoming interview sessions.' },
    { id: 'fp', heading: 'Feedback Pending', subHeading: 'Submit interview feedback and evaluation results.' },
  ];

  private interviewService = inject(InterviewServiceService);

  activeStageId = 'ti';

  // ── Filter / pagination state ──────────────────────────────────────────────
  private lastFilterPayload: any = {
    filters: {
      priority: '',
      dateFilter: 'thisMonth'
    }
  };
  currentPage = 1;
  pageSize = 10;

  tablePayload: object = this.buildRequestBody();

  ngOnInit(): void {
    const state = history.state;

    if (state?.activeType) {
      this.activeStageId = state.activeType;
    } else {
      this.activeStageId = 'ti';
    }

    this.tablePayload = this.buildRequestBody();
    this.loadCount();
  }

  get searchPlaceholder():any{
    return this.activeStageId=='ar' ? 'Search by Job Title,Department':'Search by Candidate name,Job Title'
  }
  get activeFilters() {
    const noPriorityStages = ['ti', 'ui'];
    return noPriorityStages.includes(this.activeStageId)
      ? this.interviewPriority.filter((f: any) => f.key !== 'priority')
      : this.interviewPriority;
  }

  filterChange(data: any): void {
    this.lastFilterPayload = data;
    this.currentPage = 1;           // reset to page 1 on new filter
    this.tablePayload = this.buildRequestBody();
  }

  // ── Stage selection ────────────────────────────────────────────────────────
  onStageSelected(stage: any): void {
    this.activeStageId = stage.id;
    this.currentPage = 1;
    this.tablePayload = this.buildRequestBody();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.tablePayload = this.buildRequestBody();
  }

  // ── Payload builder ───────────────────────────────────────────────────────
  private buildRequestBody(): object {
    const f = this.lastFilterPayload;
    const filters: Record<string, string> = {};

    // Search (top-level)
    if (f?.search?.trim()) {
      filters['search'] = f.search.trim();
    }
    console.log(f);
    // Nested filters object
    const nested = f?.filters ?? {};

    // Priority
    if (nested['priority']) {
      filters['priority'] = nested['priority'];
    }

    // Date filter
    const dateFilter = nested['dateFilter'] || f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f?.['fromDate']) filters['fromDate'] = nested['fromDate'] || f?.['fromDate'];
      if (f?.['toDate']) filters['toDate'] = nested['toDate'] || f?.['toDate'];
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      direction: 'DESC',
      filters,
    };
  }

  // ── Count ─────────────────────────────────────────────────────────────────
  private async loadCount() {
    try {
      const res: any = await this.interviewService.getInterviewAssignementCount();
      if (res?.responsecode === '00') {
        const countMap: Record<string, number> = {
          ti: res.data.todaysInterviews,
          ar: res.data.assignedInterviewRequests,
          ts: res.data.toSchedule,
          ui: res.data.upcoming,
          fp: res.data.Feedback,
        };
        this.stages.forEach(s => s.count = countMap[s.id] ?? 0);
      }
    } catch (err) {
      console.error(err);
    }
  }

  get selectedStageMeta() {
    return this.stageMeta.find(x => x.id === this.activeStageId);
  }


  
}