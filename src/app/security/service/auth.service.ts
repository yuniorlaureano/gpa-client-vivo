import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginModel } from '../model/login.model';
import { environment } from '../../../environments/environment';
import { TokenModel } from '../model/token.model';
import { TokenService } from '../../core/service/token.service';
import { UserModel } from '../model/user.model';
import { SignUpModel } from '../model/sign-up.model';

@Injectable()
export class AuthService {
  url = `${environment.api_url}/security/auth`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(model: LoginModel): Observable<TokenModel> {
    return this.http.post<TokenModel>(`${this.url}/login`, model).pipe(
      tap({
        next: (data) => this.tokenService.saveToken(data.token),
      })
    );
  }

  logOut() {
    this.tokenService.remoteToken();
    window.location.href = '/auth/login';
  }

  changeProfile(profileId: string): Observable<TokenModel> {
    return this.http
      .get<TokenModel>(`${this.url}/profile/${profileId}/change`)
      .pipe(
        tap({
          next: (data) => this.tokenService.saveToken(data.token),
        })
      );
  }

  editUserProfile(user: UserModel): Observable<TokenModel> {
    return this.http
      .put<TokenModel>(`${this.url}/users/${user.id}/profile/edit`, user)
      .pipe(
        tap({
          next: (data) => {
            this.tokenService.remoteToken();
            this.tokenService.saveToken(data.token);
          },
        })
      );
  }

  signUp(model: SignUpModel): Observable<void> {
    return this.http.post<void>(`${this.url}/signup`, model);
  }
}
