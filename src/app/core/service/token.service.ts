import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenClaims } from '../models/token-claims.model';
import { PermissionType } from '../models/permission.type';

@Injectable()
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem('gpa_access_token');
  }

  getPermissions(): PermissionType | null {
    const permissions = localStorage.getItem('gpa_permissions');
    if (!permissions) {
      return null;
    }
    return JSON.parse(permissions);
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

  savePermissions(permissions: PermissionType) {
    localStorage.setItem('gpa_permissions', JSON.stringify(permissions));
  }
  remotePermissions() {
    localStorage.removeItem('gpa_permissions');
  }
}
