import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth..service';
import { LoginModel } from '../model/login.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'gpa-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  errors: string[] = [];
  loginSubscription!: Subscription;
  loginForm = this.formBuilder.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.loginSubscription!.unsubscribe();
  }

  login() {
    if (this.loginForm.valid) {
      this.loginSubscription = this.authService
        .login(this.loginForm.value as LoginModel)
        .subscribe({
          next: () => {
            this.errors = [];
            this.router.navigate(['']);
          },
          error: ({ error }) => {
            const errors = Object.keys(error).map((err) => error[err]);
            let concatenatedErrors: string[] = [];
            for (let err of errors) {
              concatenatedErrors = concatenatedErrors.concat(err);
            }
            this.errors = concatenatedErrors;
          },
        });
    }
  }
}
