import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterModel } from '../../core/models/filter.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class ReportService {
  url = `${environment.api_url}/report/inventory`;
  constructor(private http: HttpClient) {}

  existenceReport(search: FilterModel | null = null): Observable<Blob> {
    return this.http.get(
      `${this.url}/existence/print${search ? search.asQueryString() : ''}`,
      {
        responseType: 'blob',
      }
    );
  }

  stockCycleReport(stockCycleId: string): Observable<Blob> {
    return this.http.get(`${this.url}/stockcycles/${stockCycleId}/print`, {
      responseType: 'blob',
    });
  }

  transactionReport(search: FilterModel | null = null): Observable<Blob> {
    return this.http.get(
      `${this.url}/transactions/print${search ? search.asQueryString() : ''}`,
      {
        responseType: 'blob',
      }
    );
  }

  saleReport(search: FilterModel | null = null): Observable<Blob> {
    return this.http.get(
      `${this.url}/sales/print${search ? search.asQueryString() : ''}`,
      {
        responseType: 'blob',
      }
    );
  }
}
