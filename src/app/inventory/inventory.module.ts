import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { ManufacturedProductEntryComponent } from './manufactured-product-entry/manufactured-product-entry.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicSelectComponent } from '../core/dynamic-search/dynamic-search.component';
import { ProviderDynamicSearchComponent } from './provider-dynamic-search/provider-dynamic-search.component';
import { CoreModule } from '../core/core.module';
import { StockListComponent } from './stock-list/stock-list.component';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { StockListTableComponent } from './stock-list/stock-list-table.component';
import { StockMasterListComponent } from './stock-master-list/stock-master-list.component';
import { StockMasterListTableComponent } from './stock-master-list/stock-master-list-table.component';
import { CategoryListTableComponent } from './category-list/category-list-table.component';
import { CategoryListComponent } from './category-list/category-list.component';

@NgModule({
  declarations: [
    ProductComponent,
    CategoryComponent,
    ManufacturedProductEntryComponent,
    ProviderDynamicSearchComponent,
    StockListTableComponent,
    StockListComponent,
    StockMasterListComponent,
    StockMasterListTableComponent,
    CategoryListTableComponent,
    CategoryListComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicSelectComponent,
    CoreModule,
    DataTableComponent,
  ],
})
export class InventoryModule {}
