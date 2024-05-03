import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { ClientModel } from '../model/client.model';

@Injectable()
export class ClientService {
  url = `${environment.api_url}/inventory/products`;
  constructor(private http: HttpClient) {}

  getClients(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ClientModel>> {
    return this.http.get<ResponseModel<ClientModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
