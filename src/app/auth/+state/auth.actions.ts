import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ErrorResponse,
  Instructor,
  LoggedUser,
  LoginRequest,
  LoginResponse,
  Student,
} from '@core/model';
import { DecodedAccessToken } from '@app/auth/+state/auth.effects';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    login: props<{ loginRequest: LoginRequest }>(),
    loginSuccess: props<{ jwtTokens: LoginResponse }>(),
    loginFailure: props<{ errorResponse: ErrorResponse }>(),

    updateUser: props<{ loggedUser: LoggedUser }>(),
    updateInstructor: props<{ instructor: Instructor }>(),
    updateStudent: props<{ student: Student }>(),

    setLoggedUser: props<{ jwtTokens: LoginResponse }>(),
    setLoggedUserSuccess: props<{
      decodedToken: any;
      accessToken: string;
      loggedUser: LoggedUser;
    }>(),
    setLoggedUserFailure: props<{ errorResponse: ErrorResponse }>(),

    redirectLoggedInUser: props<{ decodedToken: DecodedAccessToken }>(),
    redirectLoggedInUserSuccess: props<{ decodedToken: DecodedAccessToken }>(),

    logout: emptyProps,

    loadInstructor: props<{
      decodedToken: DecodedAccessToken;
      accessToken: string;
    }>(),
    loadInstructorSuccess: props<{ loggedUser: LoggedUser }>(),

    loadStudent: props<{
      decodedToken: DecodedAccessToken;
      accessToken: string;
    }>(),
    loadStudentSuccess: props<{ loggedUser: LoggedUser }>(),

    autoLogin: emptyProps(),
    autoLogout: props<{ loggedUser: LoggedUser | null }>(),
  },
});
