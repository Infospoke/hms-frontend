import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

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
}
