import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilterModel } from '../../core/models/filter.model';
import { TransactionType } from '../../core/models/transaction-type.enum';
import { ReasonEnum } from '../../core/models/reason.enum';
import { RawInputVsOutputVsExistenceModel } from '../model/raw-input-vs-output-vs-existence.model';
import { RawTransactionsPerMonthByReasonModel } from '../model/raw-transactions-per-month-by-reason';

@Injectable()
export class DashboardService {
  url = `${environment.api_url}/general/dashboard`;
  constructor(private http: HttpClient) {}

  getClientsCount(search: FilterModel | null = null): Observable<number> {
    return this.http.get<number>(
      `${this.url}/clients/count${search ? search.asQueryString() : ''}`
    );
  }

  getSelesRevenue(
    month: number,
    search: FilterModel | null = null
  ): Observable<number> {
    return this.http.get<number>(
      `${this.url}/sales/months/${month}/revenue${
        search ? search.asQueryString() : ''
      }`
    );
  }

  getInputVsOutputVsExistence(
    search: FilterModel | null = null
  ): Observable<RawInputVsOutputVsExistenceModel[]> {
    return this.http.get<RawInputVsOutputVsExistenceModel[]>(
      `${this.url}/input-vs-output-vs-existence${
        search ? search.asQueryString() : ''
      }`
    );
  }

  getTransactionsPerMonthByReason(
    reason: ReasonEnum,
    search: FilterModel | null = null
  ): Observable<RawTransactionsPerMonthByReasonModel[]> {
    return this.http.get<RawTransactionsPerMonthByReasonModel[]>(
      `${this.url}/reasons/${reason}/transactions${
        search ? search.asQueryString() : ''
      }`
    );
  }
}
