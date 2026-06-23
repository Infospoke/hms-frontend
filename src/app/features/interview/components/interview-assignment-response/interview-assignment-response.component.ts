import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { JobInfoCardComponent } from '../job-info-card/job-info-card.component';
import { InterviewCandidateInfoComponent } from '../interview-candidate-info/interview-candidate-info.component';
import { JobDetailsComponent } from '../job-details/job-details.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { CommonModalComponent } from '../../../../shared/components/common-modal/common-modal.component';

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
    CommonModalComponent,
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

  jobData: any = null;

  candidateData: any = null;

  tabs: any[] = [
    { key: 'personal',       label: 'Personal'       },
    { key: 'education',      label: 'Education'      },
    { key: 'experience',     label: 'Experience'     },
    { key: 'projects',       label: 'Projects'       },
    { key: 'certifications', label: 'Certifications' },
  ];

  jobId: any;

  private router           = inject(Router);
  private route            = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.paramMap.get('id');
    this.jobId        = this.route.snapshot.paramMap.get('jobId');

    Promise.all([
      this.loadRoundTypeJobDetails(this.jobId),
      this.loadJobDetails(this.assignmentId),
      this.loadCandidateInfo(this.assignmentId),
    ]).finally(() => (this.isLoading = false));
  }

  // ── Data loaders ───────────────────────────────────────────────────────────

  /** Loads the interview-assignment card at the top (existing API) */
  private async loadJobDetails(id: any): Promise<void> {
    try {
      const res: any = await this.interviewService.getInterviewRequestAssignmentDetails(id);
      if (res?.responsecode === '00') {
        const d = res.data;
        this.job = {
          title:         d.jobTitle,
          department:    d.deptName,
          interviewType: d.interviewType,
          interviewMode: d.interviewMode,
          assignedOn:    this.formatDate(d.assignedOn),
          responseDue:   d.responseDue,
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
      console.log('Error loading assignment details:', err);
    }
  }

  
  private async loadRoundTypeJobDetails(id: any): Promise<void> {
    if (!id) return;
    try {
      console.log(id);
      const res: any = await this.interviewService.getJobDetailsById(id);
      console.log(res);
      if (res?.responsecode === '00') {
        const overview     = res.data?.jobOverview     ?? {};
        const description  = res.data?.jobDescription?.description?.[0] ?? {};

        this.jobData = {
          // Overview fields
          nameOfJob:          overview.jobTitle        ?? description.jobTitle ?? '',
          jobCode:            overview.jobCode         ?? '',
          department:         overview.department      ?? '',
          workMode:           overview.workMode        ?? description.workMode ?? '',
          employmentType:     overview.employmentType  ?? description.employmentType ?? '',
          experienceRequired: overview.minExperience != null && overview.maxExperience != null
                                ? `${overview.minExperience} - ${overview.maxExperience} Years`
                                : (description.experienceRequirements ?? ''),
          location:           overview.location        ?? description.location ?? '',
          workType:           overview.employmentType  ?? '',

          // Description fields
          description:        description.jobSummary   ?? '',
          responsibilities:   description.keyResponsibilities   ?? [],
          qualifications:     [
            ...(description.basicQaulifications   ?? []),
            ...(description.preferredQualifications ?? []),
          ],
          mustHaveSkills:     overview.skillsMustHave  ?? description.skillsMustHave   ?? [],
          niceToHaveSkills:   overview.niceToHaveSkills ?? description.niceToHaveSkills ?? [],
          certifications:     description.certificationsRequired ?? [],
          educationRequirements: description.educationRequirements ?? '',
          languagesRequired:  description.languagesRequired ?? [],
          aboutCompany:       description.aboutCompany ?? '',
        };
      } else {
        console.log('Failed to load job details:', res?.message);
      }
    } catch (err) {
      console.log('Error loading job details by id:', err);
    }
  }

 private async loadCandidateInfo(applicationId: any): Promise<void> {
  if (!applicationId) return;
  try {
    const res: any = await this.interviewService.getInterviewCandidateDetails({
      application_id: applicationId,
    });
 
    const rawData = res?.data ?? res;
    const d = Array.isArray(rawData) ? rawData[0] : rawData;
 
    if (!d) { console.log('No candidate data found'); return; }
 
    const exp      = d.experience       ?? {};
    const personal = d.personal_details ?? {};
 
    this.candidateData = {
      // ── Header ─────────────────────────────────────────────────
      firstName:       (d.name ?? '').split(' ')[0],
      lastName:        (d.name ?? '').split(' ').slice(1).join(' '),
      currentRole:     d.designation      ?? '',
      candidateId:     `APP-${d.application_id ?? ''}`,
      email:           d.email            ?? '',
      phone:           d.phone_no         ?? '',
      currentLocation: d.current_location ?? '',
      noticePeriod:    d.notice_period    ?? '',
      currentCompany:  d.current_company  ?? '',
      totalExperience: exp.total_experience ?? '',
 
      // ── Personal tab (flat) ────────────────────────────────────
      dateOfBirth: personal.personal_date_of_birth  ?? '',
      gender:      personal.personal_gender          ?? '',
      nationality: personal.personal_nationality     ?? '',
      languages:   personal.personal_languages_known ?? [],   // ✅ 'languages' not 'languagesKnown'
      address:     personal.personal_address         ?? '',
 
      // ── Education tab (array — template iterates these) ────────
      education: (d.education ?? []).map((edu: any) => ({
        degree:       edu.degree         ?? '',
        institution:  edu.institution    ?? '',
        fieldOfStudy: edu.field_of_study ?? '',
        startYear:    edu.start_year     ?? '',
        endYear:      edu.end_year       ?? '',
        percentage:   edu.percentage     ?? '',
      })),
 
      // ── Experience tab ─────────────────────────────────────────
      experience: {
        totalExperience:    exp.total_experience    ?? '',
        relevantExperience: exp.relevant_experience ?? '',
        companiesWorked:    exp.companies_worked    ?? '',
        averageTenure:      exp.average_tenure      ?? '',
        details: (exp.experience_details ?? []).map((e: any) => ({
          jobTitle:    e.job_title   ?? '',
          company:     e.company     ?? '',
          startDate:   e.start_date  ?? '',
          endDate:     e.end_date    ?? '',
          description: e.description ?? [],   // string[]
        })),
        timeLine:       exp.time_line       ?? [],
        companyDetails: exp.company_details ?? [],
      },
 
      // ── Projects tab ───────────────────────────────────────────
      projects: (d.projects?.project_details ?? []).map((p: any) => ({
        name:        p.project_title ?? '',
        description: p.description  ?? [],   // kept as array — template handles both
        techStack:   p.tech_stack   ?? [],
        startDate:   p.start_date   ?? '',
        endDate:     p.end_date     ?? '',
      })),
 
      // ── Certifications tab ─────────────────────────────────────
      certifications: d.certifications ?? [],
    };
 
  } catch (err) {
    console.log('Error loading candidate info:', err);
  }
}

  // ── Modal helpers ──────────────────────────────────────────────────────────

  onAccept(): void {
    this.commentModalAction = 'approve';
    this.modalConfig = {
      title:           'Accept Assignment',
      message:         'Please add a comment before accepting this interview assignment.',
      confirmLabel:    'Accept',
      confirmClass:    'btn-success',
      showCommentInput: true,
      commentRequired:  false,
      placeholder:     'Add an optional note…',
    };
    this.showCommentModal = true;
  }

  onDecline(): void {
    this.commentModalAction = 'reject';
    this.modalConfig = {
      title:           'Reject Assignment',
      message:         'Please provide a reason for rejecting this interview assignment.',
      confirmLabel:    'Reject',
      confirmClass:    'btn-danger',
      showCommentInput: true,
      commentRequired:  true,
      placeholder:     'Enter reason for rejection…',
    };
    this.showCommentModal = true;
  }

  closeCommentModal(): void {
    this.showCommentModal = false;
    this.commentModalAction = null;
  }

  async onModalConfirmed(comment: any): Promise<void> {
    if (!this.assignmentId || !this.commentModalAction) return;

    const status = this.commentModalAction === 'approve' ? 'Accepted' : 'Rejected';

    const payload = {
      Id:       this.assignmentId,
      status,
      comments: comment?.comment ?? '',
    };

    this.isSubmitting = true;
    try {
      const res: any = await this.interviewService.updateIntervieAssignement(payload);
      if (res?.responsecode === '00') {
        this.closeCommentModal();
        this.router.navigate(['/interview/assigend-interview-requests'], {
          state: { activeType: 'ar' },
        });
      } else {
        console.log('Update failed:', res?.message);
      }
    } catch (err) {
      console.log('Error updating assignment:', err);
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

  handleBack(){
  
    this.router.navigate(["/supply/my-interview-requests"],{state:{activeType:'ar'}})
  }
}