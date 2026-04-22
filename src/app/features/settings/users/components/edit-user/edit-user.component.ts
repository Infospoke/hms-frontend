import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UserService } from '../../servics/user-service';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-edit-user',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NzModalModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() user!: any;



  roles: any[] = [];
  businessUnits: any[] = [];
  departments: any[] = [];
  designations: any[] = [];
  private userService = inject(UserService);
  form!: FormGroup;
  private fb = inject(FormBuilder);
  private modal = inject(NzModalService);
  private modalRef = inject(NzModalRef);
  private notificationService = inject(NotificationService);
  isloading = signal<boolean>(false);
  constructor() { }
  ngOnInit(): void {
    this.form = this.fb.group({
      businessUnit: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required],
    })
    this.getIntialData();
    this.form.get('businessUnit')?.valueChanges.subscribe(unit => {
      if(!unit)return;
      this.departments = [];
      this.roles = [];
      this.getDeparmentData(unit);
    });

    this.form.get('department')?.valueChanges.subscribe(dept => {
      if(!dept)return;
      this.roles = [];
      this.getRoleData(dept);
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
      this.userService.getDepartments(id)
        .then((res: any) => {
          this.roles = res?.data;
        })
        .catch(console.error);
    }
    catch (error: any) {

    }
  }
  deactivateUser() {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to deactivate this user?',
      nzContent: 'This action will disable user access.',
      nzOkText: 'Yes, Deactivate',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',

      nzOnOk: () => {
        return this.deactive(this.user?.id);
      }
    })
  }

  deactive(userId: any) {
    let obj = {
      "deactivate": true
    }
    this.userService.update(userId, obj)
      .then((res: any) => {
        this.notificationService.success(res?.message);
        this.reset()
      })
      .catch((error: any) => {
        this.notificationService.error(error?.error?.message);
      });
  }
  getIntialData() {
    forkJoin({
      bussinessUnit: this.userService.getBussinessUnits()
    }).subscribe({
      next: (res: any) => {
        this.businessUnits = res.bussinessUnit?.data;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }
  save() {
    if (this.form.valid) {
      console.log("formValid")
      const roleId = this.form.get('role')?.value;
      const role = this.roles.find(item => item.id == roleId);
      this.isloading.set(true);
      let obj = {
        employmentTypeId: this.form.get('employmentType')?.value,
        businessUnitId: this.form.get('businessUnit')?.value,
        departmentId: this.form.get('department')?.value,
        roleId: role?.id,
      }
      this.userService.update(this.user?.id, obj)
        .then((res: any) => {
          this.isloading.set(false);
          this.notificationService.success(res?.message);
          this.reset();

        })
        .catch((error: any) => {
          this.isloading.set(false);
          this.notificationService.error(error?.error?.message);
        });
    }
    else {
      this.form.markAllAsTouched();
    }
  }

  reset() {
    this.form.reset();
    this.modalRef.close();
  }
  c(name: string) {
    return this.form.get(name);
  }

}
