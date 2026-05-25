import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { JobService } from '../../../../services/job.service';


interface JdVersion {
  id: number;
  label: string;
  isCurrent: boolean;
  generatedAt: Date;
  content: string;
  showMenu: boolean;
}

@Component({
  selector: 'app-ai-job-description-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai-job-description.component.html',
  styleUrl: './ai-job-description.component.scss'
})
export class AiJobDescriptionStepComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @ViewChild('editor', { static: false })
  editorRef!: ElementRef<HTMLDivElement>;

  private cdr = inject(ChangeDetectorRef);
  private jobService = inject(JobService);

  readonly STORAGE_KEY = 'ai_jd_versions';

  versions: JdVersion[] = [];
  selectedVersionId: number | null = null;

  isGenerating = false;
  isRegenerating = false;

  saveStatus: 'idle' | 'saving' | 'saved' = 'idle';
  wordCount = 0;
  showMoreAIOptions = false;

  private saveTimer: any;

  ngOnInit(): void {
    if (!this.form.get('jobDescription')) {
      this.form.addControl(
        'jobDescription',
        new FormControl('', Validators.required)
      );
    }

    this.loadStoredVersions();
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveTimer);
  }

private loadStoredVersions(): void {
  const stored = localStorage.getItem(this.STORAGE_KEY);

  if (!stored) return;

  this.versions = JSON.parse(stored).map((v: any) => ({
    ...v,
    generatedAt: new Date(v.generatedAt)
  }));

  if (this.versions.length) {
    this.loadVersion(this.versions[0]);
  }
}

  async generateJD(): Promise<void> {
    await this.callGenerateApi('');
  }

  async regenerate(): Promise<void> {
    await this.callGenerateApi('');
  }

  async applyAIOption(option: string): Promise<void> {
    this.showMoreAIOptions = false;
    await this.callGenerateApi(option);
  }

private async callGenerateApi(updateParameter: string): Promise<void> {
  if (this.isGenerating || this.isRegenerating) return;

  this.isGenerating = !updateParameter;
  this.isRegenerating = !!updateParameter;

  const step1 = this.form.parent?.get('step1')?.getRawValue();

  const payload = {
    job_id: 15,
    job_title: step1?.jobTitle || 'Python Developer',
    department: String(step1?.department || 'Engineering'),
    location: step1?.location || 'Hyderabad, Telangana, India',
    seniority_level: 'Mid-Senior level',
    num_openings: step1?.openings || 10,
    target_start_date: step1?.startDate || '25-06-2026',
    employment_type: step1?.employmentType || 'Full-time',
    work_mode: step1?.workMode || 'Hybrid',
    must_have_skills: step1?.mustHaveSkills || [],
    nice_to_have_skills: step1?.niceToHaveSkills || [],
    education_requirements:
      "Bachelor's degree in Computer Science or related field",
    travel_requirement: 'N/A',
    years_of_experience: String(step1?.experience || '5'),
    required_certifications: [],
    languages: 'English',
    old_job_description:
      this.editorRef?.nativeElement?.innerHTML || '',
    update_parameter: updateParameter
  };

  try {
    const res: any =
      await this.jobService.generateJobDescription(payload);

    const latestDescription =
      res?.job_description;

    if (latestDescription) {
      this.addVersion(latestDescription);
    }
  } finally {
    this.isGenerating = false;
    this.isRegenerating = false;
    this.cdr.detectChanges();
  }
}

private addVersion(jobDescription: string): void {
  const version: JdVersion = {
    id: Date.now(),
    label: '',
    isCurrent: true,
    generatedAt: new Date(),
    content: jobDescription,
    showMenu: false
  };

  this.versions.unshift(version);

  if (this.versions.length > 3) {
    this.versions.pop();
  }

  this.versions.forEach((v, i) => {
    v.label = `Version ${i + 1}`;
    v.isCurrent = i === 0;
  });

  localStorage.setItem(
    this.STORAGE_KEY,
    JSON.stringify(this.versions)
  );

  this.loadVersion(this.versions[0]);
}

  private persistVersions(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.versions)
    );
  }

loadVersion(v: JdVersion): void {
  this.selectedVersionId = v.id;

  this.versions.forEach(ver => {
    ver.isCurrent = ver.id === v.id;
  });

  // THIS LINE makes selected version visible in editor
  if (this.editorRef?.nativeElement) {
    this.editorRef.nativeElement.innerHTML = v.content;
  }

  // sync form
  this.form.get('jobDescription')?.setValue(v.content);

  // update footer
  this.updateWordCount();

  this.cdr.detectChanges();
}

  deleteVersion(v: JdVersion): void {
    this.versions = this.versions.filter(
      ver => ver.id !== v.id
    );

    this.persistVersions();

    if (this.versions.length) {
      this.loadVersion(this.versions[0]);
    }
  }

  format(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorRef?.nativeElement.focus();
    this.onEditorInput();
  }

  isFormatActive(command: string): boolean {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }

  onEditorInput(): void {
    const content =
      this.editorRef?.nativeElement.innerHTML || '';

    this.form.get('jobDescription')?.setValue(content);

    this.updateWordCount();
    this.triggerSave();
  }

  private updateWordCount(): void {
    const text =
      this.editorRef?.nativeElement.innerText || '';

    this.wordCount = text
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  private triggerSave(): void {
    this.saveStatus = 'saving';

    clearTimeout(this.saveTimer);

    this.saveTimer = setTimeout(() => {
      this.saveStatus = 'saved';
      this.cdr.detectChanges();
    }, 800);
  }

  toggleMenu(v: JdVersion, event: Event): void {
    event.stopPropagation();

    const wasOpen = v.showMenu;

    this.versions.forEach(ver => (ver.showMenu = false));
    v.showMenu = !wasOpen;
  }

  toggleMoreAIOptions(event: Event): void {
    event.stopPropagation();
    this.showMoreAIOptions = !this.showMoreAIOptions;
  }

  closeMenus(): void {
    this.versions.forEach(v => (v.showMenu = false));
    this.showMoreAIOptions = false;
  }

  formatDate(d: Date): string {
    return d.toLocaleString();
  }

  get hasContent(): boolean {
    return this.versions.length > 0;
  }
}