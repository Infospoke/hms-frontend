import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Public types
export interface CompetencyRow {
  key: string;
  label: string;
  description: string;
  rating: number | null;
}

export type DecisionType = 'next' | 'hold' | 'reject' | null;

export interface FeedbackFormValue {
  overallRating: number;
  competencies: { key: string; rating: number | null }[];
  strengths: string;
  areasOfImprovement: string;
  additionalComments: string;
  decision: DecisionType;
}

// Default competency rows
export const DEFAULT_COMPETENCIES: CompetencyRow[] = [
  { key: 'technical',    label: 'Technical Knowledge', description: 'Understanding of core technical concepts',            rating: null },
  { key: 'problem',      label: 'Problem Solving',     description: 'Ability to analyze and solve problems effectively',  rating: null },
  { key: 'communication',label: 'Communication',       description: 'Clarity of communication and expression of ideas',   rating: null },
  { key: 'analytical',   label: 'Analytical Thinking', description: 'Ability to think critically and logically',          rating: null },
  { key: 'cultural',     label: 'Cultural Fit',        description: 'Alignment with team values and organization culture', rating: null },
];

@Component({
  selector: 'app-interview-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-feedback-form.component.html',
  styleUrl: './interview-feedback-form.component.scss',
})
export class InterviewFeedbackFormComponent implements OnInit {

  // Inputs
  @Input() competencies: CompetencyRow[] = DEFAULT_COMPETENCIES.map(c => ({ ...c }));
  @Input() initialRating = 0;
  @Input() initialStrengths            = '';
  @Input() initialAreasOfImprovement   = '';
  @Input() initialAdditionalComments   = '';
  @Input() initialDecision: DecisionType = null;

  /** When true, all inputs are read-only and action buttons are hidden. */
  @Input() readonly = false;

  /** Show / hide the Decision section. */
  @Input() showDecision = true;

  @Input() showCancel = true;
  @Input() submitLabel = 'Submit Feedback';

  // Outputs
  @Output() formSubmit = new EventEmitter<FeedbackFormValue>();
  @Output() formCancel = new EventEmitter<void>();

  // Internal state
  overallRating = 0;
  hoverRating   = 0;

  strengths            = '';
  areasOfImprovement   = '';
  additionalComments   = '';

  decision: DecisionType = null;

  readonly starsArray = [1, 2, 3, 4, 5];

  readonly competencyColumns = [
    { value: 1, label: 'Poor' },
    { value: 2, label: 'Below Avg' },
    { value: 3, label: 'Average' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Excellent' },
  ];

  readonly decisionOptions: { key: DecisionType; label: string; sub: string; color: string }[] = [
    { key: 'next',   label: 'Move to Next Round', sub: 'Candidate will move to the next round for further evaluation.', color: 'green' },
    { key: 'hold',   label: 'Hold',               sub: 'Candidate will be put on hold. Review will occur at a later stage.', color: 'amber' },
    { key: 'reject', label: 'Reject',             sub: 'Candidate will not be selected for further rounds.', color: 'red' },
  ];

  // Lifecycle
  ngOnInit(): void {
    this.overallRating      = this.initialRating;
    this.strengths          = this.initialStrengths;
    this.areasOfImprovement = this.initialAreasOfImprovement;
    this.additionalComments = this.initialAdditionalComments;
    this.decision           = this.initialDecision;
  }

  // Handlers
  setRating(value: number): void {
    this.overallRating = value;
  }

  setDecision(key: DecisionType): void {
    this.decision = key;
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  onSubmit(): void {
    const value: FeedbackFormValue = {
      overallRating:      this.overallRating,
      competencies:       this.competencies.map(c => ({ key: c.key, rating: c.rating })),
      strengths:          this.strengths,
      areasOfImprovement: this.areasOfImprovement,
      additionalComments: this.additionalComments,
      decision:           this.decision,
    };
    this.formSubmit.emit(value);
  }
}
