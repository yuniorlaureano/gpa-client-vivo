import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-reset-password',
  templateUrl: './totp-code.component.html',
  styleUrl: './totp-code.component.css',
})
export class TOTPCodeComponent implements OnDestroy {
  errors: string[] = [];
  messasge: string[] = [];
  loginSubscription!: Subscription;
  resetForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
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
      this.loginSubscription = this.authService
        .sendTOTPCode(this.resetForm.value.email!)
        .subscribe({
          next: () => {
            this.errors = [];
            this.messasge.push('Código enviado verifique su correo.');
            setTimeout(() => {
              this.spinner.hide('fullscreen');
              this.router.navigate(['/auth/reset-password']);
            }, 2000);
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
