import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { API } from '../../../shared/constants/api-endpoints';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientManagementService {

  private api = inject(ApiService);

  async addClient(payload: any): Promise<any> {
    return await firstValueFrom(this.api.hrmspost(API.CLIENT_MANAGEMENT.ADD_CLIENT, payload));
  }

  async getAllClients(payload: any): Promise<any> {
    return await firstValueFrom(this.api.hrmspost(API.CLIENT_MANAGEMENT.GET_ALL_CLIENTS, payload));
  }

  async getClientById(id: any): Promise<any> {
    return await firstValueFrom(this.api.hrmsget(API.CLIENT_MANAGEMENT.GET_CLIENT_BY_ID(id)));
  }
  async updateClient(payload: any): Promise<any> {
    return await firstValueFrom(this.api.hrmsput(API.CLIENT_MANAGEMENT.UPDATE_CLIENT, payload));
  }

}