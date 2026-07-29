import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PipelineStage, PipeLineStagesComponent } from '../../../../shared/components/pipe-line-stages/pipe-line-stages.component';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { candidateManagementFilter } from '../../../../shared/constants/reusbale-filter';
import { RaiseOfferRequestTableComponent } from '../raise-offer-request-table/raise-offer-request-table.component';
import { RaiseOfferLetterPendingTableComponent } from '../raise-offer-letter-pending-table/raise-offer-letter-pending-table.component';
import { RaiseOfferLetterReadyTableComponent } from '../raise-offer-letter-ready-table/raise-offer-letter-ready-table.component';
import { PayRevisionRequestTableComponent } from '../pay-revision-request-table/pay-revision-request-table.component';
import { AcceptOfferTableComponent } from '../accept-offer-table/accept-offer-table.component';
import { ApprovalStatusTableComponent } from '../approval-status-table/approval-status-table.component';
import { CandidateServiceComponent } from '../../serviecs/candidate-service.component';
import { InterviewServiceService } from '../../../interview/service/interview-service.service';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-raise-offer-request',
  imports: [
    CommonModule,
    PipeLineStagesComponent,
    HeadingComponent,
    CommonFilterComponent,
    RaiseOfferRequestTableComponent,
    RaiseOfferLetterPendingTableComponent,
    RaiseOfferLetterReadyTableComponent,
    PayRevisionRequestTableComponent,
    AcceptOfferTableComponent,
    ApprovalStatusTableComponent
  ],
  templateUrl: './raise-offer-request.component.html',
  styleUrl: './raise-offer-request.component.scss',
})
export class RaiseOfferRequestComponent implements OnInit {
  private router = inject(Router);
  stages: PipelineStage[] = [
    {
      id: 'ror',
      label: 'Raise offer request',
      icon: 'fa-solid fa-envelope',
      countColor: 'blue',
      count: 0,

    },
    {
      id: 'rol',
      label: 'Release offer letter',
      icon: 'fa-solid fa-shield-halved',
      countColor: 'purple',
      count: 0,
      breakdown: `${0} pending • ${0} ready`,
    },
    {
      id: 'cr',
      label: 'Candidate requested',
      icon: 'fa-solid fa-pen',
      countColor: 'orange',
      // TODO: swap to `data?.candidateRequested ?? 0` once the API returns it.
      count: 0,

    },
    {
      id: 'al',
      label: 'Accepted letters',
      icon: 'fa-solid fa-users',
      countColor: 'green',
      // TODO: swap to `data?.acceptedLetters ?? 0` once the API returns it.
      count: 0,

    },
  ];
  headings: any = {
    ror: {
      heading: 'Raise Offer Request',
      subHeading: 'Candidates have reached the hire stage and are ready for offer initiation. Raise an offer request to begin the approval process.'
    },
    rol: {
      heading: 'Release Offer Letter',
      subHeading: 'Approved offer requests are ready for release. Generate and send the offer letters to the selected candidates.'
    },
    cr: {
      heading: 'Candidate Requested',
      subHeading: 'Candidates have requested changes to their offers. Review the requests and approve or reject the proposed revisions.'
    },
    al: {
      heading: 'Accepted Letters',
      subHeading: 'Candidates who have accepted their offer letters are listed here and are ready for the onboarding process.'
    }
  };
  private candidateService = inject(CandidateServiceComponent)
  totalAcceptedLetters: number = 11;
  acceptedLetters: any[] = [];
  dropDownData = candidateManagementFilter;
  activeStageId: any = 'ror';
  newPayRevisionRequestsCount:any;
  currentPage: number = 1;
  pageSize: number = 10;
  totalCandidates: number = 0;
  activeFilters: any = { dateFilter: '' }
  // ── Sub-tabs, keyed by stage ──────────────────────────────────────────────
  // 'ror' and 'al' have no entry here -> tabs getter returns [] -> no tabs shown.
  tabsByStage: Record<string, { key: string; label: string; count: number, show: boolean }[]> = {
    rol: [
      { key: 'pending', label: 'Pending approval', count: 0, show: false },
      { key: 'ready', label: 'Ready to release', count: 0, show: false },
    ],
    cr: [
      { key: 'new', label: 'New requests', count: 0, show: false },
      { key: 'approval', label: 'In approval', count: 0, show: false },
    ],
  };

