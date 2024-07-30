import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ResetPasswordModel } from '../model/reset-password.model';

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
    userName: ['', [Validators.required, Validators.maxLength(30)]],
    code: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
    confirmPassword: ['', [Validators.required, this.bothPasswordAreInvalid]],
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

  bothPasswordAreInvalid(control: FormControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.parent?.get('confirmPassword')?.value;
    return password == confirmPassword
      ? null
      : { bothPasswordAreInvalid: true };
  }

  changePassword() {
    if (this.resetForm.valid) {
      this.spinner.show('fullscreen');

      this.loginSubscription = this.authService
        .resetPassword(this.resetForm.value as ResetPasswordModel)
        .subscribe({
          next: () => {
            this.errors = [];
            this.messasge.push('Contraseña cambiada correctamente.');
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
              this.spinner.hide('fullscreen');
            }, 500);
          },
          error: ({ error }) => {
            this.spinner.hide('fullscreen');
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
