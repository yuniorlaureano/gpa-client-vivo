import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Store } from '@ngxs/store';
import { ReplaceMessages } from '../../core/ng-xs-store/actions/auth.actions';
import { ToastService } from '../../core/service/toast.service';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-reset-password',
  templateUrl: './totp-code.component.html',
  styleUrl: './totp-code.component.css',
})
export class TOTPCodeComponent implements OnDestroy {
  errors: string[] = [];
  loginSubscription!: Subscription;
  resetForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private store: Store,
    private toastService: ToastService
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
            this.spinner.hide('fullscreen');
            this.store.dispatch(
              new ReplaceMessages([
                'Código enviado verifique su correo.',
                'Complete el formulario para continuar.',
              ])
            );
            this.router.navigate(['/auth/reset-password']);
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            var errors = processError(
              error.error || error,
              'Error enviando código de verificación'
            );
            errors.forEach((err) => {
              this.toastService.showError(err);
            });
            this.errors = errors;
            this.spinner.hide('fullscreen');
          },
        });
    }
  }
}
