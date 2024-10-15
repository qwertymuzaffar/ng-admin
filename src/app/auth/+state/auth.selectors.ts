import { authFeature } from '@app/auth/+state/auth.reducer';

export const {
  selectIsAuthenticated,
  selectUser,
  selectInstructor,
  selectStudent,
  selectIsAdmin,
  selectIsInstructor,
  selectIsStudent,
} = authFeature;

export const authQuery = {
  selectIsAuthenticated,
  selectUser,
  selectInstructor,
  selectStudent,
  selectIsAdmin,
  selectIsInstructor,
  selectIsStudent,
};
