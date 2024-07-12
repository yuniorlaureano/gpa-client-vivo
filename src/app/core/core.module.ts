import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminTemplateComponent } from './admin-template/admin-template.component';
import { RouterModule } from '@angular/router';
import { AdminPageHeaderComponent } from './admin-page-header/admin-page-header.component';
import { AdminPageFooterComponent } from './admin-page-footer/admin-page-footer.component';
import { AdminPageTogglerComponent } from './admin-page-header/admin-page-toggler.component';
import { LayoutService } from './service/layout.service';
import { AdminSidebarMenuItemComponent } from './admin-sidebar-menu-item/admin-sidebar-menu-item.component';
import { ClientCatalogComponent } from './client-catalog/client-catalog.component';
import { StockProductCatalogComponent } from './stock-product-catalog/stock-product-catalog.component';
import { ProductCatalogComponent } from './product-catalog/product-catalog.component';
import { InvoiceCatalogComponent } from './invoice-catalog/invoice-catalog.component';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './service/toast.service';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { ConfirmModalService } from './service/confirm-modal.service';
import { ValidatorMessageComponent } from './validator-message/validator-message.component';
import { ModalService } from './service/modal.service';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminSidebarComponent,
    AdminTemplateComponent,
    AdminPageHeaderComponent,
    AdminPageFooterComponent,
    AdminPageTogglerComponent,
    AdminSidebarMenuItemComponent,
    ClientCatalogComponent,
    StockProductCatalogComponent,
    ProductCatalogComponent,
    InvoiceCatalogComponent,
    ToastContainerComponent,
    ConfirmModalComponent,
    ModalComponent,
    ValidatorMessageComponent,
  ],
  imports: [CommonModule, RouterModule, NgbToastModule, NgTemplateOutlet],
  providers: [
    LayoutService,
    DecimalPipe,
    ToastService,
    ConfirmModalService,
    ModalService,
  ],
  exports: [
    ClientCatalogComponent,
    StockProductCatalogComponent,
    ProductCatalogComponent,
    InvoiceCatalogComponent,
    ConfirmModalComponent,
    ValidatorMessageComponent,
  ],
})
export class CoreModule {}
