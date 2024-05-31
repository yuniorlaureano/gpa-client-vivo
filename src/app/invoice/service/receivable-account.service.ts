import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { ReceivableAccountModel } from '../model/receivable-account.model';
import { InvoiceWithReceivableAccountModel } from '../model/invoice-with-receivable-account';
import { ReceivableAccountSummaryModel } from '../model/receivable-account-summary.model';

@Injectable()
export class ReceivableAccountService {
  url = `${environment.api_url}/invoice/receivableaccounts`;
  constructor(private http: HttpClient) {}

  getReceivableAccounts(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ReceivableAccountModel>> {
    return this.http.get<ResponseModel<ReceivableAccountModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getReceivableAccountSummary(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ReceivableAccountSummaryModel>> {
    return this.http.get<ResponseModel<ReceivableAccountSummaryModel>>(
      `${this.url}/summary${search ? search.asQueryString() : ''}`
    );
  }

  getReceivableAccountsByInvoiceId(
    invoiceId: string
  ): Observable<InvoiceWithReceivableAccountModel> {
    return this.http.get<InvoiceWithReceivableAccountModel>(
      `${this.url}/invoice/${invoiceId}`
    );
  }

  getReceivableAccount(id: string): Observable<ReceivableAccountModel> {
    return this.http.get<ReceivableAccountModel>(`${this.url}/${id}`);
  }

  addReceivableAccount(model: ReceivableAccountModel): Observable<void> {
    return this.http.post<void>(this.url, model);
  }

  updateReceivableAccount(model: ReceivableAccountModel): Observable<void> {
    return this.http.put<void>(this.url, model);
  }

  cancelReceivableAccount(id: string): Observable<void> {
    return this.http.put<void>(`${this.url}/cancel/${id}`, { id: id });
  }
}
