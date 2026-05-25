import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';


@Injectable({
  providedIn: 'root',
})
export class SupplyService {
  private apiUrl=environment.hrmsApiUrl;
  private api=inject(ApiService);

  async kanban(payload:any){
      return await firstValueFrom(
        this.api.hrmspost(API.SUPPLY.KANBAN,payload)
      );
    }
   async myAssignedCounts(){
      return await firstValueFrom(
        this.api.hrmsget(API.SUPPLY.ASSIGNED_COUNT)
      );
    }

  async getAssginedList(payload:any){
    return await firstValueFrom(
        this.api.hrmspost(API.SUPPLY.ASSIGNED_LIST,payload)
      );
  }
}
