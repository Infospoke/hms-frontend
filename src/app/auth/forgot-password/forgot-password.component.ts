import { Component, inject, signal } from '@angular/core';
import { HeadingComponent } from "../../shared/components/heading/heading.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [HeadingComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = signal(false);
  private router = inject(Router);
  constructor(private fb: FormBuilder, private authService: AuthService,
    private notification: NotificationService,) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res: any) => {
        this.loading.set(false);

        if (res?.responsecode == '00' && res?.message === 'New credentials sent to registered email') {
         
          this.router.navigate(['/login']);
          
        }


      },

      error: () => {
        this.loading.set(false);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
