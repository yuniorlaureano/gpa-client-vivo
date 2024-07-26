import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { EmailProviderComponent } from './email-provider/email-provider.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [{ path: 'emails', component: EmailProviderComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralRoutingModule {}
