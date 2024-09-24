import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '../components/authentication/store';

export const authGuard = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const user = authStore.user();
  if (!user) {
    return router.createUrlTree(['/auth']);
  }

  const { roles, instructor, student } = user;
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
