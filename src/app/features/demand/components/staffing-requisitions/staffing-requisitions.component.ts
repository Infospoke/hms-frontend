import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

import { StaffingServiceService } from '../../services/staffing-service.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SrReviewComponent } from '../sr-review/sr-review';
import { firstValueFrom, forkJoin } from 'rxjs';

export interface StaffingRequisition {
  id: string;
  title: string;
  meta: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

interface SrListItem {
  createdDate: string;
  jobTitle: string;
  srId: string | null;
  status: string;
}

interface SrListResponse {
  data: {
    totalPages: number;
    currentPage: number;
    totalElements: number;
    content: SrListItem[];
  };
  message: string;
  responsecode: string;
}

@Component({
  selector: 'app-staffing-requisitions',
  standalone: true,
  imports: [CommonModule, PaginationComponent, NzModalModule],
  templateUrl: './staffing-requisitions.component.html',
  styleUrl: './staffing-requisitions.component.scss',
})
export class StaffingRequisitionsComponent implements OnInit {

  requisitions: StaffingRequisition[] = [];
  draftSR: StaffingRequisition | null = null;

  private demandService = inject(StaffingServiceService);
  private modal = inject(NzModalService);
  private router = inject(Router);

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  isLoading = false;
  viewLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadPage(1);
  }

