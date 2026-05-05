import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  signal,
  effect,
} from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[appCan]',
  standalone: true,
})
export class CanDirective {
  private ps  = inject(PermissionService);
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private _key = signal('');
  private _hasView = false;

  @Input()
  set appCan(value: string) {
    this._key.set(value ?? '');
  }

  constructor() {
    effect(() => {
      const key   = this._key();
      const parts = key.split(':');

      let allowed = false;

      if (parts.length >= 3) {
        allowed = this.ps.can(parts[0], parts[1], parts[2]);
      } else if (parts.length === 2) {
        allowed = this.ps.canModule(parts[0], parts[1]);
      }

      if (allowed && !this._hasView) {
        this.vcr.createEmbeddedView(this.tpl);
        this._hasView = true;
      } else if (!allowed && this._hasView) {
        this.vcr.clear();
        this._hasView = false;
      }
    });
  }
}
