import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'gpa-admin-sidebar-menu-item',
  templateUrl: './admin-sidebar-menu-item.component.html',
  styleUrl: './admin-sidebar-menu-item.component.css',
})
export class AdminSidebarMenuItemComponent implements OnInit {
  menuIdentifier: string = uuidv4();
  @Input() selectedMenu: string = '';
  @Output() onMenuSelected = new EventEmitter<string>();

  ngOnInit(): void {}

  isMenuActive() {
    return this.menuIdentifier == this.selectedMenu;
  }

  handleMenuSelected() {
    this.onMenuSelected.emit(this.menuIdentifier);
  }
}
