import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../service/token.service';

export const JwtAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  const token = tokenService.getToken();
  let headers = req.headers;

  if (!req.url.endsWith('/security/auth/signup')) {
    if (!token) {
      router.navigate(['/auth/login']);
    } else {
      headers = req.headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const newRequest = req.clone({
    headers: headers,
  });

  return next(newRequest).pipe(
    tap({
      error: (error) => {
        if (error.status && error.status == 401) {
          router.navigate(['/auth/login']);
        }
      },
    })
  );
};
