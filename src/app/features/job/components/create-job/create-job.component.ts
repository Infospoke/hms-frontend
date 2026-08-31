import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ConfirmModalComponent } from '../../../../shared/components/modal-component/confirm-modal.component';
import { InterviewPlanStepComponent } from './steps/interview-plan-step/interview-plan-step.component';;

import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { JobDetailsStepComponent } from './steps/job-details/job-details.component';
import { AiJobDescriptionStepComponent } from './steps/ai-job-description/ai-job-description.component';
import { SourcingStrategyStepComponent } from './steps/sourcing-strategy/sourcing-strategy.component';
import { RecruiterAssignmentStepComponent } from './steps/recruiter-assignment/recruiter-assignment.component';
// TODO: update this path to wherever agency-assignment.component.ts actually lives in your project

import { ReviewSubmitStepComponent } from './steps/review-submit/review-submit.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobService } from '../../services/job.service';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';
import { AgencyAssignmentComponent } from './steps/agency-assignment/agency-assignment.component';

const SR_ID_KEY = 'create_job_sr_id';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzStepsModule,
    NzModalModule,
    HeadingComponent,
    JobDetailsStepComponent,
    AiJobDescriptionStepComponent,
    SourcingStrategyStepComponent,
    RecruiterAssignmentStepComponent,
    AgencyAssignmentComponent,
    ReviewSubmitStepComponent,
    InterviewPlanStepComponent,
  ],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.scss',
})
export class CreateJobComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private modal = inject(NzModalService);
  private notificationService = inject(NotificationService);
  private jobService = inject(JobService);
  private approvalService = inject(ApprovalService);
  private userService = inject(UserService);

  currentStep = 0;
  jdError = false;

  // IDs sourced directly from the SR response — no separate lookup arrays needed
  private srDepartmentId: number | string = '';
  private srBusinessUnitId: number | string = '';

  readonly steps = [
    { title: 'Job Details' },
    { title: 'AI Job Description' },
    { title: 'Sourcing Strategy' },
    { title: 'Recruiter Assignment' },
    // { title: 'Agency Assignment' },    // ← add this
    { title: 'Interview Plan' },
    { title: 'Review & Submit' },
  ];

  get nextButtonLabel(): string {
    if (this.currentStep === this.steps.length - 1) return 'Submit';
    return 'Next: ' + this.steps[this.currentStep + 1].title;
  }
  get experienceDisplay(): string {
    const min = this.step1Form.get('minExp')?.value;
    const max = this.step1Form.get('maxExp')?.value;
    if (min === null && max === null) return '';
    return `${min ?? 0} - ${max ?? 0} Years`;
  }
  get isLastStep(): boolean { return this.currentStep === this.steps.length - 1; }
  get isFirstStep(): boolean { return this.currentStep === 0; }

  form!: FormGroup;
  get step1Form(): FormGroup { return this.form.get('step1') as FormGroup; }
  get step2Form(): FormGroup { return this.form.get('step2') as FormGroup; }
  get step3Form(): FormGroup { return this.form.get('step3') as FormGroup; }
  get step4Form(): FormGroup { return this.form.get('step4') as FormGroup; }
  get step5Form(): FormGroup { return this.form.get('step5') as FormGroup; } // agency assignment
  get step6Form(): FormGroup { return this.form.get('step6') as FormGroup; } // interview plan
  get step7Form(): FormGroup { return this.form.get('step7') as FormGroup; } // review & submit
  get currentStepForm(): FormGroup { return this.form.get('step' + (this.currentStep + 1)) as FormGroup; }

  ngOnInit(): void {
    this.form = this.fb.group({
      step1: this.fb.group({
        jobTitle: ['', [Validators.required, Validators.maxLength(255)]],
        jobCode: ['', Validators.required],
        department: ['', Validators.required],
        businessUnit: ['', Validators.required],
        location: ['', Validators.required],
        workMode: ['', Validators.required],
        employmentType: ['', Validators.required],
        experience: ['', Validators.required],
        minExp: ['', Validators.required],
        maxExp: ['', Validators.required],
        openings: [null, [Validators.required, Validators.min(1)]],
        startDate: [null, Validators.required],
        mustHaveSkills: [[], [Validators.required, this.nonEmptyArray]],
        niceToHaveSkills: [[]],
        notes: ['', [Validators.minLength(6), Validators.maxLength(300)]],
        educationRequirement: ['', Validators.maxLength(100)],
        country: ['', Validators.maxLength(50)],
        certificate: ['',],
        languages: [''],
      }),
      step2: this.fb.group({}),
      step3: this.fb.group({}),
      step4: this.fb.group({}),
      step5: this.fb.group({}),   // ← new: agency assignment
      step6: this.fb.group({}),   // interview plan
      step7: this.fb.group({}),   // review & submit
    });

    // Persist SR ID to localStorage when coming fresh from signal
    const signalData = this.jobService.jobDetailsBySrIdSignal();
    if (signalData?.srId) {
      const previousSrId = localStorage.getItem(SR_ID_KEY);

      
      if (previousSrId !== signalData.srId) {
        localStorage.removeItem('ai_jd_versions');
      }
      localStorage.setItem(SR_ID_KEY, signalData.srId);
    }

    this.getJobDetailsFromSr();
  }

  nonEmptyArray(control: any) {
    return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
  }

  getJobDetailsFromSr(): void {
    const srId = this.jobService.jobDetailsBySrIdSignal()?.srId
      || localStorage.getItem(SR_ID_KEY);

    if (!srId) return;

    this.jobService.getJobDetailsBySrId(srId)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          const data = res?.data;
          if (data) {
            // ── Store IDs for use at submit time ──────────────────────────────
            this.srDepartmentId = data.departmentId ?? '';
            this.srBusinessUnitId = data.businessUnitId ?? '';

            // ── Patch display names into the form ─────────────────────────────
            this.step1Form.patchValue({
              jobTitle: data.jobTitle || '',
              jobCode: data.jobCode || '',
              department: data.departmentName || '',   // display name
              businessUnit: data.businessName || '',   // display name  ← note: API returns "businessName"
              location: data.location || '',
              workMode: data.workMode || '',
              employmentType: data.employmentType || '',
              experience: data.maxExperience ?? data.minExperience ?? '',
              minExp: data?.minExperience,
              maxExp: data?.maxExperience,
              openings: data.openings ?? null,
              startDate: data.targetStartDate || null,
              mustHaveSkills: data.skillsMustHave ? data.skillsMustHave.split(',') : [],
              niceToHaveSkills: data.niceToHaveSkills ? data.niceToHaveSkills.split(',') : [],
              educationRequirement: data.educationRequirement || '',
              country: data.country || '',
              certificate: data?.certificationsRequired,
              languages: data?.languages || ''
            });
          }
          return;
        }
        this.notificationService.error(res?.errors?.[0] ?? res?.message ?? 'Failed to fetch job details from SR');
      })
      .catch((error: any) => {
        this.notificationService.error(error?.message ?? 'Failed to fetch job details from SR');
      });
  }

  private clearSrIdStorage(): void {
    localStorage.removeItem(SR_ID_KEY);
    localStorage.removeItem('ai_jd_versions');
  }

  onNext(): void {
    if (this.isLastStep) { this.confirmSubmit(); return; }

    // Step 2: JD must be generated
    if (this.currentStep === 1) {
      const jd = this.step2Form.get('jobDescription')?.value;
      if (!jd) { this.jdError = true; return; }
      this.jdError = false;
    }

    // Step 3: referral amount must be > 0 when referral channel enabled
    if (this.currentStep === 2) {
      const channels = this.step3Form.get('selectedChannels')?.value ?? [];
      const referral = channels.find((c: any) => c.channelName === 'Employee Referral' && c.postJob);
      if (referral && !(Number(referral.referralAmount) > 0)) {
        this.notificationService.error('Please enter a referral bonus amount greater than ₹0 for Employee Referral.');
        return;
      }
    }

    // Step 4: at least one recruiter must be assigned
    if (this.currentStep === 3) {
      const selected = this.step4Form.get('selectedRecruiterDetails')?.value ?? [];
      if (!selected.length) {
        this.notificationService.info('Please assign at least one recruiter before proceeding.');
        return;
      }
    }
  
    if (this.currentStep === 3) {
      const selectedAgencies = this.step5Form.get('selectedAgencyDetails')?.value ?? [];
      // if (!selectedAgencies.length) {
      //   this.notificationService.info('Please assign at least one agency before proceeding.');
      //   return;
      // }
    }

    if(this.currentStep === 4) {
      const selectedPlan = this.step6Form.get('planId')?.value;
      if (!selectedPlan) {
        this.notificationService.info('Please select an interview plan before proceeding.');
        return;
      }
    }

    const stepForm = this.currentStepForm;
    if (stepForm?.invalid) { stepForm.markAllAsTouched(); return; }
    this.currentStep++;
  }

  onBack(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  onCancel(): void {
    this.clearSrIdStorage();
    this.router.navigateByUrl('/demand/all-approved-srs');
  }

  goBack(): void {
    this.clearSrIdStorage();
    this.router.navigateByUrl('/demand/all-approved-srs');
  }

  confirmSubmit(): void {
    const modal = this.modal.create<ConfirmModalComponent>({
      nzContent: ConfirmModalComponent,
      nzData: { mode: 'submit-job' },
      nzClassName: 'custom-confirm-modal custom-edit-modal',
      nzFooter: null,
      nzCentered: true,
      nzWidth: 360,
      nzClosable: false,
    });
    modal.afterClose.subscribe((result: string) => {
      if (result === 'confirm') {
        this.onSubmit();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const step1 = this.step1Form.getRawValue();
    const step2 = this.step2Form.getRawValue();
    const step3 = this.step3Form.getRawValue();
    const step4 = this.step4Form.getRawValue();
    const step5 = this.step5Form.getRawValue(); // agency assignment
    const step6 = this.step6Form.getRawValue(); // interview plan

    const referralChannel = step3.selectedChannels?.find((c: any) =>
      c.channelName?.toLowerCase().includes('referral')
    );

    const channelsObject = step3.selectedChannels?.reduce((acc: any, channel: any) => {
      const key = channel.channelName.replace(/\s+/g, '').replace('.com', '');
      acc[key] = channel.postJob;
      return acc;
    }, {}) || {};

    const srId = this.jobService.jobDetailsBySrIdSignal()?.srId
      || localStorage.getItem(SR_ID_KEY) || '';

    const agencyIds: number[] = (step5.selectedAgencyDetails || []).map((a: any) => a.agencyId);

    // ✅ Map description to expected camelCase format
    const desc = step2.jobDescription;
    const jobDescriptionRequest = {
      description: [
        {
          jobTitle: desc?.job_title || desc?.jobTitle || '',
          jobSummary: desc?.job_summary || desc?.jobSummary || '',
          keyResponsibilities: desc?.key_responsibilities || desc?.keyResponsibilities || [],
          basicQaulifications: desc?.basic_qualifications || desc?.basicQaulifications || [], // ✅ typo
          preferredQualifications: desc?.preferred_qualifications || desc?.preferredQualifications || [],
          skillsMustHave: desc?.skills_must_have || desc?.skillsMustHave || [],
          niceToHaveSkills: desc?.skills_nice_to_have || desc?.niceToHaveSkills || [],
          educationRequirements: desc?.education_requirements || desc?.educationRequirements || '',
          experienceRequirements: desc?.experience_requirements || desc?.experienceRequirements || '',
          certificationsRequired: desc?.certifications_required || desc?.certificationsRequired || [],
          languagesRequired: this.toArray(desc?.languages_required || desc?.languagesRequired), // ✅ always array
          workMode: desc?.work_mode || desc?.workMode || '',
          employmentType: desc?.employment_type || desc?.employmentType || '',
          location: desc?.location || '',
          aboutCompany: desc?.about_company || desc?.aboutCompany || '',
        }
      ]
    };

    const payload = {
      srId,
      submit: 'true',
      createJobDetailsRequest: {
        jobTitle: step1.jobTitle,
        businessUnitId: this.srBusinessUnitId,
        departmentId: this.srDepartmentId,
        location: step1.location,
        jobCode: step1.jobCode,
        openings: step1.openings,
        targetStartDate: step1.startDate,
        workMode: step1.workMode,
        employmentType: step1.employmentType,
        skillsMustHave: step1.mustHaveSkills?.join(','),
        niceToHaveSkills: step1.niceToHaveSkills?.join(','),
        minExperience: step1.minExp ?? 0,
        maxExperience: step1.maxExp ?? 0,
        additionalNotes: step1.notes,
        educationRequirement: step1.educationRequirement,
        country: step1.country,
        certificationsRequired: step1.certificate,
        languages: step1?.languages
      },
      jobDescriptionRequest,   // ✅ replaced
      sourcingChannelRequest: {
        referral: !!referralChannel,
        referralAmount: referralChannel?.referralAmount || 0,
        channels: channelsObject,
      },
      recuriterAssignmentRequest: {
        srId: srId,
        recruiterInfoDtos: step4.selectedRecruiterDetails || [],
      },
      agencyDetailsRequest: {
        agencyIds,
      },
      interviewPlanRequest: {
        planId: step6.planId
      }
    };

    this.jobService.createNewJob(payload)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          this.clearSrIdStorage();
          this.notificationService.success(res?.message || 'Job created successfully');
          this.onCancel();
        } else {
          this.notificationService.error( res?.errors?.[0] ||res?.message || 'Failed to create job');
        }
      })
      .catch((error: any) => {
        this.notificationService.error(error?.message || 'Failed to create job');
      });
  }
  private toArray(value: string | string[] | null | undefined): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map((v: string) => v.trim()).filter(Boolean); // ✅ "English,Hindi" → ["English","Hindi"]
  }
}