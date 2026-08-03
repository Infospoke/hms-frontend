import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexTooltip,
  ApexGrid,
  ApexXAxis,
  ApexYAxis,
  ApexFill,
  ApexStates
} from 'ng-apexcharts';

export interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

export interface ConversionCircle {
  fromLabel: string;
  toLabel: string;
  rate: number;  
  color: string;
}

@Component({
  selector: 'app-candidate-pipeline-graph',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './candidate-pipeline-graph.component.html',
  styleUrls: ['./candidate-pipeline-graph.component.scss']
})
export class CandidatePipelineGraphComponent implements OnInit {


  stages: FunnelStage[] = [
    { label: 'Applied',    value: 128, color: '#3B82F6' },
    { label: 'Screening',  value: 64,  color: '#14B8A6' },
    { label: 'Interview',  value: 21,  color: '#8B5CF6' },
    { label: 'Offer',      value: 5,   color: '#F97316' },
    { label: 'Hired',      value: 2,   color: '#22C55E' }
  ];

  conversions: ConversionCircle[] = [];
  overallConversionRate = 0;

  funnelSeries: ApexAxisChartSeries = [];
  funnelChart: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    animations: {
      enabled: true,
      speed: 600
    }
  };
  funnelPlotOptions: ApexPlotOptions = {
    bar: {
      borderRadius: 0,
      horizontal: true,
      barHeight: '90%',
      isFunnel: true
    }
  };
  funnelDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number, opts: any) => {
      const stage = this.stages[opts.dataPointIndex];
      return `${stage.label}\n${stage.value}`;
    },
    dropShadow: { enabled: false },
    style: {
      colors: ['#fff'],
      fontSize: '14px',
      fontWeight: 600
    }
  };
  funnelStroke: ApexStroke = { show: true, width: 2, colors: ['#1E1E2D'] };
  funnelFill: ApexFill = { type: 'solid' };
  funnelTooltip: ApexTooltip = {
    theme: 'dark',
    y: { formatter: (val: number) => `${val} candidates` }
  };
  funnelXAxis: ApexXAxis = {
    categories: [],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false }
  };
  funnelYAxis: ApexYAxis = {
    labels: { show: false }
  };
  funnelGrid: ApexGrid = {
    show: false,
    padding: { left: 0, right: 0, top: 0, bottom: 0 }
  };
  funnelStates: ApexStates = {
    hover: { filter: { type: 'lighten' } }
  };
  funnelColors: string[] = [];

  ngOnInit(): void {
    this.buildFunnelChart();
    this.buildConversions();
    this.buildOverallRate();
  }

  private buildFunnelChart(): void {
    this.funnelColors = this.stages.map(s => s.color);
    this.funnelXAxis = { ...this.funnelXAxis, categories: this.stages.map(s => s.label) };
    this.funnelSeries = [
      {
        name: 'Candidates',
        data: this.stages.map(s => s.value)
      }
    ];
  }

  private buildConversions(): void {
    this.conversions = [];
    for (let i = 1; i < this.stages.length; i++) {
      const prev = this.stages[i - 1];
      const curr = this.stages[i];
      const rate = prev.value > 0 ? Math.round((curr.value / prev.value) * 100) : 0;
      this.conversions.push({
        fromLabel: prev.label,
        toLabel: curr.label,
        rate,
        color: curr.color
      });
    }
  }

  private buildOverallRate(): void {
    const first = this.stages[0]?.value ?? 0;
    const last = this.stages[this.stages.length - 1]?.value ?? 0;
    this.overallConversionRate = first > 0 ? Math.round((last / first) * 1000) / 10 : 0;
  }

  // ---- Per-circle radialBar config (called from template, one instance per conversion) ----
  radialSeries(rate: number): ApexNonAxisChartSeries {
    return [rate];
  }

  radialChart(): ApexChart {
    return {
      type: 'radialBar',
      height: 90,
      width: 90,
      sparkline: { enabled: true }
    };
  }

  radialPlotOptions(color: string): ApexPlotOptions {
    return {
      radialBar: {
        hollow: { size: '58%' },
        track: {
          background: '#2A2A3C',
          strokeWidth: '100%'
        },
        dataLabels: {
          show: true,
          name: { show: false },
          value: {
            show: true,
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            offsetY: 5,
            formatter: (val: number) => `${val}%`
          }
        }
      }
    };
  }

  radialFill(color: string): ApexFill {
    return {
      type: 'solid',
      colors: [color]
    };
  }

  radialStroke(): ApexStroke {
    return { lineCap: 'round' };
  }
}