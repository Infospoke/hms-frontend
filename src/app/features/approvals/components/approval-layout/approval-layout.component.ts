import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { CommonModule } from '@angular/common';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonFilterComponent } from "../../../../shared/components/common-filter/common-filter.component";
import { filterDropdowns } from '../../../../shared/constants/reusbale-filter';
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
  @Input() buttonType:any;

  @Input() showBtn:boolean=false;
  @Input() searchPlaceholder:any
  @Input() dropDownData: any[] = [];
  @Output() handle=new EventEmitter<any>();

  @Output() filterChange = new EventEmitter<any>();
  handleNavigate(){
    this.handle.emit();
  }



   onFilterChange(event: any): void {
    const payload: any = {
      chainName: event.search || undefined,
      status: event.filters['status'] || undefined,
      approval: event.filters['approval'] || undefined,
      dateFilter: event.filters['dateFilter'] || undefined,
    };


    if (event.fromDate) payload.fromDate = event.fromDate;
    if (event.toDate) payload.toDate = event.toDate;

    this.filterChange.emit(payload);
    console.log('[filter payload]', payload);

  }
}
