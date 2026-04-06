import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-heading-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heading-container.component.html',
  styleUrl: './heading-container.component.scss'
})
export class HeadingContainerComponent implements OnInit, OnChanges{

  @Input() heading:any=null;
  
  @Input() fontSize!:any;
  @Input() subHeading:any=null;

  @Input() subHeadingFontSize!:any;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }
}
