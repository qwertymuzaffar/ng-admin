import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthStore } from '../authentication/store';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
})
export class NavbarComponent {
  #authStore: AuthStore = inject(AuthStore);

  user = this.#authStore.user;
  isAuthenticated = this.#authStore.isAuthenticated;
  isAdmin = this.#authStore.isAdmin;
  isInstructor = this.#authStore.isInstructor;
  isStudent = this.#authStore.isStudent;

  instructor = this.#authStore.instructor;
  student = this.#authStore.student;
}
