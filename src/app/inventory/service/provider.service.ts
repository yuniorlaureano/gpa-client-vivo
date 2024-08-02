import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { ProviderModel } from '../models/provider.model';

@Injectable()
export class ProviderService {
  url = `${environment.api_url}/inventory/providers`;
  constructor(private http: HttpClient) {}

  getProviders(
    search: FilterModel | null = null
  ): Observable<ResponseModel<ProviderModel>> {
    return this.http.get<ResponseModel<ProviderModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
