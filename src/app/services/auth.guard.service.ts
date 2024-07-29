import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  #authService: AuthService = inject(AuthService);
  #router: Router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.#authService.user.pipe(take(1), map(user => {
      const isAuth = !!user;
      if(isAuth) {
        if(user?.roles.includes(route.data['role'])) return true;
        else if(user?.roles.includes('Admin')) return this.#router.createUrlTree(['/courses']);
        else if(user?.roles.includes('Instructor')) return this.#router.createUrlTree(['/instructor-courses/' + user?.instructor?.instructorId]);
        else if(user?.roles.includes('Student')) return this.#router.createUrlTree(['/student-courses/' + user?.student?.studentId]);
      }
      return this.#router.createUrlTree(['/auth']);
    }))
  }
}
