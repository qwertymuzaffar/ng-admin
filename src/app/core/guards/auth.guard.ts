import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { UserData } from '@core/model';
import { STORAGE_KEY } from '@core/const';
import { LocalStorageService } from '@core/utils';

export const authGuard = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const localStorageService = inject(LocalStorageService);
  const router = inject(Router);

  const userData: UserData | null = localStorageService.getItem(
    STORAGE_KEY.user
  );

  if (!userData) {
    return router.createUrlTree(['/auth']);
  }

  const { roles, instructor, student } = userData;
  const requiredRole = route.data['role'];

  if (roles.includes(requiredRole)) {
    return true;
  }

  const redirectUrl = getRedirectUrl(
    roles,
    instructor?.instructorId,
    student?.studentId
  );
  return redirectUrl
    ? router.createUrlTree([redirectUrl])
    : router.createUrlTree(['/auth']);
};

const getRedirectUrl = (
  roles: string[],
  instructorId?: number,
  studentId?: number
) => {
  if (roles.includes('Admin')) {
    return '/courses';
  }
  if (roles.includes('Instructor') && instructorId) {
    return `/instructor-courses/${instructorId}`;
  }
  if (roles.includes('Student') && studentId) {
    return `/student-courses/${studentId}`;
  }
  return null;
};
