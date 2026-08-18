import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AssignedBy {
  name: string;
  role: string;
}

export interface JobInfo {
  // ── Original fields ───────────────────────────────
  title: string;
  id: string;
  status: string;
  department: string;
  planName: string;
  totalRounds: number;
  createdOn: string;

  // ── Detail / interview fields (all optional) ──────
  roundTitle?: string;      // e.g. "Round 1: Technical Assessment"
  roundType?: string;       // e.g. "Technical"
  interviewType?: string;   // e.g. "Technical Interview"
  interviewMode?: string;   // e.g. "Online (Google Meet)"
  assignedOn?: string;      // e.g. "12 May 2024"
  responseDue?: string;     // e.g. "14 May 2024"
  daysLeft?: number;        // triggers red colour when <= 3
  assignedBy?: AssignedBy;  // { name, role }
}

@Component({
  selector: 'app-job-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-info-card.component.html',
  styleUrl: './job-info-card.component.scss',
})
export class JobInfoCardComponent {
  @Input({ required: true }) job!: JobInfo;

 
  @Input() detailMode?: boolean;

  get isDetailMode(): boolean {
    if (this.detailMode !== undefined) return this.detailMode;
    return !!(
      this.job?.roundTitle ||
      this.job?.interviewType ||
      this.job?.interviewMode ||
      this.job?.assignedOn ||
      this.job?.assignedBy
    );
  }

  /** "Venkat Reddy" → "VR", "Alice" → "A" */
  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  get isDueSoon(): boolean {
    return this.job.daysLeft !== undefined &&
           this.job.daysLeft !== null &&
           this.job.daysLeft <= 3;
  }

  get dueLabelSuffix(): string {
    if (this.job.daysLeft !== undefined && this.job.daysLeft !== null) {
      return ` (${this.job.daysLeft} day${this.job.daysLeft === 1 ? '' : 's'} left)`;
    }
    return '';
  }
}