import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SourceStat {
  label: string;
  value: number;
}

export interface SourceTile {
  name: string;
  color: string;
  stats: SourceStat[];
}

/**
 * "Candidate Source Performance" tree-map-style tile grid — one colored
 * tile per source, each listing a small stack of stats (Added / Interviewed
 * / Offered / Hired, or whatever the caller passes). Purely data-driven so
 * it's reusable for any source/channel breakdown, not just recruiting.
 */
@Component({
  selector: 'app-source-performance-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-performance-grid.component.html',
  styleUrl: './source-performance-grid.component.scss',
})
export class SourcePerformanceGridComponent {
  @Input() title: string = 'Candidate Source Performance';
  @Input() subTitle: string = '';
  @Input() tiles: SourceTile[] = [];
  @Input() footNote: string = '';
}
