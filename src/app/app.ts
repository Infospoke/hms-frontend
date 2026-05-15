import { afterNextRender, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebsocketService } from './features/notification-panel/services/notification-websocket-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('infospoke_website_2.0');

  constructor(private websocketService:NotificationWebsocketService) {
   
  }
  ngOnInit(): void {
    this.websocketService.connect();
    
  }
}
