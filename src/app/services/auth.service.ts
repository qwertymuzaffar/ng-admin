import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { LoginRequest } from '../model/login.model';
import { LoginResponse } from '../model/login.model';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoggedUser } from '../model/logged-user.model';
import { Router } from '@angular/router';
import { InstructorsService } from './instructors.service';
import { StudentsService } from './students.service';
import { Instructor } from '../model/instructor.model';
import { Student } from '../model/student.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http: HttpClient = inject(HttpClient);
  #router: Router = inject(Router);
  #instructorService: InstructorsService = inject(InstructorsService);
  #studentService: StudentsService = inject(StudentsService);

  jwtHelperService = new JwtHelperService();
  user = new BehaviorSubject<LoggedUser | null>(null);
  tokenExpirationTimer: any;

  public login(user: LoginRequest): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);
    return this.#http.post<LoginResponse>(
      environment.backendHost + '/login',
      formData
    );
  }

  saveToken(jwtTokens: LoginResponse) {
    const decodedAccessToken = this.jwtHelperService.decodeToken(
      jwtTokens.accessToken
    );
    const loggedUser = new LoggedUser(
      decodedAccessToken.sub,
      decodedAccessToken.roles,
      jwtTokens.accessToken,
      this.getExpirationDate(decodedAccessToken.exp),
      undefined,
      undefined
    );
    this.user.next(loggedUser);
    this.autoLogout(
      this.getExpirationDate(decodedAccessToken.exp).valueOf() -
        new Date().valueOf()
    );
    localStorage.setItem('userData', JSON.stringify(loggedUser));
    this.redirectLoggedInUser(decodedAccessToken, jwtTokens.accessToken);
  }

  redirectLoggedInUser(decodedToken: any, accessToken: string) {
    if (decodedToken.roles.includes('Admin'))
      this.#router.navigateByUrl('/courses');
    else if (decodedToken.roles.includes('Instructor')) {
      this.#instructorService
        .loadInstructorByEmail(decodedToken.sub)
        .pipe(take(1))
        .subscribe(instructor => {
          const loggedUser = new LoggedUser(
            decodedToken.sub,
            decodedToken.roles,
            accessToken,
            this.getExpirationDate(decodedToken.exp),
            undefined,
            instructor
          );
          this.user.next(loggedUser);
          localStorage.setItem('userData', JSON.stringify(loggedUser));
          this.#router.navigateByUrl(
            '/instructor-courses/' + instructor.instructorId
          );
        });
    } else if (decodedToken.roles.includes('Student')) {
      this.#studentService
        .loadStudentByEmail(decodedToken.sub)
        .pipe(take(1))
        .subscribe(student => {
          const loggedUser = new LoggedUser(
            decodedToken.sub,
            decodedToken.roles,
            accessToken,
            this.getExpirationDate(decodedToken.exp),
            student,
            undefined
          );
          this.user.next(loggedUser);
          localStorage.setItem('userData', JSON.stringify(loggedUser));
          this.#router.navigateByUrl('/student-courses/' + student.studentId);
        });
    }
  }

  autoLogin() {
    let dataS: string | null;
    dataS = localStorage.getItem('userData');
    if (dataS == null) return;
    const userData: {
      username: string;
      roles: string[];
      _token: string;
      _expiration: string;
      student: Student | undefined;
      instructor: Instructor | undefined;
    } = JSON.parse(dataS);

    const loadedUser = new LoggedUser(
      userData.username,
      userData.roles,
      userData._token,
      new Date(userData._expiration),
      userData.student,
      userData.instructor
    );
    if (loadedUser.token) {
      this.user.next(loadedUser);
      this.autoLogout(loadedUser._expiration.valueOf() - new Date().valueOf());
    }
  }

  logout() {
    localStorage.clear();
    this.user.next(null);
    this.#router.navigate(['/']);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  refreshInstructor(instructor: Instructor) {
    const userData: {
      username: string;
      roles: string[];
      _token: string;
      _expiration: Date;
      student: Student | undefined;
      instructor: Instructor | undefined;
    } = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) return;
    const loggedUser = new LoggedUser(
      userData.username,
      userData.roles,
      userData._token,
      new Date(userData._expiration),
      userData.student,
      instructor
    );
    this.user.next(loggedUser);
    localStorage.setItem('userData', JSON.stringify(loggedUser));
  }

  refreshStudent(student: Student) {
    const userData: {
      username: string;
      roles: string[];
      _token: string;
      _expiration: Date;
      student: Student | undefined;
      instructor: Instructor | undefined;
    } = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) return;
    const loggedUser = new LoggedUser(
      userData.username,
      userData.roles,
      userData._token,
      new Date(userData._expiration),
      student,
      userData.instructor
    );
    if (loggedUser.token) {
      this.user.next(loggedUser);
      localStorage.setItem('userData', JSON.stringify(loggedUser));
    }
  }

  getExpirationDate(exp: number) {
    const date = new Date(0);
    date.setUTCSeconds(exp);
    return date;
  }

  autoLogout(_expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, _expirationDuration);
  }
}
