import { inject, Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationAllService } from './notification-service';
import { NotificationService } from '../../../core/services/notification.service';
declare var SockJS: any;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

/** Shape of each entry stored in localStorage — mirrors the WS payload */
export interface StoredNotification {
  id:                number | null;
  processId:         string;
  notificationTitle: string;
  message:           string;
  type:              string;
  deptName:          string;
  roleId:            number | null;
  receivedAt:        string;   // ISO timestamp — set by the client on arrival
}

const LS_KEY = 'np_ws_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationWebsocketService implements OnDestroy {

  private stompClient!: Client;
  private notificationService    = inject(NotificationAllService);
  private toastNotificationService = inject(NotificationService);
  private authService            = inject(AuthService);

  private notificationSubject = new Subject<any>();
  private statusSubject       = new BehaviorSubject<ConnectionStatus>('disconnected');

  /**
   * BehaviorSubject seeded from localStorage so any subscriber (including
   * the panel) always gets the latest persisted list immediately.
   * Public so callers can synchronously read the current value via getValue().
   */
  public storedNotificationsSubject = new BehaviorSubject<StoredNotification[]>(
    this._readFromStorage()
  );

  public notification$          = this.notificationSubject.asObservable();
  public status$                = this.statusSubject.asObservable();
  /** Emit every time the localStorage list changes (add / clear). */
  public storedNotifications$   = this.storedNotificationsSubject.asObservable();

  // ── WebSocket lifecycle ───────────────────────────────────────────────────

  connect(): void {
    this.statusSubject.next('connecting');

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.hrmsApiUrl}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
    });

    this.stompClient.onConnect = () => {
      this.statusSubject.next('connected');
      this.stompClient.subscribe(
        `/topic/notifications/${this.authService.getRoleId()}`,
        (message: IMessage) => {
          if (message.body) {
            this.handleNotificationEvent(message.body);
          }
        }
      );
    };

    this.stompClient.onDisconnect    = () => this.statusSubject.next('disconnected');
    this.stompClient.onStompError    = (frame) => {
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

  // ── Event handler ─────────────────────────────────────────────────────────

  private handleNotificationEvent(rawBody: any): void {
    // Parse JSON if the body is a string
    let payload: any;
    try {
      payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch {
      payload = { raw: rawBody };
    }

    // Build the stored entry — pull processId & notificationType from payload
    const entry: StoredNotification = {
      id:                payload?.id                ?? null,
      processId:         payload?.processId         ?? "",
      notificationTitle: payload?.NotificationTitle ?? payload?.notificationTitle ?? "Notification",
      message:           payload?.message           ?? "",
      type:              payload?.type              ?? "info",
      deptName:          payload?.deptName          ?? "",
      roleId:            payload?.roleId            ?? null,
      receivedAt:        new Date().toISOString(),
    };

    this._appendToStorage(entry);

    // Side-effects
    this.notificationSubject.next(payload);
    this.notificationService.getNotificationCountsUnRead();
    this.toastNotificationService.success('A New Notification is received.!');
  }

  // ── Public clear (called by the panel's clearAll) ─────────────────────────

  /** Wipe localStorage and reset the BehaviorSubject. */
  clearStoredNotifications(): void {
    try {
      localStorage.removeItem(LS_KEY);
    } catch { /* storage unavailable */ }
    this.storedNotificationsSubject.next([]);
  }

  // ── localStorage helpers ──────────────────────────────────────────────────

  private _readFromStorage(): StoredNotification[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
    } catch {
      return [];
    }
  }

  private _appendToStorage(entry: StoredNotification): void {
    const current = this._readFromStorage();
    current.unshift(entry);           // newest first

    // Keep only the 5 most recent; slice off anything beyond that
    const capped = current.slice(0, 5);

    try {
      localStorage.setItem(LS_KEY, JSON.stringify(capped));
    } catch { /* quota exceeded — fail silently */ }
    this.storedNotificationsSubject.next(capped);
  }
}