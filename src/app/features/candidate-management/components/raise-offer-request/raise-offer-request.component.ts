import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PipeLineStagesComponent } from '../../../../shared/components/pipe-line-stages/pipe-line-stages.component';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { CommonFilterComponent } from '../../../../shared/components/common-filter/common-filter.component';
import { candidateManagementFilter } from '../../../../shared/constants/reusbale-filter';
import { RaiseOfferRequestTableComponent } from '../raise-offer-request-table/raise-offer-request-table.component';
import { RaiseOfferLetterPendingTableComponent } from '../raise-offer-letter-pending-table/raise-offer-letter-pending-table.component';
import { RaiseOfferLetterReadyTableComponent } from '../raise-offer-letter-ready-table/raise-offer-letter-ready-table.component';
import { PayRevisionRequestTableComponent } from '../pay-revision-request-table/pay-revision-request-table.component';

import { ApprovalStatusTableComponent, ApprovalStatusRow, ApprovalStatusState } from '../approval-status-table/approval-status-table.component';
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

    ApprovalStatusTableComponent
  ],
  templateUrl: './raise-offer-request.component.html',
  styleUrl: './raise-offer-request.component.scss',
})
export class RaiseOfferRequestComponent implements OnInit {
  private router = inject(Router);
  stages: any[] = [
    {
      id: 'ror',
      label: 'New offer requests',
      icon: 'fa-solid fa-envelope',
      countColor: 'blue',
      count: 0,
    },
    {
      id: 'rol',
      label: 'Offer approvals',
      icon: 'fa-solid fa-square-check',
      countColor: 'purple',
      count: 0,
      breakdown: `${0} new • ${0} negotiated`,
    },
    {
      id: 'rl',
      label: 'Release offer letter',
      icon: 'fa-solid fa-shield-heart',
      countColor: 'orange',
      count: 0,
      breakdown: `${0} pending • ${0} ready`,
    },
    {
      id: 'cr',
      label: 'Candidate response',
      icon: 'fa-solid fa-user-group',
      countColor: 'green',
      count: 0,
      breakdown: ``,
    },
  ];

  headings: any = {
    ror: {
      heading: 'Candidates moved to hire stage',
      subHeading: 'These candidates are ready for offer release. Raise an offer request to start the approval process.'
    },
    rol: {
      offerApprovals: {
        heading: 'New offer approvals',
        subHeading: "Offer requests moving through department head, finance, and HR sign-off before they can be released.",
      },
      negAppovals: {
        heading: 'Negotiation approvals',
        subHeading: "Revised packages HR has approved, now moving through the approval chain before an updated letter is re-released.",
      }
    },
    rl: {
      pending: {
        heading: 'Pending release',
        subHeading: 'All approvals are complete for these first-time offers. Select candidates below and release their letters in bulk, or view what each approver noted.'
      },
      pendingReady: {
        heading: 'Re-release',
        subHeading: 'Approved after negotiation. These candidates already hold an offer letter — releasing here resends it with the revised terms.'
      }
    },
    cr: {
      expired: {
        heading: 'Expired',
        subHeading: 'Terminal state. Validity window closed with no response &mdash; raise a fresh request to re-offer.'
      },
      accepted: {
        heading: 'Accepted',
        subHeading: 'Terminal state. Candidates who have accepted their final offer letter — no further action.'
      },
      negotiating: {
        heading: "Negotiating",
        subHeading: "Candidates who received their offer letter and asked for a package increment. Review the counter — one attempt only, so the outcome here is final.",
      },
      rejected: {
        heading: "Rejected",
        subHeading: "Terminal state. Candidate declined the offer &mdash; record is closed.",
      },
      pending: {
        heading: "Pending",
        subHeading: "Letter sent, awaiting the candidate's decision to accept, reject, or negotiate.",
      }
    },
    al: {
      heading: 'Negotiating',
      subHeading: 'Candidates who received their offer letter and asked for a package increment. Review the counter — one attempt only, so the outcome here is final.'
    }
  };
  private candidateService = inject(CandidateServiceComponent)
  totalAcceptedLetters: number = 11;
  acceptedLetters: any[] = [];
  dropDownData = candidateManagementFilter;
  activeStageId: any = 'ror';
  newPayRevisionRequestsCount: any;
  currentPage: number = 1;
  pageSize: number = 10;
  totalCandidates: number = 0;
  activeFilters: any = { dateFilter: '' }

