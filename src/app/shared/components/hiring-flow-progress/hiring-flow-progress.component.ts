import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
} from 'ng-apexcharts';

export interface FlowStage {
  icon: string;
  iconBg: string;
  color: string;
  label: string;
  percent: number;
  fraction: string;
  subLabel?: string;
}

/**
 * "Process flow + stacked progress" panel — a row of stage icons connected
 * by arrows, each with a radialBar completion ring underneath, plus an
 * overall compliance footer. Fully data-driven via `stages` so it's
 * reusable for any multi-step SLA/flow visualization, not just recruiting.
 */
@Component({
  selector: 'app-hiring-flow-progress',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './hiring-flow-progress.component.html',
  styleUrl: './hiring-flow-progress.component.scss',
})
export class HiringFlowProgressComponent implements OnChanges {
  @Input() title: string = 'SLA Compliance by Hiring Flow';
  @Input() subTitle: string = '';
  @Input() stages: FlowStage[] = [];

  @Input() overallLabel: string = 'Overall SLA Compliance';
  @Input() overallValue: string = '';
  @Input() overallColor: string = '#1E9E5A';

  ngOnChanges(changes: SimpleChanges): void {}

  radialSeries(percent: number): ApexNonAxisChartSeries {
    return [percent];
  }

  radialChart(): ApexChart {
    return {
      type: 'radialBar',
      height: 92,
      width: 92,
      sparkline: { enabled: true },
    };
  }

  radialPlotOptions(): ApexPlotOptions {
    return {
      radialBar: {
        hollow: { size: '62%' },
        track: { background: '#EEF1F6', strokeWidth: '100%' },
        dataLabels: {
          show: true,
          name: { show: false },
          value: {
            show: true,
            fontSize: '15px',
            fontWeight: 700,
            color: '#1F2937',
            offsetY: 5,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    };
  }

  radialFill(color: string): ApexFill {
    return { type: 'solid', colors: [color] };
  }

  radialStroke(): ApexStroke {
    return { lineCap: 'round' };
  }
}
