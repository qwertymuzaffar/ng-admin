import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { authActions } from '@app/auth/+state/auth.actions';

@Injectable({ providedIn: 'root' })
export class TokenExpirationService {
  #tokenExpirationTimer!: ReturnType<typeof setTimeout> | null;
  readonly #store: Store = inject(Store);

  setLogoutTimer(expirationDuration: number): void {
    this.clearLogoutTimer();
    this.#tokenExpirationTimer = setTimeout(() => {
      this.#store.dispatch(authActions.logout());
    }, expirationDuration);
  }

  clearLogoutTimer(): void {
    if (this.#tokenExpirationTimer) {
      clearTimeout(this.#tokenExpirationTimer);
      this.#tokenExpirationTimer = null;
    }
  }
}
