import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
export class ConfigureRoundsComponent implements OnInit, OnChanges {

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

  // ── Default "AI Interview" round (create mode only) ──────────────────────────
  /** Stage name used to pre-fill + auto-select the AI Interview round on create */
  private readonly DEFAULT_STAGE_NAME = 'AI Interview';
  /** Ensures the default round is only ever inserted once */
  private defaultRoundInitialized = false;

  ngOnInit(): void {
    this.maybeAddDefaultRound();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stageTypeOptions']) {
      this.maybeAddDefaultRound();
      this.resolveDefaultStageType();
    }
  }

  /**
   * On first load, if we're in create mode (not viewMode) and there are no
   * rounds yet, seed the table with a single mandatory "AI Interview" round.
   * If the matching stage type hasn't loaded from the API yet, stageType is
   * left blank and gets backfilled by resolveDefaultStageType() once it does.
   */
  private maybeAddDefaultRound(): void {
    if (this.viewMode) return;
    if (this.defaultRoundInitialized) return;
    if (this.rounds.length > 0) {
      this.defaultRoundInitialized = true;
      return;
    }
    this.defaultRoundInitialized = true;

    const match = this.findAiInterviewStageType();

    this.rounds = [
      {
        id: 1,
        order: 1,
        stageName: this.DEFAULT_STAGE_NAME,
        stageType: match ? String(match.id) : '',
        interviewMode: 'Online',
        mandatory: true,
      },
    ];
  }

  /**
   * Backfills the stageType id on the default round once stageTypeOptions
   * (loaded async by the parent) arrives, in case it wasn't ready yet when
   * the default round was first created.
   */
  private resolveDefaultStageType(): void {
    const match = this.findAiInterviewStageType();
    if (!match) return;

    this.rounds = this.rounds.map(r =>
      r.stageName === this.DEFAULT_STAGE_NAME && !r.stageType
        ? { ...r, stageType: String(match.id) }
        : r
    );
  }

  private findAiInterviewStageType(): { id: number; name: string } | undefined {
    // API returns names like "ai interview round" rather than an exact
    // "AI Interview" match, so look for the keyword as a substring instead.
    const keyword = this.DEFAULT_STAGE_NAME.toLowerCase(); // "ai interview"
    return this.stageTypeOptions.find(opt =>
      opt.name?.toLowerCase().includes(keyword)
    );
  }

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