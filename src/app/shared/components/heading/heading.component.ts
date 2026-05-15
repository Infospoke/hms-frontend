import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-heading',
  imports: [CommonModule],
  templateUrl: './heading.component.html',
  styleUrl: './heading.component.scss',
})
export class HeadingComponent implements OnInit {

  @Input() heading!: any;
  @Input() subHeading!: any;

  @Input() headingFontSize!: any;
  @Input() subHeadingFontSize!: any;

  @Input() headingColor!: any;
  @Input() subHeadingColor!: any;
  @Input() isCenter = false;
  @Input() showInfo: boolean = false; // for the ⓘ icon
  @Input() infoTooltip: string = '';

  @Input() showBackButton: boolean = false;
  @Input() backButtonUrl:string='';

  @Input() buttonText:string='Back';
  
  private router=inject(Router);
  constructor() { }
  ngOnInit(): void {

  }


  goBack(){
    this.router.navigateByUrl(this.backButtonUrl);
  }
}
