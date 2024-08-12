import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { BlobStorageConfigurationModel } from '../model/blob-storage-configuration.model';

@Injectable()
export class BlobStorageProviderService {
  url = `${environment.api_url}/general/blobstorage`;
  constructor(private http: HttpClient) {}

  getBlobProvider(
    search: FilterModel | null = null
  ): Observable<ResponseModel<BlobStorageConfigurationModel>> {
    return this.http.get<ResponseModel<BlobStorageConfigurationModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getBlobProviderById(id: string): Observable<BlobStorageConfigurationModel> {
    return this.http.get<BlobStorageConfigurationModel>(`${this.url}/${id}`);
  }

  addBlobProvider(model: BlobStorageConfigurationModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateBlobProvider(model: BlobStorageConfigurationModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
