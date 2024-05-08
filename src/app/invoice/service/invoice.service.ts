import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { InvoiceModel } from '../model/invoice.model';

@Injectable()
export class InvoiceService {
  url = `${environment.api_url}/invoice/invoices`;
  constructor(private http: HttpClient) {}

  getInvoices(
    search: SearchModel | null = null
  ): Observable<ResponseModel<InvoiceModel>> {
    return this.http.get<ResponseModel<InvoiceModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getInvoice(id: string): Observable<InvoiceModel> {
    return this.http.get<InvoiceModel>(`${this.url}/${id}`);
  }

  addInvoice(model: InvoiceModel): Observable<void> {
    return this.http.post<void>(this.url, model);
  }

  updateInvoice(model: InvoiceModel): Observable<void> {
    return this.http.put<void>(this.url, model);
  }
}
