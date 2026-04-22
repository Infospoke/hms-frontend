import { Component, input, output, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenService } from '../../../core/auth/token.service';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-header',
  imports: [CardComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
sidebarCollapsed = input(false);
  menuToggle = output();

  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  // get userName(): string { return this.tokenService.getUser()?.name || 'User'; }
  // get userRole(): string { return this.tokenService.getUser()?.role || ''; }

  logout() { this.authService.logout(); }


  get userName(){
    return this.authService.getUserName()?.slice(0,2)?.toUpperCase();
  }

  get roleName(){
    return this.authService.getRole();
  }
}
