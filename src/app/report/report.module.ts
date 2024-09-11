import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { StockComponent } from './stock/stock.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [StockComponent],
  imports: [CommonModule, ReportRoutingModule, NgbTooltipModule],
})
export class ReportModule {}
