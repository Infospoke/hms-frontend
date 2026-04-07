import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobs-card.component.html',
  styleUrl: './jobs-card.component.scss'
})
export class JobsCardComponent implements OnChanges{
 
  
   selectedCard:any;

  @Input() job!:any;
  @Input() isActive!:any;
  @Input() width:any;
  @Input() showJobDetails:boolean=false;
  @Input() isSimpleView:boolean=false;
  @Output() selectedJob=new EventEmitter<any>();

  constructor(){}
  ngOnChanges(changes: SimpleChanges): void {
     
  }
  handleSelectedCard(id:any){
    this.selectedJob.emit(id);
  }
}
