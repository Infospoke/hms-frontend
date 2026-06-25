import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InterviewRound {
  id: number;
  order: number;
  stageName: string;
  stageType: string;
  interviewMode: string;
  mandatory: boolean;
}

export interface EvaluationSettings {
  gradingScale: string;
  minimumPercentage: number | null;
}

@Component({
  selector: 'app-configure-rounds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configure-rounds.component.html',
  styleUrl: './configure-rounds.component.scss',
})
export class ConfigureRoundsComponent {

  /** Maximum number of rounds allowed */
  readonly maxRounds = 4;


  @Input() viewMode = false;

  @Input() stageTypeOptions: { id: number; name: string }[] = [];
  @Input() set initialRounds(value: InterviewRound[]) {
    if (value && value.length) this.rounds = value.map(r => ({ ...r }));
  }

  @Input() set initialEvaluation(value: EvaluationSettings) {
    if (value) this.evaluation = { ...value };
  }

  @Output() discard  = new EventEmitter<void>();
  @Output() savePlan = new EventEmitter<{ rounds: InterviewRound[]; evaluation: EvaluationSettings }>();

  

  interviewModeOptions = ['Online', 'Offline'];

  gradingScaleOptions = [
    '1 - 5 (1 = Poor, 5 = Exceptional)',
    '1 - 10 (1 = Poor, 10 = Exceptional)',
    'A - F (A = Exceptional, F = Poor)',
  ];

  rounds: InterviewRound[] = [];

  evaluation: EvaluationSettings = {
    gradingScale: '1 - 5 (1 = Poor, 5 = Exceptional)',
    minimumPercentage: 60,
  };

  // ── Drag state ──────────────────────────────────────────────────────────────
  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  onDragStart(index: number): void {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverIndex = index;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === dropIndex) {
      this.dragIndex = null;
      this.dragOverIndex = null;
      return;
    }
    const reordered = [...this.rounds];
    const [moved] = reordered.splice(this.dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    this.rounds = reordered.map((r, i) => ({ ...r, order: i + 1 }));
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  onDragEnd(): void {
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────
  addRound(): void {
    if (this.rounds.length >= this.maxRounds) return;   // guard: max 4

    const nextId = this.rounds.length
      ? Math.max(...this.rounds.map(r => r.id)) + 1
      : 1;
    this.rounds = [
      ...this.rounds,
      {
        id: nextId,
        order: this.rounds.length + 1,
        stageName: '',
        stageType: '',
        interviewMode: 'Online',
        mandatory: false,
      },
    ];
  }

  deleteRound(index: number): void {
    this.rounds = this.rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, order: i + 1 }));
  }

  /**
   * Returns the stageTypeOptions list for a given row, with already-selected
   * types (in OTHER rows) disabled so they cannot be double-picked.
   */
  getAvailableStageTypes(currentRound: InterviewRound): { id: number; name: string; disabled: boolean }[] {
    const usedIds = new Set(
      this.rounds
        .filter(r => r !== currentRound && r.stageType !== '' && r.stageType != null)
        .map(r => Number(r.stageType))
    );
    return this.stageTypeOptions.map(opt => ({
      ...opt,
      disabled: usedIds.has(opt.id),
    }));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  onDiscard(): void {
    this.discard.emit();
  }

  onSave(): void {
    this.savePlan.emit({ rounds: this.rounds, evaluation: this.evaluation });
  }
}