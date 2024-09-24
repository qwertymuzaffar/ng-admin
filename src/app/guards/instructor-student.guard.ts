import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthStore } from '../components/authentication/store';

export const instructorStudentGuard = (
  route: ActivatedRouteSnapshot
): boolean | UrlTree => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const user = authStore.user();

  if (user) {
    const routeId = Number(route.params['id']);

    if (
      user.roles.includes('Instructor') &&
      routeId !== user.instructor?.instructorId
    ) {
      return router.createUrlTree([
        `/instructor-courses/${user.instructor?.instructorId}`,
      ]);
    }

    if (user.roles.includes('Student') && routeId !== user.student?.studentId) {
      return router.createUrlTree([
        `/student-courses/${user.student?.studentId}`,
      ]);
    }
  }

  return true;
};
