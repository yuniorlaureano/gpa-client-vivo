import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { UnitModel } from '../model/unit.model';

@Injectable()
export class UnitService {
  url = `${environment.api_url}/common/units`;
  constructor(private http: HttpClient) {}

  getUnits(
    search: SearchModel | null = null
  ): Observable<ResponseModel<UnitModel>> {
    return this.http.get<ResponseModel<UnitModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
