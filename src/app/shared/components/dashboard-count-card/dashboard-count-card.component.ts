import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-count-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-count-card.component.html',
  styleUrl: './dashboard-count-card.component.scss',
})
export class DashboardCountCardComponent {

  @Input() value: any = '';
  @Input() label: any = '';
  @Input() valueColor: any = '#111827';
  @Input() labelColor: any = '#6b7280';
  @Input() borderColor: any = '';

  @Input() iconClass: any = '';
  @Input() iconColor: any = '#6366f1';
  @Input() iconBgColor: any = '#eef2ff';

  @Input() bottomText!: string;
  @Input() bottomTextColor: string = '#94a3b8';
  @Output() cardClick = new EventEmitter<void>();
}