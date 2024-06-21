import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './category/category.component';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicSelectComponent } from '../core/dynamic-search/dynamic-search.component';
import { ProviderDynamicSearchComponent } from './provider-dynamic-search/provider-dynamic-search.component';
import { CoreModule } from '../core/core.module';
import { ExistenceListComponent } from './existence/existence-list.component';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { ExistenceListTableComponent } from './existence/existence-list-table.component';
import { TransactionListComponent } from './transaction/transaction-list.component';
import { TransactionListTableComponent } from './transaction/transaction-list-table.component';
import { CategoryListTableComponent } from './category-list/category-list-table.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductListTableComponent } from './product-list/product-list-table.component';
import { DropzoneComponent } from './product/dropzone/dropzone.component';
import { StockCycleComponent } from './stock-cycle/stock-cycle.component';
import { StockCycleDetailComponent } from './stock-cycle-detail/stock-cycle-detail.component';
import { StockCycleListComponent } from './stock-cycle-list/stock-cycle-list.component';
import { StockCycleListTableComponent } from './stock-cycle-list/stock-cycle-list-table.component';
import { StockOutputComponent } from './stock-output/stock-output.component';
import { AddonComponent } from './addon/addon.component';
import { AddonListComponent } from './addon-list/addon-list.component';
import { AddonListTableComponent } from './addon-list/addon-list-table.component';

@NgModule({
  declarations: [
    ProductComponent,
    CategoryComponent,
    StockEntryComponent,
    ProviderDynamicSearchComponent,
    ExistenceListTableComponent,
    ExistenceListComponent,
    TransactionListComponent,
    TransactionListTableComponent,
    CategoryListTableComponent,
    CategoryListComponent,
    ProductListComponent,
    ProductListTableComponent,
    DropzoneComponent,
    StockCycleComponent,
    StockCycleDetailComponent,
    StockCycleListComponent,
    StockCycleListTableComponent,
    StockOutputComponent,
    AddonComponent,
    AddonListComponent,
    AddonListTableComponent,
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
