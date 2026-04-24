import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sr-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sr-review.html',
  styleUrl: './sr-review.scss'
})
export class SrReviewComponent implements OnInit {

 
  @Input() srId: string | null = null;
  @Input() jobTitle = '';
  @Input() isSaving = false;
  @Input() viewOnly = false;

 
  @Input() step0: {
    jobTitle: string;
    dept: string | number;
    bu: string | number;
    location: string;
    workMode: string;
    empType: string;
    seniority: string | number;
    openings: number;
    priority: string;
    startDate: string;
  } | null = null;

  @Input() step1: {
    justType: string;
    bizCase: string;
    impactNote: string;
  } | null = null;

  @Input() step2: {
    costCenter: string;
    budgetCode: string;
    hcSlot: boolean;
    salaryComp: string;
    proposedComp: string | number;
    signingBonus: boolean;
    signingAmt: string | number;
    equity: boolean;
    equityAmt: string | number;
    relocation: boolean;
    relocAmt: string | number;
    annualHiringCost?: number;
  } | null = null;

  @Input() step3: {
    eduReq: string;
    travel: string;
    expMin: number;
    expMax: number;
    interviewMin: number;
    interviewMax: number;
    assessmentOn: boolean;
  } | null = null;

  @Input() step4: {
    internalFirst: boolean;
    sourcingBudget: string | number;
    referralOn: boolean;
    referralAmt: string | number;
    diversityOn: boolean;
  } | null = null;

  @Input() mustSkills: string[] = [];
  @Input() niceSkills: string[] = [];
  @Input() certs: string[] = [];
  @Input() langs: string[] = [];
  @Input() jobBoards: string[] = [];
  @Input() assessmentTypes: string[] = [];
  @Input() diversityBoards: string[] = [];
  @Input() selectedManagers: any[] = [];
  @Input() replaceEmployee: any = null;
  @Input() supportDoc: any = null;

  
  @Output() onEdit = new EventEmitter<number>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onSaveDraft = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  
  open: boolean[] = [true, true, true, true, true];

  ngOnInit(): void {}

  toggle(i: number): void {
    this.open[i] = !this.open[i];
  }

  goTo(step: number): void {
    this.onEdit.emit(step);
  }

  saveDraft(): void {
    this.onSaveDraft.emit();
  }

  submitSr(): void {
    this.onSubmit.emit();
  }

  back(): void {
    this.onBack.emit();
  }


  get needsReplace(): boolean {
    const jt = this.step1?.justType ?? '';
    return jt === 'Backfill' || jt === 'Replacement';
  }

  
  get totalCompensation(): number {
    if (!this.step2) return 0;
    const s = this.step2;
    const toLPA = (v: any) => (Number(v) || 0) / 100000;

    const base = toLPA(s.proposedComp);

    let salaryMid = 0;
    if (s.salaryComp) {
      const parts = String(s.salaryComp).split('-');
      const mn = Number(parts[0]) || 0;
      const mx = Number(parts[1]) || 0;
      salaryMid = (mn + mx) / 2 / 100000;
    }

    const signing    = s.signingBonus  ? toLPA(s.signingAmt) : 0;
    const equity     = s.equity        ? toLPA(s.equityAmt)  : 0;
    const relocation = s.relocation    ? toLPA(s.relocAmt)   : 0;

    return +(base + salaryMid + signing + equity + relocation).toFixed(2);
  }


  htmlToText(html: string): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }


  truncate(html: string, len = 120): string {
    const text = this.htmlToText(html);
    return text.length > len ? text.substring(0, len) + '…' : text;
  }
}