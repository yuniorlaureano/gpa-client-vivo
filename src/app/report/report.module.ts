import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { StockComponent } from './stock/stock.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ExistenceReportComponent } from './existence-report/existence-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [StockComponent, ExistenceReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ReportModule {}
