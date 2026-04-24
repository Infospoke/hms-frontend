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
    dept: string;
    bu: string;
    location: string;
    workMode: string;
    empType: string;
    seniority: string;
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
    proposedComp: any;
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
    sourcingBudget: string;
  } | null = null;

  @Input() mustSkills: string[] = [];
  @Input() niceSkills: string[] = [];
  @Input() certs: string[] = [];
  @Input() langs: string[] = [];
  @Input() jobBoards: string[] = [];
  @Input() assessmentTypes: string[] = [];

  @Output() onEdit = new EventEmitter<number>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onSaveDraft = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  open: boolean[] = [true, true, true, true, true];

  ngOnInit(): void {}

  toggle(i: number): void {
    this.open[i] = !this.open[i];
  }
}