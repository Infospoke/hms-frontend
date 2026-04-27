import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  private querySubject = new BehaviorSubject<string>('');

  query$ = this.querySubject.asObservable();

  setQuery(q: string): void {
    this.querySubject.next(q.trim().toLowerCase());
  }

  clearQuery(): void {
    this.querySubject.next('');
  }

   camelToNormal(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')          
      .replace(/^./, s => s.toUpperCase())   
      .trim();
  }
}
