import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AddSkillComponent } from '../../../../shared/components/add-skill/add-skill.component';
import { forkJoin, of, switchMap } from 'rxjs';
import { StaffingServiceService } from '../../services/staffing-service.service';
import { UserService } from '../../../settings/users/servics/user-service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { SrReviewComponent } from '../sr-review/sr-review';

export interface BannerMessage {
  text: string;
  type: 'ok' | 'err';
}

export interface StepConfig {
  label: string;
  icon: string;
}

export interface BoardOption {
  n: string;
  icon: string;
}

export interface ApproverInfo {
  n: string;
  role: string;
  status: string;
  color: string;
  tc: string;
}

function minItemsValidator(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr: string[] = control.value || [];
    return arr.length >= min ? null : { minItems: { required: min, actual: arr.length } };
  };
}

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value);
  return selected >= today ? null : { pastDate: true };
}


@Component({
  selector: 'app-create-staff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, QuillModule, NzModalModule, NzModalModule],
  templateUrl: './create-staff.component.html',
  styleUrl: './create-staff.component.scss'
})
export class CreateStaffComponent implements OnInit, OnDestroy {

  compValidationStatus: string = '';
  stepDataLoaded: Record<number, boolean> = {};
  currentStep = 0;
  isSaving = false;
  srId: string | null = null;
  editMode = false;
  routeType: string | null = null;
  private pendingDeptPrefill: any = null;
  private pendingManagerIds: number[] = [];
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  readonly STEPS: StepConfig[] = [
    { label: 'Position Basics', icon: '📋' },
    { label: 'Business Justification', icon: '📝' },
    { label: 'Budget & Comp', icon: '💰' },
    { label: 'Role Requirements', icon: '🎯' },
    { label: 'Sourcing Strategy', icon: '🔍' },
    { label: 'Review', icon: '👁' },
    { label: 'Approval', icon: '✅' }
  ];

  errorMsg: any;
  modalType: 'must' | 'nice' | 'cert' | 'lang' = 'must';
  modalLabel: any;
  banner: BannerMessage | null = null;
  private bannerTimeout: ReturnType<typeof setTimeout> | null = null;


  private demandService = inject(StaffingServiceService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  seniorityIC: any[] = [];
  deptKeys: any[] = [];
  bussiness: any[] = [];

  readonly requisitionTypes = ['New Headcount', 'Backfill', 'Replacement', 'Contract to Perm'];
  readonly workModes = ['Remote', 'Hybrid', 'On-site'];
  readonly empTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  readonly priorities = ['Critical', 'High', 'Standard'];
  educationOpts: any[] = [];
  travelOpts: any = [];
  readonly assessmentOpts = ['Technical', 'Personality', 'Case Study', 'Psychometric'];
  readonly diversityOpts = ['Women-in-Tech', 'Veterans', 'LGBTQ+', 'Differently-Abled'];

  readonly boardOptions: BoardOption[] = [
    { n: 'Internal Board', icon: 'fa-building' },
    { n: 'Naukri', icon: 'fa-briefcase' },
    { n: 'LinkedIn', icon: 'fab fa-linkedin-in' },
    { n: 'Indeed', icon: 'fa-search' },
    { n: 'Company Site', icon: 'fa-globe' },
    { n: 'Agency / RPO', icon: 'fa-handshake' }
  ];

  readonly approvers: ApproverInfo[] = [
    { n: 'Maya Tete', role: 'Hiring Manager', status: 'Pending, notified', color: '#f0f9ff', tc: '#0284c7' },
    { n: 'Aryn Apprec', role: 'Finance Approver', status: 'Pending', color: '#f0f9ff', tc: '#0284c7' },
    { n: 'Saree Dadly', role: 'VP Engineering', status: 'Pending', color: '#f0f9ff', tc: '#0284c7' }
  ];

  readonly reviewApprovalChain = [
    { n: 'Hiring Manager (You)', status: 'Approved', level: '1' },
    { n: 'Finance (Aryan K.)', status: 'Pending', level: '1' },
    { n: 'VP Eng (Priya R.)', status: 'Pending', level: '1' }
  ];


  showDropdown = false;
  managersList: any[] = [];
  @ViewChild('managerInput') managerInput!: ElementRef;
  selectedManagers: any[] = [];
  filteredManagers: any[] = [];
  replaceEmployee: any = null;


  mustSuggestions: any[] = [];
  niceSuggestions: any[] = [];
  certSuggestions: any = [];
  langSuggestions: any[] = [];
  mustSkills: string[] = [];
  niceSkills: string[] = [];
  certs: string[] = [];
  langs: string[] = [];
  mustSkillInput = '';
  niceSkillInput = '';
  certInput = '';
  langInput = '';


  jobBoards: string[] = [];
  diversityBoards: string[] = [];
  assessmentTypes: string[] = [];
  supportDoc: any = null;
  reviewSectionOpen: boolean[] = [true, true, true, true, true];
  min = 0; max = 25;

  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  private modal = inject(NzModalService);
  step0Form!: FormGroup;
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  modalForm!: FormGroup;

  constructor(private fb: FormBuilder) { }


  ngOnInit(): void {
    this.buildForms();
    this.modalForm = this.fb.group({ value: ['', Validators.required] });

    this.step0Form.get('bu')?.valueChanges.subscribe((value) => {
      if (!value) return;
      this.getRoles(value);
    });

    this.captureRouteParams();
    this.goTo(0);
  }

  private captureRouteParams(): void {
    this.route.queryParams.subscribe(params => {

      const srId = params['id'];
      const type = params['type'];
      if (srId) {
        this.srId = srId;
      }
      this.routeType = type ?? null;
      this.editMode = type === 'edit' && !!srId;
    });


  }

  ngOnDestroy(): void {
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
  }

  private buildForms(): void {
    this.step0Form = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      dept: ['', Validators.required],
      bu: ['', Validators.required],
      manager: [[], [Validators.required, minItemsValidator(1)]],
      location: ['', Validators.required],
      workMode: ['', Validators.required],
      empType: ['', Validators.required],
      seniority: ['', Validators.required],
      openings: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
      priority: ['', Validators.required],
      startDate: ['', [Validators.required, futureDateValidator]],
      managerSearch: ['']
    });