  activeTabId: string = '';

  get tabs(): { key: string; label: string; count: number, show: boolean }[] {
    return this.tabsByStage[this.activeStageId] || [];
  }

  candidates: any[] = [

  ];

  // ── Release offer letter: Pending approval ───────────────────────────────
  totalPendingApproval: number = 0;
  pendingApprovalOfferLetters: any[] = [];

  // ── Release offer letter: Ready to release ───────────────────────────────
  totalReadyToRelease: number = 3;
  readyToReleaseOfferLetters: any[] = [];
  permissionName: any = 'CANDIDATEMANAGEMENT:OFFERMANAGEMENT:VIEW';
  // ── Candidate requested / Pay revision requests: New requests ────────────
  totalNewPayRevisionRequests: number = 4;
  newPayRevisionRequests: any[] = [];

  totalPayRevisionInApproval: number = 3;
  payRevisionInApproval: any[] = [

  ];

  get heading(): string {
    return this.headings[this.activeStageId]?.heading
  }
  get subHeading(): string {
    return this.headings[this.activeStageId]?.subHeading
  }
  private interviewService = inject(InterviewServiceService)
  private approvalService = inject(ApprovalService)
  async ngOnInit() {

    const state = history.state ?? {};
    this.activeStageId = state.activeType ?? 'ror';

    const stageTabs = this.tabsByStage[this.activeStageId];
    this.activeTabId = stageTabs?.length ? stageTabs[0].key : '';

    await Promise.all([this.loadDepartments(), this.loadJobs(), this.handleApiCalling(), this.getCount()])
  }
  private async getCount() {
    const res: any = await this.candidateService.getCount();

    if (res?.responsecode == '00') {
      this.applyCounts(res.data);
    }

  }
  private applyCounts(data: any): void {
    this.stages = [
      {
        id: 'ror',
        label: 'Raise offer request',
        icon: 'fa-solid fa-envelope',
        countColor: 'blue',
        count: data?.raiseOfferRequest ?? 0,
        caption: '',
      },
      {
        id: 'rol',
        label: 'Release offer letter',
        icon: 'fa-solid fa-shield-halved',
        countColor: 'purple',
        count: data?.releaseOfferLetter ?? 0,
        breakdown: `${data?.pendingApprovals ?? 0} pending • ${data?.readyToRelease ?? 0} ready`,
      },
      {
        id: 'cr',
        label: 'Candidate requested',
        icon: 'fa-solid fa-pen',
        countColor: 'orange',
        // TODO: swap to `data?.candidateRequested ?? 0` once the API returns it.
        count: 0,
        caption: '',
      },
      {
        id: 'al',
        label: 'Accepted letters',
        icon: 'fa-solid fa-users',
        countColor: 'green',
        // TODO: swap to `data?.acceptedLetters ?? 0` once the API returns it.
        count: 0,
        caption: '',
      },
    ];
  }

  private async loadDepartments() {
    const res: any = await this.approvalService.departments();
    if (res?.responsecode == '00') {
      const data = this.map(res?.data);
      this.dropDownData = this.dropDownData.map((item: any) =>
        item.key === 'departments'
          ? { ...item, options: data ?? [] }
          : item
      );
    }
  }
  private async loadJobs() {
    const res: any = await this.interviewService.getAIInterviewZoneJobs();
    if (res?.responsecode == '00') {
      const fun = this.map(res?.data ?? {});
      // ✅ Update only allJobs key, preserve everything else in allFilters
      this.dropDownData = this.dropDownData.map((item: any) =>
        item.key === 'allJobs' ? { ...item, options: fun } : item
      );
    }
  }

