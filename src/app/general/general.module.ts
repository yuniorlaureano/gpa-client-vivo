import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicSelectComponent } from '../core/dynamic-search/dynamic-search.component';
import { CoreModule } from '../core/core.module';
import { EmailProviderComponent } from './email-provider/email-provider.component';

@NgModule({
  declarations: [EmailProviderComponent],
  imports: [
    CoreModule,
    CommonModule,
    GeneralRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    NgbDatepickerModule,
    DynamicSelectComponent,
  ],
})
export class GeneralModule {}
