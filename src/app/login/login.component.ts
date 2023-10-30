import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/http/user.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {
  router = inject(Router);
  userService = inject(UserService);

  formGroup = new FormGroup(
    {
      username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    }
  );

  usernameEmpty = true;
  passwordEmpty = true;

  userInvalid: boolean = false;

  //Getters for formGroup

  get UserName() {
    return this.formGroup.get('username');
  }

  get Password() {
    return this.formGroup.get('password');
  }

  valueOf(obj: AbstractControl | null): string {
    return obj ? obj.value : '';
  }


  onSubmit() {
    this.userService.isUserValid(this.valueOf(this.UserName), this.valueOf(this.Password))
      .pipe(take(1))
      .subscribe(
        (value) => {
          if (value) {
            // TODO: Since the user exists, we go to main page. Should probably user credential here as well.
            this.router.navigateByUrl('/main');
          } else {
            // TODO: User doesn't exist, so we should raise error.
            this.formGroup.reset({ username: '', password: '' });
            this.userInvalid = true;
          }
        }
      );
  }

}
