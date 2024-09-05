import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { LocationWithNameModel } from '../../core/models/location-with-name.model';
import { processError } from '../../core/utils/error.utils';
import { ProviderModel } from '../models/provider.model';
import { ProviderService } from '../service/provider.service';

@Component({
  selector: 'gpa-provider',
  templateUrl: './provider.component.html',
  styleUrl: './provider.component.css',
})
export class ProviderComponent implements OnInit, OnDestroy {
  providers: ProviderModel[] = [];
  isEdit: boolean = false;
  mapIsVisible: boolean = false;
  locations: { lat: number; lng: number; name: string }[] = [];

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private providerService: ProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad();
    this.loadProvider();
    this.providerForm.get('latitude')?.disable();
    this.providerForm.get('longitude')?.disable();
  }

  providerForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    lastName: [''],
    identification: ['', Validators.required],
    identificationType: [1, Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.required],
    buildingNumber: [''],
    city: [''],
    street: [''],
    country: [''],
    postalCode: [''],
    latitude: [''],
    longitude: [''],
    formattedAddress: [''],
  });

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.Provider
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
      PermissionConstants.Permission.Update
    );
  }

  showMap() {
    this.mapIsVisible = true;
  }

  onSubmit() {
    this.providerForm.markAllAsTouched();
    if (this.providerForm.valid) {
      if (!this.isEdit) {
        this.createProvider();
      } else {
        this.upateProvider();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  createProvider() {
    this.providerForm.get('id')?.setValue(null);
    const value = {
      ...this.providerForm.value,
      latitude: this.parseLocationValue(
        this.providerForm.get('latitude')?.value
      ),
      longitude: this.parseLocationValue(
        this.providerForm.get('longitude')?.value
      ),
    };
    this.spinner.show('fullscreen');
    const sub = this.providerService
      .addProvider(value as ProviderModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Proveedor agregado');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error creando porveedor').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  parseLocationValue(value: any) {
    if (value == '' || value == null) {
      return null;
    }
    return parseFloat(value);
  }

  upateProvider() {
    const value = {
      ...this.providerForm.value,
      latitude: this.parseLocationValue(
        this.providerForm.get('latitude')?.value
      ),
      longitude: this.parseLocationValue(
        this.providerForm.get('longitude')?.value
      ),
    };

    this.spinner.show('fullscreen');
    const sub = this.providerService
      .updateProvider(value as ProviderModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.spinner.hide('fullscreen');
          this.toastService.showSucess('Proveedor actualizado');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error actualizando proveedor').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/inventory/provider']);
  }

  clearForm() {
    this.providerForm.reset();
    this.isEdit = false;
    this.providerForm.get('latitude')?.disable();
    this.providerForm.get('longitude')?.disable();
  }

  handleLocationChange(location: LocationWithNameModel) {
    this.mapIsVisible = false;
    this.providerForm.get('name')?.setValue(location.placeName);
    this.providerForm
      .get('formattedAddress')
      ?.setValue(location.formattedAddress);
    this.providerForm.get('latitude')?.setValue(location.lat?.toString() ?? '');
    this.providerForm
      .get('longitude')
      ?.setValue(location.lng?.toString() ?? '');
  }

  hideMap() {
    this.mapIsVisible = false;
  }

  loadProvider() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.providerService.getProviderById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (provider) => {
          if (provider) {
            this.providerForm.setValue({
              id: provider.id,
              name: provider.name,
              lastName: provider.lastName,
              identification: provider.identification,
              identificationType: provider.identificationType,
              phone: provider.phone,
              email: provider.email,
              buildingNumber: provider.buildingNumber,
              country: provider.country,
              postalCode: provider.postalCode,
              street: provider.street,
              city: provider.city,
              latitude: provider.latitude?.toString() ?? '',
              longitude: provider.longitude?.toString() ?? '',
              formattedAddress: provider.formattedAddress,
            });

            if (provider.latitude != null && provider.longitude != null) {
              this.locations = [
                {
                  lat: provider.latitude,
                  lng: provider.longitude,
                  name: provider.name + ' ' + provider.lastName,
                },
              ];
            }
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error cargando proveedor').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }
}
