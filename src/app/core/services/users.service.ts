import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http-client/api.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  #apiService: ApiService = inject(ApiService);

  public checkIfEmailExist(email: string): Observable<boolean> {
    return this.#apiService.get<boolean>('/users?email=' + email);
  }
}