    this.step1Form = this.fb.group({
      justType: ['New Headcount', Validators.required],
      replacesEmp: [''],
      replaceSearch: [''],
      bizCase: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2000)]],
      impactNote: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2000)]]
    });

    this.step2Form = this.fb.group({
      
      hcSlot: [true],
      salaryComp: ['', Validators.required],
      proposedComp: ['', [Validators.required, Validators.min(1)]],
      signingBonus: [false],
      signingAmt: [''],
      equity: [false],
      equityAmt: [''],
      relocation: [false],
      relocAmt: ['']
    });

    this.step3Form = this.fb.group({
      eduReq: ['', Validators.required],
      expMin: [0],
      expMax: [5],
      interviewMin: [0],
      interviewMax: [0],
      assessmentOn: [false],
      travel: ['']
    });

    this.step4Form = this.fb.group({
      internalFirst: [true],
      referralOn: [false],
      referralAmt: [''],
      sourcingBudget: [''],
      diversityOn: [false]
    });
  }

  goTo(n: number): void {
    this.currentStep = n;
    this.loadDataForStep(n);
  }

  private loadDataForStep(step: number): void {

    switch (step) {
      case 0: this.loadStep0Data(); break;
      case 2: this.loadStep2Data(); break;
      case 3: this.aiSuggestSkills(); break;
    }

  }
  loadStep2Data() {
    let payload = {
      job_title: this.jobTitle,
      department: this.department,
      seniority: this.seniority,
      location: this.location,
      employment_type: this.empType,
      business_justification: this.bizCase,
    }
    this.demandService.CTC(payload).then((res: any) => {
      const salary = res?.min_salary + '-' + res?.max_salary
      this.step2Form.get('salaryComp')?.setValue(salary);
    }
    ).catch((error: any) => console.log(error));
  }

  validateStep0(type: any): void {
    this.step0Form.markAllAsTouched();
    if (this.step0Form.invalid) {
      this.showBanner('Please fix the highlighted fields', 'err');
      return;
    }
    this.isSaving = true;
    const payload = { positonBascicsRequest: this.buildPositionBasicsRequest() };
    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );
    const formData = new FormData();
    formData.append('request', jsonBlob);
    this.demandService.createStaffing(formData)
      .then((res: any) => {
        this.isSaving = false;
        if (res?.responsecode === '00') {
          if (res?.data) {
            this.srId = res.data;
          }

          if (type !== 'draft') this.goTo(1);
          if (type === 'draft') {
            this.notificationService.success(
              'Success',
              'Draft saved successfully!'
            );
          }
        } else {
          this.showBanner(res?.message || 'Failed to save Position Basics', 'err');
        }
      })
      .catch(() => {
        this.isSaving = false;
        this.showBanner('Error saving Position Basics. Please try again.', 'err');
      });
  }


  validateStep1(type: any): void {
    this.step1Form.markAllAsTouched();

    if (this.needsReplace) {
      this.step1Form.get('replacesEmp')?.setValidators(Validators.required);
      this.step1Form.get('replacesEmp')?.updateValueAndValidity();
    } else {
      this.step1Form.get('replacesEmp')?.clearValidators();
      this.step1Form.get('replacesEmp')?.updateValueAndValidity();
    }

    if (this.step1Form.invalid) {
      this.showBanner('Please fix the highlighted fields', 'err');
      return;
    }

    this.isSaving = true;
    const payload = {
      positonBascicsRequest: this.buildPositionBasicsRequest(),
      businessJustificationRequest: this.buildBusinessJustificationRequest()
    };
    const formData = new FormData();

    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );

    formData.append('request', jsonBlob);

    if (this.supportDoc?.file) {
      formData.append('file', this.supportDoc.file);
    }
    this.demandService.createStaffing(formData)
      .then((res: any) => {
        this.isSaving = false;
        if (res?.responsecode === '00') {
          if (type !== 'draft') this.goTo(2);
          if (type === 'draft') {
            this.notificationService.success(
              'Success',
              'Draft saved successfully!'
            );
          }
        } else {
          this.showBanner(res?.message || 'Failed to save Business Justification', 'err');
        }
      })
      .catch(() => {
        this.isSaving = false;
        this.showBanner('Error saving Business Justification. Please try again.', 'err');
      });
  }



  validateStep2(type: any): void {
    this.step1Form.markAllAsTouched();
    if (!this.step2Form.value.hcSlot) {
      this.showBanner('HC slot required to proceed', 'err');
      return;
    }
    if(this.step2Form.invalid)return;

    this.isSaving = true;

    const payload = {
      positonBascicsRequest: this.buildPositionBasicsRequest(),
      businessJustificationRequest: this.buildBusinessJustificationRequest(),
      budgetAndCompensationRequest: this.buildBudgetRequest()
    };

    const formData = new FormData();

    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );

    formData.append('request', jsonBlob);

    if (this.supportDoc?.file) {
      formData.append('file', this.supportDoc.file);
    }

    this.demandService.createStaffing(formData)
      .then((res: any) => {
        this.isSaving = false;

        if (res?.responsecode === '00') {

          const status = res?.data?.status;
          this.compValidationStatus = res?.data?.status;
          if (status === 'RED') {


            setTimeout(() => {

            }, 2000);

            return;
          }

          if (status === 'YELLOW') {


            setTimeout(() => {
              if (type !== 'draft') this.goTo(3);
            }, 2000);

            return;
          }


          if (type !== 'draft') this.goTo(3);
          if (type === 'draft') {
            this.notificationService.success(
              'Success',
              'Draft saved successfully!'
            );
          }

        } else {
          this.showBanner(res?.message || 'Failed to save Budget & Compensation', 'err');
        }
      })
      .catch(() => {
        this.isSaving = false;
        this.showBanner('Error saving Budget & Compensation. Please try again.', 'err');
      });
  }

  validateStep3(type: any): void {
    this.step3Form.markAllAsTouched();

    if (this.mustSkills.length < 3) {
      this.showBanner('Add at least 3 must-have skills', 'err');
      return;
    }
    if (this.step3Form.get('eduReq')?.invalid) {
      this.showBanner('Please fix the highlighted fields', 'err');
      return;
    }

    this.isSaving = true;
    const payload = {
      positonBascicsRequest: this.buildPositionBasicsRequest(),
      businessJustificationRequest: this.buildBusinessJustificationRequest(),
      budgetAndCompensationRequest: this.buildBudgetRequest(),
      rolesAndRequirementsRequest: this.buildRolesRequest()
    };
    const formData = new FormData();

    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );

    formData.append('request', jsonBlob);

    if (this.supportDoc?.file) {
      formData.append('file', this.supportDoc.file);
    }
    this.demandService.createStaffing(formData)
      .then((res: any) => {
        this.isSaving = false;
        if (res?.responsecode === '00') {
          if (type !== 'draft') this.goTo(4);
          if (type === 'draft') {
            this.notificationService.success(
              'Success',
              'Draft saved successfully!'
            );
          }
        } else {
          this.showBanner(res?.message || 'Failed to save Role Requirements', 'err');
        }
      })
      .catch(() => {
        this.isSaving = false;
        this.showBanner('Error saving Role Requirements. Please try again.', 'err');
      });
  }


  validateStep4(type: any): void {
    if (this.jobBoards.length === 0) {
      this.showBanner('Select at least one sourcing channel', 'err');
      return;
    }

    this.isSaving = true;
    const payload = {
      positonBascicsRequest: this.buildPositionBasicsRequest(),
      businessJustificationRequest: this.buildBusinessJustificationRequest(),
      budgetAndCompensationRequest: this.buildBudgetRequest(),
      rolesAndRequirementsRequest: this.buildRolesRequest(),
      sourcingStrategyRequest: this.buildSourcingRequest(false)  // submit=false (draft)
    };
    const formData = new FormData();


    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );

    formData.append('request', jsonBlob);


    if (this.supportDoc?.file) {
      formData.append('file', this.supportDoc.file);
    }
    this.demandService.createStaffing(formData)
      .then((res: any) => {
        this.isSaving = false;
        if (res?.responsecode === '00') {
          if (type !== 'draft') this.goTo(5);
          if (type === 'draft') {
            this.notificationService.success(
              'Success',
              'Draft saved successfully!'
            );
          }
        } else {
          this.showBanner(res?.message || 'Failed to save Sourcing Strategy', 'err');
        }
      })
      .catch(() => {
        this.isSaving = false;
        this.showBanner('Error saving Sourcing Strategy. Please try again.', 'err');
      });
  }

  validateStep5(type: any): void {
    this.isSaving = true;
    const payload = {
      positonBascicsRequest: this.buildPositionBasicsRequest(),
      businessJustificationRequest: this.buildBusinessJustificationRequest(),
      budgetAndCompensationRequest: this.buildBudgetRequest(),
      rolesAndRequirementsRequest: this.buildRolesRequest(),
      sourcingStrategyRequest: this.buildSourcingRequest(true),  // submit=true
      reviewRequest: { srId: this.srId, submit: true }
    };
    const formData = new FormData();


    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );

    formData.append('request', jsonBlob);


    if (this.supportDoc?.file) {
      formData.append('file', this.supportDoc.file);
    }
    this.demandService.createStaffing(formData)
      .then((res: any) => {
        this.isSaving = false;
        if (res?.responsecode === '00') {

          const budgetStatus = res?.data?.status;
          if (budgetStatus === 'RED') {
            this.showBanner(`Budget validation failed: ${res?.data?.message}`, 'err');
            return;
          }
          if (budgetStatus === 'YELLOW') {

            this.showBanner(`Notice: ${res?.data?.message}`, 'ok');
          }
          if (type !== 'draft') this.goTo(6);
          if (type === 'draft') {
            this.notificationService.success(
              'Success',
              'Draft saved successfully!'
            );
          }
        } else {
          this.showBanner(res?.message || 'Submission failed. Please try again.', 'err');
        }
      })
      .catch(() => {
        this.isSaving = false;
        this.showBanner('Error submitting SR. Please try again.', 'err');
      });
  }

  private buildPositionBasicsRequest(): object {
    const f = this.step0Form.value;
    return {
      srId: this.srId,
      jobTitle: f.jobTitle,
      departmentId: f.dept,
      businessUnitId: f.bu,
      reportingManagerInfo: f.manager,
      location: f.location,
      seniorityLevel: f.seniority,
      openings: f.openings,
      targetStartDate: f.startDate,
      workMode: f.workMode,
      employmentType: f.empType,
      priority: f.priority
    };
  }

  private buildBusinessJustificationRequest(): object {
    const f = this.step1Form.value;
    return {
      srId: this.srId,
      requisitionType: f.justType,
      businessCase: f.bizCase,
      impactIfNotFilled: f.impactNote,
      replacesEmployee: this.replaceEmployee?.id ?? null
    };
  }

  private buildBudgetRequest(): object {
    const f = this.step2Form.value;

    const parts = String(f.salaryComp).split('-');
    const minSalary = parseFloat(parts[0] || '0') * 100000;
    const maxSalary = parseFloat(parts[1] || '0') * 100000;
    const proposedTotal = (Number(f.proposedComp) || 0) * 100000;
    const signingAmt = f.signingBonus ? (Number(f.signingAmt) || 0) : 0;
    const equityAmt = f.equity ? (Number(f.equityAmt) || 0) : 0;
    const relocAmt = f.relocation ? (Number(f.relocAmt) || 0) : 0;

    return {
      srId: this.srId,
      minSalary,
      maxSalary,
      proposedTotalCompensation: proposedTotal,
      signingBonus: f.signingBonus,
      equity: f.equity,
      relocationBudget: f.relocation,
      signingBonusAmount: signingAmt,
      equityAmount: equityAmt,
      relocationBudgetAmount: relocAmt,
      annualHiringCost: proposedTotal + signingAmt + equityAmt + relocAmt
    };
  }

  private buildRolesRequest(): object {
    const f = this.step3Form.value;
    return {
      srId: this.srId,
      skillsMustHave: this.mustSkills,
      niceToHaveSkills: this.niceSkills,
      educationRequirement: f.eduReq,
      travelRequirement: f.travel,
      minExperience: f.expMin,
      maxExperience: f.expMax,
      minInterviewRounds: f.interviewMin,
      maxInterviewRounds: f.interviewMax,
      certificationsRequired: this.certs,
      languages: this.langs,
      assessmentRequired: f.assessmentOn
    };
  }

  private buildSourcingRequest(submit: boolean): object {
    const f = this.step4Form.value;

    return {
      srId: this.srId,
      internalBoard: this.jobBoards.includes('Internal Board'),
      naukri: this.jobBoards.includes('Naukri'),
      linkedIn: this.jobBoards.includes('LinkedIn'),
      indeed: this.jobBoards.includes('Indeed'),
      companySite: this.jobBoards.includes('Company Site'),
      agencyRpo: this.jobBoards.includes('Agency / RPO'),
      internalFirstPolicy: f.internalFirst,
      sourcingBudget: Number(f.sourcingBudget) || 0,
      referralEnabled: f.referralOn,
      referralAmount: f.referralOn ? (Number(f.referralAmt) || 0) : 0,
      diversityEnabled: f.diversityOn,
      diversityTags: f.diversityOn ? this.diversityBoards.join(', ') : '',
      submit
    };
  }


  loadStep0Data() {
    const obj = {
      page: 0, size: 10, sortBy: 'id', direction: 'DESC', filters: {}
    };

    forkJoin({
      business: this.userService.getBussinessUnits(),
      seniority: this.demandService.getSeniority(),
      firstPage: this.userService.getList({ ...obj, page: 0, size: 10 }),
    })
      .pipe(
        switchMap(({ business, seniority, firstPage }: { business: any; seniority: any; firstPage: any }) => {
          this.seniorityIC = seniority?.data;
          this.bussiness = business?.data;
          const totalElements: number = firstPage?.data?.totalElements ?? 0;
          if (totalElements <= 10) return of(firstPage);
          return this.userService.getList({ ...obj, page: 0, size: totalElements });
        })
      )
      .subscribe({
        next: (res: any) => {
          this.managersList = res?.content ?? res?.data?.users ?? [];
          if (this.editMode && this.srId) {
            this.prefillFromSr();
          } else {
            const email = this.authService.getUserName();
            const findEmp = this.managersList.find(item => item.email === email);
            this.selectManager(findEmp);
          }
        },
        error: () => this.showBanner('Failed to load users', 'err')
      });
  }

  private async prefillFromSr(): Promise<void> {
    if (!this.srId) return;
    try {
      const res: any = await this.demandService.getBySrId(this.srId);
      if (res?.responsecode !== '00' || !res?.data) return;

      const d = res.data;
      const p = d.positonBasicsResponse ?? {};
      const bj = d.businessJustificationResponse ?? {};
      const bc = d.budgetAndCompensationResponse ?? {};
      const rr = d.rolesAndRequirementsResponse ?? {};
      const ss = d.sourcingStrategyResponse ?? {};

      // --- Step 0: Position Basics ---
      this.pendingDeptPrefill = p.departmentId ?? null;
      this.step0Form.patchValue({
        jobTitle: p.jobTitle ?? '',
        bu: p.businessUnitId ?? '',
        location: p.location ?? '',
        workMode: p.workMode ?? '',
        empType: p.employmentType ?? '',
        seniority: p.seniorityLevel ?? '',
        openings: p.openings ?? 1,
        priority: p.priority ?? '',
        startDate: p.targetStartDate ?? ''
      });

      // Reporting managers
      this.selectedManagers = [];
      this.step0Form.get('manager')?.setValue([]);
      const managerIds: number[] = Array.isArray(p.reportingManagerInfo) ? p.reportingManagerInfo : [];
      managerIds.forEach((id: number) => {
        const mgr = this.managersList.find(m => m.id === id);
        if (mgr) this.selectManager(mgr);
      });

      // --- Step 1: Business Justification ---
      this.step1Form.patchValue({
        justType: bj.requisitionType ?? 'New Headcount',
        bizCase: bj.businessCase ?? '',
        impactNote: bj.impactIfNotFilled ?? '',
        replacesEmp: bj.replacesEmployee ?? ''
      });

      // --- Step 2: Budget & Compensation ---
      this.step2Form.patchValue({
        proposedComp: bc.proposedTotalCompensation ? (bc.proposedTotalCompensation / 100000) : 0,
        signingBonus: !!bc.signingBonus,
        signingAmt: bc.signingBonusAmount ?? '',
        equity: !!bc.equity,
        equityAmt: bc.equityAmount ?? '',
        relocation: !!bc.relocationBudget,
        relocAmt: bc.relocationBudgetAmount ?? ''
      });

      // --- Step 3: Role Requirements ---
      this.step3Form.patchValue({
        eduReq: rr.educationRequirement ?? '',
        travel: rr.travelRequirement ?? '',
        expMin: rr.minExperience ?? 0,
        expMax: rr.maxExperience ?? 0,
        interviewMin: rr.minInterviewRounds ?? 0,
        interviewMax: rr.maxInterviewRounds ?? 0,
        assessmentOn: !!rr.assessmentRequired
      });
      this.mustSkills = this.splitCsv(rr.skillsMustHave);
      this.niceSkills = this.splitCsv(rr.niceToHaveSkills);
      this.certs = this.splitCsv(rr.certificationsRequired);
      this.langs = this.splitCsv(rr.languages);

      // --- Step 4: Sourcing Strategy ---
      this.step4Form.patchValue({
        internalFirst: !!ss.internalFirstPolicy,
        referralOn: !!ss.referralEnabled,
        referralAmt: ss.referralAmount ?? '',
        sourcingBudget: ss.sourcingBudget != null ? String(ss.sourcingBudget) : '',
        diversityOn: !!ss.diversityEnabled
      });

      this.jobBoards = [];
      const boardKeys: Record<string, string> = {
        internalBoard: 'Internal Board',
        naukri: 'Naukri',
        linkedIn: 'LinkedIn',
        indeed: 'Indeed',
        companySite: 'Company Site',
        agencyRpo: 'Agency / RPO'
      };
      Object.entries(boardKeys).forEach(([key, label]) => {
        if (ss[key]) this.jobBoards.push(label);
      });
      this.diversityBoards = this.splitCsv(ss.diversityTags);

    } catch {
      this.showBanner('Failed to load SR for editing', 'err');
    }
  }

  private splitCsv(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((v: any) => String(v).trim()).filter(Boolean);
    }
    return String(value).split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  aiSuggestSkills(): void {
    const objSkills = {
      job_title: this.jobTitle,
      department: this.department,
      business_case: this.bizCase,
    };
    const objLanguage = {
      job_title: this.jobTitle,
      department: this.department,
      seniority: this.seniority,
      business_justification: this.bizCase,
      location: this.location,
    };

    forkJoin({
      mustSkills: this.demandService.mustHaveSkills(objSkills),
      niceSkills: this.demandService.niceHaveSkills(objSkills),
      language: this.demandService.language(objLanguage),
      certificate: this.demandService.certificate(objLanguage),
      travelOpts: this.demandService.getTravel(),
      education: this.demandService.education(objLanguage),
    }).subscribe({
      next: (res: any) => {
        this.mustSuggestions = res.mustSkills?.skills ?? [];
        this.niceSuggestions = res.niceSkills?.skills ?? [];
        this.langSuggestions = res.language?.languages ?? [];
        this.certSuggestions = res.certificate?.certifications ?? [];
        this.travelOpts = res?.travelOpts?.data;
        this.educationOpts = res?.education?.qualifications;
      },
      error: () => this.showBanner('AI suggestions unavailable', 'err')
    });
  }
  get empType(): string { return this.step0Form.get('empType')?.value }
  get todayStr(): string { return new Date().toISOString().split('T')[0]; }
  get jobTitle(): string { return this.step0Form.get('jobTitle')?.value; }
  get department(): string {
    const deptId = this.step0Form.get('dept')?.value;

    return this.deptKeys.find(d => d?.id === deptId)?.name || '';
  }
  get location(): string { return this.step0Form.get('location')?.value; }
  get seniority(): string {
    const ser = this.seniorityIC.find(item => item.id == this.step0Form.get('seniority')?.value);
    return ser?.name;
  }

  get needsReplace(): boolean {
    const jt = this.step1Form.get('justType')?.value;
    return jt === 'Backfill' || jt === 'Replacement';
  }

  get bizCaseLen(): number { return (this.step1Form.get('bizCase')?.value || '').length; }
  get bizCase(): string { return this.htmlToText(this.step1Form.get('bizCase')?.value || ''); }
  get impactLen(): number { return (this.step1Form.get('impactNote')?.value || '').length; }

  get expMin() { return this.step3Form.get('expMin')?.value; }
  get expMax() { return this.step3Form.get('expMax')?.value; }
  get minInterviewData() { return this.step3Form.get('interviewMin')?.value; }
  get maxInterviewData() { return this.step3Form.get('interviewMax')?.value; }

  get minPercent(): number { return ((this.expMin - this.min) / (this.max - this.min)) * 100; }
  get maxPercent(): number { return ((this.expMax - this.min) / (this.max - this.min)) * 100; }
  get rangeWidth(): number { return this.maxPercent - this.minPercent; }
  get minInterview(): number { return ((this.minInterviewData - this.min) / (this.max - this.min)) * 100; }
  get maxInterview(): number { return ((this.maxInterviewData - this.min) / (this.max - this.min)) * 100; }
  get rangeInterview(): number { return this.maxInterview - this.minInterview; }




  get totalCompensation(): number {
    const f = this.step2Form.value;

    const toLPA = (val: number) => (val || 0) / 100000;


    const base = toLPA(Number(f.proposedComp));

    let salary = 0;
    if (f.salaryComp) {
      const parts = String(f.salaryComp).split('-');

      const min = Number(parts[0]) || 0;
      const max = Number(parts[1]) || 0;

      salary = (min + max) / 2 / 100000;
    }

    const signing = f.signingBonus ? toLPA(Number(f.signingAmt)) : 0;
    const equity = f.equity ? toLPA(Number(f.equityAmt)) : 0;
    const relocation = f.relocation ? toLPA(Number(f.relocAmt)) : 0;

    return +(base + salary + signing + equity + relocation).toFixed(2);
  }
  getCompStatus(status: string) {
    switch (status) {
      case 'RED':
        return {
          color: 'red',
          msg: '✗ Budget exceeds allowed range'
        };

      case 'YELLOW':
        return {
          color: 'yellow',
          msg: '⚠ Slightly above budget — approval required'
        };

      case 'GREEN':
        return {
          color: 'green',
          msg: '✓ Within budget — good to proceed'
        };

      default:
        return {
          color: 'blue',
          msg: ''
        };
    }
  }


  onMinChange() {
    if (this.expMin >= this.expMax) this.step3Form.patchValue({ expMin: this.expMax - 1 });
  }
  onMaxChange() {
    if (this.expMax <= this.expMin) this.step3Form.patchValue({ expMax: this.expMin + 1 });
  }
  onMinInterview() {
    if (this.minInterviewData >= this.maxInterviewData)
      this.step3Form.patchValue({ interviewMin: this.maxInterviewData - 1 });
  }
  onMaxInterview() {
    if (this.maxInterviewData <= this.minInterviewData)
      this.step3Form.patchValue({ interviewMax: this.minInterviewData + 1 });
  }


  addTag(arr: string[], val: string, max = 10): string {
    val = val.trim();
    if (val && arr.length < max && !arr.includes(val)) arr.push(val);
    return '';
  }
  removeTag(arr: string[], i: number): void { arr.splice(i, 1); }
  onTagKeydown(e: KeyboardEvent, arr: string[], inputRef: { value: string }): void {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); inputRef.value = this.addTag(arr, inputRef.value); }
  }

  addMust(v: string): void { this.mustSkillInput = this.addTag(this.mustSkills, v); }
  removeMust(i: number): void { this.removeTag(this.mustSkills, i); }
  onMustKeydown(e: KeyboardEvent): void { const ref = { value: this.mustSkillInput }; this.onTagKeydown(e, this.mustSkills, ref); this.mustSkillInput = ref.value; }
  addMustFromInput() {
    const value = this.mustSkillInput?.trim();
    if (!value || this.mustSkills.length >= 10 || this.mustSkills.includes(value)) return;
    this.mustSkills.push(value);
    this.mustSkillInput = '';
  }

  addNice(v: string): void { this.niceSkillInput = this.addTag(this.niceSkills, v); }
  removeNice(i: number): void { this.removeTag(this.niceSkills, i); }
  onNiceKeydown(e: KeyboardEvent): void { const ref = { value: this.niceSkillInput }; this.onTagKeydown(e, this.niceSkills, ref); this.niceSkillInput = ref.value; }

  addCert(v: string): void { this.certInput = this.addTag(this.certs, v); }
  removeCert(i: number): void { this.removeTag(this.certs, i); }
  onCertKeydown(e: KeyboardEvent): void { const ref = { value: this.certInput }; this.onTagKeydown(e, this.certs, ref); this.certInput = ref.value; }

  addLang(v: string): void { this.langInput = this.addTag(this.langs, v); }
  removeLang(i: number): void { this.removeTag(this.langs, i); }
  onLangKeydown(e: KeyboardEvent): void { const ref = { value: this.langInput }; this.onTagKeydown(e, this.langs, ref); this.langInput = ref.value; }


  toggleAssessType(t: string): void {
    const i = this.assessmentTypes.indexOf(t);
    if (i >= 0) this.assessmentTypes.splice(i, 1); else this.assessmentTypes.push(t);
  }
  toggleBoard(n: string): void {
    const i = this.jobBoards.indexOf(n);
    if (i >= 0) this.jobBoards.splice(i, 1); else this.jobBoards.push(n);
  }
  toggleDiversity(v: string): void {
    const i = this.diversityBoards.indexOf(v);
    if (i >= 0) this.diversityBoards.splice(i, 1); else this.diversityBoards.push(v);
  }


  focusInput() { this.managerInput.nativeElement.focus(); }

  private getUnselectedUsers(): any[] {
    return this.managersList.filter(u => !this.selectedManagers.find(s => s.email === u.email));
  }

  selectManager(m: any): void {
    if (!m) return;
    if (!this.selectedManagers.find(x => x.email === m.email)) {
      this.selectedManagers.push(m);
      const currentIds: number[] = this.step0Form.get('manager')?.value ?? [];
      this.step0Form.get('manager')?.setValue([...currentIds, m.id]);
      this.step0Form.get('manager')?.markAsTouched();
    }
    this.step0Form.get('managerSearch')?.setValue('');
    this.filteredManagers = [...this.getUnselectedUsers()];
    this.showDropdown = false;
  }

  removeManager(m: any): void {
    this.selectedManagers = this.selectedManagers.filter(x => x.email !== m.email);
    const currentIds: number[] = this.step0Form.get('manager')?.value ?? [];
    this.step0Form.get('manager')?.setValue(currentIds.filter(id => id !== m.id));
    this.step0Form.get('manager')?.markAsTouched();
    this.filteredManagers = this.getUnselectedUsers();
  }

  onSearchManager($event: any) {
    const value = this.step0Form.get('managerSearch')?.value?.toLowerCase() || '';
    this.filteredManagers = this.managersList.filter(m =>
      m.username?.toLowerCase().includes(value) || m.name?.toLowerCase().includes(value)
    );
  }
  onSearchReplace() {
    const value = this.step0Form.get('replacesEmpSearch')?.value?.toLowerCase() || '';
    this.filteredManagers = this.managersList.filter(m =>
      m.username?.toLowerCase().includes(value) || m.name?.toLowerCase().includes(value)
    );
  }
  hideDropdown() { setTimeout(() => { this.showDropdown = false; }, 200); }

  selectReplaceEmployee(m: any) {
    this.replaceEmployee = m;
    this.step1Form.get('replacesEmp')?.setValue(m?.id)
  }
  removeReplaceEmp() { this.replaceEmployee = null; }


  getRoles(value: any) {
    this.deptKeys = [];
    this.userService.getDepartments(value)
      .then((res: any) => {
        this.deptKeys = res?.data;
        if (this.pendingDeptPrefill != null) {
          this.step0Form.patchValue({ dept: this.pendingDeptPrefill });
          this.pendingDeptPrefill = null;
        }
      })
      .catch((error: any) => console.log(error));
  }

  setWorkMode(v: string): void { this.step0Form.patchValue({ workMode: v }); }
  setEmpType(v: string): void { this.step0Form.patchValue({ empType: v }); }
  setPriority(v: string): void { this.step0Form.patchValue({ priority: v }); }
  setJustType(v: string): void {
    this.step1Form.patchValue({ justType: v });
    if (v !== 'Backfill' && v !== 'Replacement') this.step1Form.patchValue({ replacesEmp: '' });
  }

  changeOpenings(delta: number): void {
    const cur = this.step0Form.get('openings')!.value;
    const next = cur + delta;
    if (next >= 1 && next <= 999) this.step0Form.patchValue({ openings: next });
  }

  hasError(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(form: FormGroup, field: string, name: any): string {
    const ctrl = form.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return `${name.replace(/([A-Z])/g, ' $1')} is required`;
    if (ctrl.errors['minlength']) return `Min ${ctrl.errors['minlength'].requiredLength} characters`;
    if (ctrl.errors['maxlength']) return `Max ${ctrl.errors['maxlength'].requiredLength} characters`;
    if (ctrl.errors['min']) return `Minimum value is ${ctrl.errors['min'].min}`;
    if (ctrl.errors['max']) return `Maximum value is ${ctrl.errors['max'].max}`;
    if (ctrl.errors['pastDate']) return 'Date must be today or in the future';
    return 'Invalid value';
  }

  onBizCaseChange(event: any) { /* char count handled by getter */ }
  onImpactChange(event: any) { /* char count handled by getter */ }


  onFileSelected(event: any): void { this.validateAndSetFile(event.target.files[0]); }

  onDragOver(event: DragEvent) { event.preventDefault(); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.validateAndSetFile(event.dataTransfer?.files[0]);
  }

  validateAndSetFile(file: any) {
    this.errorMsg = '';
    if (!file) return;
    if (file.type !== 'application/pdf') { this.errorMsg = 'Only PDF files are allowed'; return; }
    if (file.size > 20 * 1024 * 1024) { this.errorMsg = 'File size exceeds 20MB'; return; }
    this.supportDoc = { file, name: file.name, sizeText: (file.size / 1024).toFixed(1) + ' KB' };
  }

  removeDoc(): void { this.supportDoc = null; }


  stepClass(i: number): string {
    if (i === this.currentStep) return 'active';
    if (i < this.currentStep) return 'done';
    return '';
  }

  toggleReviewSection(i: number): void { this.reviewSectionOpen[i] = !this.reviewSectionOpen[i]; }


  openModal(type: 'must' | 'nice' | 'cert' | 'lang') {
    const labelMap: any = {
      must: 'Enter Must Have Skill',
      nice: 'Enter Nice-to-Have Skill',
      cert: 'Enter Certification',
      lang: 'Enter Language'
    };
    this.modalType = type;
    this.modalLabel = labelMap[type];
    const addSkill = this.modal.create({
      nzTitle: '',
      nzContent: AddSkillComponent,
      nzWidth: '40%',
      nzCentered: true,
      nzBodyStyle: { 'max-height': '100vh', 'overflow-y': 'auto', 'padding': '10px' },
      nzFooter: null,
    });
    const instance = addSkill.getContentComponent();
    instance.modalType = this.modalType;
    instance.modalForm = this.modalForm;
    instance.modalLabel = this.modalLabel;
    addSkill.afterClose.subscribe((result: any) => { if (result) this.saveModal(); });
  }

  saveModal() {
    const val = this.modalForm.get('value')?.value?.trim();
    if (!val) return;
    if (this.modalType === 'must') this.mustSuggestions.push(val);
    if (this.modalType === 'nice') this.niceSuggestions.push(val);
    if (this.modalType === 'cert') this.certSuggestions.push(val);
    if (this.modalType === 'lang') this.langSuggestions.push(val);
    this.modalForm.reset();
  }


  showBanner(msg: string, type: 'ok' | 'err'): void {
    this.banner = { text: msg, type };
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => { this.banner = null; }, 3500);
  }

  saveDraft(): void {
    switch (this.currentStep) {
      case 0: this.validateStep0('draft'); break;
      case 1: this.validateStep1('draft'); break;
      case 2: this.validateStep2('draft'); break;
      case 3: this.validateStep3('draft'); break;
      case 4: this.validateStep4('draft'); break;
      case 5: this.validateStep5('draft'); break;
    }
  }

  viewInMySRs(): void {
    this.router.navigateByUrl('/demand/my-jds')
  }

  raiseAnother(): void {
    this.currentStep = 0;
    this.srId = null;
    this.stepDataLoaded = {};
    this.buildForms();
    this.mustSkills = []; this.niceSkills = []; this.certs = []; this.langs = [];
    this.mustSuggestions = []; this.niceSuggestions = []; this.certSuggestions = []; this.langSuggestions = [];
    this.jobBoards = []; this.diversityBoards = []; this.assessmentTypes = [];
    this.selectedManagers = []; this.replaceEmployee = null;
    this.supportDoc = null;
    this.goTo(0);
  }

  onExpMinChange(val: number): void {
    let expMax = this.step3Form.value.expMax;
    if (val > expMax) expMax = val;
    this.step3Form.patchValue({ expMin: val, expMax });
  }

  onExpMaxChange(val: number): void {
    let expMin = this.step3Form.value.expMin;
    if (val < expMin) expMin = val;
    this.step3Form.patchValue({ expMax: val, expMin });
  }

  changeRounds(delta: number): void {
    const cur = this.step3Form.get('interviewRounds')?.value ?? 0;
    const next = cur + delta;
    if (next >= 1 && next <= 8) this.step3Form.patchValue({ interviewRounds: next });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  }

  trackByIndex(i: number): number { return i; }

  htmlToText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  get reviewStep0() {
    const f = this.step0Form.value;
    return {
      jobTitle: f.jobTitle,
      dept: f.dept,
      bu: f.bu,
      location: f.location,
      workMode: f.workMode,
      empType: f.empType,
      seniority: f.seniority,
      openings: f.openings,
      priority: f.priority,
      startDate: f.startDate
    };
  }

  get reviewStep1() {
    const f = this.step1Form.value;
    return {
      justType: f.justType,
      bizCase: f.bizCase,
      impactNote: f.impactNote
    };
  }

  get reviewStep2() {
    const f = this.step2Form.value;
    return {
     
      hcSlot: f.hcSlot,        // ← was missing
      salaryComp: f.salaryComp,    // ← was missing
      proposedComp: f.proposedComp,
      signingBonus: f.signingBonus,  // ← was missing
      signingAmt: f.signingAmt,    // ← was missing
      equity: f.equity,        // ← was missing
      equityAmt: f.equityAmt,     // ← was missing
      relocation: f.relocation,    // ← was missing
      relocAmt: f.relocAmt       // ← was missing
    };
  }

  get reviewStep3() {
    const f = this.step3Form.value;
    return {
      eduReq: f.eduReq,
      travel: f.travel,
      expMin: f.expMin,
      expMax: f.expMax,
      interviewMin: f.interviewMin,
      interviewMax: f.interviewMax,
      assessmentOn: f.assessmentOn
    };
  }

  get reviewStep4() {
    const f = this.step4Form.value;
    return {
      internalFirst: f.internalFirst,
      sourcingBudget: f.sourcingBudget,
      referralOn: f.referralOn,   // ← was missing
      referralAmt: f.referralAmt,  // ← was missing
      diversityOn: f.diversityOn
    };
  }
}