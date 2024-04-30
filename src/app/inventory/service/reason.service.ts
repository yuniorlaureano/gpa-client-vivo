import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { ReasonModel } from '../models/reason.model';

@Injectable({
  providedIn: 'root',
})
export class ReasonService {
  url = `${environment.api_url}/inventory/reasons`;
  constructor(private http: HttpClient) {}

  getReasons(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ReasonModel>> {
    return this.http.get<ResponseModel<ReasonModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
