import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { EmailProviderComponent } from './email-provider/email-provider.component';
import { EmailProviderListComponent } from './email-provider-list/email-provider-list.component';
import { BlobProviderComponent } from './blob-provider/blob-provider.component';
import { BlobProviderListComponent } from './blob-provider-list/blob-provider-list.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { PrintInformationComponent } from './print-information/print-information.component';
import { PrintInformationListComponent } from './print-information-list/print-information-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminTemplateComponent,
    children: [
      { path: 'integrations', component: IntegrationsComponent },

      {
        path: 'emails/integrations/:provider',
        component: EmailProviderComponent,
      },
      { path: 'emails/list', component: EmailProviderListComponent },
      {
        path: 'emails/integrations/:provider/edit/:id',
        component: EmailProviderComponent,
      },

      {
        path: 'blobs/integrations/:provider',
        component: BlobProviderComponent,
      },
      { path: 'blobs/list', component: BlobProviderListComponent },
      {
        path: 'blobs/integrations/:provider/edit/:id',
        component: BlobProviderComponent,
      },
      {
        path: 'print-information',
        component: PrintInformationComponent,
      },
      {
        path: 'print-information/edit/:id',
        component: PrintInformationComponent,
      },
      {
        path: 'print-information/list',
        component: PrintInformationListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralRoutingModule {}
