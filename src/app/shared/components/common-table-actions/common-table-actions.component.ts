import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CanDirective } from '../../directives/can.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-table-actions',
  standalone:true,
  imports: [CanDirective,CommonModule],
  templateUrl: './common-table-actions.component.html',
  styleUrl: './common-table-actions.component.scss',
})
export class CommonTableActionsComponent {

  @Input() viewPermission = '';
  @Input() editPermission = '';
  @Input() isCreate:boolean=false;

  @Input() editDisabled = false;
  @Input() disableView=false;
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
}
