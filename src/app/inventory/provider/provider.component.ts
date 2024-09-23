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
import { LocationWithNameModel } from '../../core/models/location-with-name.model';
import { processError } from '../../core/utils/error.utils';
import { ProviderModel } from '../models/provider.model';
import { ProviderService } from '../service/provider.service';
import { ErrorService } from '../../core/service/error.service';
import { AppState } from '../../core/ng-xs-store/states/app.state';
import { createMask } from '@ngneat/input-mask';

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
  mapLoaded$ = this.store.select(AppState.getMapLoaded);
  mapLoaded: boolean = false;
  //subscriptions
  subscriptions$: Subscription[] = [];
  emailInputMask = createMask({ alias: 'email' });
  rncMask = createMask('99999999');
  cedulaMask = createMask({
    mask: '999-9999999-9',
    parser: (value: string) => {
      return value.replace(/[^0-9a-zA-Z]/g, '');
    },
  });
  passportMask = createMask('********');
  phoneMask = createMask({
    mask: '9{1,15}',
    greedy: false,
    parser: (value: string) => {
      return String(value.replace(/[^0-9a-zA-Z]/g, ''));
    },
  });

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
    private store: Store,
    private errorService: ErrorService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadProvider();
    });
    this.providerForm.get('latitude')?.disable();
    this.providerForm.get('longitude')?.disable();
    this.mapLoaded$.subscribe((mapLoaded) => {
      this.mapLoaded = mapLoaded;
    });
  }

  providerForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', Validators.maxLength(100)],
    identification: ['', [Validators.required, Validators.maxLength(15)]],
    identificationType: [1, Validators.required],
    phone: ['', [Validators.required, Validators.maxLength(15)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
    buildingNumber: ['', Validators.maxLength(10)],
    city: ['', Validators.maxLength(50)],
    street: ['', Validators.maxLength(100)],
    country: ['', Validators.maxLength(50)],
    postalCode: ['', Validators.maxLength(50)],
    latitude: [''],
    longitude: [''],
    formattedAddress: [''],
  });

  handlePermissionsLoad(onPermissionLoad: () => void) {
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

  getInputMaskByType() {
    const identificationType =
      this.providerForm.get('identificationType')?.value;
    if (identificationType == 1) {
      return this.cedulaMask;
    } else if (identificationType == 2) {
      return this.rncMask;
    } else if (identificationType == 3) {
      return this.passportMask;
    }
    return null;
  }

  getInputMaskPlaceHolderByType() {
    const identificationType =
      this.providerForm.get('identificationType')?.value;
    if (identificationType == 1) {
      return '__-_______-_';
    } else if (identificationType == 2) {
      return '________';
    } else if (identificationType == 3) {
      return '________';
    }
    return '';
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
          processError(error.error || error, 'Error creando porveedor').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
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
          processError(
            error.error || error,
            'Error actualizando proveedor'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
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
          processError(
            error.error || error,
            'Error cargando proveedor'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }
}
