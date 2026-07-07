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

/** Shared max character limit for Strengths, Areas of Improvement, and Additional Comments. */
export const FEEDBACK_TEXT_MAX_LENGTH = 1000;

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

  /** Max characters allowed in Strengths / Areas of Improvement / Additional Comments. */
  readonly maxLength = FEEDBACK_TEXT_MAX_LENGTH;

  // Validation error messages — null/empty means that section is valid.
  overallRatingError: string | null = null;
  competencyError: string | null = null;
  strengthsError: string | null = null;
  areasOfImprovementError: string | null = null;
  decisionError: string | null = null;

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
    if (this.overallRating > 0) {
      this.overallRatingError = null;
    }
  }

  setDecision(key: DecisionType): void {
    this.decision = key;
    if (this.decision) {
      this.decisionError = null;
    }
  }

  onCompetencyRatingChange(): void {
    if (this.competencies.every(c => c.rating != null)) {
      this.competencyError = null;
    }
  }

  onStrengthsChange(): void {
    if (this.strengths.trim().length > 0) {
      this.strengthsError = null;
    }
  }

  onAreasOfImprovementChange(): void {
    if (this.areasOfImprovement.trim().length > 0) {
      this.areasOfImprovementError = null;
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  /** Validates all required sections. Returns true when the form is valid. */
  private validate(): boolean {
    this.overallRatingError = this.overallRating > 0
      ? null
      : 'Please provide an overall rating.';

    this.competencyError = this.competencies.every(c => c.rating != null)
      ? null
      : 'Please rate every competency.';

    this.strengthsError = this.strengths.trim().length > 0
      ? null
      : 'Please share the candidate\'s strengths.';

    this.areasOfImprovementError = this.areasOfImprovement.trim().length > 0
      ? null
      : 'Please share areas of improvement.';

    this.decisionError = (this.showDecision && !this.decision)
      ? 'Please select a decision.'
      : null;

    return !this.overallRatingError
      && !this.competencyError
      && !this.strengthsError
      && !this.areasOfImprovementError
      && !this.decisionError;
  }

  onSubmit(): void {
    if (!this.validate()) {
      return;
    }

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