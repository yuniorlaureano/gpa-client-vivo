import { Component, EventEmitter, Output } from '@angular/core';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'gpa-admin-page-toggler',
  templateUrl: './admin-page-toggler.component.html',
  styleUrl: './admin-page-toggler.component.css',
})
export class AdminPageTogglerComponent {
  constructor(private layoutService: LayoutService) {}
  toggle() {
    this.layoutService.handleToggle();
  }
}
