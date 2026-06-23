import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";

export interface Interview {
  id: string;
  interviewId: string;
  round: string;
  roundNumber: number;
  totalRounds: number;
  candidateName: string;
  candidateInitials: string;
  candidateId: string;
  jobTitle: string;
  jobLevel: string;
  department: string;
  roundLabel: string;
  scheduleDate: string;
  scheduleTime: string;
  type: 'Online' | 'Office';
  location: string;
  meetLink?: string;
}
 
@Component({
  selector: 'app-interview-upcomming-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './interview-upcomming-table.component.html',
  styleUrl: './interview-upcomming-table.component.scss',
})
export class InterviewUpcommingTableComponent {
    @Input() payload!: any;
  @Output() pageChange = new EventEmitter<number>();
   @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;
  private router=inject(Router);
  columns: TableColumn[] = [
    { key: 'interview', label: 'Interview Detail', custom: true, width: '100px' },
    { key: 'candidate', label: 'Candidate', custom: true, width: '160px' },
    { key: 'job', label: 'Job & Round', custom: true, width: '190px' },
    { key: 'schedule', label: 'Schedule', custom: true, width: '170px' },
    { key: 'typeLocation', label: 'Type & Location', custom: true, width: '200px' },
    { key: 'action', label: 'Action', custom: true, align: 'center', width: '130px' }
  ];
 
  interviews: Interview[] = [
    {
      id: '1',
      interviewId: 'INT-2025-0196',
      round: '1st Round',
      roundNumber: 1,
      totalRounds: 2,
      candidateName: 'Sneha Priya',
      candidateInitials: 'SP',
      candidateId: 'NXH-1026',
      jobTitle: 'Quality Assurance Engineer – L2',
      jobLevel: 'Quality Assurance',
      department: 'QA',
      roundLabel: 'Round 1 of 2',
      scheduleDate: 'May 20, 2025',
      scheduleTime: '11:30 AM – 12:00 PM',
      type: 'Online',
      location: 'Google Meet',
      meetLink: 'meet.google.com/abc-defg-hij'
    },
    {
      id: '2',
      interviewId: 'INT-2025-0197',
      round: '2nd Round',
      roundNumber: 2,
      totalRounds: 2,
      candidateName: 'Mohit Tiwari',
      candidateInitials: 'MT',
      candidateId: 'NXH-1027',
      jobTitle: 'Backend Developer – L3',
      jobLevel: 'Engineering',
      department: 'Eng',
      roundLabel: 'Round 2 of 2',
      scheduleDate: 'May 20, 2025',
      scheduleTime: '10:15 AM – 11:00 AM',
      type: 'Online',
      location: 'Google Meet',
      meetLink: 'meet.google.com/xyz-abcd-k12'
    },
    {
      id: '3',
      interviewId: 'INT-2025-0198',
      round: '1st Round',
      roundNumber: 1,
      totalRounds: 1,
      candidateName: 'Kavya Bansal',
      candidateInitials: 'KB',
      candidateId: 'NXH-1028',
      jobTitle: 'Business Analyst – L2',
      jobLevel: 'Product',
      department: 'Prod',
      roundLabel: 'Round 1 of 1',
      scheduleDate: 'May 19, 2025',
      scheduleTime: '04:20 PM – 05:00 PM',
      type: 'Office',
      location: 'Nexus Tech Park, 5th Floor, Interview Room 2, Bellandur Outer Ring Road, Bangalore, Karnataka 560103'
    },
    {
      id: '4',
      interviewId: 'INT-2025-0199',
      round: '1st Round',
      roundNumber: 1,
      totalRounds: 1,
      candidateName: 'Arjun Desai',
      candidateInitials: 'AD',
      candidateId: 'NXH-1029',
      jobTitle: 'DevOps Engineer – L2',
      jobLevel: 'Engineering',
      department: 'Eng',
      roundLabel: 'Round 1 of 1',
      scheduleDate: 'May 19, 2025',
      scheduleTime: '03:05 PM – 03:50 PM',
      type: 'Online',
      location: 'Google Meet',
      meetLink: 'meet.google.com/def-ghij-kl'
    },
    {
      id: '5',
      interviewId: 'INT-2025-0200',
      round: '2nd Round',
      roundNumber: 2,
      totalRounds: 2,
      candidateName: 'Neha Reddy',
      candidateInitials: 'NR',
      candidateId: 'NXH-1030',
      jobTitle: 'UI/UX Designer – L2',
      jobLevel: 'Design',
      department: 'Des',
      roundLabel: 'Round 2 of 2',
      scheduleDate: 'May 18, 2025',
      scheduleTime: '02:45 PM – 03:30 PM',
      type: 'Office',
      location: 'Nexus Tech Park, 6th Floor, Conference Room A, Bellandur Outer Ring Road, Bangalore, Karnataka 560103'
    }
  ];
 
  totalItems = 5;
  currentPage = 1;
  pageSize = 10;
  showPagination = true;
 
  expandedRow: string | null = null;
 
  getRoundColor(round: string): string {
    if (round.includes('1st')) return 'badge--first';
    if (round.includes('2nd')) return 'badge--second';
    if (round.includes('3rd')) return 'badge--third';
    return 'badge--default';
  }
 
  toggleExpand(id: string): void {
    this.expandedRow = this.expandedRow === id ? null : id;
  }
 
  onRowClick(row: Interview): void {
    // handle row click
  }
  handleview(row:any){
    this.router.navigateByUrl('/supply/my-interview-requests/reschedule-interview')
  }
 
  onPageChange(page: number): void {
    this.currentPage = page;
  }
}
