import { inject, Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';

import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { AuthService } from '../../../core/auth/auth.service';

declare var SockJS: any;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class NotificationWebsocketService implements OnDestroy {

    private stompClient!: Client;
    private notificationSubject = new Subject<any>();
    private statusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');
    private authService=inject(AuthService);
    public notification$ = this.notificationSubject.asObservable();
    public status$ = this.statusSubject.asObservable();

    connect(): void {
        this.statusSubject.next('connecting');

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(`${environment.hrmsApiUrl}/ws/${this.authService.getRole()}`),

            reconnectDelay: 5000,
            debug: (str) => console.log('[STOMP]', str)
        });

        this.stompClient.onConnect = () => {
            this.statusSubject.next('connected');
            this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
                if (message.body) {
                    console.log('Received notification:', message.body);
                    this.notificationSubject.next(JSON.parse(message.body));
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

    ngOnDestroy(): void {
        this.disconnect();
    }
}