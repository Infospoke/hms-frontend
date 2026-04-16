import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent {
  @Output() close = new EventEmitter<void>();


   user = {
    name: 'Priya Sharma',
    email: 'priya.s@company.com',
    isActive: true,
    currentRole: 'Recruiter',
    assignedDate: '01-03-2026',
    assignedBy: 'Admin (Arjun K.)'
  };

  roles = ['Recruiter', 'TA Lead', 'Manager'];
  businessUnits = ['IT', 'HR', 'Finance'];
  departments = ['Engineering', 'Marketing', 'Sales'];
  designations = ['Junior', 'Senior', 'Lead'];

  form = {
    role: '',
    businessUnit: '',
    department: '',
    designation: ''
  };

  deactivateUser() {
    if (confirm('Are you sure you want to deactivate this user?')) {
      this.user.isActive = false;
    }
  }

  save() {
    console.log('Saved Data:', this.form);

    alert('Changes saved successfully!');
  }

  reset() {
    this.form = {
      role: '',
      businessUnit: '',
      department: '',
      designation: ''
    };
  }
}
