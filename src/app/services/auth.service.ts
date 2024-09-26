import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http: HttpClient = inject(HttpClient);

  public login(user: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);
    return this.#http.post<LoginResponse>(
      environment.backendHost + '/login',
      formData
    );
  }
}
