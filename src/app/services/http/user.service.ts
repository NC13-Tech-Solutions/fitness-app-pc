import { Injectable, inject } from '@angular/core';
import { Observable, of, take } from 'rxjs';
import { ApiService } from './api.service';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);
  private datePipe = inject(DatePipe);
  private justDateTime: string = 'yyyy-MM-ddThh:mm:ss';

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

  public logOut(): Observable<boolean> {
    localStorage.removeItem('JwtToken');
    sessionStorage.removeItem('User Registered Time');
    // TODO: Do any other actions before logging out, here
    return of(true);
  }

  public isUserTokenValid(): Observable<boolean> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<boolean, 'false' | 'true'>(
      'api/user/validate',
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

  public isUserValid(username: String, password: String): Observable<boolean> {
    // Check if the user credentials are valid
    return this.api.postRequest<boolean, string>(
      'api/user/login',
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
}
