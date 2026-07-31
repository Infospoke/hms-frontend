import { Component, Input } from '@angular/core';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  imports: [HeadingComponent, DashboardCountCardComponent,CommonModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {

  @Input() heading:any;
  @Input() subHeading:any;

  @Input() cards:any[]=[];

  @Input() table:boolean=false;
  
  @Input() pieChart:boolean=false;

  @Input() pipeLine:boolean=false
}
