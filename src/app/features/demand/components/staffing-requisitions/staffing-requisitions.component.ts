import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

import { StaffingServiceService } from '../../services/staffing-service.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SrReviewComponent } from '../sr-review/sr-review';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CanDirective } from '../../../../shared/directives/can.directive';
import { UserService } from '../../../settings/users/servics/user-service';

export interface StaffingRequisition {
  id: string;
  title: string;
  meta: string;
  status: string;
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
  imports: [CommonModule, PaginationComponent, NzModalModule, CanDirective],
  templateUrl: './staffing-requisitions.component.html',
  styleUrl: './staffing-requisitions.component.scss',
})
export class StaffingRequisitionsComponent implements OnInit {

  requisitions: StaffingRequisition[] = [];
  draftSR: StaffingRequisition | null = null;

  private demandService = inject(StaffingServiceService);
  private userService = inject(UserService);
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
      const response: any = await this.demandService.getAllSRS({ page: page - 1, size: this.pageSize }) as SrListResponse;
      if (response?.responsecode === '00' && response.data) {
        const { content, totalPages, totalElements } = response.data;

        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.requisitions = content.map((item: any) => this.mapToRequisition(item));
        this.draftSR = this.requisitions.find(r => r.status === 'Draft') ?? null;
      } else {
        this.errorMessage = response?.errors?.[0] ?? 'Failed to load requisitions.';
      }
    } catch {
      this.errorMessage = 'An error occurred while fetching requisitions.';
    } finally {
      this.isLoading = false;
    }
  }


  async viewSR(sr: StaffingRequisition): Promise<void> {
    if (!sr?.id || sr.id === 'Draft – Pending ID') return;
    const obj = {
      page: 0, size: 10, sortBy: 'id', direction: 'DESC', filters: {}
    };
    this.viewLoading = true;
    try {

      const [res, travelRes, firstPage]: any[] = await firstValueFrom(
        forkJoin([
          this.demandService.getBySrId(sr.id),
          this.demandService.getTravel(),
          this.userService.getList({ ...obj, page: 0, size: 10 }),
        ])
      );

      if (res?.responsecode !== '00') {
        this.viewLoading = false;
        return;
      }
      let managersList = firstPage?.data?.users ?? firstPage?.content ?? [];
      const totalElements = firstPage?.data?.totalElements ?? 0;
      if (totalElements > 10) {
        const fullRes: any =
          await this.userService.getList({ ...obj, page: 0, size: totalElements })
        console.log(fullRes);
        managersList = fullRes?.data?.users ?? fullRes?.content ?? [];
      }
      const travelOpts: { id: string; name: string }[] = travelRes?.data ?? [];

      const getTravelName = (id: string): string =>
        travelOpts.find(t => String(t.id) === String(id))?.name ?? id;

      const d = res.data ?? {};
      const p = d.positonBasicsResponse ?? {};
      const bj = d.businessJustificationResponse ?? {};
      const bc = d.budgetAndCompensationResponse ?? {};
      const rr = d.rolesAndRequirementsResponse ?? {};
      const ss = d.sourcingStrategyResponse ?? {};

      const boardKeys: Record<string, string> = {
        internalBoard: 'Internal Board',
        naukri: 'Naukri',
        linkedIn: 'LinkedIn',
        indeed: 'Indeed',
        companySite: 'Company Site',
        agencyRpo: 'Agency / RPO',
      };
      const jobBoards = Object.entries(boardKeys)
        .filter(([key]) => ss[key])
        .map(([, label]) => label);
      const diversityBoards = this.splitCsv(ss.diversityTags);

      const modal = this.modal.create({
        nzTitle: `${p.jobTitle ?? sr.title} — ${sr.id}`,
        nzContent: SrReviewComponent,
        nzWidth: 780,
        nzCentered: true,
        nzWrapClassName: 'custom-edit-modal',
        nzBodyStyle: { 'max-height': '78vh', 'overflow-y': 'auto', padding: '0' },
        nzFooter: [{ label: 'Close', onClick: () => modal.destroy() }],
      });

      const instance = modal.getContentComponent() as SrReviewComponent;

      instance.viewOnly = true;
      instance.srId = sr.id;
      instance.jobTitle = p.jobTitle ?? sr.title;

      instance.step0 = {
        jobTitle: p.jobTitle ?? '',
        dept: p.departmentName ?? '',
        bu: p.businessUnitName ?? '',
        location: p.location ?? '',
        workMode: p.workMode ?? '',
        empType: p.employmentType ?? '',
        seniority: p.seniorityLevelName ?? '',
        openings: p.openings ?? 0,
        priority: p.priority ?? '',
        startDate: p.targetStartDate ?? '',
      };

      instance.selectedManagers = Array.isArray(p.reportingManagerInfo)
        ? p.reportingManagerInfo
          .map((id: any) =>
            managersList.find((item: any) => String(item.id) === String(id))
          )
          .filter(Boolean)
        : [];

      instance.step1 = {
        justType: bj.requisitionType ?? '',
        bizCase: bj.businessCase ?? '',
        impactNote: bj.impactIfNotFilled ?? '',
      };
      const replaceEmployee = managersList.find((item: any) => item.id == bj.replacesEmployee)
      console.log(replaceEmployee, managersList);
      // instance.replaceEmployee = bj.replacesEmployee
      //   ? { id: bj.replacesEmployee, username: String(bj.replacesEmployee) }
      //   : null;
      instance.replaceEmployee = replaceEmployee ? { id: replaceEmployee?.id, username: String(replaceEmployee.username || replaceEmployee?.name) }
        : null;
      instance.supportDoc = bj.document
        ? { name: bj.document, sizeText: '' }
        : null;

      instance.step2 = {
        costCenter: bc.costCenter ?? '',
        budgetCode: bc.budgetCode ?? '',
        hcSlot: bc.approved ?? false,
        salaryComp: bc?.minSalary + '-' + bc?.maxSalary,
        proposedComp: Number(bc.proposedTotalCompensation),
        signingBonus: bc.signingBonus ?? false,
        signingAmt: Number(bc.signingBonusAmount),
        equity: bc.equity ?? false,
        equityAmt: Number(bc.equityAmount),
        relocation: bc.relocationBudget ?? false,
        relocAmt: Number(bc.relocationBudgetAmount),
        annualHiringCost: bc.annualHiringCost ?? 0,
      };

      instance.step3 = {
        eduReq: rr.educationRequirement ?? '',

        travel: getTravelName(rr.travelRequirement ?? ''),
        expMin: rr.minExperience ?? 0,
        expMax: rr.maxExperience ?? 0,
        interviewMin: rr.minInterviewRounds ?? 0,
        interviewMax: rr.maxInterviewRounds ?? 0,
        assessmentOn: rr.assessmentRequired ?? false,
      };

      instance.mustSkills = this.splitCsv(rr.skillsMustHave);
      instance.niceSkills = this.splitCsv(rr.niceToHaveSkills);
      instance.certs = this.splitCsv(rr.certificationsRequired);
      instance.langs = this.splitCsv(rr.languages);
      instance.assessmentTypes = [];

      instance.step4 = {
        internalFirst: ss.internalFirstPolicy ?? false,
        sourcingBudget: ss.sourcingBudget != null ? String(ss.sourcingBudget) : '',
        referralOn: ss.referralEnabled ?? false,
        referralAmt: ss.referralAmount != null ? String(ss.referralAmount) : '',
        diversityOn: ss.diversityEnabled ?? false,
      };

      instance.jobBoards = jobBoards;
      instance.diversityBoards = diversityBoards;
      instance.viewOnly = true;
      instance.showTicks = false;
      instance.startOpen = true;
      instance.allowMultipleOpen = true;

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


    return {
      id: item.srId ?? 'Draft – Pending ID',
      title: item.jobTitle,
      meta: `Created ${this.formatDate(item.createdDate)}`,
      status: item.status,
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
      draft: 'badge-draft',
      submitted: 'badge-submitted',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      pending: 'badge-pending'
    };
    return map[status?.toLowerCase()] ?? '';
  }

  showActions(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }

  canEdit(sr: StaffingRequisition): boolean {
    return sr.status === 'Draft' || sr.status === 'Submitted';
  }


  private formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // fallback if unparseable
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }); // → "11 May 2025"
  }
}