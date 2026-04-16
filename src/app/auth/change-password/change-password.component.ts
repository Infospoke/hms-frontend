import { Component, signal } from '@angular/core';
import { HeadingComponent } from "../../shared/components/heading/heading.component";
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  imports: [HeadingComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  changeForm: FormGroup;
  loading = signal(false);

  showCurrent = signal(true);
  showNew = signal(true);
  showConfirm = signal(true);

  constructor(private fb: FormBuilder) {
    this.changeForm = this.fb.group({
      currentPassword: ['', [Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/)]],
      newPassword: ['', [Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/)]],
      confirmPassword: ['', Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/)]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;

    if (newPass !== confirmPass) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  onSubmit() {
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    console.log(this.changeForm.value);

    // API call
    setTimeout(() => {
      this.loading.set(false);
    }, 1500);
  }
}
