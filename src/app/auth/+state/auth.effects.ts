import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { InstructorsService } from '@core/services/instructors.service';
import { StudentsService } from '@core/services/students.service';
import { authActions } from './auth.actions';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoggedUser, UserData } from '@core/model';
import { LocalStorageService } from '@core/utils';
import { STORAGE_KEY } from '@core/const';
import { TokenExpirationService } from '@app/auth/services/token-expiration.service';
import { createLoggedUser, getExpirationDate } from '@app/auth/utils';

export interface DecodedAccessToken {
  exp: number;
  iss: string;
  roles: string[];
  sub: string;
}

export const login$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(authActions.login),
      switchMap(({ loginRequest }) =>
        authService.login(loginRequest).pipe(
          map(jwtTokens => authActions.loginSuccess({ jwtTokens })),
          catchError(errorResponse =>
            of(authActions.loginFailure({ errorResponse }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const loginSuccess$ = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(authActions.loginSuccess),
      map(({ jwtTokens }) => {
        return authActions.setLoggedUser({ jwtTokens });
      }),
      catchError(errorResponse =>
        of(authActions.loginFailure({ errorResponse }))
      )
    );
  },
  { functional: true }
);

export const setLoggedUser$ = createEffect(
  (
    actions$ = inject(Actions),
    tokenExpirationService = inject(TokenExpirationService),
    localStorageService = inject(LocalStorageService)
  ) => {
    return actions$.pipe(
      ofType(authActions.setLoggedUser),
      map(({ jwtTokens }) => {
        const jwtHelperService = new JwtHelperService();
        const decodedToken = jwtHelperService.decodeToken(
          jwtTokens.accessToken
        );
        const expirationDate = getExpirationDate(decodedToken.exp);
        const loggedUser = createLoggedUser(
          decodedToken,
          jwtTokens.accessToken
        );

        const expirationDuration =
          expirationDate.valueOf() - new Date().valueOf();
        tokenExpirationService.setLogoutTimer(expirationDuration);
        localStorageService.setItem(STORAGE_KEY.user, loggedUser);
        return authActions.setLoggedUserSuccess({
          decodedToken,
          accessToken: jwtTokens.accessToken,
          loggedUser,
        });
      }),
      catchError(errorResponse =>
        of(authActions.loginFailure({ errorResponse }))
      )
    );
  },
  { functional: true }
);

export const autoLogout$ = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(authActions.setLoggedUserSuccess),
      map(({ loggedUser }) => authActions.autoLogout({ loggedUser }))
    );
  },
  { functional: true }
);

export const setLoggedUserSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(authActions.setLoggedUserSuccess),
      concatMap(({ decodedToken, accessToken }) => {
        if (decodedToken.roles.includes('Admin')) {
          router.navigateByUrl('/courses');
          return EMPTY;
        } else if (decodedToken.roles.includes('Instructor')) {
          return of(authActions.loadInstructor({ decodedToken, accessToken }));
        } else if (decodedToken.roles.includes('Student')) {
          return of(authActions.loadStudent({ decodedToken, accessToken }));
        } else {
          return EMPTY;
        }
      })
    ),
  { functional: true }
);

export const loadInstructor$ = createEffect(
  (
    actions$ = inject(Actions),
    instructorService = inject(InstructorsService),
    localStorageService = inject(LocalStorageService)
  ) => {
    return actions$.pipe(
      ofType(authActions.loadInstructor),
      switchMap(({ decodedToken, accessToken }) => {
        return instructorService.loadInstructorByEmail(decodedToken.sub).pipe(
          map(instructor => {
            const loggedUser = createLoggedUser(
              decodedToken,
              accessToken,
              undefined,
              instructor
            );
            localStorageService.setItem(STORAGE_KEY.user, loggedUser);
            return authActions.loadInstructorSuccess({ loggedUser });
          })
        );
      })
    );
  },
  { functional: true }
);

export const loadStudent$ = createEffect(
  (
    actions$ = inject(Actions),
    studentService = inject(StudentsService),
    localStorageService = inject(LocalStorageService)
  ) => {
    return actions$.pipe(
      ofType(authActions.loadStudent),
      switchMap(({ decodedToken, accessToken }) => {
        return studentService.loadStudentByEmail(decodedToken.sub).pipe(
          map(student => {
            const loggedUser = createLoggedUser(
              decodedToken,
              accessToken,
              student,
              undefined
            );
            localStorageService.setItem(STORAGE_KEY.user, loggedUser);
            return authActions.loadStudentSuccess({ loggedUser });
          })
        );
      })
    );
  },
  { functional: true }
);

export const loadStudentSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(authActions.loadStudentSuccess),
      tap(({ loggedUser }) => {
        router.navigateByUrl(
          `/student-courses/${loggedUser.student?.studentId}`
        );
      })
    );
  },
  { functional: true, dispatch: false }
);

export const loadInstructorSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(authActions.loadInstructorSuccess),
      tap(({ loggedUser }) => {
        router.navigateByUrl(
          `/instructor-courses/${loggedUser.instructor?.instructorId}`
        );
      })
    );
  },
  { functional: true, dispatch: false }
);

export const autoLogin$ = createEffect(
  (
    actions$ = inject(Actions),
    tokenExpirationService = inject(TokenExpirationService),
    localStorageService = inject(LocalStorageService)
  ) => {
    return actions$.pipe(
      ofType(authActions.autoLogin),
      map(() => {
        const userData: UserData | null = localStorageService.getItem(
          STORAGE_KEY.user
        );

        if (!userData) {
          return authActions.logout();
        }

        const loggedUser = new LoggedUser(
          userData.username,
          userData.roles,
          userData._token,
          new Date(userData._expiration),
          userData.student,
          userData.instructor
        );

        if (loggedUser.token) {
          const expirationDuration =
            loggedUser._expiration.valueOf() - new Date().valueOf();
          tokenExpirationService.setLogoutTimer(expirationDuration);
          return authActions.updateUser({ loggedUser });
        } else {
          return authActions.logout();
        }
      })
    );
  },
  { functional: true }
);

export const logout$ = createEffect(
  (
    actions$ = inject(Actions),
    tokenExpirationService = inject(TokenExpirationService),
    localStorageService = inject(LocalStorageService),
    router = inject(Router)
  ) => {
    return actions$.pipe(
      ofType(authActions.logout),
      tap(() => {
        tokenExpirationService.clearLogoutTimer();
        localStorageService.removeItem(STORAGE_KEY.user);
        router.navigate(['/']);
      })
    );
  },
  { functional: true, dispatch: false }
);
