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
import { BlobStorageConstant } from '../../core/models/blob-storage.constants';
import { BlobStorageProviderService } from '../service/blob-storage-provider.service';
import { BlobStorageConfigurationModel } from '../model/blob-storage-configuration.model';

@Component({
  selector: 'gpa-blob-storage-provider',
  templateUrl: './blob-provider.component.html',
  styleUrl: './blob-provider.component.css',
})
export class BlobProviderComponent implements OnInit, OnDestroy {
  blobStorageConstant = BlobStorageConstant;
  isEdit = false;
  options: string | null | undefined = null;
  blobProviderForm = this.formBuilder.group({
    id: [''],
    identifier: ['', Validators.required],
    provider: ['', Validators.required],
    current: [false, Validators.required],
    value: ['', Validators.required],
  });

  providers = {
    [BlobStorageConstant.AWS]: BlobStorageConstant.AWS,
    [BlobStorageConstant.GCP]: BlobStorageConstant.GCP,
    [BlobStorageConstant.AZURE]: BlobStorageConstant.AZURE,
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
    private blobStorageProviderService: BlobStorageProviderService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadBlobProvider();
    this.handlePermissionsLoad();
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.General][
            PermissionConstants.Components.Blob
          ]
      )
      .subscribe({
        next: (permissions) => {
          this.setPermissions(permissions);
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
      PermissionConstants.Permission.Upload
    );
  }

  get selectedEngine() {
    return this.blobProviderForm.get('provider')?.value;
  }

  handleOptionsChange(value: string) {
    this.blobProviderForm.get('value')?.setValue(value);
  }

  save() {
    this.blobProviderForm.markAllAsTouched();
    if (this.blobProviderForm.valid) {
      const value = {
        ...this.blobProviderForm.value,
        value: this.blobProviderForm.get('value')?.value,
      };
      if (this.isEdit) {
        this.spinner.show('fullscreen');
        const sub = this.blobStorageProviderService
          .updateBlobProvider(<BlobStorageConfigurationModel>value)
          .subscribe({
            next: () => {
              this.clearForm();
              this.toastService.showSucess('Proveedor de archivo modificado');
              this.spinner.hide('fullscreen');
              this.router.navigate(['/general/blobs']);
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              this.toastService.showError(
                'Error al modificar el proveedor de archivo'
              );
            },
          });
        this.subscriptions$.push(sub);
      } else {
        value.id = null;
        this.spinner.show('fullscreen');
        const sub = this.blobStorageProviderService
          .addBlobProvider(<BlobStorageConfigurationModel>value)
          .subscribe({
            next: () => {
              this.clearForm();
              this.toastService.showSucess('Proveedor de archivo creado');
              this.spinner.hide('fullscreen');
            },
            error: (error) => {
              this.spinner.hide('fullscreen');
              this.toastService.showError(
                'Error al crear el proveedor de archivo'
              );
            },
          });
        this.subscriptions$.push(sub);
      }
    }
  }

  loadBlobProvider() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          this.blobProviderForm
            .get('provider')
            ?.setValue(params.get('provider'));
          if (id) {
            this.isEdit = true;
            return this.blobStorageProviderService.getBlobProviderById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (blobProvider) => {
          if (blobProvider) {
            this.blobProviderForm.setValue({
              id: blobProvider.id,
              identifier: blobProvider.identifier,
              provider: blobProvider.provider,
              current: blobProvider.current,
              value: blobProvider.value,
            });
            this.options = blobProvider.value;
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError(
            'Error al cargar el proveedor de archivo'
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/general/blobs']);
  }

  clearForm() {
    this.blobProviderForm.reset();
    this.isEdit = false;
  }
}
