import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideComponentStore } from '@ngrx/component-store';
import { AuthStore } from './components/authentication/store';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      NgbModule,
      ReactiveFormsModule,
      CommonModule
    ),
    provideComponentStore(AuthStore),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
