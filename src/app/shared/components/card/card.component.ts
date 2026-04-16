import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

   @Input() label: string = '';
  @Input() count?: number | null;
  @Input() textColor: string = '';
  @Input() bgColor: string = '';
  @Input() borderColor: string = '';
}
