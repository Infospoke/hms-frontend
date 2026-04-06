import { Directive, output, ElementRef, inject } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutsideDirective {
  appClickOutside = output();
  private el = inject(ElementRef);

  constructor() {
    fromEvent<MouseEvent>(document, 'click').pipe(
      filter(e => !this.el.nativeElement.contains(e.target)),
      takeUntilDestroyed()
    ).subscribe(() => this.appClickOutside.emit());
  }
}