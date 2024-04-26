import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'gpa-admin-sidebar-menu-item',
  templateUrl: './admin-sidebar-menu-item.component.html',
  styleUrl: './admin-sidebar-menu-item.component.css',
})
export class AdminSidebarMenuItemComponent {
  @Input() menu: string = '';
  @Output() onMenuSelected = new EventEmitter<string>();

  constructor(private layoutService: LayoutService) {}

  isMenuActive() {
    return this.menu == this.layoutService.selectedMenu;
  }

  handleMenuSelected() {
    if (this.menu == this.layoutService.selectedMenu) {
      this.layoutService.setSelectedMenu('');
    } else {
      this.layoutService.setSelectedMenu(this.menu);
    }
  }
}
