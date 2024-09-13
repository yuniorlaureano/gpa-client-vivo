import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerComponent } from 'ngx-spinner';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReportRoutingModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerComponent,
  ],
})
export class ReportModule {}