  async loadPage(page: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const response = await this.demandService.getAllSRS({ page: page - 1, size: this.pageSize }) as SrListResponse;
      if (response?.responsecode === '00' && response.data) {
        const { content, totalPages, totalElements } = response.data;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.requisitions = content.map(item => this.mapToRequisition(item));
        this.draftSR = this.requisitions.find(r => r.status === 'Draft') ?? null;
      } else {
        this.errorMessage = response?.message ?? 'Failed to load requisitions.';
      }
    } catch {
      this.errorMessage = 'An error occurred while fetching requisitions.';
    } finally {
      this.isLoading = false;
    }
  }

  // async viewSR(sr: StaffingRequisition): Promise<void> {
  //   if (!sr?.id || sr.id === 'Draft – Pending ID') return;

  //   this.viewLoading = true;
  //   try {
  //     const res: any = await this.demandService.getBySrId(sr.id);
  //     if (res?.responsecode !== '00') {
  //       this.viewLoading = false;
  //       return;
  //     }

  //     const d   = res.data ?? {};
  //     const p   = d.positonBasicsResponse          ?? {};
  //     const bj  = d.businessJustificationResponse  ?? {};
  //     const bc  = d.budgetAndCompensationResponse   ?? {};
  //     const rr  = d.rolesAndRequirementsResponse    ?? {};
  //     const ss  = d.sourcingStrategyResponse        ?? {};

     
  //     const boardKeys: Record<string, string> = {
  //       internalBoard: 'Internal Board',
  //       naukri:        'Naukri',
  //       linkedIn:      'LinkedIn',
  //       indeed:        'Indeed',
  //       companySite:   'Company Site',
  //       agencyRpo:     'Agency / RPO',
  //     };
  //     const jobBoards = Object.entries(boardKeys)
  //       .filter(([key]) => ss[key])
  //       .map(([, label]) => label);

   
  //     const diversityBoards = this.splitCsv(ss.diversityTags);

   
  //     const modal = this.modal.create({
  //       nzTitle: `${p.jobTitle ?? sr.title} — ${sr.id}`,
  //       nzContent: SrReviewComponent,
  //       nzWidth: 780,
  //       nzCentered: true,
  //       nzBodyStyle: { 'max-height': '78vh', 'overflow-y': 'auto', padding: '0' },
  //       nzFooter: [
  //         {
  //           label: 'Close',
  //           onClick: () => modal.destroy(),
  //         },
  //       ],
  //     });

  //     const instance = modal.getContentComponent() as SrReviewComponent;

    
  //     instance.viewOnly  = true;
  //     instance.srId      = sr.id;
  //     instance.jobTitle  = p.jobTitle ?? sr.title;

  //     instance.step0 = {
  //       jobTitle:  p.jobTitle         ?? '',
  //       dept:      p.departmentName     ?? '',
  //       bu:        p.businessUnitName   ?? '',
  //       location:  p.location         ?? '',
  //       workMode:  p.workMode         ?? '',
  //       empType:   p.employmentType   ?? '',
  //       seniority: p.seniorityLevelName  ?? '',
  //       openings:  p.openings         ?? 0,
  //       priority:  p.priority         ?? '',
  //       startDate: p.targetStartDate  ?? '',
  //     };

  //     // Reporting managers — kept as display objects for the template
  //     instance.selectedManagers = Array.isArray(p.reportingManagerInfo)
  //       ? p.reportingManagerInfo.map((id: any) =>
  //           typeof id === 'object' ? id : { id, username: String(id) }
  //         )
  //       : [];

  //     instance.step1 = {
  //       justType:   bj.requisitionType   ?? '',
  //       bizCase:    bj.businessCase      ?? '',
  //       impactNote: bj.impactIfNotFilled ?? '',
  //     };

  //     // Replaces employee (if backfill/replacement)
  //     instance.replaceEmployee = bj.replacesEmployee
  //       ? { id: bj.replacesEmployee, username: String(bj.replacesEmployee) }
  //       : null;

  //     // Supporting document name (read-only, file is not re-uploaded)
  //     instance.supportDoc = bj.document
  //       ? { name: bj.document, sizeText: '' }
  //       : null;

  //     // ── Step 2: Budget & Compensation ─────────────────────────────────────
  //     // API stores amounts in full rupees; convert to LPA (÷ 100 000) for display
  //     const toLPA = (v: number | null | undefined): string =>
  //       v != null ? (v / 100000).toFixed(2) : '';

  //     instance.step2 = {
  //       costCenter:   bc.costCenter              ?? '',
  //       budgetCode:   bc.budgetCode              ?? '',
  //       hcSlot:       bc.approved               ?? false,
  //       salaryComp:   bc?.minSalary + '-' + bc?.maxSalary,                                   // derived server-side; not in API response
  //       proposedComp: Number(bc.proposedTotalCompensation),
  //       signingBonus: bc.signingBonus            ?? false,
  //       signingAmt:   Number(bc.signingBonusAmount),
  //       equity:       bc.equity                  ?? false,
  //       equityAmt:    Number(bc.equityAmount),
  //       relocation:   bc.relocationBudget        ?? false,
  //       relocAmt:     Number(bc.relocationBudgetAmount),
  //       annualHiringCost: bc.annualHiringCost    ?? 0,
  //     };

      
  //     instance.step3 = {
  //       eduReq:       rr.educationRequirement ?? '',
  //       travel:       rr.travelRequirement    ?? '',
  //       expMin:       rr.minExperience        ?? 0,
  //       expMax:       rr.maxExperience        ?? 0,
  //       interviewMin: rr.minInterviewRounds   ?? 0,
  //       interviewMax: rr.maxInterviewRounds   ?? 0,
  //       assessmentOn: rr.assessmentRequired   ?? false,
  //     };

  //     instance.mustSkills      = this.splitCsv(rr.skillsMustHave);
  //     instance.niceSkills      = this.splitCsv(rr.niceToHaveSkills);
  //     instance.certs           = this.splitCsv(rr.certificationsRequired);
  //     instance.langs           = this.splitCsv(rr.languages);
  //     instance.assessmentTypes = [];

  //     // ── Step 4: Sourcing Strategy ─────────────────────────────────────────
  //     instance.step4 = {
  //       internalFirst:  ss.internalFirstPolicy ?? false,
  //       sourcingBudget: ss.sourcingBudget != null ? String(ss.sourcingBudget) : '',
  //       referralOn:     ss.referralEnabled      ?? false,
  //       referralAmt:    ss.referralAmount != null ? String(ss.referralAmount) : '',
  //       diversityOn:    ss.diversityEnabled     ?? false,
  //     };

  //     instance.jobBoards      = jobBoards;
  //     instance.diversityBoards = diversityBoards;

  //   } catch {
  //     // silently fail — could show a banner here if needed
  //   } finally {
  //     this.viewLoading = false;
  //   }
  // }
  async viewSR(sr: StaffingRequisition): Promise<void> {
  if (!sr?.id || sr.id === 'Draft – Pending ID') return;

  this.viewLoading = true;
  try {

    const [res, travelRes]: any[] = await firstValueFrom(
      forkJoin([
        this.demandService.getBySrId(sr.id),
        this.demandService.getTravel(),       
      ])
    );

    if (res?.responsecode !== '00') {
      this.viewLoading = false;
      return;
    }


    const travelOpts: { id: string; name: string }[] = travelRes?.data ?? [];

    const getTravelName = (id: string): string =>
      travelOpts.find(t => String(t.id) === String(id))?.name ?? id;

    const d  = res.data ?? {};
    const p  = d.positonBasicsResponse         ?? {};
    const bj = d.businessJustificationResponse ?? {};
    const bc = d.budgetAndCompensationResponse  ?? {};
    const rr = d.rolesAndRequirementsResponse  ?? {};
    const ss = d.sourcingStrategyResponse      ?? {};

    const boardKeys: Record<string, string> = {
      internalBoard: 'Internal Board',
      naukri:        'Naukri',
      linkedIn:      'LinkedIn',
      indeed:        'Indeed',
      companySite:   'Company Site',
      agencyRpo:     'Agency / RPO',
    };
    const jobBoards      = Object.entries(boardKeys)
      .filter(([key]) => ss[key])
      .map(([, label]) => label);
    const diversityBoards = this.splitCsv(ss.diversityTags);

    const modal = this.modal.create({
      nzTitle:     `${p.jobTitle ?? sr.title} — ${sr.id}`,
      nzContent:   SrReviewComponent,
      nzWidth:     780,
      nzCentered:  true,
      nzWrapClassName: 'custom-edit-modal',
      nzBodyStyle: { 'max-height': '78vh', 'overflow-y': 'auto', padding: '0' },
      nzFooter: [{ label: 'Close', onClick: () => modal.destroy() }],
    });

    const instance = modal.getContentComponent() as SrReviewComponent;

    instance.viewOnly = true;
    instance.srId     = sr.id;
    instance.jobTitle = p.jobTitle ?? sr.title;

    instance.step0 = {
      jobTitle:  p.jobTitle          ?? '',
      dept:      p.departmentName    ?? '',
      bu:        p.businessUnitName  ?? '',
      location:  p.location          ?? '',
      workMode:  p.workMode          ?? '',
      empType:   p.employmentType    ?? '',
      seniority: p.seniorityLevelName ?? '',
      openings:  p.openings          ?? 0,
      priority:  p.priority          ?? '',
      startDate: p.targetStartDate   ?? '',
    };

    instance.selectedManagers = Array.isArray(p.reportingManagerInfo)
      ? p.reportingManagerInfo.map((id: any) =>
          typeof id === 'object' ? id : { id, username: String(id) }
        )
      : [];

    instance.step1 = {
      justType:   bj.requisitionType   ?? '',
      bizCase:    bj.businessCase      ?? '',
      impactNote: bj.impactIfNotFilled ?? '',
    };

    instance.replaceEmployee = bj.replacesEmployee
      ? { id: bj.replacesEmployee, username: String(bj.replacesEmployee) }
      : null;

    instance.supportDoc = bj.document
      ? { name: bj.document, sizeText: '' }
      : null;

    instance.step2 = {
      costCenter:       bc.costCenter                  ?? '',
      budgetCode:       bc.budgetCode                  ?? '',
      hcSlot:           bc.approved                    ?? false,
      salaryComp:       bc?.minSalary + '-' + bc?.maxSalary,
      proposedComp:     Number(bc.proposedTotalCompensation),
      signingBonus:     bc.signingBonus                ?? false,
      signingAmt:       Number(bc.signingBonusAmount),
      equity:           bc.equity                      ?? false,
      equityAmt:        Number(bc.equityAmount),
      relocation:       bc.relocationBudget            ?? false,
      relocAmt:         Number(bc.relocationBudgetAmount),
      annualHiringCost: bc.annualHiringCost            ?? 0,
    };

    instance.step3 = {
      eduReq:       rr.educationRequirement ?? '',

      travel:       getTravelName(rr.travelRequirement ?? ''),
      expMin:       rr.minExperience        ?? 0,
      expMax:       rr.maxExperience        ?? 0,
      interviewMin: rr.minInterviewRounds   ?? 0,
      interviewMax: rr.maxInterviewRounds   ?? 0,
      assessmentOn: rr.assessmentRequired   ?? false,
    };

    instance.mustSkills      = this.splitCsv(rr.skillsMustHave);
    instance.niceSkills      = this.splitCsv(rr.niceToHaveSkills);
    instance.certs           = this.splitCsv(rr.certificationsRequired);
    instance.langs           = this.splitCsv(rr.languages);
    instance.assessmentTypes = [];

    instance.step4 = {
      internalFirst:  ss.internalFirstPolicy ?? false,
      sourcingBudget: ss.sourcingBudget != null ? String(ss.sourcingBudget) : '',
      referralOn:     ss.referralEnabled      ?? false,
      referralAmt:    ss.referralAmount != null ? String(ss.referralAmount) : '',
      diversityOn:    ss.diversityEnabled     ?? false,
    };

    instance.jobBoards       = jobBoards;
    instance.diversityBoards = diversityBoards;

  } catch {
    // silently fail
  } finally {
    this.viewLoading = false;
  }
}
  private splitCsv(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(Boolean);
    }
    return String(value).split(',').map(s => s.trim()).filter(Boolean);
  }

  private mapToRequisition(item: SrListItem): StaffingRequisition {
    const statusMap: Record<string, StaffingRequisition['status']> = {
      DRAFT:     'Draft',
      SUBMITTED: 'Submitted',
      APPROVED:  'Approved',
      REJECTED:  'Rejected',
    };
    return {
      id:     item.srId ?? 'Draft – Pending ID',
      title:  item.jobTitle,
      meta:   `Created ${item.createdDate}`,
      status: statusMap[item.status?.toUpperCase()] ?? 'Draft',
    };
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPage(page);
  }

  newSR(): void {
    this.router.navigateByUrl('/demand/create?step=0');
  }

  resumeSR(sr: StaffingRequisition): void {
    this.router.navigate(['/demand/create'], { queryParams: { id: sr.id, type: 'edit' } });
  }

  editSR(sr: StaffingRequisition): void {
    this.router.navigate(['/demand/create'], { queryParams: { id: sr.id, type: 'edit' } });
  }

  badgeClass(status: string): string {
    const map: Record<string, string> = {
      draft:     'badge-draft',
      submitted: 'badge-submitted',
      approved:  'badge-approved',
      rejected:  'badge-rejected',
    };
    return map[status?.toLowerCase()] ?? '';
  }

  showActions(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }

  canEdit(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }
}