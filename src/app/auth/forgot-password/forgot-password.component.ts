import { Component, inject, signal } from '@angular/core';
import { HeadingComponent } from "../../shared/components/heading/heading.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [HeadingComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = signal(false);
  private router=inject(Router);
  constructor(private fb: FormBuilder) {
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

    const email = this.forgotForm.value.email;

    console.log('Send reset link to:', email);


    setTimeout(() => {
      this.loading.set(false);
    }, 1500);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
