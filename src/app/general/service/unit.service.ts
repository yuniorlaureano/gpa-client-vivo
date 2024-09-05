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

  getUnitById(id: string): Observable<UnitModel> {
    return this.http.get<UnitModel>(`${this.url}/${id}`);
  }

  addUnit(model: UnitModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateUnit(model: UnitModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }

  removeUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
