import { Component, input, output, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-side-bar',
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  activeMenu: string = 'demand';
  private router=inject(Router);
  toggle(menu: string) {
    this.activeMenu = this.activeMenu === menu ? '' : menu;
  }

  handlenavigate(path:string){
    console.log(path);
    this.router.navigateByUrl(path);
  } 
}