  tabsByStage: Record<string, { key: string; label: string; count: number, show: boolean }[]> = {
    rl: [
      { key: 'pending', label: 'Pending release', count: 0, show: true },
      { key: 'pendingReady', label: 'Re-release', count: 0, show: true },
    ],
    rol: [
      { key: 'offerApprovals', label: 'New offer approvals ', count: 0, show: true },
      { key: 'negAppovals', label: 'Negotiation approvals', count: 0, show: true },
    ],
    cr: [
      {
        key: 'negotiating',
        label: 'Negotiating',
        count: 0,
        show: true,
      },
      {
        key: 'pending',
        label: 'Pending',
        count: 0,
        show: true,
      },
      {
        key: 'accepted',
        label: 'Accepted',
        count: 0,
        show: true,
      },
      {
        key: 'rejected',
        label: 'Rejected',
        count: 0,
        show: true,
      },
      {
        key: 'expired',
        label: 'Expired',
        count: 0,
        show: true,
      },
    ],
  };

  activeTabId: string = '';

  // ── Approval type mapping for tabs ──────────────────────────────────────
  private approvalTypeMap: Record<string, string> = {
    offerApprovals: 'New Offer Approvals',
    negAppovals: 'Negotiation Approvals',
  };

  private rlTabStatusMap: Record<string, string> = {
    pending:'PENDING',
    pendingReady:'RE-RELEASE',
  }
  private crTabStatusMap: Record<string, string> = {
    negotiating: 'Requested for Negotiation',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    expired: 'Expired',
  };


  private crTabRowStatusMap: Record<string, ApprovalStatusState> = {
    pending: 'awaiting',
    accepted: 'accepted',
    rejected: 'rejected',
    expired: 'expired',
  };

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
  
  totalNewPayRevisionRequests: number = 4;
  newPayRevisionRequests: any[] = [];

  totalPayRevisionInApproval: number = 3;
  payRevisionInApproval: any[] = [

  ];

