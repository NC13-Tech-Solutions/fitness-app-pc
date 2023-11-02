import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../services/http/user.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  private userService: UserService = inject(UserService);
  private router: Router = inject(Router);

  canActivate(state: RouterStateSnapshot) {
    const x = this.userService.isLoggedIn();
    if (state.url == '/login') {
      //Route to Login
      // Check if user is already logged in, if so, then route to main page
      if (typeof x == 'boolean') {
        if (x) {
          // user is already logged in and token is valid, so re-routing to main page
          return this.router.navigateByUrl('/main');
        }
        return true;
      } else {
        return new Promise<boolean>((resolve, reject) => {
          x.pipe(take(1)).subscribe((value) => {
            if (value) {
              // user is already logged in, so re-routing to main page
              resolve(this.router.navigateByUrl('/main'));
            }
            resolve(true);
          });
        });
      }
    } else {
      //Any other route
      // Check if user is logged in, if not, then route to login page
      if (typeof x == 'boolean') {
        if (!x) {
          // token is invalid, so re-routing to login page
          return this.router.navigateByUrl('/login');
        }
        return true;
      } else {
        return new Promise<boolean>((resolve, reject) => {
          x.pipe(take(1)).subscribe((value) => {
            if (value) {
              // user is logged in, so all routes are allowed
              resolve(true);
            }
            //user is not logged in, so rerouting to login page
            resolve(this.router.navigateByUrl('/login'));
          });
        });
      }
    }
  }
}

export const authentication: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(AuthGuardService).canActivate(state);
};
