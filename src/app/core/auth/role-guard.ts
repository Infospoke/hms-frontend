import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const roles = route.data['roles'];
    const role = this.auth.getRole();

    if (!roles.includes(role)) {
      this.router.navigate(['/forbidden']);
      return false;
    }
    return true;
  }
}