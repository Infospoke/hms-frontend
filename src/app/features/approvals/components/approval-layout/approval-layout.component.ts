import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { CommonModule } from '@angular/common';
import { DashboardCountCardComponent } from "../../../../shared/components/dashboard-count-card/dashboard-count-card.component";
import { CommonFilterComponent } from "../../../../shared/components/common-filter/common-filter.component";
import { CanDirective } from "../../../../shared/directives/can.directive";
import { filter } from 'rxjs';

@Component({
  selector: 'app-approval-layout',
  imports: [HeadingComponent, CommonModule, DashboardCountCardComponent, CommonFilterComponent, CanDirective],
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

  @Input() showBtn:any='';
  @Input() searchPlaceholder:any
  @Input() dropDownData: any[] = [];
  @Input() tabs: { key: string; label: string; count: number }[] = [];
  @Input() activeTab: string = '';
  @Input() showBackButton: boolean = false;
  @Input() buttonText:any=null;
  @Output() handle=new EventEmitter<any>();
  @Output() tabChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Input() buttonUrl:string='';
  @Input() disableCreateButton:boolean=false;
  handleNavigate(){
    this.handle.emit();
  }



   onFilterChange(event: any): void {
    console.log(event);
    const payload: any = {
      chainName: event.search || undefined,
      status: event.filters['status'] || undefined,
      approval: event.filters['approval'] || undefined,
      dateFilter: event.filters['dateFilter'] || undefined,
      department:event?.filters['department'] || undefined,
      priority:event?.filters['priority'] || undefined,
      // NOTE: some dropDownData configs (e.g. candidateManagement in
      // reusbale-filter.ts) key their department/stage filters as
      // 'departments'/'currentStage' rather than 'department' above —
      // passed through additively here so those pages' filters actually
      // reach their [filterChange] listener without touching the existing
      // 'department' key other pages already depend on.
      departments:event?.filters['departments'] || undefined,
      currentStage:event?.filters['currentStage'] || undefined,
      requestedBy:event?.filters['requestedBy'] || undefined,
      createdBy:event?.filters['createdby'] || undefined,
      plan:event?.filters['plan'] || undefined,
      allJobs:event?.filters['allJobs'] || undefined,
      questionStatus:event?.filters['allQuestion']||undefined
    };


    if (event.fromDate) payload.fromDate = event.fromDate;
    if (event.toDate) payload.toDate = event.toDate;

    this.filterChange.emit(payload);
    console.log('[filter payload]', payload);

  }

  tabChangeEvent($event: any) {
    // $event?.stopPropagation();
    console.log('Selected tab:', $event);
    this.activeTab = $event;
    this.tabChange.emit($event);
  }
}
