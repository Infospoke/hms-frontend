import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private activeRequests = signal(0);
  isLoading = computed(() => this.activeRequests() > 0);

  show(){ 
    this.activeRequests.update(v => v + 1); 
  }

  hide(){
     this.activeRequests.update(v => Math.max(0, v - 1)); 
    }
}
