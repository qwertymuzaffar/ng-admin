import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { authQuery } from '@app/auth/+state/auth.selectors';
import { AuthState } from '@app/auth/+state/auth.reducer';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, AsyncPipe],
})
export class NavbarComponent {
  #authStore: Store<AuthState> = inject(Store<AuthState>);

  isAuthenticated$ = this.#authStore.select(authQuery.selectIsAuthenticated);
  isAdmin$ = this.#authStore.select(authQuery.selectIsAdmin);
  isInstructor$ = this.#authStore.select(authQuery.selectIsInstructor);
  isStudent$ = this.#authStore.select(authQuery.selectIsStudent);

  instructor = this.#authStore.selectSignal(authQuery.selectInstructor);
  student = this.#authStore.selectSignal(authQuery.selectStudent);
}
