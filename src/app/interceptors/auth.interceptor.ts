import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../components/authentication/store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.user()?.token;

  if (!token) {
    return next(req);
  }

  const modifiedRequest = req.clone({
    headers: new HttpHeaders({ Authorization: 'Bearer ' + token }),
  });

  return next(modifiedRequest);
};
