import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenClaims } from '../models/token-claims.model';

@Injectable()
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem('gpa_access_token');
  }

  getClaims(): TokenClaims | null {
    const token = this.getToken();
    if (token) {
      const decoded = jwtDecode(token);
      return decoded as TokenClaims;
    }
    return null;
  }

  saveToken(token: string) {
    localStorage.setItem('gpa_access_token', token);
  }

  remoteToken() {
    localStorage.removeItem('gpa_access_token');
  }
}
