import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { authQuery, AuthState } from '@app/auth/+state';
import { Store } from '@ngrx/store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(Store<AuthState>);
  const userData = authStore.selectSignal(authQuery.selectUser);
  const token = computed(() => userData()?.token);

  if (!token()) {
    return next(req);
  }

  const modifiedRequest = req.clone({
    headers: new HttpHeaders({ Authorization: 'Bearer ' + token() }),
  });

  return next(modifiedRequest);
};
