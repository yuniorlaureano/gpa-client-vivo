import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { SaleComponent } from './sale/sale.component';
import { RouterModule } from '@angular/router';
import { PurchaseComponent } from './purchase/purchase.component';

@NgModule({
  declarations: [SaleComponent, PurchaseComponent],
  imports: [CommonModule, InvoiceRoutingModule],
})
export class InvoiceModule {}
