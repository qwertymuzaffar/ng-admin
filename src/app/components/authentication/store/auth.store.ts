import { inject, Injectable } from '@angular/core';
import { ComponentStore, OnStoreInit } from '@ngrx/component-store';
import {
  ErrorResponse,
  Instructor,
  LoggedUser,
  LoginRequest,
  LoginResponse,
  Student,
} from '../../../model';
import { AuthService } from '../../../services/auth.service';
import { LocalStorageService } from '../../../utils';
import { Router } from '@angular/router';
import { STORAGE_KEY } from '../../../constatns';
import { from, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { InstructorsService } from '../../../services/instructors.service';
import { StudentsService } from '../../../services/students.service';
import { UserData } from '../../../model/user-data.model';

interface AuthState {
  user: LoggedUser | null;
  instructor: Instructor | undefined;
  student: Student | undefined;
  isAuthenticated: boolean;
  errorResponse: ErrorResponse | null;
}

interface DecodedAccessToken {
  exp: number;
  iss: string;
  roles: string[];
  sub: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStore
  extends ComponentStore<AuthState>
  implements OnStoreInit
{
  #router = inject(Router);
  #localStorage = inject(LocalStorageService);
  #authService = inject(AuthService);
  #instructorService: InstructorsService = inject(InstructorsService);
  #studentService: StudentsService = inject(StudentsService);

  #jwtHelperService = new JwtHelperService();
  #tokenExpirationTimer!: ReturnType<typeof setTimeout> | null;

  isAuthenticated = this.selectSignal(state => state.isAuthenticated);
  isInstructor = this.selectSignal(state => !!state.instructor);
  isStudent = this.selectSignal(state => !!state.student);
  isAdmin = this.selectSignal(state => state.user?.roles.includes('Admin'));

  user = this.selectSignal(state => state.user);
  instructor = this.selectSignal(state => state.instructor);
  student = this.selectSignal(state => state.student);

  ngrxOnStoreInit(): void {
    const user: LoggedUser | null = this.#localStorage.getItem<LoggedUser>(
      STORAGE_KEY.user
    );
    this.setState({
      isAuthenticated: !!user,
      user: user,
      errorResponse: null,
      instructor: user?.instructor,
      student: user?.student,
    });
  }

  readonly login = this.effect<LoginRequest>(
    switchMap(loginForm => {
      return this.#authService
        .login(loginForm)
        .pipe(tap(response => this.#saveToken(response)));
    })
  );

  readonly logout = this.effect<void>(
    tap(() => {
      this.#localStorage.removeItem(STORAGE_KEY.user);
      this.#updateState({
        user: null,
        isAuthenticated: false,
        instructor: undefined,
        student: undefined,
      });
      this.#router.navigate(['/']);
      if (this.#tokenExpirationTimer) {
        clearTimeout(this.#tokenExpirationTimer);
      }
      this.#tokenExpirationTimer = null;
    })
  );

  readonly autoLogin = this.effect<void>(
    tap(() => {
      const userData: UserData | null = this.#localStorage.getItem<UserData>(
        STORAGE_KEY.user
      );
      if (!userData) return;

      const loadedUser = new LoggedUser(
        userData.username,
        userData.roles,
        userData._token,
        new Date(userData._expiration),
        userData.student,
        userData.instructor
      );

      if (loadedUser.token) {
        this.#updateState({ user: loadedUser });
        this.#autoLogout(
          new Date(userData._expiration).valueOf() - new Date().valueOf()
        );
      }
    })
  );

  readonly refreshInstructor = this.effect(
    tap((instructor: Instructor) => {
      const userData: UserData | null = this.#localStorage.getItem<UserData>(
        STORAGE_KEY.user
      );
      if (!userData) return;

      const loggedUser = new LoggedUser(
        userData.username,
        userData.roles,
        userData._token,
        new Date(userData._expiration),
        userData.student,
        instructor
      );
      this.#updateState({ user: loggedUser });
      this.#localStorage.setItem(STORAGE_KEY.user, JSON.stringify(loggedUser));
    })
  );

  readonly refreshStudent = this.effect(
    tap((student: Student) => {
      const userData: UserData | null = this.#localStorage.getItem<UserData>(
        STORAGE_KEY.user
      );
      if (!userData) return;

      const loggedUser = new LoggedUser(
        userData.username,
        userData.roles,
        userData._token,
        new Date(userData._expiration),
        student,
        userData.instructor
      );
      this.#updateState({ user: loggedUser });
      this.#localStorage.setItem(STORAGE_KEY.user, JSON.stringify(loggedUser));
    })
  );

  readonly redirectAdmin = this.effect<void>(
    switchMap(() => {
      return from(this.#router.navigateByUrl('/courses'));
    })
  );

  readonly redirectInstructor = this.effect<string>(
    switchMap(email => {
      return this.#instructorService.loadInstructorByEmail(email).pipe(
        tap((instructor: Instructor) => {
          this.#updateState({ instructor });
          this.refreshInstructor(instructor);
          this.#router.navigateByUrl(
            `/instructor-courses/${instructor.instructorId}`
          );
        })
      );
    })
  );

  readonly redirectStudent = this.effect<string>(
    switchMap(email => {
      return this.#studentService.loadStudentByEmail(email).pipe(
        tap((student: Student) => {
          this.#updateState({ student });
          this.refreshStudent(student);
          this.#router.navigateByUrl(`/student-courses/${student.studentId}`);
        })
      );
    })
  );

  #saveToken(jwtTokens: LoginResponse): void {
    const decodedAccessToken: DecodedAccessToken | null =
      this.#jwtHelperService.decodeToken(jwtTokens.accessToken);
    if (!decodedAccessToken) return;
    const loggedUser = this.#createLoggedUser(
      decodedAccessToken,
      jwtTokens.accessToken
    );
    this.#updateState({
      user: loggedUser,
      isAuthenticated: true,
      errorResponse: null,
    });
    this.#autoLogout(
      this.#getExpirationDate(decodedAccessToken.exp).valueOf() -
        new Date().valueOf()
    );
    this.#localStorage.setItem(STORAGE_KEY.user, JSON.stringify(loggedUser));
    this.#redirectLoggedInUser(decodedAccessToken);
  }

  #createLoggedUser(
    decodedToken: DecodedAccessToken,
    accessToken: string,
    student?: Student,
    instructor?: Instructor
  ): LoggedUser {
    return new LoggedUser(
      decodedToken.sub,
      decodedToken.roles,
      accessToken,
      this.#getExpirationDate(decodedToken.exp),
      student,
      instructor
    );
  }

  #redirectLoggedInUser(decodedToken: DecodedAccessToken): void {
    if (decodedToken.roles.includes('Admin')) {
      this.redirectAdmin();
    } else if (decodedToken.roles.includes('Instructor')) {
      this.redirectInstructor(decodedToken.sub);
    } else if (decodedToken.roles.includes('Student')) {
      this.redirectStudent(decodedToken.sub);
    }
  }

  #getExpirationDate(exp: number): Date {
    const date = new Date(0);
    date.setUTCSeconds(exp);
    return date;
  }

  #autoLogout(expirationDuration: number): void {
    this.#tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  #updateState(state: Partial<AuthState>): void {
    this.patchState(state);
  }
}
