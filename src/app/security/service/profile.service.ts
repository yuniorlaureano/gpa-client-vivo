import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { ProfileModel } from '../model/profile.model';
import { RawUserModel } from '../model/raw-user.model';

@Injectable()
export class ProfileService {
  url = `${environment.api_url}/security/profiles`;
  constructor(private http: HttpClient) {}

  getProfiles(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ProfileModel>> {
    return this.http.get<ResponseModel<ProfileModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getProfileById(id: string): Observable<ProfileModel> {
    return this.http.get<ProfileModel>(`${this.url}/${id}`);
  }

  getUsers(
    profileId: string,
    search: SearchModel | null = null
  ): Observable<ResponseModel<RawUserModel>> {
    return this.http.get<ResponseModel<RawUserModel>>(
      `${this.url}/${profileId}/users${search ? search.asQueryString() : ''}`
    );
  }

  addProfile(model: ProfileModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateProfile(model: ProfileModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }

  assignUser(profileId: string, userId: string): Observable<void> {
    return this.http.put<void>(
      `${this.url}/${profileId}/assign/users/${userId}`,
      null
    );
  }

  removeUser(profileId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${profileId}/users/${userId}`);
  }
}
