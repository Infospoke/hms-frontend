import { Injectable , inject } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private nzNotification = inject(NzNotificationService);

  success(message: string, title = 'Success') {
    this.nzNotification.success(title, message);
  }

  error(message: string, title = 'Error') {
    this.nzNotification.error(title, message);
  }

  warning(message: string, title = 'Warning') {
    this.nzNotification.warning(title, message);
  }

  info(message: string, title = 'Info') {
    this.nzNotification.info(title, message);
  }
}
