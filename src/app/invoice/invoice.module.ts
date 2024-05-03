import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { SaleComponent } from './sale/sale.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { NgbDatepicker, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientCatalogComponent } from '../core/client-catalog/client-catalog.component';
import { StockProductCatalogComponent } from '../core/stock-product-catalog/stock-product-catalog.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [SaleComponent, PurchaseComponent],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    NgbDatepickerModule,
    FormsModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class InvoiceModule {}
