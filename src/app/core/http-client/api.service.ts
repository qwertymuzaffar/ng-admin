import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/http-client/api-url.token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly #http = inject(HttpClient);
  readonly #api_url = inject(API_URL);

  get<T>(url: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.#http.get<T>(`${this.#api_url}${url}`, {
      headers: this.headers,
      params,
    });
  }

  post<T, D>(url: string, data?: D): Observable<T> {
    return this.#http.post<T>(`${this.#api_url}${url}`, data, {
      headers: this.headers,
    });
  }

  loginPost<T, D>(url: string, data?: D): Observable<T> {
    return this.#http.post<T>(`${this.#api_url}${url}`, data);
  }

  put<T, D>(url: string, data: D): Observable<T> {
    return this.#http.put<T>(`${this.#api_url}${url}`, data, {
      headers: this.headers,
    });
  }

  delete<T>(url: string): Observable<T> {
    return this.#http.delete<T>(`${this.#api_url}${url}`, {
      headers: this.headers,
    });
  }

  get headers(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    return new HttpHeaders(headersConfig);
  }
}
