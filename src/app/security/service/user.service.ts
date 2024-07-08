import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { environment } from '../../../environments/environment';
import { UserModel } from '../model/user.model';

@Injectable()
export class UserService {
  url = `${environment.api_url}/security/users`;
  constructor(private http: HttpClient) {}

  getUsers(
    search: SearchModel | null = null
  ): Observable<ResponseModel<UserModel>> {
    return this.http.get<ResponseModel<UserModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getUserById(id: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.url}/${id}`);
  }

  addUser(model: UserModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateUser(model: UserModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
