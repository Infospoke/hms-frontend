import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {

  private api = inject(ApiService);

  async createChain(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.APPROVALS.CREATE_CHAIN, payload)
    );
  }


  async chainCount() {
    return await firstValueFrom(
      this.api.hrmsget(API.APPROVALS.APPROVAL_CHAIN_COUNT)
    );
  }

  async departments() {
    return await firstValueFrom(
      this.api.hrmsget(API.APPROVALS.DEPATMENTS)
    );
  }


  async chainDetailsById(id: any) {
    return await firstValueFrom(
      this.api.hrmsget(API.APPROVALS.APPROVAL_CHAIN_DETAILS(id))
    );
  }


  async getFunctionalities() {
    return await firstValueFrom(
      this.api.hrmsget(API.APPROVALS.GET_FUNCTIONALITIES)
    );
  }


  async updateChain(payload: any) {
    return await firstValueFrom(
      this.api.hrmsput(API.APPROVALS.UPDATE_CHAIN, payload)
    );
  }


  async approvalChainList(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.APPROVALS.APPROVAL_CHAIN_LIST, payload)
    );
  }


  async getSrDetails(srId: string) {
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.BY_SR_ID,{ request: srId })
    );
  }


  async approveOrReject(payload: { srId: string; decision: 'APPROVE' | 'REJECT'; comments?: string }) {
    return await firstValueFrom(
      this.api.hrmspost(API.APPROVALS.APPROVE_OR_REJECT, payload)
    );
  }


  async getSrCount() {
    return await firstValueFrom(
      this.api.hrmsget(API.SR_APPROVALS.COUNT)
    );
  }

   async getSRList(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.SR_APPROVALS.LIST, payload)
    );
  }
}
