import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NzProgressModule } from 'ng-zorro-antd/progress';
@Component({
  selector: 'app-pipe-line-cards',
  standalone: true,
  imports: [NzProgressModule,CommonModule],
  templateUrl: './pipe-line-cards.component.html',
  styleUrl: './pipe-line-cards.component.scss'
})
export class PipeLineCardsComponent implements OnInit {

  @Input() stage!:any;
  constructor(){}
  ngOnInit(): void {

  }
  handleProgessBar(count: any, total: any) {
    return (count / total) * 100;
  }
}
