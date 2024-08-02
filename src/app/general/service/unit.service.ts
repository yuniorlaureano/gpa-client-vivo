import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { UnitModel } from '../model/unit.model';

@Injectable()
export class UnitService {
  url = `${environment.api_url}/general/units`;
  constructor(private http: HttpClient) {}

  getUnits(
    search: FilterModel | null = null
  ): Observable<ResponseModel<UnitModel>> {
    return this.http.get<ResponseModel<UnitModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