  get heading(): string {
    const stageHeadings = this.headings[this.activeStageId];
    return stageHeadings?.heading ?? stageHeadings?.[this.activeTabId]?.heading ?? '';
  }
  get subHeading(): string {
    const stageHeadings = this.headings[this.activeStageId];
    return stageHeadings?.subHeading ?? stageHeadings?.[this.activeTabId]?.subHeading ?? '';
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
        label: 'New offer requests',
        icon: 'fa-solid fa-envelope',
        countColor: 'blue',
        count: data?.newOfferRequests ?? 0,
      },
      {
        id: 'rol',
        label: 'Offer approvals',
        icon: 'fa-solid fa-square-check',
        countColor: 'purple',
        count: data?.offerApprovals?.total ?? 0,
        breakdown: `${data?.offerApprovals?.new ?? 0} new • ${data?.offerApprovals?.negotiated ?? 0} negotiated`,
      },
      {
        id: 'rl',
        label: 'Release offer letter',
        icon: 'fa-solid fa-file-signature',
        countColor: 'orange',
        count: data?.releaseOfferLetter?.total ?? 0,
        breakdown: `${data?.releaseOfferLetter?.pending ?? 0} pending • ${data?.releaseOfferLetter?.reRelease ?? 0} ready`,
      },
      {
        id: 'cr',
        label: 'Candidate response',
        icon: 'fa-solid fa-user-check',
        countColor: 'green',
        count: data?.candidateResponses ?? 0,
        breakdown: ``,
      },
    ];
  }

  private async loadDepartments() {
    const payload={
      "srDepartments": true,
    }
    
    const res: any = await this.approvalService.getDepartmentsByType(payload);
    if (res?.responsecode == '00') {
      const data = this.mapForDepartment(res?.data);
      this.dropDownData = this.dropDownData.map((item: any) =>
        item.key === 'departments'
          ? { ...item, options: data ?? [] }
          : item
      );
    }
  }

   private mapForDepartment(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.departmentName,
      }))
    ];
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
        // ✅ FIXED: Differentiate between offerApprovals and negAppovals tabs
        this.getPendingOfferLetters(payload);
        break;

      case 'rl':

        if (this.activeTabId === 'pending') {
          this.getReadyOfferLetters(payload);
        } else if (this.activeTabId === 'pendingReady') {
          this.getReadyOfferLetters(payload);
        }
        break;

      case 'cr':
        switch (this.activeTabId) {
          case 'negotiating':
            this.getNegotiatingCandidates(payload);
            break;

          case 'pending':
            this.getPendingCandidates(payload);
            break;

          case 'accepted':
            this.getAcceptedCandidates(payload);
            break;

          case 'rejected':
            this.getRejectedCandidates(payload);
            break;

          case 'expired':
            this.getExpiredCandidates(payload);
            break;
        }
        break;

      case 'al':
        this.getAcceptedOfferLetters(payload);
        break;
    }
  }

  async getNegotiatingCandidates(payload: any) {
    await this.getCandidateResponseList(payload);
  }

  async getPendingCandidates(payload: any) {
    await this.getCandidateResponseList(payload);
  }

  async getAcceptedCandidates(payload: any) {
    await this.getCandidateResponseList(payload);
  }

  async getRejectedCandidates(payload: any) {
    await this.getCandidateResponseList(payload);
  }

  async getExpiredCandidates(payload: any) {
    await this.getCandidateResponseList(payload);
  }

  
  private async getCandidateResponseList(payload: any) {
    const payloadData = {
      ...payload,
      sortBy: 'id',
    };
    const res: any = await this.candidateService.getCandidateResponse(payloadData);
    if (res?.responsecode != '00') {
      return;
    }

    if (this.activeTabId === 'negotiating') {
      this.newPayRevisionRequestsCount = res?.data?.totalElements;
      this.newPayRevisionRequests = this.mapReadToNagotiateList(res?.data?.content);
    } else {
      this.totalPayRevisionInApproval = res?.data?.totalElements;
      this.payRevisionInApproval = this.mapCandidateResponseList(res?.data?.content);
    }
  }

  private mapCandidateResponseList(data: any[]): ApprovalStatusRow[] {
    return (data ?? []).map((item: any) => ({
      id: item.negotiationId ?? item.candidateId,
      name: item.candidateName,
      applicantId:item?.applicantId,
      email: item.email,
      avatarInitials: this.getAvatarInitials(item.candidateName),
      avatarColor: this.getAvatarColor(item.candidateName) as ApprovalStatusRow['avatarColor'],
      jobTitle: item.jobTitle?.trim?.() ?? item.jobTitle,
      package: item.approvedAmount ?? item.offeredAmount ?? item.requestedAmount,
      releasedOn: this.formatDate(item.offerReleasedDate),
      recruiter: item.recruiter ?? '-',
      status: this.crTabRowStatusMap[this.activeTabId] ?? 'awaiting',
    }));
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
      jobId:item?.jobId,
      offerId:item?.offerId,
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
   
    const approvalType = this.approvalTypeMap[this.activeTabId];
    
    const payloadRequest = {
      ...payload,
      sortBy: 'createdDate',
      filters: {
        ...payload?.filters,
        approvalType: approvalType 
      }
    };



    const res: any = await this.candidateService.getOfferApprovalsList(payloadRequest);
    if (res?.responsecode == '00') {
      this.pendingApprovalOfferLetters = this.mapPendingApprovalsList(res?.data?.pendingApprovals);
      this.totalPendingApproval = res?.data?.totalElements;
    }
  }

  
  private mapPendingApprovalsList(data: any) {
    return (data ?? []).map((item: any) => ({
      id: item?.applicationId,
      offerId: item?.offerId,
  
      name: item?.applicantName,
      email: item?.applicantEmail,
  
      avatarInitials: this.getAvatarInitials(item?.applicantName),
      avatarColor: this.getAvatarColor(item?.applicantName),
  
      jobTitle: item?.jobTitle,
      department: item?.department,
  
      approvalSteps:
        (item?.approvals && item.approvals.length > 0)
          ? item.approvals.map((approval: any) => ({
              label: approval?.role || 'Pending',
  
              // true  → completed
              // false → pending
              // null  → pending
              state:
                approval?.approved === true
                  ? 'completed'
                  : 'pending'
            }))
          : [
              {
                label: 'Approval Pending',
                state: 'pending'
              }
            ],
  
      requestedOn: this.formatDate(item?.requestedOn),
      requestedOnTime: this.formatTime(item?.requestedOn),
      priority: item?.priority
    }));
  }
  async getReadyOfferLetters(payload: any) {
    const payloadData = {
      ...payload,
      sortBy: 'finalApprovalTime'
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
      reReleaseOfferId:item?.reReleaseOfferId,
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

  mapReadToNagotiateList(data: any): any {
    return data?.map((item: any) => ({
      id: item?.negotiationId,
      applicantId:item?.applicantId,
      candidateId: item?.candidateId,
      name: item?.candidateName,
      email: item?.email,
      avatarInitials: this.getAvatarInitials(item?.candidateName),
      avatarColor: this.getAvatarColor(item.candidateName),
      jobTitle: item?.jobTitle,
      offerReleasedOn: this.formatDate(item?.offerNegotiationDate),
      requestedPackage: item?.requestedAmount,
      currentPackage: item?.offeredAmount,
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
    this.router.navigate([`/candidate-management/offer-management/details/${candidate?.id}/${candidate?.jobId}/${candidate?.offerId}`], );

  }



  onViewApprovalDetails(row: any) {
    if(this.activeStageId === 'rol' && this.activeTabId === 'negAppovals') {
      this.router.navigate([`/candidate-management/offer-management/negotiation-approvals/${row?.id}/${row?.offerId}`])   
    }
    else{
      this.router.navigate([`/candidate-management/offer-management/release-offer-letter-details/${row?.id}`], {
      state: {
        mode: 'view',
        url: '/candidate-management/offer-management',
        activeType: this.activeStageId,
      }
    })
    }
    
  }

  onViewOfferLetterDetails(row: any) {
    // this.router.navigate([`/candidate-management/offer-management/release-offer-letter-details/${row?.id}`], {
    //   state: {
    //     mode: 'release',
    //     url: '/candidate-management/offer-management',
    //     activeType: this.activeStageId,
    //   }
    // })
    this.router.navigate([`/candidate-management/offer-management/release-offer-letter/${this.activeTabId==='pending'?row?.id:row?.reReleaseOfferId??row?.offerId}`],{
      state:{type: this.activeTabId}
    });
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

    // Candidate response ('cr') stage: send the status for the currently active tab
    // (pending/accepted/rejected/expired/negotiating) so the backend can filter on it.
    if (this.activeStageId === 'cr' && this.crTabStatusMap[this.activeTabId]) {
      filters.status = this.crTabStatusMap[this.activeTabId];
    }

    if(this.activeStageId==='rl' && this.rlTabStatusMap[this.activeTabId]){
      filters.releaseType = this.rlTabStatusMap[this.activeTabId];
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
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
    this.router.navigate([`/candidate-management/offer-management/review-negotiation-request/${data?.applicantId}`])   
  }
}