import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import {
  NgbDatepickerModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ReportGroupComponent } from './report-group/report-group.component';
import { SaleReportComponent } from './report-group/sale-report/sale-report.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [ReportGroupComponent, SaleReportComponent],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    ReportRoutingModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerComponent,
    CoreModule,
  ],
})
export class ReportModule {}
