import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnDestroy {
  errors: string[] = [];
  messasge: string[] = [];
  loginSubscription!: Subscription;
  resetForm = this.formBuilder.group({
    code: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.email]],
    confirmPassword: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription!.unsubscribe();
    }
  }

  sendCode() {
    if (this.resetForm.valid) {
      this.spinner.show('fullscreen');
      // this.loginSubscription = this.authService
      //   .sendTOTPCode(this.resetForm.value.email!)
      //   .subscribe({
      //     next: () => {
      //       this.errors = [];
      //       this.spinner.hide('fullscreen');
      //       this.messasge.push('Código enviado verfique su correo');
      //     },
      //     error: ({ error }) => {
      //       this.spinner.hide('fullscreen');
      //       const errors = Object.keys(error).map((err) => error[err]);
      //       let concatenatedErrors: string[] = [];
      //       for (let err of errors) {
      //         concatenatedErrors = concatenatedErrors.concat(err);
      //       }
      //       this.errors = concatenatedErrors;
      //     },
      //   });
    }
  }
}
