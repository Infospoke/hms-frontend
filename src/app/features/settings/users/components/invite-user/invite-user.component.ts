import { CommonModule } from '@angular/common';
import { Component, inject, NgModuleRef, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UserService } from '../../servics/user-service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';

function alphabetsOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const regex = /^[A-Za-z]+$/
    return regex.test(value) ? null : { alphabetsOnly: true };
  };
}

function numericOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return /^\d+$/.test(control.value) ? null : { numericOnly: true };
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
function mobileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const value = control.value.trim();

   
    const regex = /^(\+\d{1,3}\s?)?\d{10}$/;

    return regex.test(value) ? null : { invalidMobile: true };
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

  userTypes: any = [];

  employmentTypes: any = [];
  businessUnits: any = [];
  departments: any[] = [];
  roles: any[] = [];
  private userService = inject(UserService);
  private notificationService=inject(NotificationService);
  private router=inject(Router);
  isloading=signal<boolean>(false);
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      userType: ['', Validators.required],

      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        alphabetsOnly()
      ]],

      lastName: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        alphabetsOnly()
      ]],

      employeeId: ['', [
        Validators.required,
        numericOnly(),
        Validators.maxLength(4)
      ]],

      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],

      mobile: ['', [
        Validators.required,
        mobileValidator(),
        Validators.minLength(10),
        Validators.maxLength(15)
      ]],

      altMobile: ['', [
        mobileValidator(),
        Validators.minLength(10),
        Validators.maxLength(15),
        notSameAsMobile('mobile')
      ]],

     

      employmentType: ['', Validators.required],
      businessUnit: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required],
    });
    this.getIntialData();
    this.form.get('businessUnit')?.valueChanges.subscribe(unit => {
      this.departments = [];
      this.roles = [];
      this.getDeparmentData(unit);
    });

    this.form.get('department')?.valueChanges.subscribe(dept => {
      this.roles = [];
      this.getRoleData(dept);
    });
    this.form.get('mobile')?.valueChanges.subscribe(() => {
      this.form.get('altMobile')?.updateValueAndValidity();
    });
  }
  getIntialData() {
    forkJoin({
      userTypes: this.userService.getUsersTypes(),
      employmentTypes: this.userService.getEmployeeTypes(),
      bussinessUnit: this.userService.getBussinessUnits()
    }).subscribe({
      next: (res: any) => {
        this.userTypes = res.userTypes?.data;
        this.employmentTypes = res.employmentTypes?.data;
        this.businessUnits = res.bussinessUnit?.data;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }
  getDeparmentData(id: any) {
    try {
      this.userService.getDepartments(id)
        .then((res: any) => {
          this.departments = res?.data;
        })
        .catch(console.error);
    }
    catch (error: any) {

    }
  }
  getRoleData(id: any) {
    try {
      this.userService.getRoles(id)
        .then((res: any) => {
          this.roles = res?.data;
        })
        .catch(console.error);
    }
    catch (error: any) {

    }
  }
  submit() {
    if (this.form.valid) {
      const roleId = this.form.get('role')?.value;
      const role=this.roles.find(item=>item.id==roleId);
      this.isloading.set(true);
      let obj = {
        userTypeId: this.form?.get('userType')?.value,
        firstName: this.form.get('firstName')?.value,
        lastName: this.form.get('lastName')?.value,
        employeeId: this.form.get('employeeId')?.value,
        email: this.form.get('email')?.value,
        mobileNumber: this.form.get('mobile')?.value,
        alternateContact: this.form.get('altMobile')?.value,
        dateOfBirth: this.form.get('dob')?.value,
        employmentTypeId: this.form.get('employmentType')?.value,
        businessUnitId: this.form.get('businessUnit')?.value,
        departmentId: this.form.get('department')?.value,
        roleId: role?.id,
      }
      try {
        this.userService.inviteUser(obj)
          .then((res: any) => {
            this.notificationService.success(res?.message);
            this.isloading.set(false);
            this.close();
          }).catch((error:any)=>{
            this.notificationService.error(error?.error?.message);
           this.isloading.set(false);
          })
      }
      catch (error: any) {

      }
    }
    else {
      this.form.markAllAsTouched();
    }
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
    this.router.navigateByUrl("/users/user-onboard-roles");
  }
}