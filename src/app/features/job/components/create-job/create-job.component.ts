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

  // ── Stepper
  currentStep = 0;

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

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  // ── Form
  form!: FormGroup;

  get step1Form(): FormGroup { return this.form.get('step1') as FormGroup; }
  get step2Form(): FormGroup { return this.form.get('step2') as FormGroup; }
  get step3Form(): FormGroup { return this.form.get('step3') as FormGroup; }
  get step4Form(): FormGroup { return this.form.get('step4') as FormGroup; }
  get step5Form(): FormGroup { return this.form.get('step5') as FormGroup; }

  get currentStepForm(): FormGroup {
    return this.form.get('step' + (this.currentStep + 1)) as FormGroup;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      step1: this.fb.group({
        jobTitle:        ['', [Validators.required, Validators.maxLength(255)]],
        jobCode:         [{ value: this.generateJobCode(), disabled: true }],
        department:      ['', Validators.required],
        businessUnit:    ['', Validators.required],
        location:        ['', Validators.required],
        workMode:        ['', Validators.required],
        employmentType:  ['', Validators.required],
        experience:      ['', Validators.required],
        openings:        [null, [Validators.required, Validators.min(1)]],
        startDate:       [null, Validators.required],
        mustHaveSkills:  [['Java', 'Spring Boot', 'REST API', 'SQL', 'Microservices'], [Validators.required, this.nonEmptyArray]],
        niceToHaveSkills:[['Docker', 'AWS', 'Kafka', 'Kubernetes']],
        notes:           ['', Validators.maxLength(250)],
      }),
      step2: this.fb.group({}),
      step3: this.fb.group({}),
      step4: this.fb.group({}),
      step5: this.fb.group({}),
    });
  }

  nonEmptyArray(control: any) {
    return Array.isArray(control.value) && control.value.length > 0
      ? null : { required: true };
  }

  onNext(): void {
    if (this.isLastStep) { this.onSubmit(); return; }
    const stepForm = this.currentStepForm;
    if (stepForm && stepForm.invalid) {
      stepForm.markAllAsTouched();
      return;
    }
    this.currentStep++;
  }

  onBack(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  onCancel(): void {
    this.router.navigateByUrl('/supply/jobs/job-details');
  }

  onSaveAsDraft(): void {
    this.notificationService.success('Job saved as draft');
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = this.form.getRawValue();
    console.log('Create Job payload:', payload);
    this.notificationService.success('Job created successfully');
    this.router.navigateByUrl('/supply/jobs/job-details');
  }

  private generateJobCode(): string {
    const prefixes = ['ENG', 'HR', 'FIN', 'OPS', 'MKT'];
    const depts    = ['BE', 'FE', 'DS', 'QA', 'PM'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const d = depts[Math.floor(Math.random() * depts.length)];
    const n = Math.floor(1000 + Math.random() * 9000);
    return p + '-' + d + '-' + String(n).padStart(4, '0');
  }
}
