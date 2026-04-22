import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, NgModel, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-skill',
  imports: [CommonModule, ReactiveFormsModule,NzModalModule],
  templateUrl: './add-skill.component.html',
  styleUrl: './add-skill.component.scss',
})
export class AddSkillComponent {

  @Input() modalForm!: FormGroup;

  @Input() modalType!: any;
  @Input() modalLabel!:any;

  private modal=inject(NzModalRef)
  closeModal() {
    this.modal.close(null);
  }

  saveModal() {
    const value = this.modalForm.value.value;
    this.modal.close(value);
  }
}
