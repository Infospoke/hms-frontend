import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private api = inject(ApiService);


  private notificationsSignal = signal<any['data'] | null>(null);
  private countsSignal = signal<any['data'] | null>(null);

  notifications$ = this.notificationsSignal;
  counts$ = this.countsSignal;



 
  async getNotifications(payload: any): Promise<any> {
    const res: any = await firstValueFrom(
      this.api.hrmspost(API.NOTIFICATIONS.ALL_NOTIFICATIONS, payload)
    );
    this.notificationsSignal.set(res?.data);
    return res;
  }

 
  async getNotificationCounts(): Promise<any> {
    const res: any = await firstValueFrom(
      this.api.hrmsget(API.NOTIFICATIONS.NOTIFICATION_COUNTS)
    );
    this.countsSignal.set(res?.data);
    return res;
  }

 
  getNotificationsValue() {
    return this.notificationsSignal();
  }

  getCountsValue() {
    return this.countsSignal();
  }
}
