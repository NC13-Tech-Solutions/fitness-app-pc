import { Injectable, inject } from '@angular/core';
import { Observable, of, take } from 'rxjs';
import { ApiService } from './api.service';
import { DatePipe } from '@angular/common';
import { User } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);
  private datePipe = inject(DatePipe);
  private justDateTime: string = 'yyyy-MM-ddThh:mm:ss';
  private entryPoint = 'api/user';

  /**
   * Checks the {@link localStorage} if a `JwtToken` is received and if so, then the time the `JwtToken` was received is retrieved from {@link sessionStorage}.
   * If the time data is available, then it checks whether the time has passed 24 hours. If time data is unavailable, then we call {@link isUserTokenValid} and sets
   * the current time as the time the `JwtToken` is received in the session storage.
   * @remarks `JwtToken` expires after 24 hours
   * @returns `false` if `JwtToken` is not found in the {@link localStorage}. `true` if the time the `JwtToken` was received is less than 24 hours.
   * Observable of boolean is returned if the call to {@link isUserTokenValid} is made to check if `JwtToken` is valid or not
   * @see {@link isUserTokenValid} for more info.
   */
  public isLoggedIn(): Observable<boolean> | boolean {
    // Check if user is logged in
    if (localStorage.getItem('JwtToken') != null) {
      const cur_date = this.datePipe.transform(
        Date.now(),
        this.justDateTime
      ) as string;
      if (sessionStorage.getItem('User Registered Time') != null) {
        const registered_date = sessionStorage.getItem(
          'User Registered Time'
        ) as string;
        const difference =
          new Date(cur_date).getTime() - new Date(registered_date).getTime();
        // Check if the logged in time is less than 24 hours
        if (difference <= 1000 * 60 * 60 * 24) {
          return true;
        }
      }
      return new Observable<boolean>((sub) => {
        this.isUserTokenValid()
          .pipe(take(1))
          .subscribe((value) => {
            if (value) {
              sessionStorage.setItem('User Registered Time', cur_date);
            }
            sub.next(value);
          });
      });
    }
    return false;
  }

  /**
   * Performs actions to be performed before removing the user
   * @privateRemarks currently this function only returns `true`
   * @returns Observable of boolean which returns `true` if the actions were successful or `false` if otherwise
   */
  public logOut(): Observable<boolean> {
    localStorage.removeItem('JwtToken');
    sessionStorage.removeItem('User Registered Time');
    // TODO: Do any other actions before logging out, here
    return of(true);
  }
  /**
   * Checks with the server whether the JwtToken is valid or not
   * @returns Observable of boolean which returns `true` if the token is valid or `false` if otherwise
   */
  public isUserTokenValid(): Observable<boolean> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<boolean, 'false' | 'true'>(
      `${this.entryPoint}/validate`,
      'text',
      {
        token: JwtToken,
      },
      [{ name: 'Content-Type', value: 'application/json' }],
      (value) => {
        return this.sToB(value);
      }
    );
  }
  /**
   * Check if the user credentials are valid and saves the `JwtToken` in the {@link localStorage} and the time the token was received in the {@link sessionStorage}
   * @param username
   * @param password
   * @returns Observable of boolean which returns `true` if the user credentials are valid or else it returns `false`
   */
  public isUserValid(username: String, password: String): Observable<boolean> {
    return this.api.postRequest<boolean, string>(
      `${this.entryPoint}/login`,
      'text',
      {
        username,
        password,
      },
      [{ name: 'Content-Type', value: 'application/json' }],
      (value) => {
        if (value.startsWith('JwtToken:')) {
          const cur_date = this.datePipe.transform(
            Date.now(),
            this.justDateTime
          ) as string;
          localStorage.setItem('JwtToken', value.substring('JwtToken:'.length));
          sessionStorage.setItem('User Registered Time', cur_date);
          return true;
        }
        return false;
      }
    );
  }

  /**
   * converts boolean data in string type to boolean type
   * @param text is either 'true' or 'false'
   * @returns the boolean version of the text
   */
  public sToB(text: 'false' | 'true'): boolean {
    if (text == 'true') return true;
    return false;
  }

  /**
   * Gets userId of the authenticated user using username and password
   * @param username
   * @param password
   * @returns Observable of number which contains userid of the user, if the credentials match or else `0` is returned
   */
  public getUserId(username: String, password: String): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<number, number>(
      `${this.entryPoint}/view/data`,
      'text',
      {
        username,
        password,
      },
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        return value;
      }
    );
  }

  /**
   * Gets the details of the user using userId
   * @param userId of the autheticated user
   * @returns Observable of {@link User}
   */
  public getUserById(userId: number): Observable<User> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<User, User>(
      `${this.entryPoint}/view/id/${userId}`,
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        return value;
      }
    );
  }
}
