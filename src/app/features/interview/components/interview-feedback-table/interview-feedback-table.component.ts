import { Component, ViewChild, TemplateRef, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { InterviewServiceService } from '../../service/interview-service.service';

export interface InterviewFeedback {
  id: string;
  candidateInitials: string;
  candidateName: string;
  candidateId: string;
  jobTitle: string;
  department: string;
  round: string;
  roundLabel: string;
  interviewDate: string;
  interviewTime: string;
  priority: 'High' | 'Medium' | 'Low';
}
@Component({
  selector: 'app-interview-feedback-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './interview-feedback-table.component.html',
  styleUrl: './interview-feedback-table.component.scss',
})
export class InterviewFeedbackTableComponent implements OnInit, OnChanges {

  @Input() payload!: any;
  @Output() pageChange = new EventEmitter<number>();
  @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;
  private router = inject(Router);
  private interviewService = inject(InterviewServiceService);
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '180px' },
    { key: 'jobTitle', label: 'Job Title', custom: true, width: '190px' },
    { key: 'round', label: 'Round', custom: true, width: '170px' },
    { key: 'interviewDate', label: 'Interview Date', custom: true, width: '150px', sortable: true },
    { key: 'priority', label: 'Priority', custom: true, width: '110px' },
    { key: 'action', label: 'Action', custom: true, width: '160px', align: 'center' },
  ];

  sortableColumns = ['interviewDate'];

  feedBackList: any[] = [
    { id: '1', candidateInitials: 'RM', candidateName: 'Rahul Mehta', candidateId: 'NXH-1026', jobTitle: 'Data Scientist', department: 'Data Science', round: 'Technical Round 1', roundLabel: 'Round 1 of 4', interviewDate: '20 May 2026', interviewTime: '11:30 AM', priority: 'High' },
    { id: '2', candidateInitials: 'PS', candidateName: 'Priya Sharma', candidateId: 'NXH-1027', jobTitle: 'Backend Developer', department: 'Engineering', round: 'Technical Round 2', roundLabel: 'Round 2 of 3', interviewDate: '19 May 2026', interviewTime: '10:15 AM', priority: 'Medium' },
    { id: '3', candidateInitials: 'AR', candidateName: 'Arjun Rao', candidateId: 'NXH-1028', jobTitle: 'QA Engineer', department: 'Quality Assurance', round: 'Manager Round', roundLabel: 'Round 1 of 4', interviewDate: '18 May 2026', interviewTime: '04:20 PM', priority: 'High' },
    { id: '4', candidateInitials: 'SR', candidateName: 'Sneha Reddy', candidateId: 'NXH-1029', jobTitle: 'Product Manager', department: 'Product', round: 'Final Round', roundLabel: 'Round 5 of 5', interviewDate: '17 May 2026', interviewTime: '03:05 PM', priority: 'Low' },
    { id: '5', candidateInitials: 'VK', candidateName: 'Vikram Singh', candidateId: 'NXH-1030', jobTitle: 'DevOps Engineer', department: 'Engineering', round: 'Technical Round 1', roundLabel: 'Round 1 of 4', interviewDate: '16 May 2026', interviewTime: '02:45 PM', priority: 'Low' },
    { id: '6', candidateInitials: 'AN', candidateName: 'Ananya Iyer', candidateId: 'NXH-1031', jobTitle: 'UX Designer', department: 'Design', round: 'Technical Round 2', roundLabel: 'Round 2 of 3', interviewDate: '15 May 2026', interviewTime: '11:50 AM', priority: 'Medium' },
  ];

  totalItems = 6;
  currentPage = 1;
  pageSize = 10;
  ngOnInit(): void {
    // this.loadListData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload'] && this.payload) {
      this.loadListData();
    }
  }

  private async loadListData() {
    const payload = {...this.payload,sortBy:''};
    const res: any = await this.interviewService.getFeedBackList(payload);
    if (res?.responsecode == '00') {
      this.feedBackList = this.mapResponse(res?.data?.content);
      this.totalItems = res.data.totalElements;
    }
  }
  private mapResponse(data: any[]): any[] {
    return data.map((item: any) => ({
      id: item.applicationId,
      candidateInitials: this.getInitials(item.applicantName),
      candidateName: item.applicantName,
      candidateId: item.jobCode,
      jobTitle: item.jobTitle,
      department: item.department,
      round: item.currentStageType,
      interviewDate: this.formatDate(item.interviewDate),
      interviewTime: this.formatTime(item.endTime),
      priority: this.toTitleCase(item.sla)
    }));
  }
  

  private formatDate(date: string): string {
    if (!date) return '';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private formatTime(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  private toTitleCase(value: string): 'High' | 'Medium' | 'Low' {
    return (value?.charAt(0).toUpperCase() +
      value?.slice(1).toLowerCase()) as 'High' | 'Medium' | 'Low';
  }
  private getInitials(name: string): string {
    if (!name) return '';

    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
  avatarClass(i: string): string {
    const m: Record<string, string> = { RM: 'av-rm', PS: 'av-ps', AR: 'av-ar', SR: 'av-sr', VK: 'av-vk', AN: 'av-an' };
    return m[i] ?? 'av-default';
  }

  onPageChange(p: number): void { this.currentPage = p; }
  onRowClick(_r: InterviewFeedback): void { }

  handleProvide(row: any) {
    this.router.navigateByUrl(`/supply/my-interview-requests/provide-feedback/${row.id}`)
  }
}
