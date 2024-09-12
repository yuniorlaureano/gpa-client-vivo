import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterModel } from '../../core/models/filter.model';
import { environment } from '../../../environments/environment';
import { ExistenceModel } from '../../inventory/models/existence.model';

@Injectable()
export class ReportService {
  url = `${environment.api_url}/report/inventory`;
  constructor(private http: HttpClient) {}

  getExistence(
    search: FilterModel | null = null
  ): Observable<ExistenceModel[]> {
    return this.http.get<ExistenceModel[]>(
      `${this.url}/existence${search ? search.asQueryString() : ''}`
    );
  }

  existenceReport(search: FilterModel | null = null): Observable<Blob> {
    return this.http.get(
      `${this.url}/existence/print${search ? search.asQueryString() : ''}`,
      {
        responseType: 'blob',
      }
    );
  }
}
