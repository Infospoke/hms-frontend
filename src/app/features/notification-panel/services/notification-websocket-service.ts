import { inject, Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';

import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationAllService } from './notification-service';
import { NotificationService } from '../../../core/services/notification.service';
declare var SockJS: any;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class NotificationWebsocketService implements OnDestroy {

    private stompClient!: Client;
    private notificationService=inject(NotificationAllService)
    private toastNotificationService=inject(NotificationService)
    private notificationSubject = new Subject<any>();
    private statusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');
    private authService = inject(AuthService);
    public notification$ = this.notificationSubject.asObservable();
    public status$ = this.statusSubject.asObservable();

    connect(): void {
        this.statusSubject.next('connecting');

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(`${environment.hrmsApiUrl}/ws`),

            reconnectDelay: 5000,
            debug: (str) => console.log('[STOMP]', str)
        });

        this.stompClient.onConnect = () => {
            this.statusSubject.next('connected');
            this.stompClient.subscribe(`/topic/notifications/${this.authService.getRoleId()}`, (message: IMessage) => {
                console.log(message,"this is a nofications");
                if (message.body) {
                    console.log("this is a notification ")
                   this.handleNotificationEvent(message.body);
                }
            });
        };

        this.stompClient.onDisconnect = () => this.statusSubject.next('disconnected');

        this.stompClient.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message']);
            this.statusSubject.next('disconnected');
        };

        this.stompClient.activate();
    }

    disconnect(): void {
        if (this.stompClient?.active) this.stompClient.deactivate();
    }
    private handleNotificationEvent(event: any): void {
        const userRoleName = this.authService.getRole();

        // const ismaker = event?.makerRoleName === userRoleName;
        // const isChecker = event?.checkerRoleName === userRoleName;

        // if (ismaker || isChecker) {
            this.notificationService.getNotificationCountsUnRead();
            this.toastNotificationService.success("A New Notification is received.!");
        // }
    }
    ngOnDestroy(): void {
        this.disconnect();
    }
}