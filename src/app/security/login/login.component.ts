import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { LoginModel } from '../model/login.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthState } from '../../core/ng-xs-store/states/auth.state';
import { Store } from '@ngxs/store';
import { ReplaceMessages } from '../../core/ng-xs-store/actions/auth.actions';
import { processError } from '../../core/utils/error.utils';
import { ToastService } from '../../core/service/toast.service';

@Component({
  selector: 'gpa-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy, OnInit {
  errors: string[] = [];
  subscriptions$: Subscription[] = [];
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
    private store: Store,
    private toastService: ToastService
  ) {
    this.spinner.hide('fullscreen');
  }

  ngOnInit(): void {
    const sub = this.store
      .select(AuthState.getUserName)
      .subscribe((userName) => {
        this.loginForm.patchValue({ userName: userName });
      });
    this.subscriptions$.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  login() {
    if (this.loginForm.valid) {
      this.spinner.show('fullscreen');
      const sub = this.authService
        .login(this.loginForm.value as LoginModel)
        .subscribe({
          next: () => {
            this.store.dispatch(new ReplaceMessages([]));
            this.errors = [];
            this.spinner.hide('fullscreen');
            this.router.navigate(['']);
          },
          error: (error) => {
            var errors = processError(
              error.error || error,
              'Error authenticando usuario'
            );
            errors.forEach((err) => {
              this.toastService.showError(err);
            });
            this.errors = errors;
            this.spinner.hide('fullscreen');
          },
        });
      this.subscriptions$.push(sub);
    }
  }
}
