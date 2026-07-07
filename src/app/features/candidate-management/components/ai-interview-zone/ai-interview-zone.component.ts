import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipeLineStagesComponent } from "../../../../shared/components/pipe-line-stages/pipe-line-stages.component";
import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { aiInterview } from '../../../../shared/constants/reusbale-filter';
import { InterviewQuestionsTableComponent } from '../../../interview/components/interview-questions-table/interview-questions-table.component';
import { InterviewScheduleAiTableComponent } from '../../../interview/components/interview-schedule-ai-table/interview-schedule-ai-table.component';
import { InterviewUpcomingAiTableComponent } from '../../../interview/components/interview-upcoming-ai-table/interview-upcoming-ai-table.component';
import { InterviewServiceService } from '../../../interview/service/interview-service.service';

@Component({
  selector: 'app-ai-interview-zone',
  imports: [CommonModule, PipeLineStagesComponent, ApprovalLayoutComponent, InterviewQuestionsTableComponent, InterviewScheduleAiTableComponent, InterviewUpcomingAiTableComponent],
  templateUrl: './ai-interview-zone.component.html',
  styleUrl: './ai-interview-zone.component.scss',
})
export class AiInterviewZoneComponent implements OnInit {

  stages: any[] = [
    {
      id: 'qg',
      label: 'Generate AI Questions',
      icon: 'fa-solid fa-file-lines',
      count: 0,
      countColor: 'purple'
    },
    {
      id: 'is',
      label: 'Schedule AI Interview',
      icon: 'fa-solid fa-calendar-days',
      count: 0,
      countColor: 'blue'
    },
    {
      id: 'si',
      label: 'Upcoming AI Interview',
      icon: 'fa-solid fa-clock',
      count: 0,
      countColor: 'teal'
    }
  ];
  private readonly originalFilters = structuredClone(aiInterview);
  allFilters: any[] = structuredClone(aiInterview);
  displayFilters: any[] = [];
  activeStageId = 'qg';

  currentPage: any = 1;
  tableData: any[] = [];
  activeFilters: any = { dateFilter: '' };
  sortableColumns: string[] = ['name', 'jobTitle', 'lastUpdated', 'totalQuestions'];

  // Toggled off/on (via resetFilterUi) to force app-approval-layout to be
  // destroyed and recreated, so its own internal search/dropdown state
  // clears whenever the pipeline stage tab changes.
  showFilter = true;
  private interviewService = inject(InterviewServiceService)
  ngOnInit(): void {
    // this.setFiltersForStage();
    const state = history.state;

    if (state?.activeType) {
      this.activeStageId = state.activeType;
    } else {
      this.activeStageId = 'qg';
    }
    Promise.all([this.loadCardsCount(), this.loadJobs(), this.loadInterviewPlans()]).then(() => {
      this.setFiltersForStage();
    });
  }
  private async loadJobs() {
    const res: any = await this.interviewService.getAIInterviewZoneJobs();
    if (res?.responsecode == '00') {
      const fun = this.map(res?.data ?? {});
      // ✅ Update only allJobs key, preserve everything else in allFilters
      this.allFilters = this.allFilters.map((item: any) =>
        item.key === 'allJobs' ? { ...item, options: fun } : item
      );
    }
  }

  private async loadInterviewPlans() {
    const res: any = await this.interviewService.getAIInterviewPLANSLIST();
    if (res?.responsecode == '00') {
      const fun = this.map(res?.data ?? {});

      this.allFilters = this.allFilters.map((item: any) =>
        item.key === 'allInterviewPlans' ? { ...item, options: fun } : item
      );
    }
  }
  private map(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.name,
        label: item.name,
      }))
    ];
  }
  private async loadCardsCount() {
    const res: any = await this.interviewService.getAiInterviewZoneCounts();
    if (res?.responsecode == '00') {
      this.stages[0].count = res.data.generateAIQuestionsCount ?? 0;
      this.stages[1].count = res.data.scheduleAIInterviewCount ?? 0;
      this.stages[2].count = res.data.upcomingAIInterviewCount ?? 0;
    }
    else {
      console.log('error');
    }
  }

  onStageSelected(stage: any): void {
    this.activeStageId = stage.id;
    this.activeFilters = { dateFilter: '' };
    this.setFiltersForStage();
    this.resetFilterUi();
  }

  filterChange(event: any): void {
    this.activeFilters = event;
  }

  onRowClick(row: any): void {
    console.log('Row clicked:', row);
  }

  onSortChange(event: { col: string; dir: 'asc' | 'desc' }): void {
    console.log('Sort changed:', event);
  }

  private setFiltersForStage(): void {
    const filterMap: any = {
      qg: ['allJobs', 'allQuestion', 'dateFilter'],
      is: ['allJobs', 'allInterviewPlans', 'priority', 'dateFilter'],
      si: ['allJobs', 'dateFilter']
    };

    // ✅ Clone from allFilters which is rebuilt from originalFilters
    this.displayFilters = structuredClone(
      this.allFilters.filter((f: any) =>
        filterMap[this.activeStageId]?.includes(f.key)
      )
    );
  }


  private resetFilterUi(): void {
    this.showFilter = false;
    setTimeout(() => (this.showFilter = true));
  }
} 