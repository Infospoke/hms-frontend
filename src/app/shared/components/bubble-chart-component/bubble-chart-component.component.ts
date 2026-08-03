import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface BubbleData {
  label: string;
  value: number;
  color: string;
  size: number;
}

@Component({
  selector: 'app-bubble-chart-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bubble-chart-component.component.html',
  styleUrl: './bubble-chart-component.component.scss'
})
export class BubbleChartComponentComponent {

  @Input() title = 'Source Performance';

  @Input() bubbles: BubbleData[] = [];

  @Input() tableData: any[] = [];

}