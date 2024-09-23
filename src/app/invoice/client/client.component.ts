import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { ClientModel } from '../model/client.model';
import { ClientService } from '../service/client.service';
import { ClientCreditModel } from '../model/client-credit.model';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { LocationWithNameModel } from '../../core/models/location-with-name.model';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';
import { AppState } from '../../core/ng-xs-store/states/app.state';
import { createMask } from '@ngneat/input-mask';

@Component({
  selector: 'gpa-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent implements OnInit, OnDestroy {
  clients: ClientModel[] = [];
  isEdit: boolean = false;
  mapIsVisible: boolean = false;
  locations: { lat: number; lng: number; name: string }[] = [];
  mapLoaded$ = this.store.select(AppState.getMapLoaded);
  mapLoaded: boolean = false;
  emailInputMask = createMask({ alias: 'email' });
  rncMask = createMask('999999999');
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
  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ',',
    digits: 2,
    digitsOptional: false,
    prefix: '$ ',
    placeholder: '0',
    parser: (value: string) => {
      return Number(value.replace(/[^0-9.]/g, ''));
    },
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
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
      this.loadClient();
    });
    this.clientForm.get('latitude')?.disable();
    this.clientForm.get('longitude')?.disable();
    this.mapLoaded$.subscribe((mapLoaded) => {
      this.mapLoaded = mapLoaded;
    });
  }

  clientForm = this.fb.group({
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
    credits: this.fb.array([]),
  });

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Invoice][
            PermissionConstants.Components.Client
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
    const identificationType = this.clientForm.get('identificationType')?.value;
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
    const identificationType = this.clientForm.get('identificationType')?.value;
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
    this.clientForm.markAllAsTouched();
    this.credits.markAllAsTouched();
    if (this.clientForm.valid) {
      if (!this.isEdit) {
        this.createClient();
      } else {
        this.upateClient();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  createClient() {
    this.clientForm.get('id')?.setValue(null);
    const value = {
      ...this.clientForm.value,
      latitude: this.parseLocationValue(this.clientForm.get('latitude')?.value),
      longitude: this.parseLocationValue(
        this.clientForm.get('longitude')?.value
      ),
    };
    this.spinner.show('fullscreen');
    const sub = this.clientService.addClient(value as ClientModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Cliente agregado');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error || error, 'Error creando cliente').forEach(
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

  upateClient() {
    const value = {
      ...this.clientForm.value,
      latitude: this.parseLocationValue(this.clientForm.get('latitude')?.value),
      longitude: this.parseLocationValue(
        this.clientForm.get('longitude')?.value
      ),
    };

    this.spinner.show('fullscreen');
    const sub = this.clientService
      .updateClient(value as ClientModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.spinner.hide('fullscreen');
          this.toastService.showSucess('Cliente actualizado');
          this.router.navigate(['/invoice/client']);
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error actualizando cliente'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  get credits() {
    return this.clientForm.get('credits') as FormArray;
  }

  addCredit() {
    this.credits.push(
      this.fb.group({
        concept: ['', Validators.required],
        credit: [0, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeCredit(i: number) {
    this.credits.removeAt(i);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/invoice/client']);
  }

  clearForm() {
    this.clientForm.reset();
    this.isEdit = false;
    this.clientForm.get('latitude')?.disable();
    this.clientForm.get('longitude')?.disable();
    this.credits.clear();
  }

  handleLocationChange(location: LocationWithNameModel) {
    this.mapIsVisible = false;
    this.clientForm.get('name')?.setValue(location.placeName);
    this.clientForm
      .get('formattedAddress')
      ?.setValue(location.formattedAddress);
    this.clientForm.get('latitude')?.setValue(location.lat?.toString() ?? '');
    this.clientForm.get('longitude')?.setValue(location.lng?.toString() ?? '');
  }

  hideMap() {
    this.mapIsVisible = false;
  }

  loadClient() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.clientService.getClientById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (client) => {
          if (client) {
            this.clientForm.setValue({
              id: client.id,
              name: client.name,
              lastName: client.lastName,
              identification: client.identification,
              identificationType: client.identificationType,
              phone: client.phone,
              email: client.email,
              buildingNumber: client.buildingNumber,
              country: client.country,
              postalCode: client.postalCode,
              street: client.street,
              city: client.city,
              latitude: client.latitude?.toString() ?? '',
              longitude: client.longitude?.toString() ?? '',
              formattedAddress: client.formattedAddress,
              credits: [],
            });
            this.mapCredits(client.credits);

            if (client.latitude != null && client.longitude != null) {
              this.locations = [
                {
                  lat: client.latitude,
                  lng: client.longitude,
                  name: client.name + ' ' + client.lastName,
                },
              ];
            }
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error || error, 'Error cargando cliente').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  mapCredits(credits: ClientCreditModel[]) {
    if (credits) {
      for (let credit of credits) {
        this.credits.push(
          this.fb.group({
            concept: [credit.concept, Validators.required],
            credit: [credit.credit, [Validators.required, Validators.min(1)]],
          })
        );
      }
    }
  }
}
