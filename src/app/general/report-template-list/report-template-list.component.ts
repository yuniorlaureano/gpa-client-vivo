import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportTemplateModel } from '../model/report-template.model';

@Component({
  selector: 'gpa-reporte-template-list',
  templateUrl: './report-template-list.component.html',
})
export class ReporteTemplateListComponent implements OnDestroy {
  reloadTable: number = 1;
  constructor(private router: Router) {}

  subscriptions$: Subscription[] = [];

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleEdit(model: ReportTemplateModel) {
    this.router.navigate(['/general/report-template/' + model.id]);
  }
}
