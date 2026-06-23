import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluation-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-summary.component.html',
  styleUrl:'/evaluation-summary.component.scss'
})
export class EvaluationSummaryComponent {
  @Input() data!: any;

  toggle(row: any): void {
    row.expanded = !row.expanded;
  }

  pillClass(rec: string): string {
    const map: Record<string, string> = {
      'Pass': 'pass',
      'Strong Hire': 'strong-hire',
      'Hold': 'hold',
      'Reject': 'reject',
    };
    return map[rec] ?? 'pass';
  }

  getRatingNum(score: string): number {
    // score format: "4.5/5" or "4/5"
    return Math.round(parseFloat(score));
  }
}