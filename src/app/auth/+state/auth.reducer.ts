import { createFeature, createReducer, on } from '@ngrx/store';
import { ErrorResponse, Instructor, LoggedUser, Student } from '@core/model';
import { authActions } from '@app/auth/+state/auth.actions';

export interface AuthState {
  user: LoggedUser | null;
  instructor: Instructor | undefined;
  student: Student | undefined;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  isAuthenticated: boolean;
  errorResponse: ErrorResponse | null;
}

export const authInitialState: AuthState = {
  user: null,
  instructor: undefined,
  student: undefined,
  isAdmin: false,
  isInstructor: false,
  isStudent: false,
  isAuthenticated: false,
  errorResponse: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    authInitialState,
    on(authActions.setLoggedUserSuccess, (state, { loggedUser }) => {
      const isAdmin = loggedUser.roles.includes('Admin');
      return {
        ...state,
        user: loggedUser,
        isAdmin,
        isAuthenticated: true,
        errorResponse: null,
      };
    }),
    on(authActions.loginFailure, (state, { errorResponse }) => ({
      ...state,
      user: null,
      errorResponse,
    })),
    on(authActions.updateUser, (state, { loggedUser }) => {
      const isAdmin = loggedUser.roles.includes('Admin');
      const isInstructor = loggedUser.roles.includes('Instructor');
      const isStudent = loggedUser.roles.includes('Student');
      return {
        ...state,
        user: loggedUser,
        instructor: loggedUser.instructor,
        student: loggedUser.student,
        isAdmin,
        isInstructor,
        isStudent,
        isAuthenticated: true,
        errorResponse: null,
      };
    }),
    on(authActions.updateInstructor, (state, { instructor }) => ({
      ...state,
      instructor,
    })),
    on(authActions.updateStudent, (state, { student }) => ({
      ...state,
      student,
    })),
    on(authActions.logout, state => ({
      ...state,
      user: null,
      instructor: undefined,
      student: undefined,
      isAdmin: false,
      isStudent: false,
      isInstructor: false,
      isAuthenticated: false,
      errorResponse: null,
    })),
    on(authActions.loadInstructorSuccess, (state, { loggedUser }) => ({
      ...state,
      user: loggedUser,
      instructor: loggedUser?.instructor,
      isInstructor: true,
      isAuthenticated: true,
      errorResponse: null,
    })),
    on(authActions.loadStudentSuccess, (state, { loggedUser }) => ({
      ...state,
      user: loggedUser,
      student: loggedUser?.student,
      isStudent: true,
      isAuthenticated: true,
      errorResponse: null,
    }))
  ),
});
