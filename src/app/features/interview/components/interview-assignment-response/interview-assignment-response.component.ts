import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { JobInfoCardComponent } from '../job-info-card/job-info-card.component';
import { InterviewCandidateInfoComponent } from '../interview-candidate-info/interview-candidate-info.component';
import { JobDetailsComponent } from '../job-details/job-details.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { CommonModalComponent } from '../../../../shared/components/common-modal/common-modal.component'; // adjust path

@Component({
  selector: 'app-interview-assignment-response',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeadingComponent,
    JobInfoCardComponent,
    InterviewCandidateInfoComponent,
    JobDetailsComponent,
    CommonModalComponent,   // ← add
  ],
  templateUrl: './interview-assignment-response.component.html',
  styleUrl: './interview-assignment-response.component.scss',
})
export class InterviewAssignmentResponseComponent implements OnInit {

  job: any = null;
  isLoading = true;
  hasError = false;
  assignmentId: any;

  // ── Modal state ────────────────────────────────────────────────────────────
  showCommentModal = false;
  isSubmitting = false;
  commentModalAction: 'approve' | 'reject' | null = null;

  modalConfig: any = {};


  jobData: any = {
    nameOfJob: 'Software Engineer',
    jobCode: 'JOB-2024-0132',
    department: 'Engineering',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceRequired: '3 - 5 Years',
    location: 'Bangalore, India',
    salaryRange: '₹12 – ₹18 LPA',
    workType: 'Permanent',
    description: 'Looking for a Software Engineer to design, develop, and maintain scalable web applications.',
    responsibilities: [
      'Build and maintain scalable web applications.',
      'Collaborate with product managers, designers and other engineers.',
      'Write clean, well-tested and documented code.',
      'Optimise applications for maximum speed and scalability.',
      'Participate in code reviews and provide constructive feedback.',
    ],
    qualifications: [
      "Bachelor's degree in Computer Science or related field.",
      '3+ years of experience in software development.',
      'Strong problem-solving skills and data structures knowledge.',
    ],
    mustHaveSkills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Git'],
    niceToHaveSkills: ['Angular', 'GraphQL', 'AWS', 'Docker', 'Kubernetes', 'Microservices'],
    certifications: ['AWS Certified Developer', 'Scrum Professional Developer', 'Microsoft Azure Developer'],
  };

  candidateData: any = {
    firstName: 'Arjun',
    lastName: 'Sharma',
    currentRole: 'Senior Frontend Developer',
    candidateId: 'CAND-2024-0456',
    email: 'arjun.sharma@email.com',
    phone: '+91 98765 43210',
    currentLocation: 'Bangalore, India',
    noticePeriod: '15 Days',
    currentCompany: 'Tech Solutions Inc.',
    totalExperience: '4.2 Years',
    stage: 'Moving to Round 1',
    profileUrl: '/candidates/CAND-2024-0456',
  };

  tabs: any[] = [
    { key: 'personal', label: 'Personal' },
    { key: 'education', label: 'Education' },
    { key: 'experience', label: 'Experience' },
    { key: 'projects', label: 'Projects' },
    { key: 'certifications', label: 'Certifications' },
  ];

  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private interviewService = inject(InterviewServiceService);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.paramMap.get('id');

    Promise.all([
      this.loadJobDetails(this.assignmentId),
      this.loadRoundType(this.assignmentId),
      this.loadCandidateInfo(this.assignmentId),
    ]).finally(() => (this.isLoading = false));
  }

  // ── Data loaders ───────────────────────────────────────────────────────────
  private async loadJobDetails(id: any): Promise<void> {
    try {
      const res: any = await this.interviewService.getInterviewRequestAssignmentDetails(id);
      if (res?.responsecode === '00') {
        const d = res.data;
        this.job = {
          title: d.jobTitle,
          department: d.deptName,
          interviewType: d.interviewType,
          interviewMode: d.interviewMode,
          assignedOn: this.formatDate(d.assignedOn),
          responseDue: d.responseDue,
          assignedBy: {
            name: d.assignedBy,
            role: d.roleName,
          },
        };
      } else {
        this.hasError = true;
      }
    } catch (err) {
      this.hasError = true;
      console.error('Error loading job details:', err);
    }
  }

  private async loadRoundType(id: any): Promise<void> {
    // TODO: implement when API is ready
  }

  private async loadCandidateInfo(id: any): Promise<void> {
    // TODO: implement when API is ready
  }

  // ── Modal helpers ──────────────────────────────────────────────────────────

  /** Called when user clicks the Accept button */
  onAccept(): void {
    this.commentModalAction = 'approve';
    this.modalConfig = {
      title: 'Accept Assignment',
      message: 'Please add a comment before accepting this interview assignment.',
      confirmLabel: 'Accept',
      confirmClass: 'btn-success',   // tailor to your modal's API
      showCommentInput: true,
      commentRequired: false,           // comment is optional for accept
      placeholder: 'Add an optional note…',
    };
    this.showCommentModal = true;
  }

  /** Called when user clicks the Decline/Reject button */
  onDecline(): void {
    this.commentModalAction = 'reject';
    this.modalConfig = {
      title: 'Reject Assignment',
      message: 'Please provide a reason for rejecting this interview assignment.',
      confirmLabel: 'Reject',
      confirmClass: 'btn-danger',
      showCommentInput: true,
      commentRequired: true,            // comment is mandatory for reject
      placeholder: 'Enter reason for rejection…',
    };
    this.showCommentModal = true;
  }

  closeCommentModal(): void {
    this.showCommentModal = false;
    this.commentModalAction = null;
  }

  /** Fired by the modal's (confirmed) output — $event carries the comment string */
  async onModalConfirmed(comment: any): Promise<void> {
    if (!this.assignmentId || !this.commentModalAction) return;

    const status = this.commentModalAction === 'approve' ? 'Accepted' : 'Rejected';

    const payload = {
      Id: this.assignmentId,
      status,
      comments: comment?.comment ?? '',
    };

    this.isSubmitting = true;
    try {
      const res: any = await this.interviewService.updateIntervieAssignement(payload);
      if (res?.responsecode === '00') {
        this.closeCommentModal();
        this.router.navigate(['/interview/assigend-interview-requests'], {
          state: {
            activeType: 'ar' // or 'ar', 'ts', 'ui', 'ti'
          }
        });
      } else {
        console.error('Update failed:', res?.message);
      }
    } catch (err) {
      console.error('Error updating assignment:', err);
    } finally {
      this.isSubmitting = false;
    }
  }

  // ── Utilities ──────────────────────────────────────────────────────────────
  private formatDate(isoString: string): string {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}