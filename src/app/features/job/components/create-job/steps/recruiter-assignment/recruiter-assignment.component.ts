import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ReusableTableComponent, TableColumn } from '../../../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../../../shared/components/common-filter/common-filter.component';
import { roles } from '../../../../../../shared/constants/reusbale-filter';
import { HeadingComponent } from '../../../../../../shared/components/heading/heading.component';

export interface Recruiter {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  role: string;
  activeAssignments: number;
  assigned: boolean;
}

@Component({
  selector: 'app-recruiter-assignment-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReusableTableComponent, CommonFilterComponent, HeadingComponent],
  templateUrl: './recruiter-assignment.component.html',
  styleUrl: './recruiter-assignment.component.scss',
})
export class RecruiterAssignmentStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() showInfo: any;
  @Input() infoTooltip: any;
  @Input() showBackButton: boolean = false;
  @Input() buttonText: any;
  @Input() buttonUrl: any;

  recruiters: Recruiter[] = [
    { id: 1, name: 'Rahul Sharma', initials: 'RS', avatarColor: '#ef4444', email: 'rahul.sharma@nexushms.com', role: 'Talent Acquisition Specialist', activeAssignments: 6, assigned: false },
    { id: 2, name: 'Pooja Patel', initials: 'PP', avatarColor: '#a855f7', email: 'pooja.patel@nexushms.com', role: 'Senior Recruiter', activeAssignments: 8, assigned: false },
    { id: 3, name: 'Amit Mishra', initials: 'AM', avatarColor: '#3b82f6', email: 'amit.mishra@nexushms.com', role: 'Recruiter', activeAssignments: 4, assigned: false },
    { id: 4, name: 'Neha Kapoor', initials: 'NK', avatarColor: '#f59e0b', email: 'neha.kapoor@nexushms.com', role: 'Talent Acquisition Specialist', activeAssignments: 5, assigned: false },
    { id: 5, name: 'Vikas Kumar', initials: 'VK', avatarColor: '#10b981', email: 'vikas.kumar@nexushms.com', role: 'Technical Recruiter', activeAssignments: 7, assigned: false },
    { id: 6, name: 'Shreya Nair', initials: 'SN', avatarColor: '#ec4899', email: 'shreya.nair@nexushms.com', role: 'Senior Recruiter', activeAssignments: 3, assigned: false },
    { id: 7, name: 'Rohan Gupta', initials: 'RG', avatarColor: '#06b6d4', email: 'rohan.gupta@nexushms.com', role: 'Recruiter', activeAssignments: 9, assigned: false },
  ];

  filteredRecruiters: Recruiter[] = [];

  columns: TableColumn[] = [
    { key: 'select', label: '', width: '48px', custom: true },
    { key: 'name', label: 'Recruiter', width: '240px', custom: true },
    { key: 'email', label: 'Email ID' },
    { key: 'role', label: 'Role' },
    { key: 'activeAssignments', label: 'Total Active Assignments', align: 'center' },
    { key: 'action', label: 'Action', align: 'center', custom: true },
  ];

  filterDropdowns = roles;

  // ── FIX 1: restore private state fields ──────────────────────────────────
  private currentSearch = '';
  private currentRole = '';

  ngOnInit(): void {
    if (this.form) {
      if (!this.form.get('assignedRecruiters')) {
        this.form.addControl('assignedRecruiters', new FormControl<number[]>([]));
      }
    }
    this.applyFilter(); // now works — filteredRecruiters gets populated on load
  }

  // ── FIX 2: restore filter state capture ──────────────────────────────────
  onFilterChange(event: any): void {
    this.currentSearch = (event.search || '').toLowerCase();
    this.currentRole = event.filters?.role || '';
    this.applyFilter();
  }

  // ── FIX 3: restore actual filter logic ───────────────────────────────────
  private applyFilter(): void {
    this.filteredRecruiters = this.recruiters.filter(r => {
      const matchSearch =
        !this.currentSearch ||
        r.name.toLowerCase().includes(this.currentSearch) ||
        r.email.toLowerCase().includes(this.currentSearch) ||
        r.role.toLowerCase().includes(this.currentSearch);

      const matchRole = !this.currentRole || r.role === this.currentRole;

      return matchSearch && matchRole;
    });
  }

  get allSelected(): boolean {
    return this.filteredRecruiters.length > 0 &&
      this.filteredRecruiters.every(r => r.assigned);
  }

  get someSelected(): boolean {
    return this.filteredRecruiters.some(r => r.assigned) && !this.allSelected;
  }

  toggleAll(checked: boolean): void {
    this.filteredRecruiters.forEach(r => r.assigned = checked);
    this.syncForm();
  }

  toggleRow(recruiter: Recruiter): void {
    recruiter.assigned = !recruiter.assigned;
    this.syncForm();
  }

  toggleAssign(recruiter: Recruiter): void {
    recruiter.assigned = !recruiter.assigned;
    this.syncForm();
  }

  private syncForm(): void {
    const ids = this.recruiters.filter(r => r.assigned).map(r => r.id);
    this.form.get('assignedRecruiters')?.setValue(ids);
  }

  get assignedCount(): number {
    return this.recruiters.filter(r => r.assigned).length;
  }
}