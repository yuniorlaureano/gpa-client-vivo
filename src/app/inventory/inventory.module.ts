import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { ManufacturedProductEntryComponent } from './manufactured-product-entry/manufactured-product-entry.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StockProductCatalogComponent } from '../core/stock-product-catalog/stock-product-catalog.component';
import { DynamicSelectComponent } from '../core/dynamic-search/dynamic-search.component';
import { ProviderDynamicSearchComponent } from './provider-dynamic-search/provider-dynamic-search.component';

@NgModule({
  declarations: [
    ProductComponent,
    CategoryComponent,
    ManufacturedProductEntryComponent,
    StockProductCatalogComponent,
    ProviderDynamicSearchComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicSelectComponent,
  ],
})
export class InventoryModule {}
