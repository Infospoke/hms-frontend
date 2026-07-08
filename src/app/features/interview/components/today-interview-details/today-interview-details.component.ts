import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";

import { NzModalService } from 'ng-zorro-antd/modal';

import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobService } from '../../../job/services/job.service';
import { ConfirmModalComponent } from '../../../../shared/components/modal-component/confirm-modal.component';

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
  meetingUrl: string;
  jobId: any;
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
  imports: [CommonModule, HeadingComponent, NzModalModule],
  templateUrl: './today-interview-details.component.html',
  styleUrl: './today-interview-details.component.scss',
})
export class TodayInterviewDetailsComponent implements OnInit {
  isLoading = true;
  error: string | null = null;
  private router = inject(Router);
  private modal = inject(NzModalService);
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
    meetingUrl: '',
    jobId: '',
  };
  applicantionId: any;
  experiences: Experience[] = [];
  totalExperience = '';
  currentCompany = '';
  currentRole = '';
  currentStageType: any;
  projects: Project[] = [];
  private interviewService = inject(InterviewServiceService)
  interviewCompletedOn: any;
  resumeDocument: CandidateDocument | null = null;
  private notificationService = inject(NotificationService)
  private sanitizer = inject(DomSanitizer);

  // PDF preview modal state
  isPdfVisible = false;
  pdfUrl: SafeResourceUrl | null = null;
  private pdfObjectUrl: string | null = null; // raw blob url, kept so we can revoke it
  isResumeLoading = false;
  private jobService = inject(JobService);
  interviewRound:any;
  constructor(
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.applicantionId = id;
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




  private mapInterviewData(data: any): void {
    this.currentStageType = data.currentStageType;
    this.interviewRound=data?.InterviewRound;
    this.interviewCompletedOn = data.interviewCompletedOn;
    this.interviewInfo = {
      interviewId: data.interviewId ?? '',
      jobId: data.jobId ?? '',
      jobTitle: data.jobTitle ?? '',
      interviewType: data.InterviewType ?? data.interviewType ?? '',
      scheduledTime: this.formatScheduledTime(data.scheduleDate, data.scheduleTime),
      candidateName: data.candidateName ?? '',
      department: data.department ?? '',
      interviewMode: data.InterviewMode ?? data.interviewMode ?? '',
      duration: data.duration ?? '',
      candidateId: data.candidateId ?? '',
      meetingUrl: data?.meetingPlatForm,
      interviewRound:
        data.InterviewRound !== undefined && data.InterviewRound !== null
          ? String(data.InterviewRound)
          : (data.interviewRound ?? ''),
      meetingPlatform: data.meetingPlatform ?? 'Google Meet',
    };

    this.totalExperience = data.totalExperience ?? '';
    this.currentCompany = data.currentCompany ?? '';
    this.currentRole = data.designation ?? data.currentRole ?? '';
    this.experiences = data.experienceDetails ?? data.experiences ?? [];
    this.projects = data.projectDetails ?? data.projects ?? [];

    // Only pick out the resume - portfolio & certifications are intentionally dropped.
    const resumeSource =
      data.resume ?? (data.documents ?? []).find((doc: any) => doc?.name?.toLowerCase() === 'resume');

    // The resume card is always shown by default (as long as the candidate has an
    // application id) - the actual PDF bytes are fetched on demand via
    // viewResume()/downloadResume() using the appId + action, not from a stored url.
    this.resumeDocument = this.applicantionId
      ? {
        name: resumeSource?.name ?? 'Resume',
        type: resumeSource?.type ?? 'PDF',
        size: resumeSource?.size ?? '',
        color: resumeSource?.color ?? '#e53935',
        url: resumeSource?.url ?? resumeSource?.downloadUrl ?? '',
      }
      : null;
  }

  /** Combines the separate scheduleDate + scheduleTime API fields into one readable string. */
  private formatScheduledTime(date?: string, time?: string): string {
    if (!date && !time) return '';
    if (date && time) {
      const parsed = new Date(`${date}T${time}`);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
      return `${date} ${time}`;
    }
    return date || time || '';
  }


  onViewJobDetails() {
    console.log('Navigating to job details for jobId:', this.interviewInfo?.jobId);
    this.router.navigate([`/candidate-management/in-person-interview/response/${this.applicantionId}/${this.interviewInfo?.jobId}`,]);
  }
  onStartInterview(): void {
    if (!this.interviewInfo.meetingUrl) {
      this.notificationService.warning('Meeting link is not available.');
      return;
    }

    window.open(this.interviewInfo.meetingUrl, '_blank', 'noopener,noreferrer');
  }
  onCompleteClick(): void {
    const modal = this.modal.create<ConfirmModalComponent>({
      nzContent: ConfirmModalComponent,
      nzData: { mode: 'complete-interview' },
      nzClassName: 'custom-confirm-modal custom-edit-modal',
      nzFooter: null,
      nzCentered: true,
      nzWidth: 360,
      nzClosable: false,
    });

    modal.afterClose.subscribe((result: string) => {
      if (result === 'confirm') {
        this.onComplete();
      }
    });
  }
  async onComplete() {
    const payload = {
      applicantId: this.applicantionId,
      "currentStageType": this.interviewRound,
      interviewCompletedOn: new Date().toISOString(),
      interviewCompleted: true
    }
    const res: any = await this.interviewService.updateInterviewCandidate(payload);
    if (res?.responsecode === '00') {
      this.notificationService.success(res?.message || res?.responsemessage || 'Interview marked as completed successfully.');
      this.onCancel();
      // this.loadInterviewDetails(this.applicantionId);
    } else {
      this.notificationService.error(res?.message || 'Failed to mark interview as completed.');
    }
  }
  onCancel() {
    this.router.navigate(['candidate-management/in-person-interview']);
  }


  /** Opens the resume PDF in the in-page preview modal (?type=resume&appId=..&action=view). */
  async onViewResume(): Promise<void> {
    if (!this.applicantionId) {
      this.notificationService.warning('Candidate application was not found.');
      return;
    }

    this.isResumeLoading = true;
    this.isPdfVisible = true;
    this.pdfUrl = null;

    try {
      const res: any = await this.jobService.viewResume('resume', this.applicantionId, 'view');
      this.setPdfPreview(res);
    } catch (err) {
      console.error('Error fetching resume', err);
      this.notificationService.error('Failed to load the resume preview.');
      this.isPdfVisible = false;
    } finally {
      this.isResumeLoading = false;
    }
  }

  /** Fetches the resume as a blob (?type=resume&appId=..&action=download) and saves it locally. */
  async onDownloadResume(): Promise<void> {
    if (!this.applicantionId) {
      this.notificationService.warning('Candidate application was not found.');
      return;
    }

    try {
      const res: any = await this.jobService.viewResume('resume', this.applicantionId, 'download');
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      console.log(this.resumeDocument?.name || this.interviewInfo || 'resume');
      link.download = (this.resumeDocument?.name || this.interviewInfo?.candidateName || 'resume') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading resume', err);
      this.notificationService.error('Failed to download the resume.');
    }
  }

  /** Builds a blob url from the PDF bytes and hands a sanitized version to the iframe. */
  private setPdfPreview(res: any): void {
    this.revokePdfObjectUrl();

    const blob = new Blob([res], { type: 'application/pdf' });
    const objectUrl = window.URL.createObjectURL(blob);
    this.pdfObjectUrl = objectUrl;

    const safeUrl = objectUrl + '#toolbar=0&navpanes=0&scrollbar=0';
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
  }

  onPdfModalClose(): void {
    this.isPdfVisible = false;
    this.pdfUrl = null;
    this.revokePdfObjectUrl();
  }

  private revokePdfObjectUrl(): void {
    if (this.pdfObjectUrl) {
      window.URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
  }

  /** Displays a friendly placeholder for any field the API didn't return. */
  display(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return 'Not Mentioned';
    return String(value);
  }
}