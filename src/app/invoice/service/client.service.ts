import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { ClientModel } from '../model/client.model';

@Injectable()
export class ClientService {
  url = `${environment.api_url}/invoice/clients`;
  constructor(private http: HttpClient) {}

  getClients(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ClientModel>> {
    return this.http.get<ResponseModel<ClientModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getClientById(id: string): Observable<ClientModel> {
    return this.http.get<ClientModel>(`${this.url}/${id}`);
  }

  addClient(model: ClientModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateClient(model: ClientModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
