import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { ReportGroupComponent } from './report-group/report-group.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [{ path: 'report-group', component: ReportGroupComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
