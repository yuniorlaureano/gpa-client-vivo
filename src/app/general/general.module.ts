import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableComponent } from '../core/datatable/data-table.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicSelectComponent } from '../core/dynamic-search/dynamic-search.component';
import { CoreModule } from '../core/core.module';
import { EmailProviderComponent } from './email-provider/email-provider.component';
import { SmtpComponent } from './email-provider/providers/smtp.component';
import { EmailProviderListTableComponent } from './email-provider-list/email-provider-list-table.component';
import { EmailProviderListComponent } from './email-provider-list/email-provider-list.component';
import { SendgridComponent } from './email-provider/providers/sendgrid.component';
import { AwsBlobComponent } from './blob-provider/providers/aws-blob.component';
import { BlobProviderComponent } from './blob-provider/blob-provider.component';
import { BlobProviderListComponent } from './blob-provider-list/blob-provider-list.component';
import { BlobProviderListTableComponent } from './blob-provider-list/blob-provider-list-table.component';
import { GcpBlobComponent } from './blob-provider/providers/gcp-blob.component';
import { AzureBlobComponent } from './blob-provider/providers/azure-blob.component';

@NgModule({
  declarations: [
    EmailProviderComponent,
    SmtpComponent,
    SendgridComponent,
    EmailProviderListTableComponent,
    EmailProviderListComponent,
    AwsBlobComponent,
    BlobProviderComponent,
    BlobProviderListComponent,
    BlobProviderListTableComponent,
    GcpBlobComponent,
    AzureBlobComponent,
  ],
  imports: [
    CoreModule,
    CommonModule,
    GeneralRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    NgbDatepickerModule,
    DynamicSelectComponent,
  ],
})
export class GeneralModule {}
