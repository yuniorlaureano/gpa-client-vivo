import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { CategoryComponent } from './category/category.component';
import { ManufacturedProductEntryComponent } from './manufactured-product-entry/manufactured-product-entry.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [
      { path: 'product', component: ProductComponent },
      { path: 'category', component: CategoryComponent },
      {
        path: 'manufactured-product-entry',
        component: ManufacturedProductEntryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
