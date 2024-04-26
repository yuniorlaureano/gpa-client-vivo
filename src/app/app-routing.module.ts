import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { AdminTemplateComponent } from './core/admin-template/admin-template.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [{ path: '', component: DashboardComponent }],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./security/security.module').then((m) => m.SecurityModule),
  },
  {
    path: 'inventory',
    loadChildren: () =>
      import('./inventory/inventory.module').then((m) => m.InventoryModule),
  },
  {
    path: 'invoice',
    loadChildren: () =>
      import('./invoice/invoice.module').then((m) => m.InvoiceModule),
  },
  {
    path: 'report',
    loadChildren: () =>
      import('./report/report.module').then((m) => m.ReportModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
