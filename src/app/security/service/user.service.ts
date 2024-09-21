import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { environment } from '../../../environments/environment';
import { UserModel } from '../model/user.model';
import { InvitationTokenModel } from '../model/invitation-token.model';

@Injectable()
export class UserService {
  url = `${environment.api_url}/security/users`;
  constructor(private http: HttpClient) {}

  getUsers(
    search: FilterModel | null = null
  ): Observable<ResponseModel<UserModel>> {
    return this.http.get<ResponseModel<UserModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getUserById(id: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.url}/${id}`);
  }

  addUser(model: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.url}`, model);
  }

  updateUser(model: UserModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }

  removeUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}`);
  }

  enableUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}/enable`);
  }

  inviteUser(userId: string, profileId: string): Observable<void> {
    return this.http.get<void>(
      `${this.url}/${userId}/invite/with-profile/${profileId}`
    );
  }

  uploadPhoto(userId: string, model: FormData): Observable<void> {
    return this.http.post<void>(`${this.url}/${userId}/photo/upload`, model);
  }

  getInvitations(userId: string): Observable<InvitationTokenModel[]> {
    return this.http.get<InvitationTokenModel[]>(
      `${this.url}/${userId}/invitations`
    );
  }

  revokeInvitation(invitationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/invitations/${invitationId}/revoke`
    );
  }
}
