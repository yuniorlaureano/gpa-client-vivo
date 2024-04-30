import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginModel } from '../model/login.model';
import { environment } from '../../../environments/environment';
import { TokenModel } from '../model/token.model';
import { TokenService } from '../../core/service/token.service';

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
}
