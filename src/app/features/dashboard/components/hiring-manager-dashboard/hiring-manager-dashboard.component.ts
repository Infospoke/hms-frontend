import {

  Component,

  inject,

  OnInit,

  TemplateRef,

  ViewChild

} from '@angular/core';



import {

  CommonModule

} from '@angular/common';



import {

  FormsModule

} from '@angular/forms';



import {

  DashboardLayoutComponent

} from '../dashboard-layout/dashboard-layout.component';



import {

  DashboardCountCardComponent

} from '../../../../shared/components/dashboard-count-card/dashboard-count-card.component';



import {

  ReusableTableComponent,

  TableColumn

} from '../../../../shared/components/reusable-table/reusable-table.component';



import {

  SemiCircleGaugeComponent

} from '../../../../shared/components/semi-circle-gauge/semi-circle-gauge.component';



import {

  SankeyNode,

  SankeyLink

} from '../../../../shared/components/sankey-diagram/sankey-diagram.component';



import {

  DonutPieChartComponent,

  DonutSegment

} from '../../../candidate-management/components/donut-pie-chart/donut-pie-chart.component';



import {

  NgxApexsankeyComponent

} from 'ngx-apexsankey';



import type {

  GraphData,

  SankeyOptions

} from 'ngx-apexsankey';



import {

  AuthService

} from '../../../../core/auth/auth.service';



import {

  DateRangePickerComponent,

  DateRange

} from '../../../../shared/components/date-range-picker/date-range-picker.component';



import {

  DashboardService

} from '../../services/dashboard.service';





// ============================================================

// TYPES

// ============================================================



export interface KpiCard {



  label: string;



  value: string | number;



  iconClass: string;



  iconColor: string;



  iconBgColor: string;



}





export interface PipelineStage {



  label: string;



  value: number;



  color: string;



  conversionPct?: number;



}





export interface OfferStatusBar {



  label: string;



  count: number;



  color: string;



}







type DashboardSection =

  | 'PIPELINE'

  | 'OFFER_STATUS'

  | 'NEGOTIATION'

  | 'ALL';





export interface HiringManagerAnalyticsResponse {



  candidatePipeline: {



    applied: number;



    screening: number;



    interview: number;



    offer: number;



    hired: number;



    screeningPercentage: number;



    interviewPercentage: number;



    offerPercentage: number;



    hiredPercentage: number;



    overallConversionRate: number;



  };





  candidateQuality: {



    excellent: number;



    good: number;



    average: number;



    needsReview: number;



    totalCandidates: number;



  };





  hiringHealth: {



    pipelineCoverage: number;



    offerProgress: number;



    candidateQuality: number;



    requisitionsOnTrack: number;



    agingRequisitions: number;



  };





  negotiationFlow: {



    negotiationRequest: number | null;



    hrReview: number | null;



    underReview: number | null;



    reReleaseOffer: number | null;



    candidateAccepted: number | null;



    candidateRejected: number | null;



  };





  offerStatusFlow: {



    offerRequestByHR: number;



    underReviewApproval: number;



    offerReleased: number;



    offerAccepted: number;



    offerRejected: number;



  };



}





@Component({



  selector:

    'app-hiring-manager-dashboard',



  standalone: true,



  imports: [



    CommonModule,



    FormsModule,



    DashboardLayoutComponent,



    DashboardCountCardComponent,



    ReusableTableComponent,



    SemiCircleGaugeComponent,



    DonutPieChartComponent,



    NgxApexsankeyComponent,



    DateRangePickerComponent



  ],



  templateUrl:

    './hiring-manager-dashboard.component.html',



  styleUrl:

    './hiring-manager-dashboard.component.scss',



})





