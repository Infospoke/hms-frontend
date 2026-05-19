import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class NotificationAllService {

  private api = inject(ApiService);


  private notificationsSignal = signal<any['data'] | null>(null);
  private countsSignal = signal<any['data'] | null>(null);
  private countunreadSignal=new BehaviorSubject<any>(0);
  notifications$ = this.notificationsSignal;
  counts$ = this.countsSignal;
  countunreadSignal$=this.countunreadSignal.asObservable();


 
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

   async getNotificationCountsUnRead(): Promise<any> {
    const res: any = await firstValueFrom(
      this.api.hrmsget(API.NOTIFICATIONS.NOTIFICATION_COUNTS)
    );
    this.countunreadSignal.next(res?.data?.unread);    return res;
  }

 
  getNotificationsValue() {
    return this.notificationsSignal();
  }

  getCountsValue() {
    return this.countsSignal();
  }

  getUnreadCount(){
    return this.countunreadSignal.value;
  }

  async markAsRead(payload:any){
    const res: any = await firstValueFrom(
      this.api.hrmsput(API.NOTIFICATIONS.MARK_AS_READ, payload)
    );
    return res;
  }
}
