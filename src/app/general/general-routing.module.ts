import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTemplateComponent } from '../core/admin-template/admin-template.component';
import { EmailProviderComponent } from './email-provider/email-provider.component';
import { EmailProviderListComponent } from './email-provider-list/email-provider-list.component';
import { BlobProviderComponent } from './blob-provider/blob-provider.component';
import { BlobProviderListComponent } from './blob-provider-list/blob-provider-list.component';
import { IntegrationsComponent } from './integrations/integrations.component';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralRoutingModule {}
