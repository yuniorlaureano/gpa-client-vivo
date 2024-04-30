import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem('gpa_access_token');
  }

  saveToken(token: string) {
    localStorage.setItem('gpa_access_token', token);
  }

  remoteToken() {
    localStorage.removeItem('gpa_access_token');
  }
}
