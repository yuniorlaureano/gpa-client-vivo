import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlobStorageConstant } from '../../core/models/blob-storage.constants';
import { EmailConstant } from '../../core/models/email.constants';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'gpa-integrations',
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.css',
})
export class IntegrationsComponent implements OnInit, OnDestroy {
  subscriptions$: Subscription[] = [];

  constructor(private route: ActivatedRoute) {}

  integrations = [
    {
      type: 'emails',
      text: 'Email',
      privders: {
        [EmailConstant.SMTP]: {
          key: EmailConstant.SMTP,
          img: 'smtp-com.png',
        },
        [EmailConstant.SENGRID]: {
          key: EmailConstant.SENGRID,
          img: 'SendGrid.png',
        },
      },
    },
    {
      type: 'blobs',
      text: 'Archivo',
      privders: {
        [BlobStorageConstant.AWS]: {
          type: BlobStorageConstant.AWS,
          img: 'aws-s3.png',
        },
        [BlobStorageConstant.GCP]: {
          type: BlobStorageConstant.GCP,
          img: 'gcpbucket.png',
        },
        [BlobStorageConstant.AZURE]: {
          type: BlobStorageConstant.AZURE,
          img: 'az-blob.png',
        },
      },
    },
  ];

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {}

  getProviders(prov: any) {
    return Object.keys(prov).map((key) => {
      return key;
    });
  }

  getLink(provider: string, integration: string) {
    return '/general/' + integration + '/integrations/' + provider;
  }

  getListLink(integration: string) {
    return '/general/' + integration + '/list';
  }
}
