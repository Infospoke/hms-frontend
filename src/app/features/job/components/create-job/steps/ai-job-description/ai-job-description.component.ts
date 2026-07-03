import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  inject,
  AfterViewInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ConfirmModalComponent } from '../../../../../../shared/components/modal-component/confirm-modal.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { JobService } from '../../../../services/job.service';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface JdVersion {
  id: number;
  label: string;
  isCurrent: boolean;
  generatedAt: Date;
  content: string;
  rawResponse: JdApiResponse;
  showMenu: boolean;
}

/** Shape of the structured JSON returned by the generate API */
interface JdApiResponse {
  job_title?: string;
  job_summary?: string;
  key_responsibilities?: string[];
  basic_qualifications?: string[];
  preferred_qualifications?: string[];
  skills_must_have?: string[];
  skills_nice_to_have?: string[];
  education_requirements?: string;
  experience_requirements?: string;
  certifications_required?: string[];
  languages_required?: string;
  work_mode?: string;
  employment_type?: string;
  location?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-ai-job-description-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzModalModule],
  templateUrl: './ai-job-description.component.html',
  styleUrl: './ai-job-description.component.scss'
})
export class AiJobDescriptionStepComponent
  implements OnInit, OnDestroy, AfterViewInit {

  @Input() form!: FormGroup;
  @Input() jdError = false;

  @ViewChild('editor', { static: false })
  editorRef!: ElementRef<HTMLDivElement>;

  private cdr = inject(ChangeDetectorRef);
  private jobService = inject(JobService);
  private modal = inject(NzModalService);

  readonly STORAGE_KEY = 'ai_jd_versions';

  versions: JdVersion[] = [];
  selectedVersionId: number | null = null;

  isGenerating = false;
  isRegenerating = false;

  saveStatus: 'idle' | 'saving' | 'saved' = 'idle';
  wordCount = 0;
  showMoreAIOptions = false;
  options:any='';
  renameButton:boolean=false;
  private saveTimer: any;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (!this.form.get('jobDescription')) {
      this.form.addControl('jobDescription', new FormControl('', Validators.required));
    }

    // ── Step 1: try to restore all versions from localStorage ────────────────
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed: JdVersion[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Re-hydrate Date objects (JSON.parse gives strings)
          this.versions = parsed.map(v => ({
            ...v,
            generatedAt: new Date(v.generatedAt),
            showMenu: false,
          }));

          // The current version is whichever was marked isCurrent,
          // falling back to the first one
          const current =
            this.versions.find(v => v.isCurrent) ?? this.versions[0];
          this.selectedVersionId = current.id;

          // Sync form value to the current version's raw response so the
          // stepper still knows about a valid JD even before the editor mounts
          this.form.get('jobDescription')?.setValue(current.rawResponse);
          return; // skip the form-value fallback below
        }
      } catch {
        // Corrupted storage — fall through to form-value restore
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }

    // ── Step 2: nothing in localStorage — try the form value ─────────────────
    const existingJd = this.form.get('jobDescription')?.value;
    if (existingJd && typeof existingJd === 'object') {
      const html = this.formatJdResponse(existingJd);
      const restored: JdVersion = {
        id: Date.now(),
        label: 'Version 1',
        isCurrent: true,
        generatedAt: new Date(),
        content: html,
        rawResponse: existingJd,
        showMenu: false,
      };
      this.versions = [restored];
      this.selectedVersionId = restored.id;
      this.persistVersions();
    }
    // If neither source has data, versions stays [] — the "Generate" prompt shows
  }

  ngAfterViewInit(): void {
    // Paint the currently selected version into the editor
    if (this.selectedVersionId !== null && this.versions.length > 0) {
      const v =
        this.versions.find(ver => ver.id === this.selectedVersionId) ??
        this.versions[0];
      if (v) {
        setTimeout(() => {
          if (this.editorRef?.nativeElement) {
            this.editorRef.nativeElement.innerHTML = v.content;
            this.updateWordCount();
          }
          this.cdr.detectChanges();
        }, 0);
      }
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveTimer);
    // Keep localStorage — versions survive Back→Forward within the stepper
  }

  // ── Public API actions ──────────────────────────────────────────────────────

  async generateJD(): Promise<void> {
    // If an AI option has been selected, this click regenerates using it.
    const updateParameter = this.renameButton ? this.options : '';

    if (this.versions.length >= 3) {
      const modal = this.modal.create<ConfirmModalComponent>({
        nzContent: ConfirmModalComponent,
        nzData: { mode: 'replace-jd' },
        nzClassName: 'custom-confirm-modal custom-edit-modal',
        nzFooter: null,
        nzCentered: true,
        nzWidth: 360,
        nzClosable: false,
      });
      modal.afterClose.subscribe((result: string) => {
        if (result === 'confirm') {
          this.callGenerateApi(updateParameter);
        }
      });
      return;
    }
    await this.callGenerateApi(updateParameter);
  }

  async regenerate(): Promise<void> {
    await this.callGenerateApi('');
  }

  applyAIOption(option: string): void {
    this.showMoreAIOptions = false;
    this.renameButton = true;
    this.options = option;
  }

  /** Lets the user back out of an option-based regenerate and return to plain "Generate JD". */
  cancelOption(event: Event): void {
    event.stopPropagation();
    this.renameButton = false;
    this.options = '';
  }

  // ── Core API call ───────────────────────────────────────────────────────────

  private async callGenerateApi(updateParameter: string): Promise<void> {
    if (this.isGenerating || this.isRegenerating) return;

    this.isGenerating = !updateParameter;
    this.isRegenerating = !!updateParameter;

    const step1 = this.form.parent?.get('step1')?.getRawValue();

    const payload = {
      job_title: step1?.jobTitle || 'Python Developer',
      department: String(step1?.department || 'Engineering'),
      location: (step1?.location + step1?.country) || 'Hyderabad, Telangana, India',
      seniority_level: 'Mid-Senior level',
      num_openings: step1?.openings || 10,
      target_start_date: step1?.startDate || '25-06-2026',
      employment_type: step1?.employmentType || 'Full-time',
      work_mode: step1?.workMode || 'Hybrid',
      must_have_skills: step1?.mustHaveSkills || [],
      nice_to_have_skills: step1?.niceToHaveSkills || [],
      education_requirements: step1?.educationRequirement
        || "Bachelor's degree in Computer Science or related field",
      travel_requirement: 'N/A',
      years_of_experience: String(step1?.minExp + '-' + step1?.maxExp || '5'),
      required_certifications: step1?.certificate || '',
      languages: step1?.languages || 'English',
      old_job_description: this.editorRef?.nativeElement?.innerHTML || '',
      update_parameter: updateParameter,
    };

    try {
      const res: any = await this.jobService.generateJobDescription(payload);
      if (res) {
        const html = this.formatJdResponse(res);
        if (html) this.addVersion(html, res);
      }
    } finally {
      this.isGenerating = false;
      this.isRegenerating = false;
      this.renameButton = false;
      this.options = '';
      this.cdr.detectChanges();
    }
  }

  // ── JD JSON → HTML formatter ────────────────────────────────────────────────

  private formatJdResponse(res: JdApiResponse): string {

    const bulletList = (items: string[] | undefined): string => {
      if (!items?.length) return '';
      const lis = items.map(i => `<li>${i}</li>`).join('');
      return `<ul class="jd-list">${lis}</ul>`;
    };

    const skillTags = (items: string[] | undefined, type: 'must' | 'nice'): string => {
      if (!items?.length) return '';
      const tags = items.map(s => `<span class="jd-tag jd-tag--${type}">${s}</span>`).join('');
      return `<div class="jd-tags">${tags}</div>`;
    };

    const section = (title: string, body: string): string => {
      if (!body.trim()) return '';
      return `
        <div class="jd-section">
          <h3 class="jd-section__title">
            <span class="jd-section__icon"></span>
            ${title}
          </h3>
          ${body}
        </div>`;
    };

    const metaItem = (label: string, value: string | undefined): string => {
      if (!value) return '';
      return `
        <div class="jd-meta__item">
          <span class="jd-meta__label">${label}</span>
          <span class="jd-meta__value">${value}</span>
        </div>`;
    };

    const metaBar = `
      <div class="jd-meta-bar">
        ${metaItem('Location', res.location)}
        ${metaItem('Work Mode', res.work_mode)}
        ${metaItem('Employment', res.employment_type)}
        ${metaItem('Experience', res.experience_requirements)}
        ${metaItem('Language', res.languages_required)}
      </div>`;

    const summarySection = section(
      'Job Description',
      res.job_summary ? `<p class="jd-summary">${res.job_summary}</p>` : ''
    );
    const responsibilitiesSection = section('Key Responsibilities', bulletList(res.key_responsibilities));
    const basicQualSection        = section('Basic Qualifications',    bulletList(res.basic_qualifications));
    const preferredQualSection    = section('Preferred Qualifications', bulletList(res.preferred_qualifications));
    const mustSkillsSection       = section('Must-Have Skills',         skillTags(res.skills_must_have, 'must'));
    const niceSkillsSection       = section('Nice-to-Have Skills',      skillTags(res.skills_nice_to_have, 'nice'));

    const eduBody = [
      res.education_requirements ? `<p class="jd-summary">${res.education_requirements}</p>` : '',
      bulletList(res.certifications_required),
    ].join('');
    const educationSection = section('Education & Certifications', eduBody);

    return `
<div class="jd-root">
  ${summarySection}
  ${responsibilitiesSection}
  ${basicQualSection}
  ${preferredQualSection}
  ${mustSkillsSection}
  ${niceSkillsSection}
  ${educationSection}
  ${metaBar}
</div>`.trim();
  }

  // ── Version management ──────────────────────────────────────────────────────

  private addVersion(html: string, raw: JdApiResponse): void {
    const version: JdVersion = {
      id: Date.now(),
      label: '',
      isCurrent: true,
      generatedAt: new Date(),
      content: html,
      rawResponse: raw,
      showMenu: false,
    };

    this.versions.unshift(version);

    // Keep max 3 versions — remove oldest
    if (this.versions.length > 3) this.versions.pop();

    // Re-label: newest = highest version number
    const total = this.versions.length;
    this.versions.forEach((v, i) => {
      v.label = `Version ${total - i}`;
      v.isCurrent = i === 0;
    });

    this.persistVersions();
    this.loadVersion(this.versions[0]);
  }

  loadVersion(v: JdVersion): void {
    this.selectedVersionId = v.id;

    // Mark which is current without discarding the others
    this.versions.forEach(ver => (ver.isCurrent = ver.id === v.id));

    // Persist the selection so a Back→Forward restores the right version
    this.persistVersions();

    // Sync form value to the selected version's raw response
    this.form.get('jobDescription')?.setValue(v.rawResponse);

    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.editorRef?.nativeElement) {
        this.editorRef.nativeElement.innerHTML = v.content;
        this.updateWordCount();
      }
      this.cdr.detectChanges();
    }, 0);
  }

  deleteVersion(v: JdVersion): void {
    this.versions = this.versions.filter(ver => ver.id !== v.id);

    // Re-label remaining versions so numbers stay contiguous
    const total = this.versions.length;
    this.versions.forEach((ver, i) => {
      ver.label = `Version ${total - i}`;
    });

    this.persistVersions();

    if (this.versions.length) {
      // If the deleted version was the selected one, switch to the newest
      if (this.selectedVersionId === v.id) {
        this.versions[0].isCurrent = true;
        this.loadVersion(this.versions[0]);
      }
    } else {
      // No versions left — clear editor and form
      this.selectedVersionId = null;
      this.form.get('jobDescription')?.setValue('');
      if (this.editorRef?.nativeElement) {
        this.editorRef.nativeElement.innerHTML = '';
      }
      this.wordCount = 0;
    }
  }

  private persistVersions(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.versions));
  }

  // ── Editor helpers ──────────────────────────────────────────────────────────

  format(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorRef?.nativeElement.focus();
    this.onEditorInput();
  }

  isFormatActive(command: string): boolean {
    try { return document.queryCommandState(command); }
    catch { return false; }
  }

  onEditorInput(): void {
    this.updateWordCount();
    this.triggerSave();
  }

  private updateWordCount(): void {
    const text = this.editorRef?.nativeElement.innerText || '';
    this.wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  }

  private triggerSave(): void {
    this.saveStatus = 'saving';
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveStatus = 'saved';
      this.cdr.detectChanges();
    }, 800);
  }

  // ── Menu toggles ────────────────────────────────────────────────────────────

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

  // ── Utilities ───────────────────────────────────────────────────────────────

  formatDate(d: Date): string {
    return d.toLocaleString();
  }

  get hasContent(): boolean {
    return this.versions.length > 0;
  }
}