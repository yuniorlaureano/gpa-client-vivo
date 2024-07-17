import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SignUpModel } from '../model/sign-up.model';
import { ToastService } from '../../core/service/toast.service';
import { map } from 'rxjs';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit() {}

  bothPasswordAreInvalid(control: FormControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.parent?.get('confirmPassword')?.value;
    return password == confirmPassword
      ? null
      : { bothPasswordAreInvalid: true };
  }

  save() {
    this.signUpForm.markAllAsTouched();
    console.log(this.signUpForm.get('userName')?.errors);
    if (this.signUpForm.valid) {
      this.authService.signUp(<SignUpModel>this.signUpForm.value).subscribe({
        next: () => {
          this.toastService.showSucess('Usuario registrado correctamente');
          this.signUpForm.reset();
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 500);
        },
        error: (error) => {
          if (typeof error.error === 'string') {
            this.errors.push = error.error;
          } else {
            this.errors = error.error.map((e: any) => e.errorMessage);
            this.toastService.showError('Error al registrar usuario');
          }
        },
      });
    }
  }
}
