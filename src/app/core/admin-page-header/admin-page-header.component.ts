import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'gpa-admin-page-header',
  templateUrl: './admin-page-header.component.html',
})
export class AdminPageHeaderComponent {
  constructor(private layoutService: LayoutService) {}
  getCurrentMenu() {
    return this.layoutService.getMenuHeader();
  }
}
