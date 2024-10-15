import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { UserData } from '@core/model';
import { STORAGE_KEY } from '@core/const';
import { LocalStorageService } from '@core/utils';

export const instructorStudentGuard = (
  route: ActivatedRouteSnapshot
): boolean | UrlTree => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);
  const userData: UserData | null = localStorageService.getItem(
    STORAGE_KEY.user
  );

  if (userData) {
    const routeId = Number(route.params['id']);

    if (
      userData.roles.includes('Instructor') &&
      routeId !== userData.instructor?.instructorId
    ) {
      return router.createUrlTree([
        `/instructor-courses/${userData.instructor?.instructorId}`,
      ]);
    }

    if (
      userData.roles.includes('Student') &&
      routeId !== userData.student?.studentId
    ) {
      return router.createUrlTree([
        `/student-courses/${userData.student?.studentId}`,
      ]);
    }
  }

  return true;
};
