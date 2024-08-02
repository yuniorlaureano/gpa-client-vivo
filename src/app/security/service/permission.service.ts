import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { environment } from '../../../environments/environment';
import { ProfileModel } from '../model/profile.model';
import { MasterProfileModel } from '../model/master-profile.mode';
import { PermissionType } from '../../core/models/permission.type';

@Injectable()
export class PermissionService {
  url = `${environment.api_url}/security/profiles`;
  constructor(private http: HttpClient) {}

  getPermissions(
    search: FilterModel | null = null
  ): Observable<ResponseModel<ProfileModel>> {
    return this.http.get<ResponseModel<ProfileModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getPermissionById(id: string): Observable<ProfileModel> {
    return this.http.get<ProfileModel>(`${this.url}/${id}`);
  }

  addPermission(model: ProfileModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updatePermission(model: ProfileModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }

  getMasterProfile(): Observable<MasterProfileModel[]> {
    return this.http.get<MasterProfileModel[]>(`${this.url}/master-profile`);
  }

  getInlinePermissions(): Observable<PermissionType> {
    return this.http.get<PermissionType>(`${this.url}/permissions`);
  }
}
