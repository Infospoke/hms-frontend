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

  async getHiringManagerDashboardCount():Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.DASHBOARD.HIRING_MANAGER_COUNT));
  }

  async getHiringManagerDashboardDate(srId:any):Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.DASHBOARD.HIRING_MANAGER_DASHBOARD(srId)));
  }

  async getRecruiterManagerDashboardCount():Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.DASHBOARD.RECRUITER_DASHBOARD_COUNT));

  }
getRecruriterDashboardAnalytics(jobId: any, fromDate: string, toDate: string) {
  const params = new HttpParams()
    .set('jobId', jobId)
    .set('fromDate', fromDate)
    .set('toDate', toDate);

  return firstValueFrom(
    this.api.hrmsget(API.DASHBOARD.RECRUITER_DASHBOARD,params)
  );
}
}
