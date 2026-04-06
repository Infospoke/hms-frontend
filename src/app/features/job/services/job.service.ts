import { inject, Inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { API } from '../../../shared/constants/api-endpoints';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private api = inject(ApiService);

  async getJobsList(isOpen: boolean): Promise<any> {
    return await firstValueFrom(
      this.api.get(API.JOBS.GET_ALL_JOBS(isOpen))
    );
  }

  async getJobDashboardCount(){
    return await firstValueFrom(
      this.api.get(API.JOBS.GET_DASHBOARD_DATA)
    );
  }

  async getJobDetailsById(jobId:any){
    return await firstValueFrom(
      this.api.get(API.JOBS.GET_JOB_BY_ID(jobId))
    );
  }
}
