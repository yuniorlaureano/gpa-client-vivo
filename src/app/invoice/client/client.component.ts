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

@Component({
  selector: 'gpa-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent implements OnInit, OnDestroy {
  clients: ClientModel[] = [];
  isEdit: boolean = false;
  mapIsVisible: boolean = false;

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
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad();
    this.loadClient();
    this.clientForm.get('latitude')?.disable();
    this.clientForm.get('longitude')?.disable();
  }

  clientForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    lastName: [''],
    identification: ['', Validators.required],
    identificationType: [1],
    phone: [''],
    email: [''],
    buildingNumber: [''],
    state: [''],
    city: [''],
    street: [''],
    country: [''],
    postalCode: [''],
    latitude: [0],
    longitude: [0],
    formattedAddress: [''],
    credits: this.fb.array([]),
  });

  handlePermissionsLoad() {
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
        this.toastService.showError('Error al agregar cliente');
      },
    });
    this.subscriptions$.push(sub);
  }

  upateClient() {
    const value = {
      ...this.clientForm.value,
    };

    this.spinner.show('fullscreen');
    const sub = this.clientService
      .updateClient(value as ClientModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.spinner.hide('fullscreen');
          this.toastService.showSucess('Cliente actualizado');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al actualizar el cliente');
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
  }

  handleLocationChange(location: LocationWithNameModel) {
    this.mapIsVisible = false;
    this.clientForm.get('name')?.setValue(location.placeName);
    this.clientForm
      .get('formattedAddress')
      ?.setValue(location.formattedAddress);
    this.clientForm.get('latitude')?.setValue(location.lat);
    this.clientForm.get('longitude')?.setValue(location.lng);
    console.log('setting location');
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
              state: client.state,
              country: client.country,
              postalCode: client.postalCode,
              street: client.street,
              city: client.city,
              latitude: client.latitude,
              longitude: client.longitude,
              formattedAddress: client.formattedAddress,
              credits: [],
            });
            this.mapCredits(client.credits);
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al cargar el cliente');
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