  private map(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
    ];
  }
  onStageSelected(data: any) {
    this.activeStageId = data?.id;
    this.currentPage = 1;
    const stageTabs = this.tabsByStage[this.activeStageId];
    this.activeTabId = stageTabs?.length ? stageTabs[0].key : '';
    this.activeFilters = { dateFilter: '' }
    this.handleApiCalling();
  }

  onTabSelected(tabKey: any) {
    this.activeTabId = tabKey;
    this.currentPage = 1;
    this.handleApiCalling();
  }
  handleApiCalling() {
    const payload = this.buildPayload();

    switch (this.activeStageId) {

      case 'ror':
        this.getRaiseOfferRequests(payload);
        break;

      case 'rol':
        if (this.activeTabId === 'pending') {
          this.getPendingOfferLetters(payload);
        } else if (this.activeTabId === 'ready') {
          this.getReadyOfferLetters(payload);
        }
        break;

      case 'cr':
        if (this.activeTabId === 'new') {
          this.getNewRevisionRequests(payload);
        } else if (this.activeTabId === 'approval') {
          this.getRevisionApprovalRequests(payload);
        }
        break;

      case 'al':
        this.getAcceptedOfferLetters(payload);
        break;
    }
  }

  private async getRaiseOfferRequests(payload: any) {
    const payloadData = {
      ...payload,
      sortBy: 'id'
    }
    const res: any = await this.candidateService.getRaiseList(payloadData);
    if (res?.responsecode == '00') {
      this.candidates = this.mapResponseOfRaiseList(res?.data?.content);
      this.totalCandidates = res?.data?.totalElements;
    }
  }
  private mapResponseOfRaiseList(data: any[]): any[] {
    return data.map((item: any) => ({
      id: item.applicantId,
      name: item.candidateName,
      email: item.candidateEmail,
      avatarInitials: this.getAvatarInitials(item.candidateName),
      avatarColor: this.getAvatarColor(item.candidateName),
      jobTitle: item.jobTitle,
      department: item.departmentName,
      movedToHireOn: this.formatDate(item.movedToHireOn),
      movedToHireOnTime: this.formatTime(item.movedToHireOn),
      recruiter: item.recruiter,
      priority: item.priority
    }));
  }
  async getPendingOfferLetters(payload: any) {
    const payloadRequest = {
      ...payload,
      sortBy: 'createdDate'
    }
    const res: any = await this.candidateService.getPendingApprovals(payloadRequest);
    if (res?.responsecode == '00') {
      this.pendingApprovalOfferLetters = this.mapPendingApprovalsList(res?.data?.pendingApprovals);
      this.totalPendingApproval = res?.data?.totalElements;
    }
  }
  private mapPendingApprovalsList(data: any) {
    return data?.map((item: any) => ({
      id: item?.applicationId,
      offerId: item?.offerId,

      name: item?.applicantName,
      email: item?.applicantEmail,

      avatarInitials: this.getAvatarInitials(item?.applicantName),
      avatarColor: this.getAvatarColor(item?.applicantName),

      jobTitle: item?.jobTitle,
      department: item?.department,

      approvalSteps: item?.approvals?.map((approval: any) => ({
        label: approval?.role || 'Pending',
        state: approval?.approved ? 'completed' : 'pending'
      })),

      requestedOn: this.formatDate(item?.requestedOn),
      requestedOnTime: this.formatTime(item?.requestedOn),
      priority: item?.priority
    }));
  }
  async getReadyOfferLetters(payload: any) {
    const payloadData = {
      ...payload,
      sortBy: 'dateOfApproval3'
    }
    const res: any = await this.candidateService.readyToReleaseOffer(payloadData);
    if (res?.responsecode == '00') {
      this.totalReadyToRelease = res?.data?.totalElements;
      this.readyToReleaseOfferLetters = this.mapReadToReleaseList(res?.data?.offers);
    }
  }
  private mapReadToReleaseList(data: any[]): any[] {
    return data.map((item: any) => ({
      id: item.applicationId,
      offerId: item.offerId,
      name: item.candidateName,
      email: item.email,
      avatarInitials: this.getAvatarInitials(item.candidateName),
      avatarColor: this.getAvatarColor(item.candidateName),
      jobTitle: item.jobTitle,
      department: item.department,
      package: item.totalCtc,
      approvedOn: this.formatDate(item.finalApprovalTime),
      approvedOnTime: this.formatTime(item.finalApprovalTime),
      recruiter: item.recruiterName,
      priority: item.priority
    }));
  }

  get visibleDropDownData(): any[] {
  if (this.activeStageId === 'cr') {
    return this.dropDownData.filter((item: any) => item.key !== 'departments');
  }
  return this.dropDownData;
}
  async getNewRevisionRequests(payload: any) {
    const payloadData = {
      ...payload,
      sortBy: 'id'
    }
    const res: any = await this.candidateService.getNotiateList(payloadData);
    if (res?.responsecode == '00') {
      this.newPayRevisionRequestsCount= res?.data?.totalElements;
      this.newPayRevisionRequests = this.mapReadToNagotiateList(res?.data?.content);
    }
  }
  mapReadToNagotiateList(data: any): any {
    return data?.map((item: any) => ({
      id:item?.negotiationId,
      candidateId:item?.candidateId,
      name: item?.candidateName,
      email:item?.email,
      avatarInitials: this.getAvatarInitials(item?.candidateName),
      avatarColor:  this.getAvatarColor(item.candidateName),
      jobTitle: item?.jobTitle,
      offerReleasedOn: this.formatDate(item?.offerNegotiationDate),
      requestedPackage:item?.requestedAmount,
      currentPackage:item?.offeredAmount,
      priority: item?.priority
    }))
  }
  getRevisionApprovalRequests(payload: any) {

  }
  getAcceptedOfferLetters(payload: any) {

  }
  handleFilterChange(data: any) {
    console.log(data);
    this.activeFilters = data;
    this.handleApiCalling();
  }

  onRaiseOfferRequest(candidate: any) {
    this.router.navigate([`/candidate-management/offer-management/details/${candidate?.id}`])

  }



  onViewApprovalDetails(row: any) {
    this.router.navigate([`/candidate-management/offer-management/release-offer-letter-details/${row?.id}`], {
      state: {
        mode: 'view',
        url: '/candidate-management/offer-management',
        activeType: this.activeStageId,
      }
    })
  }

  onViewOfferLetterDetails(row: any) {
    this.router.navigate([`/candidate-management/offer-management/release-offer-letter-details/${row?.id}`], {
      state: {
        mode: 'release',
        url: '/candidate-management/offer-management',
        activeType: this.activeStageId,
      }
    })
  }

  onPageChange(page: any) {
    this.currentPage = page;
  }

  private buildPayload(): object {

    const f = this.activeFilters || {};
    const filterData = f.filters || {};

    const filters: any = {};

    // Search
    if (f.search?.trim()) {
      filters.search = f.search.trim();
    }

    // Job Title
    if (filterData.allJobs) {
      filters.jobId = filterData.allJobs;
    }

    // Department
    if (filterData.departments) {
      filters.departmentId = filterData.departments;
    }

    // Priority
    if (filterData.priority) {
      filters.priority = filterData.priority;
    }

    // Date Filter
    if (filterData.dateFilter) {
      filters.dateFilter = filterData.dateFilter;
    }

    // Custom Date Range
    if (filterData.dateFilter === 'CUSTOM') {

      if (filterData.fromDate) {
        filters.fromDate = filterData.fromDate;
      }

      if (filterData.toDate) {
        filters.toDate = filterData.toDate;
      }
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      // sortBy: 'createdAt',
      direction: 'desc',
      filters
    };
  }
  getAvatarInitials(name: string): string {
    if (!name) return '';

    return name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }
  getAvatarColor(name: string): string {
    const colors = [
      'purple',
      'green',
      'orange',
      'blue',
      'pink',
      'red',


    ];

    if (!name) return colors[0];

    const hash = name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  }


  formatDate(date: string | Date): string {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  formatTime(date: string | Date): string {
    if (!date) return '-';

    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  onReviewPayRevisionRequest(data: any) {

  }
}