import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { JobInfoCardComponent, JobInfo } from '../job-info-card/job-info-card.component';
import { InterviewServiceService } from '../../service/interview-service.service';

export interface RoundResponse {
  id: string;
  label: string;
  colorClass: string;
  name: string;
  description: string;
  durationMins: number;
  interviewer: { name: string; role: string; avatar: string };
  response: 'Accepted' | 'Rejected' | 'Pending';
  comments: string;
  respondedOn: string;
  respondedTime: string;
}

/** Color palette cycled per round index */
const ROUND_COLORS = ['blue', 'purple', 'orange', 'green', 'teal', 'pink'];

/** Maps API status string to display value */
function mapStatus(status: string): 'Accepted' | 'Rejected' | 'Pending' {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED': return 'Accepted';
    case 'REJECTED': return 'Rejected';
    default: return 'Pending';
  }
}

/** Formats an ISO/date string into { date, time } display strings */
function formatRespondedAt(respondedAt: string | null): { date: string; time: string } {
  if (!respondedAt) return { date: '—', time: '' };
  const d = new Date(respondedAt);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

@Component({
  selector: 'app-view-assign-recruter-response',
  standalone: true,
  imports: [CommonModule, HeadingComponent, ReusableTableComponent, JobInfoCardComponent],
  templateUrl: './view-assign-recruter-response.component.html',
  styleUrl: './view-assign-recruter-response.component.scss',
})
export class ViewAssignRecruterResponseComponent implements OnInit {

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading = true;
  errorMessage: string | null = null;

  job: JobInfo = {
    title: '',
    id: '',
    status: 'Active',
    department: '',
    planName: '',
    totalRounds: 0,
    createdOn: '',
  };

  responses: RoundResponse[] = [];

  // ── Table columns ─────────────────────────────────────────────────────────
  columns: TableColumn[] = [
    { key: 'round', label: 'Round & Type', width: '250px', custom: true },
    { key: 'interviewer', label: 'Interviewer', width: '180px', custom: true },
    { key: 'response', label: 'Response', width: '130px', custom: true, align: 'center' },
    { key: 'comments', label: 'Comments', width: '200px' },
    { key: 'respondedOn', label: 'Responded On', width: '130px', custom: true },
  ];

  private router = inject(Router);
  private interviewService = inject(InterviewServiceService);

  // ── Computed ──────────────────────────────────────────────────────────────
  get hasRejection(): boolean {
    return this.responses.some(r => r.response === 'Rejected');
  }

  get rejectedCount(): number {
    return this.responses.filter(r => r.response === 'Rejected').length;
  }
  id: any;
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadResponse();
  }

  async loadResponse(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = null;
      const state = this.router.getCurrentNavigation()?.extras?.state
        ?? history.state;
      console.log(state);
      const id = state?.['id'] ?? state?.['assignmentId'];
      this.id = id;
      if (!id) {
        this.errorMessage = 'No assignment ID found. Please go back and try again.';
        return;
      }

      const res = await this.interviewService.getInterviewAssignmentDetails(id);

      if (res?.responsecode !== '00' || !res?.data) {
        this.errorMessage = res?.message ?? 'Failed to load response data.';
        return;
      }

      this.mapApiResponse(res.data);
    } catch (err) {
      console.error('Failed to load assignment details', err);
      this.errorMessage = 'Something went wrong while fetching the data.';
    } finally {
      this.isLoading = false;
    }
  }

  private mapApiResponse(data: any): void {
    let assign: any = localStorage.getItem('jobAssigned')
    const jobData: any = JSON.parse(assign);
    console.log(jobData);
    this.job = {
      title: jobData.jobTitle ?? 'N/A',
      id: ``,
      status: '',
      department: jobData.deptName ?? 'N/A',
      planName: jobData.planName ?? 'N/A',
      totalRounds: data.rounds?.length ?? 0,
      createdOn: jobData?.createdAt,
    };

    this.responses = (data.rounds ?? []).map((round: any, index: number) => {
      const history: any[] = round.assignmentHistory ?? [];
      const current = history[0] ?? {};

      const { date, time } = formatRespondedAt(current.respondedAt ?? null);

      return {
        id: String(round.roundId),
        label: `R${index + 1}`,
        colorClass: ROUND_COLORS[index % ROUND_COLORS.length],
        name: round.stageName ?? `Round ${index + 1}`,
        description: round.stageType ?? '',
        durationMins: 0,                         // not in API — hide if 0
        interviewer: {
          name: current.interviewerName ?? 'Unassigned',
          role: current.roleName ?? '',
          avatar: '',
        },
        response: mapStatus(current.status),
        comments: current.comments ?? '—',
        respondedOn: date,
        respondedTime: time,
      } satisfies RoundResponse;
    });
  }

  onReassignInterviewer(): void {
    const assign = localStorage.getItem('jobAssigned');

    if (!assign) return;

    const jobData = JSON.parse(assign);

    localStorage.setItem('details', JSON.stringify(jobData));
    console.log(this.id,'reassign')
    this.router.navigate(
      ['/demand/assign-interviewers/new-assign'],
      {
        state: {
          id: this.id,
          type: 'reassign'
        }
      }
    );
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}