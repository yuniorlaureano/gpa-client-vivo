import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Store } from '@ngxs/store';
import {
  AddUserName,
  ReplaceMessages,
} from '../../core/ng-xs-store/actions/auth.actions';
import { ToastService } from '../../core/service/toast.service';
import { processError } from '../../core/utils/error.utils';
import { ResetPasswordInvitationModel } from '../model/reset-password-invitation.model';
import { AuthState } from '../../core/ng-xs-store/states/auth.state';

@Component({
  selector: 'gpa-invitation-redime',
  templateUrl: './invitation-redime.component.html',
  styleUrl: './invitation-redime.component.css',
})
export class InvitationRedentionComponent implements OnDestroy, OnInit {
  subscriptions$: Subscription[] = [];
  errors: string[] = [];
  userName: string = '';
  messages$ = this.store.select(AuthState.getMessages);
  resetForm = this.formBuilder.group({
    userId: ['', [Validators.required]],
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
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sendCode();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
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

  sendCode() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const token = params.get('token');
          if (token) {
            return this.authService.sendRemptionCode(token);
          } else {
            return of(null);
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.errors = [];
          if (data) {
            this.resetForm.patchValue({
              userId: data.id,
            });
            this.userName = data.userName;
          }
          this.store.dispatch(
            new ReplaceMessages([
              'Acaba de recibir un correo con su códio de redención.',
              'Completar los campos y proceder.',
              'Nombre de usuario: ' + this.userName,
            ])
          );
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          var errors = processError(
            error.error || error,
            'Error confirmando invitación'
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

  setPasswords() {
    let value = {
      ...this.resetForm.value,
    } as ResetPasswordInvitationModel;

    const sub = this.authService.resetPasswordInvitation(value).subscribe({
      next: () => {
        this.errors = [];
        this.store.dispatch(
          new ReplaceMessages([
            'Invicación aceptada.',
            'Puede ingresar la sistema.',
          ])
        );
        this.store.dispatch(new AddUserName(this.userName));
        this.spinner.hide('fullscreen');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        let errors = processError(
          error.error || error,
          'Error procesando invitación'
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
