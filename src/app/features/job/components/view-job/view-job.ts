import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-job',
  imports: [CommonModule],
  templateUrl: './view-job.html',
  styleUrl: './view-job.scss',
})
export class ViewJob implements OnInit{

  @Input() job!:any;


  ngOnInit(): void {
    
  }

}
