import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import {
  FormBuilder,
  FormControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SignUpModel } from '../model/sign-up.model';
import { ToastService } from '../../core/service/toast.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  errors: string[] = [];
  signUpForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    userName: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
    confirmPassword: ['', [Validators.required, this.bothPasswordAreInvalid]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {}

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
    const confirmPassword = this.signUpForm.get(
      'confirmPassword'
    ) as FormControl;
    this.bothPasswordAreInvalid(confirmPassword);
    this.signUpForm.markAllAsTouched();
  }

  save() {
    this.markAllAsTouched();
    if (this.signUpForm.valid) {
      this.spinner.show('fullscreen');
      this.authService.signUp(<SignUpModel>this.signUpForm.value).subscribe({
        next: () => {
          this.toastService.showSucess('Usuario registrado correctamente');
          this.signUpForm.reset();
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
            this.spinner.hide('fullscreen');
          }, 500);
        },
        error: (error) => {
          processError(error.error, 'Error agregando usuario').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
          this.spinner.hide('fullscreen');
        },
      });
    }
  }
}
