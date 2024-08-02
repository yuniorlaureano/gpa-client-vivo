import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { ReasonModel } from '../models/reason.model';

@Injectable()
export class ReasonService {
  url = `${environment.api_url}/inventory/reasons`;
  constructor(private http: HttpClient) {}

  getReasons(
    search: FilterModel | null = null
  ): Observable<ResponseModel<ReasonModel>> {
    return this.http.get<ResponseModel<ReasonModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
