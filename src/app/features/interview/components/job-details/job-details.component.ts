import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss',
})
export class JobDetailsComponent {

  @Input() job: any = {};
 
  sections = [
    { key: 'details',         label: '1. Job Details',             open: true  },
    { key: 'description',     label: '2. Job Description',         open: true  },
    { key: 'responsibilities',label: '3. Key Responsibilities',    open: true  },
    { key: 'qualifications',  label: '4. Required Qualifications', open: true  },
    { key: 'certifications',  label: '6. Certifications',          open: true  },
  ];
 
  toggle(section: any): void {
    section.open = !section.open;
  }
 
  isOpen(key: string): boolean {
    return this.sections.find(s => s.key === key)?.open ?? true;
  }
}
