import {
  Component, Input, OnInit, OnDestroy,
  ElementRef, ViewChild, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface JdVersion {
  id: number;
  label: string;
  isCurrent: boolean;
  generatedAt: Date;
  content: string;
  showMenu: boolean;
}

const JD_TEMPLATES = [
  `<h2>About the Role</h2>
<p>We are looking for a skilled Backend Developer to design, build, and maintain scalable and reliable server-side applications. You will work with cross-functional teams to define, design, and ship new features while ensuring performance, quality, and responsiveness of the applications.</p>
<h2>Key Responsibilities</h2>
<ul>
  <li>Design, develop, and maintain robust and scalable backend services and APIs.</li>
  <li>Collaborate with frontend developers, product managers, and other stakeholders.</li>
  <li>Write clean, efficient, and well-documented code.</li>
  <li>Optimize applications for maximum speed and scalability.</li>
  <li>Troubleshoot, debug, and upgrade existing systems.</li>
  <li>Ensure the security, performance, and reliability of the applications.</li>
  <li>Participate in code reviews and adhere to best coding practices.</li>
</ul>
<h2>Requirements</h2>
<ul>
  <li>3–5 years of experience in backend development.</li>
  <li>Proficiency in Java, Spring Boot, and REST API design.</li>
  <li>Strong understanding of SQL and NoSQL databases.</li>
  <li>Experience with microservices architecture and containerization (Docker, Kubernetes).</li>
  <li>Familiarity with CI/CD pipelines and DevOps practices.</li>
  <li>Excellent problem-solving skills and attention to detail.</li>
</ul>`,

  `<h2>Role Overview</h2>
<p>Join our engineering team as a Backend Developer and help us build the next generation of our platform. You will be a core contributor to our microservices ecosystem, working on high-traffic distributed systems.</p>
<h2>What You'll Do</h2>
<ul>
  <li>Own and evolve backend services from design to deployment.</li>
  <li>Partner with product and design to ship impactful features.</li>
  <li>Drive technical discussions and architecture decisions.</li>
  <li>Mentor junior engineers and establish coding standards.</li>
  <li>Identify and resolve performance bottlenecks proactively.</li>
</ul>
<h2>What We're Looking For</h2>
<ul>
  <li>Strong command of Java or Python in a production environment.</li>
  <li>Experience designing and consuming RESTful or GraphQL APIs.</li>
  <li>Solid grasp of database internals — indexing, query optimization, transactions.</li>
  <li>Hands-on experience with cloud platforms (AWS / GCP / Azure).</li>
  <li>Comfortable working in agile, fast-paced environments.</li>
</ul>`,

  `<h2>About This Position</h2>
<p>We are hiring an experienced Backend Engineer to strengthen our core platform team. This is an individual contributor role with high ownership — you will architect, build, and operate services used by thousands of customers daily.</p>
<h2>Day-to-Day Responsibilities</h2>
<ul>
  <li>Build and maintain resilient microservices with high availability SLAs.</li>
  <li>Define API contracts and collaborate with mobile and web teams.</li>
  <li>Implement observability — logging, metrics, and distributed tracing.</li>
  <li>Lead technical design reviews and documentation.</li>
  <li>Participate in on-call rotations and incident response.</li>
</ul>
<h2>Skills & Experience</h2>
<ul>
  <li>3+ years of hands-on backend engineering experience.</li>
  <li>Deep knowledge of Spring Boot, Hibernate, and JPA.</li>
  <li>Experience with message queues (Kafka / RabbitMQ).</li>
  <li>Proven ability to write maintainable, testable code.</li>
  <li>Strong communication and collaboration skills.</li>
</ul>`,
];

@Component({
  selector: 'app-ai-job-description-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai-job-description.component.html',
  styleUrl: './ai-job-description.component.scss',
})
export class AiJobDescriptionStepComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @ViewChild('editor', { static: false }) editorRef!: ElementRef<HTMLDivElement>;

  private cdr = inject(ChangeDetectorRef);

  // ── State ─────────────────────────────────────────────────────────────────
  versions: JdVersion[] = [];
  selectedVersionId: number | null = null;
  isGenerating = false;
  isRegenerating = false;
  saveStatus: 'idle' | 'saving' | 'saved' = 'idle';
  wordCount = 0;
  showMoreAIOptions = false;
  private saveTimer: any;
  private templateIndex = 0;

  // ── Toolbar state ─────────────────────────────────────────────────────────
  activeFormats: Set<string> = new Set();

  ngOnInit(): void {
    if (!this.form.get('jobDescription')) {
      this.form.addControl('jobDescription', new FormControl('', Validators.required));
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveTimer);
  }

  // ── Generation ────────────────────────────────────────────────────────────
  generateJD(): void {
    if (this.isGenerating) return;
    this.isGenerating = true;

    setTimeout(() => {
      const content = JD_TEMPLATES[this.templateIndex % JD_TEMPLATES.length];
      this.templateIndex++;
      this.addVersion(content);
      this.isGenerating = false;
      this.cdr.detectChanges();
    }, 1800);
  }

  regenerate(): void {
    if (this.isRegenerating || this.versions.length === 0) return;
    this.isRegenerating = true;

    setTimeout(() => {
      const content = JD_TEMPLATES[this.templateIndex % JD_TEMPLATES.length];
      this.templateIndex++;
      this.addVersion(content);
      this.isRegenerating = false;
      this.cdr.detectChanges();
    }, 1800);
  }

  private addVersion(content: string): void {
    // Max 3 versions — drop oldest if needed
    if (this.versions.length >= 3) {
      this.versions.pop();
    }

    const newVersion: JdVersion = {
      id: Date.now(),
      label: 'Version ' + (this.versions.length + 1) + (this.versions.length === 0 ? ' (Latest)' : ''),
      isCurrent: this.versions.length === 0,
      generatedAt: new Date(),
      content,
      showMenu: false,
    };

    this.versions.unshift(newVersion);

    // Re-label after insert
    this.versions.forEach((v, i) => {
      v.label = i === 0 ? 'Version ' + (i + 1) + ' (Latest)' : 'Version ' + (i + 1);
      v.isCurrent = i === 0;
    });

    this.loadVersion(this.versions[0]);
  }

  loadVersion(v: JdVersion): void {
    this.selectedVersionId = v.id;
    if (this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.innerHTML = v.content;
      this.updateWordCount();
    }
    this.form.get('jobDescription')?.setValue(v.content);
    this.versions.forEach(ver => ver.showMenu = false);
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────
  format(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.editorRef?.nativeElement.focus();
    this.onEditorInput();
  }

  isFormatActive(command: string): boolean {
    try { return document.queryCommandState(command); } catch { return false; }
  }

  onEditorInput(): void {
    const content = this.editorRef?.nativeElement.innerHTML || '';
    this.form.get('jobDescription')?.setValue(content);
    this.updateWordCount();
    this.triggerSave();
  }

  // ── Word count ────────────────────────────────────────────────────────────
  private updateWordCount(): void {
    const text = this.editorRef?.nativeElement.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    this.wordCount = words.length;
  }

  // ── Auto-save simulation ──────────────────────────────────────────────────
  private triggerSave(): void {
    this.saveStatus = 'saving';
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveStatus = 'saved';
      this.cdr.detectChanges();
    }, 1200);
  }

  // ── Version menu ──────────────────────────────────────────────────────────
  toggleMenu(v: JdVersion, event: Event): void {
    event.stopPropagation();
    const wasOpen = v.showMenu;
    this.versions.forEach(ver => ver.showMenu = false);
    v.showMenu = !wasOpen;
  }

  deleteVersion(v: JdVersion): void {
    this.versions = this.versions.filter(ver => ver.id !== v.id);
    this.versions.forEach((ver, i) => {
      ver.label = i === 0 ? 'Version ' + (i + 1) + ' (Latest)' : 'Version ' + (i + 1);
    });
    if (this.selectedVersionId === v.id && this.versions.length > 0) {
      this.loadVersion(this.versions[0]);
    }
  }

  closeMenus(): void {
    this.versions.forEach(v => v.showMenu = false);
    this.showMoreAIOptions = false;
  }

  // ── AI Options ────────────────────────────────────────────────────────────
  toggleMoreAIOptions(e: Event): void {
    e.stopPropagation();
    this.showMoreAIOptions = !this.showMoreAIOptions;
  }

  applyAIOption(option: string): void {
    this.showMoreAIOptions = false;
    // Simulate AI rewriting
    this.isRegenerating = true;
    setTimeout(() => {
      if (this.editorRef?.nativeElement) {
        const current = this.editorRef.nativeElement.innerHTML;
        this.editorRef.nativeElement.innerHTML =
          '<p><em>[' + option + ' applied]</em></p>' + current;
        this.onEditorInput();
      }
      this.isRegenerating = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  formatDate(d: Date): string {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  get hasContent(): boolean {
    return this.versions.length > 0;
  }
}
