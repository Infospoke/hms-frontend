import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  private router = inject(Router);

  activeMenus: Set<string> = new Set(['demand']);
  activePath: string = '';

  toggle(menu: string) {
    if (this.activeMenus.has(menu)) {
      this.activeMenus.delete(menu);
    } else {
      this.activeMenus.add(menu);
    }
  }

  isOpen(menu: string): boolean {
    return this.activeMenus.has(menu);
  }

  handlenavigate(path: string) {
    this.activePath = path;
    this.router.navigateByUrl(path);
  }

  isActive(path: string): boolean {
    return this.activePath === path;
  }
}