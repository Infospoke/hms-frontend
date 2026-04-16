import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-heading',
  imports: [CommonModule],
  templateUrl: './heading.component.html',
  styleUrl: './heading.component.scss',
})
export class HeadingComponent implements OnInit {

  @Input() heading!:any;
  @Input() subHeading!:any;

  @Input() headingFontSize!:any;
  @Input() subHeadingFontSize!:any;

  @Input() headingColor!:any;
  @Input() subHeadingColor!:any;
  @Input() isCenter = false;
  constructor(){}
  ngOnInit(): void {
    
  }
}
