import { DecodedAccessToken } from '@app/auth/+state/auth.effects';
import { Instructor, LoggedUser, Student } from '@core/model';
import { getExpirationDate } from '@app/auth/utils';

export const createLoggedUser = (
  decodedToken: DecodedAccessToken,
  accessToken: string,
  student?: Student,
  instructor?: Instructor
): LoggedUser => {
  const expirationDate = getExpirationDate(decodedToken.exp);
  return new LoggedUser(
    decodedToken.sub,
    decodedToken.roles,
    accessToken,
    expirationDate,
    student,
    instructor
  );
};
