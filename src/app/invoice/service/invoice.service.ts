import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { environment } from '../../../environments/environment';
import { InvoiceModel } from '../model/invoice.model';
import { InvoiceAttachModel } from '../model/invoice-attachment';

@Injectable()
export class InvoiceService {
  url = `${environment.api_url}/invoice/invoices`;
  constructor(private http: HttpClient) {}

  getInvoices(
    search: FilterModel | null = null
  ): Observable<ResponseModel<InvoiceModel>> {
    return this.http.get<ResponseModel<InvoiceModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getInvoice(id: string): Observable<InvoiceModel> {
    return this.http.get<InvoiceModel>(`${this.url}/${id}`);
  }

  addInvoice(model: InvoiceModel): Observable<InvoiceModel> {
    return this.http.post<InvoiceModel>(this.url, model);
  }

  updateInvoice(model: InvoiceModel): Observable<void> {
    return this.http.put<void>(this.url, model);
  }

  cancelInvoice(id: string): Observable<void> {
    return this.http.put<void>(`${this.url}/cancel/${id}`, { id: id });
  }

  uploadAttachment(id: string, file: FormData): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/attachment/upload`, file);
  }

  getAttachments(stockId: string): Observable<InvoiceAttachModel[]> {
    return this.http.get<InvoiceAttachModel[]>(
      `${this.url}/${stockId}/attachments`
    );
  }

  downloadAttachments(attachmentId: string): Observable<Blob> {
    return this.http.post(
      `${this.url}/attachments/${attachmentId}/download`,
      {},
      { responseType: 'blob' }
    );
  }
}
