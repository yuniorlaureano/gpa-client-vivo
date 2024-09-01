import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { AddonService } from '../service/addon.service';
import { AddonModel } from '../models/addon.model';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-addon',
  templateUrl: './addon.component.html',
  styleUrl: './addon.component.css',
})
export class AddonComponent implements OnInit, OnDestroy {
  isEdit = false;
  addonForm = this.formBuilder.group({
    id: [''],
    concept: ['', [Validators.required, Validators.maxLength(50)]],
    isDiscount: [true, Validators.required],
    type: ['PERCENTAGE', Validators.required],
    value: ['', Validators.required],
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canEdit: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private addonService: AddonService,
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
    this.loadAddon();
    this.handlePermissionsLoad();
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.Addon
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
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  createAddons(value: any) {
    this.spinner.show('fullscreen');
    const sub = this.addonService.updateAddon(<AddonModel>value).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Agregado modificado');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error, 'Error agregando agregado').forEach((err) => {
          this.toastService.showError(err);
        });
      },
    });
    this.subscriptions$.push(sub);
  }

  updateAddon(value: any) {
    value.id = null;
    this.spinner.show('fullscreen');
    const sub = this.addonService.addAddon(<AddonModel>value).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Agregado actualizado');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error, 'Error actualizando agregado').forEach(
          (err) => {
            this.toastService.showError(err);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }

  saveAddon() {
    this.addonForm.markAllAsTouched();
    if (this.addonForm.valid) {
      const value = {
        ...this.addonForm.value,
        value: Number(this.addonForm.get('value')?.value),
      };
      if (this.isEdit) {
        this.createAddons(value);
      } else {
        this.updateAddon(value);
      }
    }
  }

  loadAddon() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.addonService.getAddonById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (addon) => {
          this.mapAddons(addon);
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error cargando agregado').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }

  mapAddons(addon: AddonModel | null) {
    if (addon) {
      this.addonForm.setValue({
        id: addon.id,
        concept: addon.concept,
        isDiscount: addon.isDiscount,
        type: addon.type,
        value: addon.value.toString(),
      });
    }
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/inventory/addon']);
  }

  clearForm() {
    this.addonForm.reset();
    this.isEdit = false;
  }
}
