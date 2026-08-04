import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SparklineComponent } from '../sparkline/sparkline.component';

@Component({
  selector: 'app-dashboard-count-card',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
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

  /** Small up/down arrow rendered before bottomText, e.g. "▲ 1 this week". */
  @Input() trend?: 'up' | 'down';
  @Input() trendColor: string = '#16A34A';

  /** Optional trend squiggle rendered along the bottom of the card — leave
   * unset and nothing changes for existing pages using this card. */
  @Input() sparklineData?: number[];
  @Input() sparklineColor: string = '#93C5FD';

  @Output() cardClick = new EventEmitter<void>();
}