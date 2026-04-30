import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {

  mode: 'activate' | 'deactivate' = 'deactivate';
  loading = false;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {
    this.mode = data.mode; 
    console.log(this.mode);
  }

  onConfirm(): void {
    this.modalRef.close('confirm');
  }

  onCancel(): void {
    this.modalRef.close('cancel');
  }
}