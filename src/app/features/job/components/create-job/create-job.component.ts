import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { JobDetailsStepComponent } from './steps/job-details/job-details.component';
import { AiJobDescriptionStepComponent } from './steps/ai-job-description/ai-job-description.component';
import { SourcingStrategyStepComponent } from './steps/sourcing-strategy/sourcing-strategy.component';
import { RecruiterAssignmentStepComponent } from './steps/recruiter-assignment/recruiter-assignment.component';
import { ReviewSubmitStepComponent } from './steps/review-submit/review-submit.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobService } from '../../services/job.service';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';

const SR_ID_KEY = 'create_job_sr_id';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzStepsModule,
    HeadingComponent,
    JobDetailsStepComponent,
    AiJobDescriptionStepComponent,
    SourcingStrategyStepComponent,
    RecruiterAssignmentStepComponent,
    ReviewSubmitStepComponent,
  ],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.scss',
})
export class CreateJobComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private jobService = inject(JobService);
  private approvalService = inject(ApprovalService);
  private userService = inject(UserService);

  currentStep = 0;

  // IDs sourced directly from the SR response — no separate lookup arrays needed
  private srDepartmentId: number | string = '';
  private srBusinessUnitId: number | string = '';

  readonly steps = [
    { title: 'Job Details' },
    { title: 'AI Job Description' },
    { title: 'Sourcing Strategy' },
    { title: 'Recruiter Assignment' },
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
  get step5Form(): FormGroup { return this.form.get('step5') as FormGroup; }
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
        minExp:['',Validators.required],
        maxExp:['',Validators.required],
        openings: [null, [Validators.required, Validators.min(1)]],
        startDate: [null, Validators.required],
        mustHaveSkills: [[], [Validators.required, this.nonEmptyArray]],
        niceToHaveSkills: [[]],
        notes: ['', Validators.maxLength(250)],
        educationRequirement: ['', Validators.maxLength(100)],
        country: ['', Validators.maxLength(50)],
      }),
      step2: this.fb.group({}),
      step3: this.fb.group({}),
      step4: this.fb.group({}),
      step5: this.fb.group({}),
    });

    // Persist SR ID to localStorage when coming fresh from signal
    const signalData = this.jobService.jobDetailsBySrIdSignal();
    if (signalData?.srId) {
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
            this.srDepartmentId  = data.departmentId  ?? '';
            this.srBusinessUnitId = data.businessUnitId ?? '';

            // ── Patch display names into the form ─────────────────────────────
            this.step1Form.patchValue({
              jobTitle:             data.jobTitle            || '',
              jobCode:              data.jobCode             || '',
              department:           data.departmentName      || '',   // display name
              businessUnit:         data.businessName        || '',   // display name  ← note: API returns "businessName"
              location:             data.location            || '',
              workMode:             data.workMode            || '',
              employmentType:       data.employmentType      || '',
              experience:           data.maxExperience ?? data.minExperience ?? '',
              minExp:data?.minExperience,
              maxExp:data?.maxExperience,
              openings:             data.openings            ?? null,
              startDate:            data.targetStartDate     || null,
              mustHaveSkills:       data.skillsMustHave  ? data.skillsMustHave.split(',')  : [],
              niceToHaveSkills:     data.niceToHaveSkills ? data.niceToHaveSkills.split(',') : [],
              educationRequirement: data.educationRequirement || '',
              country:              data.country             || '',
            });
          }
          return;
        }
        this.notificationService.error(res?.message ?? 'Failed to fetch job details from SR');
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
    if (this.isLastStep) { this.onSubmit(); return; }
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

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const step1 = this.step1Form.getRawValue();
    const step2 = this.step2Form.getRawValue();
    const step3 = this.step3Form.getRawValue();
    const step4 = this.step4Form.getRawValue();

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

    const payload = {
      srId,
      submit: 'true',
      createJobDetailsRequest: {
        jobTitle:             step1.jobTitle,
        // ── Use IDs captured from SR response, not name-based lookups ─────────
        businessUnitId:       this.srBusinessUnitId,
        departmentId:         this.srDepartmentId,
        // ─────────────────────────────────────────────────────────────────────
        location:             step1.location,
        jobCode:              step1.jobCode,
        openings:             step1.openings,
        targetStartDate:      step1.startDate,
        workMode:             step1.workMode,
        employmentType:       step1.employmentType,
        skillsMustHave:       step1.mustHaveSkills?.join(','),
        niceToHaveSkills:     step1.niceToHaveSkills?.join(','),
        minExperience:        step1.minExp || step1.experience || 1,
        maxExperience:        step1.maxExp || step1.experience || 5,
        additionalNotes:      step1.notes,
        educationRequirement: step1.educationRequirement,
        country:              step1.country,
      },
      jobDescriptionRequest: { description: step2.jobDescription || '' },
      sourcingChannelRequest: {
        referral:        !!referralChannel,
        referralAmount:  referralChannel?.referralAmount || 0,
        channels:        channelsObject,
      },
      recuriterAssignmentRequest: {
        srId:                srId,
        recruiterInfoDtos:   step4.selectedRecruiterDetails || [],
      },
    };

    this.jobService.createNewJob(payload)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          this.clearSrIdStorage();
          this.notificationService.success(res?.message || 'Job created successfully');
          this.onCancel();
        } else {
          this.notificationService.error(res?.message || 'Failed to create job');
        }
      })
      .catch((error: any) => {
        this.notificationService.error(error?.message || 'Failed to create job');
      });
  }
}