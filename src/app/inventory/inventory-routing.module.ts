import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { CategoryComponent } from './category/category.component';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { ExistenceListComponent } from './existence/existence-list.component';
import { TransactionListComponent } from './transaction/transaction-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ProductListComponent } from './product-list/product-list.component';
import { StockCycleComponent } from './stock-cycle/stock-cycle.component';
import { StockCycleDetailComponent } from './stock-cycle-detail/stock-cycle-detail.component';
import { StockCycleListComponent } from './stock-cycle-list/stock-cycle-list.component';
import { StockOutputComponent } from './stock-output/stock-output.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [
      { path: 'product', component: ProductComponent },
      { path: 'product/list', component: ProductListComponent },
      { path: 'product/:id', component: ProductComponent },
      { path: 'category', component: CategoryComponent },
      {
        path: 'category/list',
        component: CategoryListComponent,
      },
      { path: 'category/:id', component: CategoryComponent },
      { path: 'existence/list', component: ExistenceListComponent },
      { path: 'transaction/list', component: TransactionListComponent },
      {
        path: 'entry',
        component: StockEntryComponent,
      },
      {
        path: 'entry/edit/:id',
        component: StockEntryComponent,
      },
      {
        path: 'stock/cycle',
        component: StockCycleComponent,
      },
      {
        path: 'stock/cycle/list',
        component: StockCycleListComponent,
      },
      {
        path: 'stock/cycle/:id/detail',
        component: StockCycleDetailComponent,
      },
      {
        path: 'output',
        component: StockOutputComponent,
      },
      {
        path: 'output/edit/:id',
        component: StockOutputComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
