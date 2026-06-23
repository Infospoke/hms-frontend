import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-interview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-interview.component.html',
  styleUrl:'./ai-interview.component.scss'
})
export class AiInterviewComponent {
  @Input() data!: any;

  toggle(q: any): void {
    q.expanded = !q.expanded;
  }

  riskClass(risk: string): string {
    const map: Record<string, string> = { High: 'reject', Medium: 'hold', Low: 'pass' };
    return map[risk] ?? 'pass';
  }

  evalMetrics(q: any): { label: string; val: number }[] {
    if (!q.evalDetail) return [];
    return [
      { label: 'Relevance',      val: q.evalDetail.relevance },
      { label: 'Completeness',   val: q.evalDetail.completeness },
      { label: 'Accuracy',       val: q.evalDetail.accuracy },
      { label: 'Clarity',        val: q.evalDetail.clarity },
    ];
  }
}