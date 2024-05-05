import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { ClientModel } from '../model/client.model';
import { InvoiceModel } from '../model/invoice.model';

@Injectable()
export class InvoiceService {
  url = `${environment.api_url}/invoice/invoices`;
  constructor(private http: HttpClient) {}

  getInvoices(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ClientModel>> {
    return this.http.get<ResponseModel<ClientModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  addInvoice(model: InvoiceModel): Observable<void> {
    return this.http.post<void>(this.url, model);
  }
}
