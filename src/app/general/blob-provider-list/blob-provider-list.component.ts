import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlobStorageConfigurationModel } from '../model/blob-storage-configuration.model';

@Component({
  selector: 'gpa-blob-provider-list',
  templateUrl: './blob-provider-list.component.html',
})
export class BlobProviderListComponent {
  constructor(private router: Router) {}

  handleEdit(blobProvider: BlobStorageConfigurationModel) {
    this.router.navigate(['/general/blobs/edit/' + blobProvider.id]);
  }

  handleDelete(blobProvider: BlobStorageConfigurationModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
