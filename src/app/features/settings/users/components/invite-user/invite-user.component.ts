import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { firstValueFrom, forkJoin } from 'rxjs';
import { UserService } from '../../servics/user-service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { alphabetsOnly, numericOnly, mobileValidator, notSameAsMobile } from '../../../../../shared/validations/validators';


@Component({
  selector: 'app-invite-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invite-user.component.html',
  styleUrl: './invite-user.component.scss',
})
export class InviteUserComponent implements OnInit {

  form!: FormGroup;
  userTypes: any[] = [];
  employmentTypes: any[] = [];
  businessUnits: any[] = [];
  departments: any[] = [];
  roles: any[] = [];

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isloading = signal<boolean>(false);
  userData: any = null;
  isView: boolean = false;
  userId: any;

  constructor(private fb: FormBuilder) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { type: string; user: any };
    if (state) {
      this.isView = true;
      this.userData = state.user;
      this.userId = this.userData?.id;
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      userType: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), alphabetsOnly()]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), alphabetsOnly()]],
      employeeId: ['', [Validators.required, numericOnly(), Validators.minLength(4), Validators.maxLength(4)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      mobile: ['', [Validators.required, mobileValidator(), Validators.minLength(10), Validators.maxLength(15)]],
      altMobile: ['', [mobileValidator(), Validators.minLength(10), Validators.maxLength(15), notSameAsMobile('mobile')]],
      employmentType: ['', Validators.required],
      businessUnit: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.getIntialData();

    if (this.isView) {

      this.getIntialDataUser();
    }

    if (!this.isView) {
      this.form.get('businessUnit')?.valueChanges.subscribe(unit => {
        this.departments = [];
        this.roles = [];
        this.form.get('department')?.setValue('');
        this.form.get('role')?.setValue('');
        if (unit) this.getDeparmentData(unit);
      });

      this.form.get('department')?.valueChanges.subscribe(dept => {
        this.roles = [];
        this.form.get('role')?.setValue('');
        if (dept) this.getRoleData(dept);
      });
    }


    if (!this.isView) {
      this.form.get('mobile')?.valueChanges.subscribe(() => {
        this.form.get('altMobile')?.updateValueAndValidity();
      });
    }
  }

  getIntialData() {
    forkJoin({
      userTypes: this.userService.getUsersTypes(),
      employmentTypes: this.userService.getEmployeeTypes(),
      bussinessUnit: this.userService.getBussinessUnits()
    }).subscribe({
      next: (res: any) => {
        this.userTypes = res.userTypes?.data ?? [];
        this.employmentTypes = res.employmentTypes?.data ?? [];
        this.businessUnits = res.bussinessUnit?.data ?? [];
      },
      error: (error: any) => console.log(error)
    });
  }

  getDeparmentData(id: any): Promise<void> {
    return this.userService.getDepartments(id)
      .then((res: any) => {
        this.departments = res?.data ?? [];
      })
      .catch((err: any) => {
        console.error(err);
        this.departments = [];
      });
  }

  getRoleData(id: any): Promise<void> {
    return this.userService.getRoles(id)
      .then((res: any) => {
        this.roles = res?.data ?? [];
      })
      .catch((err: any) => {
        console.error(err);
        this.roles = [];
      });
  }


  async getIntialDataUser() {
    try {
      const res: any = await firstValueFrom(
        forkJoin({ user: this.userService.getUserById(this.userId) })
      );

      const user = res?.user?.data;


      this.form.patchValue({
        userType: Number(user?.userTypeId),
        firstName: user?.firstName,
        lastName: user?.lastName,
        employeeId: user?.employeeId,
        email: user?.email,
        mobile: user?.mobileNumber,
        altMobile: user?.alternateContact,
        employmentType: user?.employmentTypeId,
        businessUnit: Number(user?.businessUnitId),
      }, { emitEvent: false });


      await this.getDeparmentData(user?.businessUnitId);

      this.form.patchValue({
        department: Number(user?.departmentId),
      }, { emitEvent: false });

      await this.getRoleData(user?.departmentId);

      this.form.patchValue({
        role: Number(user?.roleId),
      }, { emitEvent: false });


      this.form.disable();

    } catch (error: any) {
      console.error(error);
    }
  }

  submit() {
    if (this.form.valid) {
      const roleId = this.form.get('role')?.value;
      const role = this.roles.find(item => item.id == roleId);
      this.isloading.set(true);
      const obj = {
        userTypeId: this.form.get('userType')?.value,
        firstName: this.form.get('firstName')?.value,
        lastName: this.form.get('lastName')?.value,
        employeeId: this.form.get('employeeId')?.value,
        email: this.form.get('email')?.value,
        mobileNumber: this.form.get('mobile')?.value,
        alternateContact: this.form.get('altMobile')?.value ? this.form.get('altMobile')?.value :null,
        employmentTypeId: this.form.get('employmentType')?.value,
        businessUnitId: this.form.get('businessUnit')?.value,
        departmentId: this.form.get('department')?.value,
        roleId: role?.id,
      };
      this.userService.inviteUser(obj)
        .then((res: any) => {
           this.isloading.set(false);
          if (res?.responsecode == '00') {
            this.notificationService.success(res?.message);
           
            this.close();
          }
          else{
            this.notificationService.error(res?.message || res?.responsemessage);
          }
        })
        .catch((error: any) => {
          this.notificationService.error(error?.error?.message);
          this.isloading.set(false);
        });
    } else {
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
    this.router.navigateByUrl('/users/user-onboard-roles');
  }
}