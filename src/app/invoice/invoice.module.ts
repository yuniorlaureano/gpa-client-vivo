import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { SaleComponent } from './sale/sale.component';

@NgModule({
  declarations: [SaleComponent],
  imports: [CommonModule, InvoiceRoutingModule],
})
export class InvoiceModule {}
