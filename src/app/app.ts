import { afterNextRender, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NotificationWebsocketService } from './features/notification-panel/services/notification-websocket-service';
import { AuthService } from './core/auth/auth.service';
import { filter } from 'rxjs';
import { TokenService } from './core/auth/token.service';
import { PermissionService } from './core/services/permission.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('infospoke_website_2.0');
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private permissionService = inject(PermissionService);

  ngOnInit(): void {


    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {

        const currentUrl =
          event.urlAfterRedirects;

        // if (currentUrl.startsWith('/auth/login')) {
        //   this.tokenService.clearTokens();
        //   this.permissionService.clear();
        // }
      });
  }


  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    this.authService.logout();
  }
}
