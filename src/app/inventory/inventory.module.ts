import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { ManufacturedProductEntryComponent } from './manufactured-product-entry/manufactured-product-entry.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ProductComponent,
    CategoryComponent,
    ManufacturedProductEntryComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    NgbDatepickerModule,
    FormsModule,
  ],
})
export class InventoryModule {}
