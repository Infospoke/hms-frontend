import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CandidateData {
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
  // Personal tab
  dateOfBirth?: string;
  age?: string;
  gender?: string;
  nationality?: string;
  languages?: string[];
  address?: string;
  // Education tab
  degree?: string;
  university?: string;
  yearOfPassing?: string;
  cgpa?: string;
  // Experience tab
  currentCtc?: string;
  expectedCtc?: string;
  // Projects & Certifications
  projects?: any[];
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

  activeTab: 'personal' | 'education' | 'experience' | 'projects' | 'certifications' = 'personal';

  @Input() tabs:any[] = [
   
  ];

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

  ngOnInit(): void {}
}