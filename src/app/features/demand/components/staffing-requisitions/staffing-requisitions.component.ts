import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

export interface StaffingRequisition {
  id: string;
  title: string;
  meta: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-staffing-requisitions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staffing-requisitions.component.html',
  styleUrl: './staffing-requisitions.component.scss',
})
export class StaffingRequisitionsComponent {

  draftSR: StaffingRequisition | null = null;

  requisitions: StaffingRequisition[] = [
    { id: 'SR-2026-ENG-0042', title: 'Senior Backend Engineer · ENG', meta: 'Created 10-04-2026 · Steps 1–2 complete', status: 'Draft' },
    { id: 'SR-2026-FIN-0031', title: 'Finance Analyst · FIN', meta: 'Submitted 05-04-2026', status: 'Submitted' },
    { id: 'SR-2026-HR-0018', title: 'HRBP Manager · HR', meta: 'Approved 20-03-2026', status: 'Approved' },
  ];

  constructor(private router: Router) {
    this.draftSR = this.requisitions.find(r => r.status === 'Draft') ?? null;
  }

  newSR() {
    this.router.navigateByUrl('/demand/create?step=0');
  }

  resumeSR(sr: StaffingRequisition) {
    this.router.navigate(['/staffing-requisitions', sr.id, 'edit']);
  }

  openSR(sr: StaffingRequisition) {
    this.router.navigate(['/staffing-requisitions', sr.id]);
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'badge-draft',
      Submitted: 'badge-submitted',
      Approved: 'badge-approved',
      Rejected: 'badge-rejected',
    };
    return map[status] ?? '';
  }

  showActions(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }

  canEdit(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }

  viewSR(sr: StaffingRequisition) {
    this.router.navigate(['/staffing-requisitions', sr.id]);
  }

  editSR(sr: StaffingRequisition) {
    this.router.navigate(['/staffing-requisitions', sr.id, 'edit']);
  }
}