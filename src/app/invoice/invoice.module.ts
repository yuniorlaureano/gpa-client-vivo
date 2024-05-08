import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { SaleComponent } from './sale/sale.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { SaleListComponent } from './sale-list/sale-list.component';
import { SaleListTableComponent } from './sale-list/sale-list-table.component';
import { DataTableComponent } from '../core/datatable/data-table.component';

@NgModule({
  declarations: [
    SaleComponent,
    PurchaseComponent,
    SaleListComponent,
    SaleListTableComponent,
  ],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    NgbDatepickerModule,
    FormsModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
  ],
})
export class InvoiceModule {}
