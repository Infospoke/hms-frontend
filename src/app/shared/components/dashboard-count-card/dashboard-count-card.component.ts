import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-count-card',
  imports: [],
  templateUrl: './dashboard-count-card.component.html',
  styleUrl: './dashboard-count-card.component.scss',
})
export class DashboardCountCardComponent {

  @Input() value: number | string = '';
  @Input() label: string = '';

  @Input() valueColor: string = '#2563eb';
  @Input() labelColor: string = '#64748b';
  @Input() borderColor: string = '#e2e8f0';


  
}
