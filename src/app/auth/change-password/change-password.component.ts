import { Component, inject, signal } from '@angular/core';
import { HeadingComponent } from "../../shared/components/heading/heading.component";
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [HeadingComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  changeForm: FormGroup;
  loading = signal(false);

  showCurrent = signal(true);
  showNew     = signal(true);
  showConfirm = signal(true);

  constructor(private fb: FormBuilder) {
    this.changeForm = this.fb.group(
      {
        currentPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
        ]],
        newPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
        ]],
        confirmPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
        ]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: AbstractControl) {
    const newPass     = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    if (newPass !== confirmPass) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
     
      const errors = form.get('confirmPassword')?.errors;
      if (errors?.['mismatch']) {
        const { mismatch, ...rest } = errors;
        form.get('confirmPassword')?.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
    return null;
  }

  onSubmit() {
    console.log('clicked')
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = {
      oldPassword: this.changeForm.value.currentPassword,
      newPassword: this.changeForm.value.newPassword,
    };

    this.auth.changePassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.logout();                  
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading.set(false);             
      },
    });
  }
}