import { Component } from '@angular/core';
import { ReportType } from '../../core/models/reports-type.enum';

@Component({
  selector: 'gpa-report-group',
  templateUrl: './report-group.component.html',
  styleUrl: './report-group.component.css',
})
export class ReportGroupComponent {
  reports: ReportType[] = [ReportType.Sale];
  reportType = ReportType;
  selectedReport: ReportType | null = null;

  handleSelectReportType(e: any) {
    this.selectedReport = e.target.value as ReportType;
  }
}
