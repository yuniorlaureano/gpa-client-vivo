import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { ProviderModel } from '../models/provider.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  url = `${environment.api_url}/inventory/providers`;
  constructor(private http: HttpClient) {}

  getProviders(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ProviderModel>> {
    return this.http.get<ResponseModel<ProviderModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
