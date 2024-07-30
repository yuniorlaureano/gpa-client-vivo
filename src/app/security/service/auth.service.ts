import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginModel } from '../model/login.model';
import { environment } from '../../../environments/environment';
import { TokenModel } from '../model/token.model';
import { TokenService } from '../../core/service/token.service';
import { UserModel } from '../model/user.model';
import { SignUpModel } from '../model/sign-up.model';
import { ResetPasswordModel } from '../model/reset-password.model';

@Injectable()
export class AuthService {
  url = `${environment.api_url}/security/auth`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(model: LoginModel): Observable<TokenModel> {
    return this.http.post<TokenModel>(`${this.url}/login`, model).pipe(
      tap({
        next: (data) => {
          this.tokenService.saveToken(data.token);
          this.tokenService.savePermissions(data.permissions);
        },
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
          next: (data) => {
            this.tokenService.saveToken(data.token);
            this.tokenService.savePermissions(data.permissions);
          },
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
            this.tokenService.remotePermissions();
            this.tokenService.saveToken(data.token);
            this.tokenService.savePermissions(data.permissions);
          },
        })
      );
  }

  signUp(model: SignUpModel): Observable<void> {
    return this.http.post<void>(`${this.url}/signup`, model);
  }

  sendTOTPCode(email: string): Observable<void> {
    return this.http.get<void>(`${this.url}/totp/send/${email}`);
  }

  resetPassword(passwordReset: ResetPasswordModel): Observable<void> {
    return this.http.post<void>(`${this.url}/reset-password`, passwordReset);
  }
}
