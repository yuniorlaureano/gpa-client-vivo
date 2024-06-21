import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { AddonModel } from '../models/addon.model';

@Injectable()
export class AddonService {
  url = `${environment.api_url}/inventory/addons`;
  constructor(private http: HttpClient) {}

  getAddon(
    search: SearchModel | null = null
  ): Observable<ResponseModel<AddonModel>> {
    return this.http.get<ResponseModel<AddonModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getAddonById(id: string): Observable<AddonModel> {
    return this.http.get<AddonModel>(`${this.url}/${id}`);
  }

  addAddon(model: AddonModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateAddon(model: AddonModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
