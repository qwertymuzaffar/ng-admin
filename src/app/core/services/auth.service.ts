import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../model';
import { API_URL } from '@core/http-client/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #http: HttpClient = inject(HttpClient);
  readonly #api_url = inject(API_URL);

  public login(user: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);
    return this.#http.post<LoginResponse>(this.#api_url + '/login', formData);
  }
}
