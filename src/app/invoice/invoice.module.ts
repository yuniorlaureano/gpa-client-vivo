import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { SaleComponent } from './sale/sale.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SaleComponent, PurchaseComponent],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    NgbDatepickerModule,
    FormsModule,
  ],
})
export class InvoiceModule {}
