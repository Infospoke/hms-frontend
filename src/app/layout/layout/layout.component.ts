import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
// import { BreadcrumbComponent } from '../../shared/components/bread-crum/bread-crum.component';
import { LoaderService } from '../../core/services/loader.service';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { SideBarComponent } from '../../shared/components/side-bar/side-bar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SideBarComponent, HeaderComponent, NzSpinComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
 loaderService = inject(LoaderService);
  sidebarCollapsed = signal(false);

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }
}
