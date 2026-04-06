import { Component, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (breadcrumbs().length) {
      <nav class="breadcrumb">
        @for (crumb of breadcrumbs(); track crumb.url; let last = $last) {
          @if (!last) {
            <a [routerLink]="crumb.url">{{ crumb.label }}</a>
            <span class="separator">/</span>
          } @else {
            <span class="current">{{ crumb.label }}</span>
          }
        }
      </nav>
    }
  `,
  styles: [`
    .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; }
    a { color: #6b7280; text-decoration: none; &:hover { color: #1a73e8; } }
    .separator { color: #d1d5db; }
    .current { color: #1f2937; font-weight: 500; }
  `]
})
export class BreadcrumbComponent {
  private router = inject(Router);

  breadcrumbs = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        const segments = this.router.url.split('/').filter(s => s);
        return segments.map((seg, i) => ({
          label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
          url: '/' + segments.slice(0, i + 1).join('/')
        }));
      })
    ),
    { initialValue: [] }
  );
}