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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, QuillModule, NzModalModule],
  templateUrl: './create-staff.component.html',
  styleUrl: './create-staff.component.scss'
})
export class CreateStaffComponent implements OnInit, OnDestroy {

  readonly STEPS: StepConfig[] = [
    { label: 'Position Basics', icon: '📋' },
    { label: 'Business Justification', icon: '📝' },
    { label: 'Budget & Comp', icon: '💰' },
    { label: 'Role Requirements', icon: '🎯' },
    { label: 'Sourcing Strategy', icon: '🔍' },
    { label: 'Review', icon: '👁' },
    { label: 'Approval', icon: '✅' }
  ];
  currentStep = 0;
  errorMsg: any;
  modalType: 'must' | 'nice' | 'cert' | 'lang' = 'must';
  modalLabel: any;
  banner: BannerMessage | null = null;
  private bannerTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly depts: Record<string, string> = {
    Engineering: 'Product',
    HR: 'Operations',
    Sales: 'Revenue',
    Finance: 'Corporate',
    Marketing: 'Growth'
  };

  readonly seniorityIC = ['IC1', 'IC2', 'IC3', 'IC4', 'IC5', 'IC6', 'IC7'];
  readonly seniorityMgr = ['M1', 'M2', 'M3', 'M4', 'M5'];
  readonly requisitionTypes = ['New Headcount', 'Backfill', 'Replacement', 'Contract to Perm'];
  readonly workModes = ['Remote', 'Hybrid', 'On-site'];
  readonly empTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  readonly priorities = ['Critical', 'High', 'Standard'];
  readonly educationOpts = ['None', 'Degree preferred', 'Degree required — CS', 'Degree required — Design', 'Degree required — Business'];
  readonly travelOpts = ['None', '< 10%', '10–25%', '25–50%', '50%+'];
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
    { n: 'Hiring Manager (You)', status: 'Approved',level:'1' },
    { n: 'Finance (Aryan K.)', status: 'Pending',level:'1' },
    { n: 'VP Eng (Priya R.)', status: 'Pending',level:'1' }
  ];
  showDropdown = false;

  managersList = [
    { name: 'Ninja Saboteur', role: 'UX/UI DESIGNER' },
    { name: 'Niall Mackinnon', role: 'SR SOFTWARE ENGINEER' },
    { name: 'Nicholas Ceter', role: 'SR SOFTWARE ENGINEER' },
    { name: 'Anita Simon', role: 'ANITA SIMON | SR SOFTWARE ENGINEER' },
    { name: 'Nicholas Grubb', role: 'INNGRUBB / PRINCIPAL GPM' },
    { name: 'Nicholas Arquel', role: 'INARQUEL / SOFTWARE ENGINEER 2' }
  ];
  @ViewChild('managerInput') managerInput!: ElementRef;
  mustSuggestions:any[]=[];
  niceSuggestions:any[]=[];
  certSuggestions:any=[];
  langSuggestions:any[]=[]
  selectedManagers: any[] = [{ name: 'Venkat' }];
  filteredManagers: any[] = [];
  replaceEmployee: any = null;
  mustSkills: string[] = [];
  niceSkills: string[] = [];
  certs: string[] = [];
  langs: string[] = [];
  mustSkillInput = '';
  niceSkillInput = '';
  certInput = '';
  langInput = '';
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };
  jobBoards: string[] = [];
  diversityBoards: string[] = [];
  assessmentTypes: string[] = [];
  supportDoc: any = null;

  reviewSectionOpen: boolean[] = [true, true, true, true];
  private modal = inject(NzModalService);
  step0Form!: FormGroup;
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  bandMin = 8;
  bandMid = 12;
  bandMax = 18;
  bandRef = 14;
  compMin = 5;
  compMax = 25;
  modalForm!: FormGroup;
  min = 0;
  max = 25;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForms();
    this.modalForm = this.fb.group({
      value: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
  }

  private buildForms(): void {
    this.step0Form = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      dept: ['', Validators.required],
      bu: [''],
      manager: ['', Validators.required],
      location: ['', Validators.required],
      workMode: ['', Validators.required],
      empType: ['', Validators.required],
      seniority: ['', Validators.required],
      openings: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
      priority: ['', Validators.required],
      startDate: ['', [Validators.required, futureDateValidator]]
    });

    this.step1Form = this.fb.group({
      justType: ['New Headcount', Validators.required],
      replacesEmp: [''],
      bizCase: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2000)]],
      impactNote: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2000)]]
    });

    this.step2Form = this.fb.group({
      costCenter: ['BNG-CC-001 — Engineering Core'],
      budgetCode: ['FY26-BNG-OPEX-42'],
      hcSlot: [true],
      salaryComp: ['10-20'],
      proposedComp: [23],
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


  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get deptKeys(): string[] {
    return Object.keys(this.depts);
  }

  get needsReplace(): boolean {
    const jt = this.step1Form.get('justType')?.value;
    return jt === 'Backfill' || jt === 'Replacement';
  }

  get bizCaseLen(): number {
    return (this.step1Form.get('bizCase')?.value || '').length;
  }

  get impactLen(): number {
    return (this.step1Form.get('impactNote')?.value || '').length;
  }
  get bandPct() {
    return ((this.bandRef - this.bandMin) / (this.bandMax - this.bandMin)) * 100;
  }
  get bandMidPct() {
    return ((this.bandMid - this.bandMin) / (this.bandMax - this.bandMin)) * 100;
  }
  get compPct() {
    const val = this.step2Form.get('proposedComp')?.value || 0;
    return ((val - this.compMin) / (this.compMax - this.compMin)) * 100;
  }

  // get isInBand(): boolean {
  //   const val = this.step2Form.value.proposedComp;
  //   return val >= this.bandMin && val <= this.bandMax;
  // }



  
  get expMin() {
    return this.step3Form.get('expMin')?.value;
  }

  get expMax() {
    return this.step3Form.get('expMax')?.value;
  }

  get minInterviewData() {
    return this.step3Form.get('interviewMin')?.value;
  }

  get maxInterviewData() {
    return this.step3Form.get('interviewMax')?.value;
  }
  get minPercent(): number {
    return ((this.expMin - this.min) / (this.max - this.min)) * 100;
  }
  get minInterview(): number {
    return ((this.minInterviewData - this.min) / (this.max - this.min)) * 100;
  }
  get maxInterview(): number {
    return ((this.maxInterviewData - this.min) / (this.max - this.min)) * 100;
  }
  get maxPercent(): number {
    return ((this.expMax - this.min) / (this.max - this.min)) * 100;
  }

  get rangeInterview(): number {
    return this.maxInterview - this.minInterview;
  }
  get rangeWidth(): number {
    return this.maxPercent - this.minPercent;
  }

  onMinChange() {
    if (this.expMin >= this.expMax) {
      this.step3Form.patchValue({
        expMin: this.expMax - 1
      });
    }
  }
  onMinInterview() {
    if (this.minInterviewData >= this.maxInterviewData) {
      this.step3Form.patchValue({
        interviewMin: this.maxInterviewData - 1
      })
    }
  }
  onMaxInterview() {
    if (this.maxInterviewData <= this.minInterviewData) {
      this.step3Form.patchValue({
        interviewMax: this.minInterviewData - 1
      })
    }
  }
  onMaxChange() {
    if (this.expMax <= this.expMin) {
      this.step3Form.patchValue({
        expMax: this.expMin + 1
      });
    }
  }
  

  

  hasError(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(form: FormGroup, field: string,name:any): string {
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

  goTo(n: number): void {
    this.currentStep = n;
  }
  selectReplaceEmployee(m: any) {
    this.replaceEmployee = m;
  }
  removeReplaceEmp() {
    this.replaceEmployee = null;
  }
  stepClass(i: number): string {
    if (i === this.currentStep) return 'active';
    if (i < this.currentStep) return 'done';
    return '';
  }


  onDeptChange(val: string): void {
    this.step0Form.patchValue({ dept: val, bu: this.depts[val] || '' });
  }
  openModal(type: 'must' | 'nice' | 'cert' | 'lang') {
    const labelMap: any = {
      must: 'Enter Must Have Skill',
      nice: 'Enter Nice-to-Have Skill',
      cert: 'Enter Certification',
      lang: 'Enter Language '
    };
    this.modalType = type;
    this.modalLabel =labelMap[type];
    const addSkill = this.modal.create({
      nzTitle: '',
      nzContent: AddSkillComponent,
      nzWidth: '40%',
      nzCentered: true,
      nzBodyStyle: {
        'max-height': '100vh',
        'overflow-y': 'auto',
        'padding': '10px'
      },
      nzFooter: null,
    })
    const instance = addSkill.getContentComponent();
    instance.modalType = this.modalType;
    instance.modalForm = this.modalForm;
    instance.modalLabel=this.modalLabel;
    addSkill.afterClose.subscribe((result: any) => {
      if (result) {
        this.saveModal()
      }
    })
  }

  saveModal() {
    const val = this.modalForm.get('value')?.value?.trim();
    if (!val) return;

    if (this.modalType === 'must')this.mustSuggestions.push(val);
    if (this.modalType === 'nice')this.niceSuggestions.push(val);
    if (this.modalType === 'cert')this.certSuggestions.push(val);
    if (this.modalType === 'lang')this.langSuggestions.push(val);
    this.modalForm.reset();
  }
  setWorkMode(v: string): void { this.step0Form.patchValue({ workMode: v }); }
  setEmpType(v: string): void { this.step0Form.patchValue({ empType: v }); }
  setPriority(v: string): void { this.step0Form.patchValue({ priority: v }); }

  changeOpenings(delta: number): void {
    const cur = this.step0Form.get('openings')!.value;
    const next = cur + delta;
    if (next >= 1 && next <= 999) this.step0Form.patchValue({ openings: next });
  }

  validateStep0(): void {
    this.step0Form.markAllAsTouched();
    if (this.step0Form.invalid) {
      this.showBanner('Please fix the highlighted fields', 'err');
      return;
    }
    this.currentStep = 1;
  }


  setJustType(v: string): void {
    this.step1Form.patchValue({ justType: v });
    if (v !== 'Backfill' && v !== 'Replacement') {
      this.step1Form.patchValue({ replacesEmp: '' });
    }
  }



  onBizCaseChange(event: any) {
    const text = event.text?.trim() || '';
    // this.bizCaseLen = text.length;
  }

  onImpactChange(event: any) {
    const text = event.text?.trim() || '';
    // this.impactLen = text.length;
  }
  removeDoc(): void { this.supportDoc = null; }




  validateStep1(): void {
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
    this.currentStep = 2;
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Drop file
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    this.validateAndSetFile(file);
  }

  validateStep2(): void {
    // if (!this.isInBand) { this.showBanner('Proposed compensation is outside salary band', 'err'); return; }
    if (!this.step2Form.value.hcSlot) { this.showBanner('HC slot required to proceed', 'err'); return; }
    this.currentStep = 3;
  }


  addTag(arr: string[], val: string, max = 10): string {
    val = val.trim();
    if (val && arr.length < max && !arr.includes(val)) arr.push(val);
    return '';
  }

  removeTag(arr: string[], i: number): void { arr.splice(i, 1); }

  onTagKeydown(e: KeyboardEvent, arr: string[], inputRef: { value: string }): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      inputRef.value = this.addTag(arr, inputRef.value);
    }
  }

  addMust(v: string): void { this.mustSkillInput = this.addTag(this.mustSkills, v); }
  removeMust(i: number): void { this.removeTag(this.mustSkills, i); }
  onMustKeydown(e: KeyboardEvent): void { const ref = { value: this.mustSkillInput }; this.onTagKeydown(e, this.mustSkills, ref); this.mustSkillInput = ref.value; }

  addNice(v: string): void { this.niceSkillInput = this.addTag(this.niceSkills, v); }
  removeNice(i: number): void { this.removeTag(this.niceSkills, i); }
  onNiceKeydown(e: KeyboardEvent): void { const ref = { value: this.niceSkillInput }; this.onTagKeydown(e, this.niceSkills, ref); this.niceSkillInput = ref.value; }

  addCert(v: string): void { this.certInput = this.addTag(this.certs, v); }
  removeCert(i: number): void { this.removeTag(this.certs, i); }
  onCertKeydown(e: KeyboardEvent): void { const ref = { value: this.certInput }; this.onTagKeydown(e, this.certs, ref); this.certInput = ref.value; }

  addLang(v: string): void { this.langInput = this.addTag(this.langs, v); }
  removeLang(i: number): void { this.removeTag(this.langs, i); }
  onLangKeydown(e: KeyboardEvent): void { const ref = { value: this.langInput }; this.onTagKeydown(e, this.langs, ref); this.langInput = ref.value; }

  changeRounds(delta: number): void {
    const cur = this.step3Form.get('interviewRounds')!.value;
    const next = cur + delta;
    if (next >= 1 && next <= 8) this.step3Form.patchValue({ interviewRounds: next });
  }

  toggleAssessType(t: string): void {
    const i = this.assessmentTypes.indexOf(t);
    if (i >= 0) this.assessmentTypes.splice(i, 1);
    else this.assessmentTypes.push(t);
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

  aiSuggestSkills(): void {
    this.mustSkills = ['UX Design', 'Usability Testing', 'Wireframing', 'User Research', 'Figma'];
    this.niceSkills = ['HTML', 'CSS', 'Bootstrap'];
  }

  validateStep3(): void {
    this.step3Form.markAllAsTouched();
    if (this.mustSkills.length < 3) {
      this.showBanner('Add at least 3 must-have skills', 'err');
      return;
    }
    if (this.step3Form.get('eduReq')?.invalid) {
      this.showBanner('Please fix the highlighted fields', 'err');
      return;
    }
    this.currentStep = 4;
  }

  toggleBoard(n: string): void {
    const i = this.jobBoards.indexOf(n);
    if (i >= 0) this.jobBoards.splice(i, 1);
    else this.jobBoards.push(n);
  }

  toggleDiversity(v: string): void {
    const i = this.diversityBoards.indexOf(v);
    if (i >= 0) this.diversityBoards.splice(i, 1);
    else this.diversityBoards.push(v);
  }

  validateStep4(): void {
    if (this.jobBoards.length === 0) {
      this.showBanner('Select at least one sourcing channel', 'err');
      return;
    }
    this.currentStep = 5;
  }

  // ── Step 5 ────────────────────────────────────────────────────────────────
  toggleReviewSection(i: number): void {
    this.reviewSectionOpen[i] = !this.reviewSectionOpen[i];
  }

  validateStep5(): void {
    this.currentStep = 6;
  }

  // ── Step 6 ────────────────────────────────────────────────────────────────
  viewInMySRs(): void { this.showBanner('Navigating to My SRs...', 'ok'); }

  raiseAnother(): void {
    this.currentStep = 0;
    this.buildForms();
    this.mustSkills = []; this.niceSkills = []; this.certs = []; this.langs = [];
    this.jobBoards = []; this.diversityBoards = []; this.assessmentTypes = [];
    this.supportDoc = null;
  }

  // ── Utility ───────────────────────────────────────────────────────────────
  showBanner(msg: string, type: 'ok' | 'err'): void {
    this.banner = { text: msg, type };
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => { this.banner = null; }, 3500);
  }

  saveDraft(): void { this.showBanner('Draft saved successfully', 'ok'); }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('');
  }

  trackByIndex(i: number): number { return i; }

  focusInput() {
    this.managerInput.nativeElement.focus();
  }

  selectManager(m: any) {
    if (!this.selectedManagers.find(x => x.name === m.name)) {
      this.selectedManagers.push(m);
    }

    this.step0Form.get('manager')?.setValue('');
    this.filteredManagers = [...this.managersList];
    this.showDropdown = false;
  }

  removeManager(m: any) {
    this.selectedManagers = this.selectedManagers.filter(x => x !== m);
  }

  onSearchManager() {
    const value = this.step0Form.get('manager')?.value?.toLowerCase() || '';

    this.filteredManagers = this.managersList.filter(m =>
      m.name.toLowerCase().includes(value)
    );
  }

  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.validateAndSetFile(file);
  }
  validateAndSetFile(file: any) {
    this.errorMsg = '';

    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.errorMsg = 'Only PDF files are allowed';
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMsg = 'File size exceeds 20MB';
      return;
    }

    const sizeText = (file.size / 1024).toFixed(1) + ' KB';

    this.supportDoc = {
      file: file,
      name: file.name,
      sizeText: sizeText
    };
  }
  get salaryPct() {
    const val = this.step2Form.get('salaryComp')?.value || 0;
    return ((this.step2Form.value.salaryComp - this.bandMin) /
      (this.bandMax - this.bandMin)) * 100;;
  }
  get totalCompensation(): number {
    const f = this.step2Form.value;

    const base = Number(f.proposedComp) || 0;
    const salary = Number(f.salaryComp) || 0;


    const signing = f.signingBonus
      ? (Number(f.signingAmt) || 0) / 100000
      : 0;

    const equity = f.equity
      ? (Number(f.equityAmt) || 0) / 100000
      : 0;

    const relocation = f.relocation
      ? (Number(f.relocAmt) || 0) / 100000
      : 0;

    return +(base + salary + signing + equity + relocation).toFixed(2);
  }

  get compStatus() {
    const f = this.step2Form.value;


    const base = Number(f.salaryComp) || 0;


    const proposed = Number(f.proposedComp) || 0;

    const signing = f.signingBonus ? (Number(f.signingAmt) || 0) / 100000 : 0;
    const equity = f.equity ? (Number(f.equityAmt) || 0) / 100000 : 0;
    const relocation = f.relocation ? (Number(f.relocAmt) || 0) / 100000 : 0;

    const total = proposed + base + signing + equity + relocation;

    const min = this.bandMin;
    const max = this.bandMax;

    const baseDiff = ((base - max) / max) * 100;
    const totalDiff = ((total - max) / max) * 100;


    if (base < min) {
      return {
        color: 'yellow',
        msg: `⚠ Base ₹${base}L below band (Min ₹${min}L) — candidate rejection risk | Total ₹${total.toFixed(2)}L`
      };
    }


    if (base > max) {
      if (baseDiff <= 5) {
        return {
          color: 'yellow',
          msg: `⚠ Base ₹${base}L slightly above band (≤5%) — approval required | Total ₹${total.toFixed(2)}L`
        };
      }

      return {
        color: 'red',
        msg: `✗ Base ₹${base}L exceeds band (Max ₹${max}L) — budget violation | Total ₹${total.toFixed(2)}L`
      };
    }
    if (base <= max && total > max) {
      if (totalDiff <= 5) {
        return {
          color: 'yellow',
          msg: `✓ Base within band | ⚠ Total ₹${total.toFixed(2)}L slightly above budget`
        };
      }

      return {
        color: 'red',
        msg: `✓ Base within band | ✗ Total ₹${total.toFixed(2)}L exceeds budget`
      };
    }


    return {
      color: 'green',
      msg: `✓ Base ₹${base}L within band | Total ₹${total.toFixed(2)}L optimal`
    };
  }
  addMustFromInput() {
    const value = this.mustSkillInput?.trim();
    if (!value) return;

    if (this.mustSkills.length >= 10) return;

    if (!this.mustSkills.includes(value)) {
      this.mustSkills.push(value);
    }

    this.mustSkillInput = '';
  }




}