export class HiringManagerDashboardComponent

  implements OnInit {







  @ViewChild('reqCellTpl')

  reqCellTpl!: TemplateRef<any>;





  @ViewChild('healthCellTpl')

  healthCellTpl!: TemplateRef<any>;





 



  private authService =

    inject(AuthService);





  private dashboardService =

    inject(DashboardService);







  selectedSrId: any = '';





  heading =

    `Good morning, Divya! 👋`;





  subHeading =

    "Here's what's happening with your hiring.";







  pipelineFromDate = '';



  pipelineToDate = '';





  offerStatusFromDate = '';



  offerStatusToDate = '';





  negotiationFromDate = '';



  negotiationToDate = '';





  // ============================================================

  // LOADING / ERROR

  // ============================================================



  isAnalyticsLoading = false;



  analyticsError: string | null = null;





  kpiCards: KpiCard[] = [



    {



      label: 'Open SRs',



      value: 0,



      iconClass:

        'fa-solid fa-briefcase',



      iconColor:

        '#3B82F6',



      iconBgColor:

        '#DBEAFE'



    },



    {



      label: 'Total Candidates',



      value: 0,



      iconClass:

        'fa-solid fa-users',



      iconColor:

        '#10B981',



      iconBgColor:

        '#D1FAE5'



    },



    {



      label: 'Interviews',



      value: 0,



      iconClass:

        'fa-solid fa-user-check',



      iconColor:

        '#8B5CF6',



      iconBgColor:

        '#EDE9FE'



    },



    {



      label: 'Offers Released',



      value: 0,



      iconClass:

        'fa-solid fa-file-signature',



      iconColor:

        '#F97316',



      iconBgColor:

        '#FFEDD5'



    },



    {



      label: 'Hired',



      value: 0,



      iconClass:

        'fa-solid fa-clock',



      iconColor:

        '#6366F1',



      iconBgColor:

        '#E0E7FF'



    }



  ];





  reqData: any[] = [];





  reqColumns: TableColumn[] = [



    {



      key: 'position',



      label: 'Position',



      width: '18%'



    },



    {



      key: 'openings',



      label: 'Openings',



      width: '10%',



      align: 'center'



    },



    {



      key: 'hired',



      label: 'Hired',



      width: '10%',



      align: 'center'



    },



    {



      key: 'inProgress',



      label: 'In-Progress',



      width: '12%',



      align: 'center'



    },



    {



      key: 'targetStart',



      label: 'Target Start Date',



      width: '16%',



      align: 'center',



      custom: true



    },



    {



      key: 'priority',



      label: 'Priority',



      width: '12%',



      align: 'center',



      custom: true



    },



    {



      key: 'slaStatus',



      label: 'SLA Status',



      width: '12%',



      align: 'center',



      custom: true



    }



  ];









  async ngOnInit(): Promise<void> {



    this.handleHeading();





    await this.getHiringManagerDashboardCount();







    if (this.selectedSrId) {



      await this.loadDashboardAnalytics(

        '',

        '',

        'ALL'

      );



    }



  }









  handleHeading(): void {



    const date =

      new Date();





    const hours =

      date.getHours();





    const userName =

      this.authService.getUserNameByToken();





    if (

      hours >= 5 &&

      hours < 12

    ) {



      this.heading =

        `Good morning, ${userName}! 👋`;



    }



    else if (

      hours >= 12 &&

      hours < 17

    ) {



      this.heading =

        `Good afternoon, ${userName}! 👋`;



    }



    else {



      this.heading =

        `Good evening, ${userName}! 👋`;



    }



  }





 

  async getHiringManagerDashboardCount(): Promise<void> {



    const res: any =

      await this.dashboardService

        .getHiringManagerDashboardCount();





    if (

      res?.responsecode === '00'

    ) {



      const data =

        res.data;





      const cards =

        data?.cards;





      this.kpiCards[0].value =

        cards?.openSrs ?? 0;





      this.kpiCards[1].value =

        cards?.totalCandidates ?? 0;





      this.kpiCards[2].value =

        cards?.interviews ?? 0;





      this.kpiCards[3].value =

        cards?.offers ?? 0;





      this.kpiCards[4].value =

        cards?.averageHiringAge ?? 0;





      this.reqData =

        this.mapRequisitions(

          data?.myRequisitions

        );





      this.selectedSrId =

        data?.myRequisitions?.[0]?.srId ?? '';



    }



  }







  private mapRequisitions(

    list: any[]

  ): any[] {



    return (list ?? []).map(

      (item: any) => {



        const totalOpenings =

          item?.totalOpenings ?? 0;





        const yetToFill =

          item?.yetToFill ?? 0;





        const inProgress =

          item?.inProgress ?? 0;





        const hired =

          Math.max(



            totalOpenings -

            yetToFill -

            inProgress,



            0



          );





        return {



          position:

            item?.position ?? '—',



          openings:

            totalOpenings,



          hired,



          inProgress,



          srId:

            item?.srId ?? '',



          jobId:

            item?.jobId ?? '',



          targetStart:

            this.formatDisplayDate(

              item?.targetStartDate

            ),



          daysRemaining:

            item?.daysRemaining ?? 0,



          priority:

            item?.priority ?? '—',



          slaStatus:

            this.normalizeSlaStatus(

              item?.slaStatus

            )



        };



      }

    );



  }





  // ============================================================

  // DATE FORMAT

  // ============================================================



  private formatDisplayDate(

    isoDate:

      string | null | undefined

  ): string {



    if (!isoDate) {



      return '—';



    }





    const d =

      new Date(isoDate);





    if (

      isNaN(d.getTime())

    ) {



      return '—';



    }





    return d.toLocaleDateString(

      'en-GB',

      {



        day: '2-digit',



        month: 'short',



        year: 'numeric'



      }

    );



  }





  // ============================================================

  // SLA

  // ============================================================



  private normalizeSlaStatus(

    status:

      string | null | undefined

  ): string {



    if (!status) {



      return '—';



    }





    return status === 'Over Due'

      ? 'Overdue'

      : status;



  }





  // ============================================================

  // CANDIDATE PIPELINE

  // ============================================================



  pipelineStages: PipelineStage[] = [



    {



      label: 'Applied',



      value: 0,



      color: '#3B82F6'



    },



    {



      label: 'Screening',



      value: 0,



      color: '#14B8A6'



    },



    {



      label: 'Interview',



      value: 0,



      color: '#8B5CF6'



    },



    {



      label: 'Offer',



      value: 0,



      color: '#F97316'



    },



    {



      label: 'Hired',



      value: 0,



      color: '#22C55E'



    }



  ];





  get pipelineConversions(): PipelineStage[] {



    return (



      this.pipelineStages ?? []



    ).filter(



      stage =>

        stage.conversionPct !== undefined



    );



  }





  getRingBackground(

    stage: PipelineStage

  ): string {



    const pct =

      Math.max(



        0,



        Math.min(



          100,



          stage.conversionPct ?? 0



        )



      );





    const deg =

      (pct / 100) * 360;





    return `conic-gradient(

      ${stage.color}

      ${deg}deg,

      #E5E7EB

      ${deg}deg

    )`;



  }





  // ============================================================

  // OFFER STATUS

  // ============================================================



  offerStatusBars: OfferStatusBar[] = [



    {



      label: 'Offer Requests',



      count: 0,



      color: '#3B82F6'



    },



    {



      label: 'Pending Approval',



      count: 0,



      color: '#F59E0B'



    },



    {



      label: 'Offer Released',



      count: 0,



      color: '#8B5CF6'



    },



    {



      label: 'Offer Accepted',



      count: 0,



      color: '#10B981'



    },



    {



      label: 'Declined',



      count: 0,



      color: '#EF4444'



    }



  ];





  get offerStatusMax(): number {



    return Math.max(



      ...this.offerStatusBars.map(

        bar => bar.count

      ),



      1



    );



  }





  getOfferBarPct(

    count: number

  ): number {



    return Math.round(



      (count /

        this.offerStatusMax) *

      100



    );



  }





  // ============================================================

  // SANKEY

  // ============================================================



  sankeyNodes: SankeyNode[] = [



    {



      id: 'released',



      label: 'Offer Released',



      value: 8,



      color: '#8B5CF6',



      column: 0



    },



    {



      id: 'negotiating',



      label: 'In Negotiation',



      value: 3,



      color: '#3B82F6',



      column: 1



    },



    {



      id: 'accepted_direct',



      label: 'Directly Accepted',



      value: 5,



      color: '#22C55E',



      column: 1



    },



    {



      id: 'mgr_review',



      label: 'Manager Review',



      value: 2,



      color: '#F59E0B',



      column: 2



    },



    {



      id: 'counter',



      label: 'Counter Offered',



      value: 1,



      color: '#F97316',



      column: 2



    },



    {



      id: 'closed_accepted',



      label: 'Closed (Accepted)',



      value: 6,



      color: '#16a34a',



      column: 3



    },



    {



      id: 'closed_declined',



      label: 'Closed (Declined)',



      value: 2,



      color: '#EF4444',



      column: 3



    }



  ];





  sankeyLinks: SankeyLink[] = [];





  apexSankeyData: GraphData = {



    nodes: [



      {



        id: 'released',



        title: 'Offers Released',



        color: '#8B5CF6'



      },



      {



        id: 'neg_started',



        title: 'Negotiation Started',



        color: '#3B82F6'



      },



      {



        id: 'mgr_review',



        title: 'Manager Review',



        color: '#22C55E'



      },



      {



        id: 'counter',



        title: 'Counter Offered',



        color: '#7C3AED'



      },



      {



        id: 'fop',



        title: 'Final Offer Pending',



        color: '#F59E0B'



      },



      {



        id: 'closed_accepted',



        title: 'Closed (Accepted)',



        color: '#16a34a'



      },



      {



        id: 'closed_declined',



        title: 'Closed (Declined)',



        color: '#EF4444'



      }



    ],



    edges: []



  };





  apexSankeyOptions:

    Partial<SankeyOptions> = {



    width: '100%',



    height: '100%',



    nodeWidth: 22,



    spacing: 24,



    edgeGradientFill: true,



    edgeOpacity: 0.52,



    edgeGap: 2,



    fontSize: '11px',



    fontFamily:

      'Inter, sans-serif',



    fontColor:

      '#374151',



    enableToolbar: false,



    highlightOnHover: true,



    dimOnHover: true,



    enableAnimation: true,



    animationDuration: 800



  };





  candidateQualitySegments:

    DonutSegment[] = [



      {



        label:

          'Excellent (90–100)',



        value: 0,



        color: '#10B981'



      },



      {



        label:

          'Good (80–89)',



        value: 0,



        color: '#3B82F6'



      },



      {



        label:

          'Average (70–79)',



        value: 0,



        color: '#F59E0B'



      },



      {



        label:

          'Needs Review (<70)',



        value: 0,



        color: '#EF4444'



      }



    ];





  hiringHealthScore = 0;





  healthColumns: TableColumn[] = [



    {



      key: 'metric',



      label: 'Metric',



      width: '52%'



    },



    {



      key: 'score',



      label: 'Score',



      width: '18%',



      align: 'center'



    },



    {



      key: 'status',



      label: 'Status',



      width: '30%',



      align: 'center',



      custom: true



    }



  ];





  healthData = [



    {



      metric:

        'Pipeline Coverage',



      score:

        '0%',



      status:

        'Excellent'



    },



    {



      metric:

        'Offer Progress',



      score:

        '0%',



      status:

        'Good'



    },



    {



      metric:

        'Candidate Quality',



      score:

        '0%',



      status:

        'Excellent'



    },



    {



      metric:

        'Requisitions On Track',



      score:

        '0%',



      status:

        'Good'



    },



    {



      metric:

        'Aging Requisitions',



      score:

        '0%',



      status:

        'Fair'



    }



  ];





  onPipelineDateRangeChange(

    range: DateRange

  ): void {



    this.pipelineFromDate =

      range.fromDate ?? '';





    this.pipelineToDate =

      range.toDate ?? '';





    /*

     * IMPORTANT:

     *

     * We tell the method:

     *

     * "Only update PIPELINE."

     *

     * Backend request is unchanged.

     */



    this.loadDashboardAnalytics(



      this.pipelineFromDate,



      this.pipelineToDate,



      'PIPELINE'



    );



  }





  // ============================================================

  // OFFER STATUS DATE FILTER

  // ============================================================



  onOfferStatusDateRangeChange(

    range: DateRange

  ): void {



    this.offerStatusFromDate =

      range.fromDate ?? '';





    this.offerStatusToDate =

      range.toDate ?? '';





    /*

     * Only OFFER STATUS is updated.

     */



    this.loadDashboardAnalytics(



      this.offerStatusFromDate,



      this.offerStatusToDate,



      'OFFER_STATUS'



    );



  }





  // ============================================================

  // NEGOTIATION DATE FILTER

  // ============================================================



  onNegotiationDateRangeChange(

    range: DateRange

  ): void {



    this.negotiationFromDate =

      range.fromDate ?? '';





    this.negotiationToDate =

      range.toDate ?? '';





    /*

     * Only NEGOTIATION is updated.

     */



    this.loadDashboardAnalytics(



      this.negotiationFromDate,



      this.negotiationToDate,



      'NEGOTIATION'



    );



  }







  async loadDashboardAnalytics(



    fromDate: string = '',



    toDate: string = '',



    section: DashboardSection = 'ALL'



  ): Promise<void> {





    if (!this.selectedSrId) {



      return;



    }





    this.isAnalyticsLoading =

      true;





    this.analyticsError =

      null;





    try {



   



      const res: any =



        await this.dashboardService

          .getHiringManagerDashboardData(



            this.selectedSrId,



            fromDate,



            toDate



          );





      if (



        res?.responsecode === '00' &&



        res?.data



      ) {





        this.mapAnalyticsResponse(



          res.data,



          section



        );



      }



      else {



        this.analyticsError =



          res?.message ||



          'Failed to load analytics.';



      }



    }



    catch (err) {



      this.analyticsError =



        'Something went wrong while loading analytics.';





      console.error(



        'getHiringManagerDashboardAnalytics failed',



        err



      );



    }



    finally {



      this.isAnalyticsLoading =

        false;



    }



  }







  private mapAnalyticsResponse(



    data:

      HiringManagerAnalyticsResponse,



    section:

      DashboardSection



  ): void {







    if (

      section === 'ALL'

    ) {



      this.mapCandidatePipeline(

        data.candidatePipeline

      );





      this.mapCandidateQuality(

        data.candidateQuality

      );





      this.mapHiringHealth(

        data.hiringHealth

      );





      this.mapOfferStatusFlow(

        data.offerStatusFlow

      );





      this.mapNegotiationFlow(

        data.negotiationFlow

      );





      return;



    }







    if (

      section === 'PIPELINE'

    ) {



      this.mapCandidatePipeline(

        data.candidatePipeline

      );





      this.mapCandidateQuality(

        data.candidateQuality

      );





      this.mapHiringHealth(

        data.hiringHealth

      );





      return;



    }







    if (

      section === 'OFFER_STATUS'

    ) {



      this.mapOfferStatusFlow(

        data.offerStatusFlow

      );





      return;



    }







    if (

      section === 'NEGOTIATION'

    ) {



      this.mapNegotiationFlow(

        data.negotiationFlow

      );





      return;



    }



  }





  private mapCandidatePipeline(



    cp:

      HiringManagerAnalyticsResponse[

        'candidatePipeline'

      ]



  ): void {





    if (!cp) {



      return;



    }





    const applied =

      cp.applied ?? 0;





    const screening =

      cp.screening ?? 0;





    const interview =

      cp.interview ?? 0;





    const offer =

      cp.offer ?? 0;





    const hired =

      cp.hired ?? 0;





    this.pipelineStages = [



      {



        label: 'Applied',



        value: applied,



        color: '#3B82F6'



      },



      {



        label: 'Screening',



        value: screening,



        color: '#14B8A6',



        conversionPct:



          this.calcConversionPct(



            screening,



            applied



          )



      },



      {



        label: 'Interview',



        value: interview,



        color: '#8B5CF6',



        conversionPct:



          this.calcConversionPct(



            interview,



            screening



          )



      },



      {



        label: 'Offer',



        value: offer,



        color: '#F97316',



        conversionPct:



          this.calcConversionPct(



            offer,



            interview



          )



      },



      {



        label: 'Hired',



        value: hired,



        color: '#22C55E',



        conversionPct:



          this.calcConversionPct(



            hired,



            offer



          )



      }



    ];



  }







  private calcConversionPct(



    current: number,



    previous: number



  ): number {



    if (!previous) {



      return 0;



    }





    return Math.round(



      (current / previous) *

      100



    );



  }



  private mapCandidateQuality(



    cq:

      HiringManagerAnalyticsResponse[

        'candidateQuality'

      ]



  ): void {





    if (!cq) {



      return;



    }





    this.candidateQualitySegments = [



      {



        label:

          'Excellent (90–100)',



        value:

          cq.excellent ?? 0,



        color:

          '#10B981'



      },



      {



        label:

          'Good (80–89)',



        value:

          cq.good ?? 0,



        color:

          '#3B82F6'



      },



      {



        label:

          'Average (70–79)',



        value:

          cq.average ?? 0,



        color:

          '#F59E0B'



      },



      {



        label:

          'Needs Review (<70)',



        value:

          cq.needsReview ?? 0,



        color:

          '#EF4444'



      }



    ];



  }









  private mapHiringHealth(



    hh:

      HiringManagerAnalyticsResponse[

        'hiringHealth'

      ]



  ): void {





    if (!hh) {



      return;



    }





    const metrics = [



      {



        metric:

          'Pipeline Coverage',



        score:

          hh.pipelineCoverage ?? 0



      },



      {



        metric:

          'Offer Progress',



        score:

          hh.offerProgress ?? 0



      },



      {



        metric:

          'Candidate Quality',



        score:

          hh.candidateQuality ?? 0



      },



      {



        metric:

          'Requisitions On Track',



        score:

          hh.requisitionsOnTrack ?? 0



      },



      {



        metric:

          'Aging Requisitions',



        score:

          hh.agingRequisitions ?? 0



      }



    ];





    this.healthData =

      metrics.map(



        metric => ({



          metric:

            metric.metric,



          score:

            `${metric.score}%`,



          status:

            this.getHealthStatus(

              metric.score

            )



        })



      );





    const avg =



      metrics.reduce(



        (sum, metric) =>



          sum + metric.score,



        0



      ) / metrics.length;





    this.hiringHealthScore =

      Math.round(avg);



  }







  private getHealthStatus(

    score: number

  ): string {



    if (score >= 90) {



      return 'Excellent';



    }





    if (score >= 75) {



      return 'Good';



    }





    if (score >= 60) {



      return 'Fair';



    }





    return 'Critical';



  }





  private mapOfferStatusFlow(



    osf:

      HiringManagerAnalyticsResponse[

        'offerStatusFlow'

      ]



  ): void {





    if (!osf) {



      return;



    }





    this.offerStatusBars = [



      {



        label:

          'Offer Requests',



        count:

          osf.offerRequestByHR ?? 0,



        color:

          '#3B82F6'



      },



      {



        label:

          'Pending Approval',



        count:

          osf.underReviewApproval ?? 0,



        color:

          '#F59E0B'



      },



      {



        label:

          'Offer Released',



        count:

          osf.offerReleased ?? 0,



        color:

          '#8B5CF6'



      },



      {



        label:

          'Offer Accepted',



        count:

          osf.offerAccepted ?? 0,



        color:

          '#10B981'



      },



      {



        label:

          'Declined',



        count:

          osf.offerRejected ?? 0,



        color:

          '#EF4444'



      }



    ];



  }





  private mapNegotiationFlow(



    nf:

      HiringManagerAnalyticsResponse[

        'negotiationFlow'

      ]



  ): void {





    if (!nf) {



      return;



    }





    const edges:

      GraphData['edges'] = [];





    if (nf.negotiationRequest) {



      edges.push({



        source:

          'released',



        target:

          'neg_started',



        value:

          nf.negotiationRequest,



        type:

          'flow'



      });



    }





    if (nf.hrReview) {



      edges.push({



        source:

          'neg_started',



        target:

          'mgr_review',



        value:

          nf.hrReview,



        type:

          'flow'



      });



    }





    if (nf.underReview) {



      edges.push({



        source:

          'mgr_review',



        target:

          'fop',



        value:

          nf.underReview,



        type:

          'flow'



      });



    }





    if (nf.reReleaseOffer) {



      edges.push({



        source:

          'fop',



        target:

          'counter',



        value:

          nf.reReleaseOffer,



        type:

          'flow'



      });



    }





    if (nf.candidateAccepted) {



      edges.push({



        source:

          'fop',



        target:

          'closed_accepted',



        value:

          nf.candidateAccepted,



        type:

          'flow'



      });



    }





    if (nf.candidateRejected) {



      edges.push({



        source:

          'fop',



        target:

          'closed_declined',



        value:

          nf.candidateRejected,



        type:

          'flow'



      });



    }





    this.apexSankeyData = {



      ...this.apexSankeyData,



      edges



    };



  }







  handleData(

    data: any

  ): void {





    console.log(

      'Selected requisition:',

      data

    );





    this.selectedSrId =

      data?.srId ?? '';





   



    this.pipelineFromDate =

      '';



    this.pipelineToDate =

      '';





    this.offerStatusFromDate =

      '';



    this.offerStatusToDate =

      '';





    this.negotiationFromDate =

      '';



    this.negotiationToDate =

      '';





   



    this.loadDashboardAnalytics(



      '',



      '',



      'ALL'



    );



  }



}