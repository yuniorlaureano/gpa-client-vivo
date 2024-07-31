import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { LoginModel } from '../model/login.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthState } from '../../core/ng-xs-store/states/auth.state';
import { Store } from '@ngxs/store';
import { ReplaceMessages } from '../../core/ng-xs-store/actions/auth.actions';

@Component({
  selector: 'gpa-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  errors: string[] = [];
  loginSubscription!: Subscription;
  messages$ = this.store.select(AuthState.getMessages);
  loginForm = this.formBuilder.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription!.unsubscribe();
    }
  }

  login() {
    if (this.loginForm.valid) {
      this.spinner.show('fullscreen');
      this.loginSubscription = this.authService
        .login(this.loginForm.value as LoginModel)
        .subscribe({
          next: () => {
            this.store.dispatch(new ReplaceMessages([]));
            this.errors = [];
            this.spinner.hide('fullscreen');
            this.router.navigate(['']);
          },
          error: ({ error }) => {
            let errors = [];
            if (typeof error === 'string') {
              errors.push(error);
            } else {
              errors = Object.keys(error).map((err) => error[err]);
            }
            let concatenatedErrors: string[] = [];
            for (let err of errors) {
              concatenatedErrors = concatenatedErrors.concat(err);
            }
            this.errors = concatenatedErrors;
            this.spinner.hide('fullscreen');
          },
        });
    }
  }
}
