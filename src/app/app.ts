import { afterNextRender, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebsocketService } from './features/notification-panel/services/notification-websocket-service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('infospoke_website_2.0');
  private authService=inject(AuthService)
  constructor(private websocketService: NotificationWebsocketService) {

  }
  ngOnInit(): void {
    Promise.all([this.websocketService.connect()])

  }


  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    this.authService.logout();
  }
}
