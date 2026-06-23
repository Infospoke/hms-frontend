import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CandidateData {
  // Basic / header
  firstName: string;
  lastName: string;
  currentRole?: string;
  candidateId?: string;
  email?: string;
  phone?: string;
  currentLocation?: string;
  noticePeriod?: string;
  currentCompany?: string;
  totalExperience?: string;
  stage?: string;
  profileUrl?: string;

  // ── Personal tab (flat — mapped from personal_details) ──────────
  dateOfBirth?: string;
  age?: string;
  gender?: string;
  nationality?: string;
  languages?: string[];     // personal_languages_known
  address?: string;

  // ── Education tab ───────────────────────────────────────────────
  // Preferred: array of entries from API
  education?: {
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
    percentage: string;
  }[];
  // Fallback flat fields (kept for legacy support)
  degree?: string;
  university?: string;
  yearOfPassing?: string;
  cgpa?: string;

  // ── Experience tab ──────────────────────────────────────────────
  experience?: {
    totalExperience?: string;
    relevantExperience?: string;
    companiesWorked?: string;
    averageTenure?: string;
    details?: {
      jobTitle?: string;
      company?: string;
      startDate?: string;
      endDate?: string;
      description?: string[];
    }[] | undefined;
    timeLine?: string[];
    companyDetails?: string[];
  } | undefined;
  currentCtc?: string;
  expectedCtc?: string;

  // ── Projects tab ────────────────────────────────────────────────
  projects?: {
    name?: string;
    title?: string;
    description: string | string[];
    techStack?: string[];
    startDate?: string;
    endDate?: string;
  }[];

  // ── Certifications tab ──────────────────────────────────────────
  certifications?: string[];
}

@Component({
  selector: 'app-interview-candidate-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './interview-candidate-info.component.html',
  styleUrl: './interview-candidate-info.component.scss',
})
export class InterviewCandidateInfoComponent implements OnInit {
  @Input() candidate: CandidateData = { firstName: '', lastName: '' };

  @Input() tabs: any[] = [];

  activeTab: 'personal' | 'education' | 'experience' | 'projects' | 'certifications' = 'personal';

  get initials(): string {
    const f = this.candidate.firstName?.[0] ?? '';
    const l = this.candidate.lastName?.[0] ?? '';
    return (f + l).toUpperCase();
  }

  get fullName(): string {
    return `${this.candidate.firstName} ${this.candidate.lastName}`.trim();
  }

  setTab(key: string): void {
    this.activeTab = key as any;
  }

  // ── Template helpers for project description (string | string[]) ──
  isString(val: any): val is string {
    return typeof val === 'string';
  }

  isArray(val: any): val is any[] {
    return Array.isArray(val);
  }

  ngOnInit(): void {}
}