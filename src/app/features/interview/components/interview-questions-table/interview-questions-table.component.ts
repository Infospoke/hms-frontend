import { Component, inject, input, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReusableTableComponent, TableColumn } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonModule } from '@angular/common';
import { InterviewServiceService } from '../../service/interview-service.service';
import { Router } from '@angular/router';
import { CanDirective } from '../../../../shared/directives/can.directive';

@Component({
  selector: 'app-interview-questions-table',
  imports: [ReusableTableComponent, CommonModule,CanDirective],
  templateUrl: './interview-questions-table.component.html',
  styleUrl: './interview-questions-table.component.scss',
})
export class InterviewQuestionsTableComponent implements OnInit, OnChanges {

  tableColumns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', width: '200px', custom: true },
    { key: 'jobTitle', label: 'Job Title', width: '130px' },

    { key: 'questionStatus', label: 'Question Status', width: '150px', custom: true },
    { key: 'totalQuestions', label: 'Total Questions', width: '100px', align: 'center' },
    { key: 'lastUpdated', label: 'Last Updated', width: '110px', custom: true },
    { key: 'actions', label: 'Actions', width: '150px', custom: true, align: 'center' },
  ];
  @Input() activeFilters: any;
  totalPages: any = 0;
  private router=inject(Router);
 
  tableData: any[] = []
  currentPage: any = 1;
  pageSize: any = 10;
  private interviewService = inject(InterviewServiceService)


  ngOnInit(): void {
    this.loadAIZoneData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['activeFilters'] &&
      !changes['activeFilters'].firstChange
    ) {
      console.log(this.activeFilters)
      this.loadAIZoneData();
    }
  }
  onRowClick(row: any): void {
    console.log('Row clicked:', row);
  }

  onSortChange(event: { col: string; dir: 'asc' | 'desc' }): void {
    console.log('Sort changed:', event);
  }

  private async loadAIZoneData() {
    try {
      const payload = this.buildRequestBody();
      const res: any = await this.interviewService.getAIInterviewZoneList(payload);

      if (res?.responsecode === '00') {

        this.tableData = res.data.content.map((item: any) => {
          const date = new Date(item.updatedDate);

          return {
            initials: item.applicantName
              ?.split(' ')
              .map((word: string) => word.charAt(0))
              .join('')
              .toUpperCase(),

            initialsColor: '#7c6fcd',

            name: item.applicantName || '-',
            email: item.email || '-',
            candidateId:item?.candidateId || '-',
            jobTitle: item.jobTitle || '-',

            questionStatus: item.questionStatus
              ? 'Questions Generated'
              : 'Questions Not Generated',

            statusType: item.questionStatus
              ? 'generated'
              : 'not-generated',

            totalQuestions: item.numberOfQuestions ?? 0,

            lastUpdatedDate: date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),

            lastUpdatedTime: date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),

            actionLabel: item.questionStatus
              ? 'Manage Questions'
              : 'Generate Questions',

            applicationId: item.applicationId
          };
        });


        this.totalPages = res.data.totalElements;
      } else {
        this.tableData = [];
      }

    } catch (error) {
      console.error('Error loading AI Zone data:', error);
      this.tableData = [];
    }
  }

  private buildRequestBody(): object {
    const f = this.activeFilters;
    const filters: Record<string, string> = {};

    if (f.chainName?.trim()) {
      filters['search'] = f.chainName.trim();
    }

    const dept = f?.['department'];
    if (dept) {
      filters['departmentId'] = dept;
    }
    const allJobs=f?.['allJobs'];
    if(allJobs){
      filters['jobTitle']=allJobs;
    }
    const reqBy = f?.['requestedBy'];
    if (reqBy) {
      filters['requestedBy'] = reqBy;
    }
    const questionStatus=f?.['questionStatus'];
    if(questionStatus){
      filters['questionStatus']=questionStatus;
    }


    const dateFilter = f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }



    return {
      page: this.currentPage - 1,   // API is 0-based
      size: this.pageSize,
      sortBy: 'createdDate',
      direction: 'DESC',
      filters,
    };
  }
  pageChange(data:any){
    console.log(data);
    this.currentPage=data;
    this.loadAIZoneData();
  }

  handleGenerateQuestions(applicationId: number): void {
    this.router.navigate(
      ['/candidate-management/ai-interview-zone/generate-ai-questions'],
      { queryParams: { applicationId } }
    );
  }
}
