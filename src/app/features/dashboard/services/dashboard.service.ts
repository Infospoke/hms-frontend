import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private api = inject(ApiService);

  async getHiringManagerDashboardCount(): Promise<any> {
    return await firstValueFrom(this.api.hrmsget(API.DASHBOARD.HIRING_MANAGER_COUNT));
  }

  async getHiringManagerDashboardData(
    srId: any,
    startDate: any,
    endDate: any
  ): Promise<any> {

    let params = new HttpParams().set('srId', srId);

    if (startDate) {
      params = params.set('fromDate', startDate);
    }
    if (endDate) {
      params = params.set('toDate', endDate);
    }

    return await firstValueFrom(
      this.api.hrmsget(API.DASHBOARD.HIRING_MANAGER_DASHBOARD, params)
    );
  }

  async getRecruiterManagerDashboardCount(): Promise<any> {
    return await firstValueFrom(this.api.hrmsget(API.DASHBOARD.RECRUITER_DASHBOARD_COUNT));

  }
  getRecruriterDashboardAnalytics(jobId: any, startDate: string, endDate: string) {
     let params = new HttpParams().set('jobId', jobId);

    if (startDate) {
      params = params.set('fromDate', startDate);
    }
    if (endDate) {
      params = params.set('toDate', endDate);
    }

    return firstValueFrom(
      this.api.hrmsget(API.DASHBOARD.RECRUITER_DASHBOARD, params)
    )
  }
  async getRecruiterPerformanceDashboardCount(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.DASHBOARD.RECRUITER_PERFORMANCE_DASHBOARD_COUNT,payload));
  }

  /** Per-job drill-down (candidate source performance, hiring trend, funnel)
   * triggered when a row in the Job Assignments table is clicked. */
  async getRecruiterPerformanceDetail(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.DASHBOARD.RECRUITER_PERFORMANCE_DETAIL,payload));
  }

}
