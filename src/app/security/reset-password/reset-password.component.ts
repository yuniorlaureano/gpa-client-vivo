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
import { Store } from '@ngxs/store';
import { ReplaceMessages } from '../../core/ng-xs-store/actions/auth.actions';
import { AuthState } from '../../core/ng-xs-store/states/auth.state';
import { processError } from '../../core/utils/error.utils';
import { ToastService } from '../../core/service/toast.service';

@Component({
  selector: 'gpa-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnDestroy {
  errors: string[] = [];
  loginSubscription!: Subscription;
  messages$ = this.store.select(AuthState.getMessages);
  resetForm = this.formBuilder.group({
    userName: ['', [Validators.required, Validators.maxLength(30)]],
    code: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
    confirmPassword: [
      '',
      [
        Validators.required,
        this.bothPasswordAreInvalid,
        Validators.maxLength(128),
      ],
    ],
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

  bothPasswordAreInvalid(control: FormControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.parent?.get('confirmPassword')?.value;
    if (password != confirmPassword) {
      control.parent
        ?.get('confirmPassword')
        ?.setErrors({ bothPasswordAreInvalid: true });
    }
    return password == confirmPassword
      ? null
      : { bothPasswordAreInvalid: true };
  }

  markAllAsTouched() {
    const confirmPassword = this.resetForm.get(
      'confirmPassword'
    ) as FormControl;
    this.bothPasswordAreInvalid(confirmPassword);
    this.resetForm.markAllAsTouched();
  }

  changePassword() {
    this.markAllAsTouched();
    if (this.resetForm.valid) {
      this.spinner.show('fullscreen');
      this.loginSubscription = this.authService
        .resetPassword(this.resetForm.value as ResetPasswordModel)
        .subscribe({
          next: () => {
            this.errors = [];
            this.spinner.hide('fullscreen');
            this.store.dispatch(
              new ReplaceMessages([
                'Contraseña cambiada correctamente.',
                'Inicia sesión con tu nueva contraseña.',
              ])
            );
            this.router.navigate(['/auth/login']);
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            var errors = processError(
              error.error || error,
              'Error reestableciendo contraseña'
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
