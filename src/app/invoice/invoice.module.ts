import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { SaleComponent } from './sale/sale.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { SaleListComponent } from './sale-list/sale-list.component';
import { SaleListTableComponent } from './sale-list/sale-list-table.component';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { ReceivableAccountComponent } from './receivable-account/receivable-account.component';
import { ReceivableAccountListComponent } from './receivable-account-list/receivable-account-list.component';
import { ReceivableAccountListTableComponent } from './receivable-account-list/receivable-account-list-table.component';
import { ClientComponent } from './client/client.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientListTableComponent } from './client-list/client-list-table.component';

@NgModule({
  declarations: [
    SaleComponent,
    SaleListComponent,
    SaleListTableComponent,
    ReceivableAccountComponent,
    ReceivableAccountListComponent,
    ReceivableAccountListTableComponent,
    ClientComponent,
    ClientListComponent,
    ClientListTableComponent,
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
