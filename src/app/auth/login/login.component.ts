import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../core/auth/auth.service';
import { TokenService } from '../../core/auth/token.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { PermissionService } from '../../core/services/permission.service';
import { API } from '../../shared/constants/api-endpoints';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from "../../shared/components/heading/heading.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NzModalModule, CommonModule, HeadingComponent,HeadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private permissionService = inject(PermissionService);
  private notification = inject(NotificationService);
  private api = inject(ApiService);
  private modal = inject(NzModalService);

  loginForm!: FormGroup;
  loading = signal(false);
  hide = signal(true);
  private userId: any = null;

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [  Validators.required,
      Validators.email]],
      password: ['', [ Validators.required,
      Validators.minLength(8),
      // Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/)]]
      ]]
    });
  }

  async onSubmit() {
    if (!this.loginForm.valid) return;

    this.loading.set(true);
    const { email, password } = this.loginForm.value;
   
    try {
      const data: any = await firstValueFrom(
        this.api.hrmspost(API.AUTH.LOGIN, { email, password })
      );

      this.loading.set(false);

      if (data?.responsecode === '00') {
        this.tokenService.setTokens(data?.data?.token,null);
        sessionStorage.setItem('token', data?.data?.token);
        // sessionStorage.setItem('refreshToken', data.refreshToken);
        // localStorage.setItem('lastLoginTime', data.lastLogin);
        if(this.authService.getIsFirstTimeUser()){
          this.router.navigateByUrl("/auth/change-password");
          return;
        }
        this.userId = data.userId;
        this.authService.getPermissions();
        this.authService.getRole();
        this.router.navigate(['/users/user-onboard-roles']);
        // this.loadUserAndNavigate();
      }
      else if (data?.responsecode == '01' && data?.message=="Please reset your password") {
        this.notification.error(data.message);
        this.router.navigateByUrl('/auth/forgot-password')
      }
      else {
        if (data?.message === 'An active session exists already.Please try again later.') {
          // this.forcedLogout();
        } else {
          this.notification.error(data?.message || 'Login failed');
        }
      }
    }
    catch (error: any) {
      this.loading.set(false);
      this.notification.error(
        error?.error?.responseMessage || error?.error?.message || 'Something went wrong'
      );
    }
  }

  async loadUserAndNavigate() {
    try {
      const data: any = await firstValueFrom(
        this.api.get(API.MODULES.GET_ALL)
      );

      if (data?.modules?.length > 0) {
        const firstModule = data.modules[0];
        if (firstModule.submenus?.length > 0) {
          sessionStorage.setItem('userId', this.userId);
          this.permissionService.setModules(data.modules);
          this.router.navigate(['/users/user-onboard-roles']);
        } else {
          this.router.navigate(['/no-modules-found']);
        }
      } else {
        this.router.navigate(['/no-modules-found']);
      }
    }
    catch (error: any) {
      this.loading.set(false);
      this.notification.error('Failed to load modules');
    }
  }

 

  forgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}