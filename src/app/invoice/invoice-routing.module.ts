import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaleComponent } from './sale/sale.component';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { SaleListComponent } from './sale-list/sale-list.component';
import { ReceivableAccountComponent } from './receivable-account/receivable-account.component';
import { ReceivableAccountListComponent } from './receivable-account-list/receivable-account-list.component';
import { ClientComponent } from './client/client.component';
import { ClientListComponent } from './client-list/client-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [
      { path: 'sale', component: SaleComponent },
      { path: 'sale/edit/:id', component: SaleComponent },
      { path: 'sale/list', component: SaleListComponent },
      {
        path: 'receivable-account-list',
        component: ReceivableAccountListComponent,
      },
      {
        path: 'receivable-account/invoice/:id',
        component: ReceivableAccountComponent,
      },
      {
        path: 'client',
        component: ClientComponent,
      },
      {
        path: 'client/edit/:id',
        component: ClientComponent,
      },
      {
        path: 'client/list',
        component: ClientListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
