import { Directive, output, inject, ElementRef } from '@angular/core';
import { fromEvent, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({ selector: '[appDebounceClick]', standalone: true })
export class DebounceClickDirective {
  appDebounceClick = output();
  private el = inject(ElementRef);

  constructor() {
    fromEvent(this.el.nativeElement, 'click').pipe(
      throttleTime(800),
      takeUntilDestroyed()
    ).subscribe(() => this.appDebounceClick.emit());
  }
}