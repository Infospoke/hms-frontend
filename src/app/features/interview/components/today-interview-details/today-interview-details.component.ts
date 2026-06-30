import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";


import { InterviewServiceService } from '../../service/interview-service.service';

interface InterviewInfo {
  interviewId: string;
  jobTitle: string;
  interviewType: string;
  scheduledTime: string;
  candidateName: string;
  department: string;
  interviewMode: string;
  duration: string;
  candidateId: string;
  interviewRound: string;
  meetingPlatform: string;
}

interface Experience {
  years: string;
  currentCompany: string;
  currentRole: string;
  company: string;
  role: string;
  duration: string;
}

interface Project {
  name: string;
  role: string;
  technologies: string;
  description: string;
}

interface CandidateDocument {
  name: string;
  type: string;
  size: string;
  color: string;
  url: string;
}

@Component({
  selector: 'app-today-interview-details',
  standalone: true,
  imports: [CommonModule, HeadingComponent],
  templateUrl: './today-interview-details.component.html',
  styleUrl: './today-interview-details.component.scss',
})
export class TodayInterviewDetailsComponent implements OnInit {
  isLoading = true;
  error: string | null = null;

  interviewInfo: InterviewInfo = {
    interviewId: '',
    jobTitle: '',
    interviewType: '',
    scheduledTime: '',
    candidateName: '',
    department: '',
    interviewMode: '',
    duration: '',
    candidateId: '',
    interviewRound: '',
    meetingPlatform: '',
  };

  experiences: Experience[] = [];
  totalExperience = '';
  currentCompany = '';
  currentRole = '';

  projects: Project[] = [];
  private interviewService=inject(InterviewServiceService)

  resumeDocument: CandidateDocument | null = null;

  constructor(
    private route: ActivatedRoute,
  
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.isLoading = false;
      this.error = 'Interview ID was not found in the route.';
      return;
    }

    this.loadInterviewDetails(id);
  }

  private async loadInterviewDetails(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.interviewService.getTodayInterviewDetails(id);

      if (response?.responsecode === '00' && response?.data) {
        this.mapInterviewData(response.data);
      } else {
        this.error = response?.message || 'Failed to load interview details.';
      }
    } catch (err) {
      console.error('Error fetching interview details', err);
      this.error = 'Something went wrong while loading interview details.';
    } finally {
      this.isLoading = false;
    }
  }

  

  // Maps the API payload (response.data) onto the view model.
  // Field names assume the same shape as InterviewInfo / Experience / Project below -
  // adjust the property names here if your backend uses different keys.
  private mapInterviewData(data: any): void {
    this.interviewInfo = {
      interviewId: data.interviewId ?? '',
      jobTitle: data.jobTitle ?? '',
      interviewType: data.interviewType ?? '',
      scheduledTime: data.scheduledTime ?? '',
      candidateName: data.candidateName ?? '',
      department: data.department ?? '',
      interviewMode: data.interviewMode ?? '',
      duration: data.duration ?? '',
      candidateId: data.candidateId ?? '',
      interviewRound: data.interviewRound ?? '',
      meetingPlatform: data.meetingPlatform ?? 'Google Meet',
    };

    this.totalExperience = data.totalExperience ?? '';
    this.currentCompany = data.currentCompany ?? '';
    this.currentRole = data.currentRole ?? '';
    this.experiences = data.experiences ?? [];
    this.projects = data.projects ?? [];

    // Only pick out the resume - portfolio & certifications are intentionally dropped.
    const resumeSource =
      data.resume ?? (data.documents ?? []).find((doc: any) => doc?.name?.toLowerCase() === 'resume');

    this.resumeDocument = resumeSource
      ? {
          name: resumeSource.name ?? 'Resume',
          type: resumeSource.type ?? 'PDF',
          size: resumeSource.size ?? '',
          color: resumeSource.color ?? '#e53935',
          url: resumeSource.url ?? resumeSource.downloadUrl ?? '',
        }
      : null;
  }

  onBack() {}
  onViewJobDetails() {}
  onStartInterview() {}
  onComplete() {}
  onCancel() {}

  onViewResume(): void {
    if (this.resumeDocument?.url) {
      window.open(this.resumeDocument.url, '_blank');
    }
  }

  onDownloadResume(): void {
    if (!this.resumeDocument?.url) {
      return;
    }
    const link = document.createElement('a');
    link.href = this.resumeDocument.url;
    link.download = this.resumeDocument.name || 'resume';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}