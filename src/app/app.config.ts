import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { environment } from '@env/environment';
import { API_URL } from '@core/http-client/api-url.token';
import { authFunctionalEffects, authFeature } from './auth/+state';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      NgbModule,
      ReactiveFormsModule,
      CommonModule
    ),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      auth: authFeature.reducer,
    }),
    provideEffects(authFunctionalEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    { provide: API_URL, useValue: environment.backendHost },
  ],
};
