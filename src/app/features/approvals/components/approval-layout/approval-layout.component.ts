import { Component, Input } from '@angular/core';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { CommonModule } from '@angular/common';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonFilterComponent } from "../../../../shared/components/common-filter/common-filter.component";
@Component({
  selector: 'app-approval-layout',
  imports: [HeadingComponent, CommonModule, DashboardCountCardComponent, CommonFilterComponent],
  templateUrl: './approval-layout.component.html',
  styleUrl: './approval-layout.component.scss',
})
export class ApprovalLayoutComponent {

  @Input() heading:any;
  @Input() showInfo:any;
  @Input() subHeading:any;
  @Input() infoTooltip:any;
  @Input() cards:any[]=[];

  @Input() dropDownData:any;

  @Input() searchPlaceholder:any
}
