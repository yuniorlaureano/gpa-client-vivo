import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminTemplateComponent } from './admin-template/admin-template.component';
import { RouterModule } from '@angular/router';
import { AdminPageHeaderComponent } from './admin-page-header/admin-page-header.component';
import { AdminPageFooterComponent } from './admin-page-footer/admin-page-footer.component';
import { AdminPageTogglerComponent } from './admin-page-header/admin-page-toggler.component';
import { LayoutService } from './services/layout.service';
import { AdminSidebarMenuItemComponent } from './admin-sidebar-menu-item/admin-sidebar-menu-item.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminSidebarComponent,
    AdminTemplateComponent,
    AdminPageHeaderComponent,
    AdminPageFooterComponent,
    AdminPageTogglerComponent,
    AdminSidebarMenuItemComponent,
  ],
  imports: [CommonModule, RouterModule],
  providers: [LayoutService],
})
export class CoreModule {}
