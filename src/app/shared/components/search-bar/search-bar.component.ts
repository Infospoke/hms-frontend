import { Component, inject } from '@angular/core';
import { UtilService } from '../../util.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule,CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {

  query = '';
  private searchService = inject(UtilService);

  onSearch(): void {
    this.searchService.setQuery(this.query);
  }

  clearSearch(): void {
    this.query = '';
    this.searchService.clearQuery();
  }
}
