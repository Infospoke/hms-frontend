import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


function alphabetsOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return /^[a-zA-Z\s]+$/.test(control.value) ? null : { alphabetsOnly: true };
  };
}

function numericOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return /^\d+$/.test(control.value) ? null : { numericOnly: true };
  };
}

function minAge(minYears: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    const dob = new Date(control.value);
    if (dob > today) return { futureDate: true };
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return actualAge >= minYears ? null : { minAge: { required: minYears, actual: actualAge } };
  };
}

function notSameAsMobile(mobileField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const parent = control.parent;
    if (!parent) return null;
    const mobile = parent.get(mobileField)?.value;
    return control.value === mobile ? { sameAsMobile: true } : null;
  };
}

@Component({
  selector: 'app-invite-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invite-user.component.html',
  styleUrl: './invite-user.component.scss',
})
export class InviteUserComponent implements OnInit {

  form!: FormGroup;

  userTypes = ['Employee', 'Manager', 'HR', 'Admin', 'Client'];

  employmentTypes = ['Full Time', 'Part Time', 'Intern', 'Contract'];

  businessUnits = ['Engineering', 'HR', 'Finance'];
  departments: string[] = [];
  allDepartments: Record<string, string[]> = {
    Engineering: ['Frontend', 'Backend', 'DevOps'],
    HR: ['HR Ops', 'Talent Acquisition'],
    Finance: ['Accounts', 'Payroll'],
  };

  roles: string[] = [];
  allRoles: Record<string, string[]> = {
    Frontend: ['Hiring Manager', 'Recruiter'],
    Backend: ['TA Lead', 'Admin'],
    'HR Ops': ['HR Manager'],
    'Talent Acquisition': ['Recruiter', 'TA Lead'],
    Accounts: ['Finance'],
    Payroll: ['Finance', 'Admin'],
    DevOps: ['Admin'],
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      userType:       ['', Validators.required],

      firstName:      ['', [
                        Validators.required,
                        Validators.minLength(2),
                        Validators.maxLength(50),
                        alphabetsOnly()
                      ]],

      lastName:       ['', [
                        Validators.required,
                        Validators.minLength(1),
                        Validators.maxLength(50),
                        alphabetsOnly()
                      ]],

      employeeId:     ['', [
                        Validators.required,
                        numericOnly()
                      ]],

      email:          ['', [
                        Validators.required,
                        Validators.email,
                        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
                      ]],

      mobile:         ['', [
                        Validators.required,
                        numericOnly(),
                        Validators.minLength(10),
                        Validators.maxLength(15)
                      ]],

      altMobile:      ['', [
                        numericOnly(),
                        Validators.minLength(10),
                        Validators.maxLength(15),
                        notSameAsMobile('mobile')
                      ]],

      dob:            ['', [
                        Validators.required,
                        minAge(18)
                      ]],

      employmentType: ['', Validators.required],
      businessUnit:   ['', Validators.required],
      department:     ['', Validators.required],
      role:           ['', Validators.required],
    });

    this.form.get('businessUnit')?.valueChanges.subscribe(unit => {
      this.departments = this.allDepartments[unit] || [];
      this.roles = [];
      this.form.get('department')?.reset('');
      this.form.get('role')?.reset('');
    });

    this.form.get('department')?.valueChanges.subscribe(dept => {
      this.roles = this.allRoles[dept] || [];
      this.form.get('role')?.reset('');
    });
    this.form.get('mobile')?.valueChanges.subscribe(() => {
      this.form.get('altMobile')?.updateValueAndValidity();
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }

  trimField(name: string) {
    const control = this.form.get(name);
    if (control?.value) {
      control.setValue(control.value.trim());
    }
  }

  c(name: string) {
    return this.form.get(name);
  }

  hasError(name: string, error: string) {
    const control = this.form.get(name);
    return control?.touched && control?.hasError(error);
  }

  close() {
    console.log('close modal');
  }
}