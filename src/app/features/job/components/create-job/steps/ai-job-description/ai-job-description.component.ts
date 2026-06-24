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
  rawResponse: JdApiResponse; // ← add this
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

  private saveTimer: any;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (!this.form.get('jobDescription')) {
      this.form.addControl('jobDescription', new FormControl('', Validators.required));
    }

    
    const existingJd = this.form.get('jobDescription')?.value;
    if (existingJd && typeof existingJd === 'object') {
      const html = this.formatJdResponse(existingJd);
      const restored: JdVersion = {
        id: Date.now(),
        label: 'Version 1 (Current)',
        isCurrent: true,
        generatedAt: new Date(),
        content: html,
        rawResponse: existingJd,
        showMenu: false
      };
      this.versions = [restored];
      this.selectedVersionId = restored.id;
      this.persistVersions();
    } else {
      // Fresh start — clear any stale localStorage from a prior session
      localStorage.removeItem(this.STORAGE_KEY);
      this.versions = [];
    }
  }

  ngAfterViewInit(): void {
    // If we restored an existing version, populate the editor DOM.
    // Uses setTimeout(0) because *ngIf="hasContent" has just become true —
    // the editor element needs one render cycle before innerHTML can be set.
    if (this.selectedVersionId !== null && this.versions.length > 0) {
      const v = this.versions.find(ver => ver.id === this.selectedVersionId);
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
    // Do NOT remove localStorage here — the form holds the source of truth,
    // but keeping localStorage means versions survive a Back→Forward within
    // the same stepper session.
  }

  // ── Public API actions ──────────────────────────────────────────────────────

  async generateJD(): Promise<void> {
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
          this.callGenerateApi('');
        }
      });
      return;
    }
    await this.callGenerateApi('');
  }

  async regenerate(): Promise<void> {
    await this.callGenerateApi('');
  }

  async applyAIOption(option: string): Promise<void> {
    this.showMoreAIOptions = false;
    await this.callGenerateApi(option);
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
      update_parameter: updateParameter
    };

    try {
      const res: any =
        await this.jobService.generateJobDescription(payload);

      if (res) {
        // Convert structured JSON → formatted HTML and store as a version
        const html = this.formatJdResponse(res);
        if (html) this.addVersion(html, res);
      }
    } finally {
      this.isGenerating = false;
      this.isRegenerating = false;
      this.cdr.detectChanges();
    }
  }

  // ── JD JSON → HTML formatter ────────────────────────────────────────────────

  private formatJdResponse(res: JdApiResponse): string {

    /** Wraps items in a styled <ul> */
    const bulletList = (items: string[] | undefined): string => {
      if (!items?.length) return '';
      const lis = items.map(i => `<li>${i}</li>`).join('');
      return `<ul class="jd-list">${lis}</ul>`;
    };

    /** Renders pill/tag badges for skills */
    const skillTags = (
      items: string[] | undefined,
      type: 'must' | 'nice'
    ): string => {
      if (!items?.length) return '';
      const tags = items
        .map(s => `<span class="jd-tag jd-tag--${type}">${s}</span>`)
        .join('');
      return `<div class="jd-tags">${tags}</div>`;
    };

    /** Single section block with a heading and body content */
    const section = (
      title: string,
      // iconClass: string,
      body: string
    ): string => {
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

    /** Single key–value row for the meta bar */
    const metaItem = (label: string, value: string | undefined): string => {
      if (!value) return '';
      return `
        <div class="jd-meta__item">
          <span class="jd-meta__label">${label}</span>
          <span class="jd-meta__value">${value}</span>
        </div>`;
    };

    // ── Assemble the full HTML ─────────────────────────────────────────────

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
      // 'fa-solid fa-align-left',
      res.job_summary ? `<p class="jd-summary">${res.job_summary}</p>` : ''
    );

    const responsibilitiesSection = section(
      'Key Responsibilities',
      // 'fa-solid fa-list-check',
      bulletList(res.key_responsibilities)
    );

    const basicQualSection = section(
      'Basic Qualifications',
      // 'fa-solid fa-circle-check',
      bulletList(res.basic_qualifications)
    );

    const preferredQualSection = section(
      'Preferred Qualifications',
      // 'fa-solid fa-star',
      bulletList(res.preferred_qualifications)
    );

    const mustSkillsSection = section(
      'Must-Have Skills',
      // 'fa-solid fa-code',
      skillTags(res.skills_must_have, 'must')
    );

    const niceSkillsSection = section(
      'Nice-to-Have Skills',
      // 'fa-solid fa-plus',
      skillTags(res.skills_nice_to_have, 'nice')
    );

    const eduBody = [
      res.education_requirements
        ? `<p class="jd-summary">${res.education_requirements}</p>`
        : '',
      bulletList(res.certifications_required)
    ].join('');

    const educationSection = section(
      'Education & Certifications',
      // 'fa-solid fa-graduation-cap',
      eduBody
    );

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
      rawResponse: raw, // ← store raw
      showMenu: false
    };

    this.versions.unshift(version);

    // Keep max 3 versions
    if (this.versions.length > 3) this.versions.pop();

    // Re-label all versions
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
    this.versions.forEach(ver => (ver.isCurrent = ver.id === v.id));

    this.form.get('jobDescription')?.setValue(v.rawResponse); // ← raw JSON

    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.editorRef?.nativeElement) {
        this.editorRef.nativeElement.innerHTML = v.content; // display only
        this.updateWordCount();
      }
      this.cdr.detectChanges();
    }, 0);
  }

  deleteVersion(v: JdVersion): void {
    this.versions = this.versions.filter(ver => ver.id !== v.id);
    this.persistVersions();

    if (this.versions.length) {
      this.loadVersion(this.versions[0]);
    }
  }

  private persistVersions(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.versions)
    );
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

  // onEditorInput(): void {
  //   const content = this.editorRef?.nativeElement.innerHTML || '';
  //   this.form.get('jobDescription')?.setValue(content);
  //   this.updateWordCount();
  //   this.triggerSave();
  // }

  onEditorInput(): void {
    // removed: this.form.get('jobDescription')?.setValue(...)
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