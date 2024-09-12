import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { ExistenceReportComponent } from './existence-report/existence-report.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [{ path: 'existence', component: ExistenceReportComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
