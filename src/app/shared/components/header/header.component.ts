import { Component, input, output, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenService } from '../../../core/auth/token.service';
import { CardComponent } from "../card/card.component";
import { ProfilePipe } from '../../pipes/profile.pipe';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CardComponent, ProfilePipe, SearchBarComponent, CommonModule, NzDropDownModule,NzMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  sidebarCollapsed = input(false);
  menuToggle = output();
  isDropdownOpen = false;
  notificationCount = 3;
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router=inject(Router);
  // get userName(): string { return this.tokenService.getUser()?.name || 'User'; }
  // get userRole(): string { return this.tokenService.getUser()?.role || ''; }

  logout() { this.authService.logout(); }


  get userName() {
    return this.authService.getUserName();
  }

  get roleName() {
    return this.authService.getRole();
  }



  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  goToProfile() {
    console.log('Profile clicked');
  }

  changePassword() {
  this.router.navigateByUrl("/auth/change-password")
  }

  openNotifications() {
    console.log('Notifications clicked');
  }
}
