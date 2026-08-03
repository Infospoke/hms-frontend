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


  async approveOrReject(payload: { srId: string; approved: boolean; comments?: string }) {
    return await firstValueFrom(
      this.api.hrmspost(API.APPROVALS.APPROVE_OR_REJECT, payload)
    );
  }


  async getSrCount() {
    return await firstValueFrom(
      this.api.hrmsget(API.SR_APPROVALS.COUNT)
    );
  }


   async getActiveFuncationalies() {
    return await firstValueFrom(
      this.api.hrmsget(API.SR_APPROVALS.FUNCATNALITIES)
    );
  }

   async getSRList(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.SR_APPROVALS.LIST, payload)
    );
  }


   async getOfferDetails(offerId: string) {
    // return this.http.get(`${BASE_URL}/${offerId}`);
  }

   async approveOrRejectOffer(payload: any) {
    const form = new FormData();
    form.append('offerId', payload.offerId);
    form.append('approved', String(payload.approved));
    form.append('comments', payload.comments);
    // if (payload.signature) form.append('signature', payload.signature);
    // return this.http.post(`${BASE_URL}/decision`, form);
  }


    releaseOfferLetter(offerId: string) {
    // return this.http.post(`${BASE_URL}/${offerId}/release`, {});
  }
 
  viewOfferLetter(offerId: string): void {
    // window.open(`${BASE_URL}/${offerId}/letter`, '_blank');
  }

  async approveOfferList(payload:any){
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.OPPROVE_OFFER_LIST, payload))
  }


  async getDepartmentsByType(payload:any){
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.DEPARMENT,payload))
  }
}
