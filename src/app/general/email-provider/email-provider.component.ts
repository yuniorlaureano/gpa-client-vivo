import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { EmailProviderService } from '../service/email-provider.service';
import { EmailConfigurationModel } from '../model/email-configuration.model';
import { EmailConstant } from '../../core/models/email.constants';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'gpa-email-provider',
  templateUrl: './email-provider.component.html',
  styleUrl: './email-provider.component.css',
})
export class EmailProviderComponent implements OnInit, OnDestroy {
  emailConstant = EmailConstant;
  isEdit = false;
  options: string | null | undefined = null;
  emailProviderForm = this.formBuilder.group({
    id: [''],
    identifier: ['', Validators.required],
    engine: ['', Validators.required],
    from: ['', Validators.required],
    current: [false, Validators.required],
    value: ['', Validators.required],
  });

  engines = {
    [EmailConstant.SMTP]: EmailConstant.SMTP,
    [EmailConstant.SENGRID]: EmailConstant.SENGRID,
  };

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private emailProviderService: EmailProviderService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private store: Store,
    private errorService: ErrorService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadEmailProvider();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.General][
            PermissionConstants.Components.Email
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
          onPermissionLoad();
        },
      });
    this.subscriptions$.push(sub);
  }

  setPermissions(requiredPermissions: RequiredPermissionType) {
    this.canRead = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Read
    );
    this.canCreate = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Create
    );
    this.canDelete = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Delete
    );
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  get selectedEngine() {
    return this.emailProviderForm.get('engine')?.value;
  }

  handleOptionsChange(value: string) {
    this.emailProviderForm.get('value')?.setValue(value);
  }

  save() {
    this.emailProviderForm.markAllAsTouched();
    if (this.emailProviderForm.valid) {
      const value = {
        ...this.emailProviderForm.value,
        value: this.emailProviderForm.get('value')?.value,
      };
      if (this.isEdit) {
        this.spinner.show('fullscreen');
        const sub = this.emailProviderService
          .updateEmailProvider(<EmailConfigurationModel>value)
          .subscribe({
            next: () => {
              this.clearForm();
              this.toastService.showSucess('Proveedor de email modificado');
              this.spinner.hide('fullscreen');
              this.router.navigate(['/general/emails/list']);
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              processError(
                error.error || error,
                'Error al modificar el proveedor de email'
              ).forEach((err) => {
                this.errorService.addGeneralError(err);
              });
            },
          });
        this.subscriptions$.push(sub);
      } else {
        value.id = null;
        this.spinner.show('fullscreen');
        const sub = this.emailProviderService
          .addEmailProvider(<EmailConfigurationModel>value)
          .subscribe({
            next: () => {
              this.clearForm();
              this.toastService.showSucess('Proveedor de email creado');
              this.spinner.hide('fullscreen');
              this.router.navigate(['/general/emails/list']);
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              processError(
                error.error || error,
                'Error al crear el proveedor de email'
              ).forEach((err) => {
                this.errorService.addGeneralError(err);
              });
            },
          });
        this.subscriptions$.push(sub);
      }
    }
  }

  loadEmailProvider() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          this.emailProviderForm
            .get('engine')
            ?.setValue(params.get('provider'));
          if (id) {
            this.isEdit = true;
            return this.emailProviderService.getEmailProviderById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (emailProvider) => {
          if (emailProvider) {
            this.emailProviderForm.setValue({
              id: emailProvider.id,
              identifier: emailProvider.identifier,
              engine: emailProvider.engine,
              from: emailProvider.from,
              current: emailProvider.current,
              value: emailProvider.value,
            });
            this.options = emailProvider.value;
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error cargando proveedores de emails'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/general/emails/list']);
  }

  clearForm() {
    this.emailProviderForm.reset();
    this.isEdit = false;
  }
}
