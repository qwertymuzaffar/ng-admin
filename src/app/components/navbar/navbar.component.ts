import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { LoggedUser } from '../../model/logged-user.model';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
})
export class NavbarComponent implements OnInit {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #authService: AuthService = inject(AuthService);

  isAuthenticated = false;
  isAdmin = false;
  isInstructor = false;
  isStudent = false;

  instructorId: number | undefined;
  studentId: number | undefined;

  ngOnInit(): void {
    this.#authService.user
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(data => {
        this.isAuthenticated = !!data;
        if (!this.isAuthenticated) {
          this.initializeState();
        } else if (data) this.setRole(data);
      });
  }

  setRole(loggedUser: LoggedUser | null) {
    if (loggedUser?.roles.includes('Admin')) this.isAdmin = true;
    else if (loggedUser?.instructor) {
      this.isInstructor = true;
      this.instructorId = loggedUser.instructor?.instructorId;
    } else if (loggedUser?.student) {
      this.isStudent = true;
      this.studentId = loggedUser.student?.studentId;
    }
  }

  initializeState() {
    this.isAdmin = false;
    this.isInstructor = false;
    this.isStudent = false;
  }
}
