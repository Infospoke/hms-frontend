
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionCell } from '../../constants/permissions.modal';
interface IconDef {
  key: keyof PermissionCell;
  tooltip: string;
  faClass: string;
}
@Component({
  selector: 'app-permission-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission-cell.component.html',
  styleUrls: ['./permission-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PermissionCellComponent {

 @Input() cell: PermissionCell = { create: false, view: false, edit: false, delete: false };
 
  @Input() editable = false;
 
  @Output() cellChange = new EventEmitter<PermissionCell>();
 
  readonly icons: IconDef[] = [
  { key: 'create', tooltip: 'Create', faClass: 'fa-regular fa-square-plus' },
  { key: 'view',   tooltip: 'View',   faClass: 'fa-regular fa-eye'         },
  { key: 'edit',   tooltip: 'Edit',   faClass: 'fa-regular fa-pen-to-square' },
  { key: 'delete', tooltip: 'Delete', faClass: 'fa-regular fa-trash-can'   },
];
  toggle(flag: keyof PermissionCell): void {
    if (!this.editable) return;
    this.cellChange.emit({ ...this.cell, [flag]: !this.cell[flag] });
  }
}