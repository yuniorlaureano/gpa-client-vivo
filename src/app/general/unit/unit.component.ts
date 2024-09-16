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
import { processError } from '../../core/utils/error.utils';
import { UnitService } from '../service/unit.service';
import { UnitModel } from '../model/unit.model';

@Component({
  selector: 'gpa-unit',
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.css',
})
export class UnitComponent implements OnInit, OnDestroy {
  isEdit = false;
  unitForm = this.formBuilder.group({
    id: [''],
    code: ['', [Validators.required, Validators.maxLength(10)]],
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
  });

  //subscriptions
  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private unitService: UnitService,
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
    this.handlePermissionsLoad(() => {
      this.loadUnit();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.General][
            PermissionConstants.Components.Unit
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

  updateUnit(value: any) {
    this.spinner.show('fullscreen');
    const sub = this.unitService.updateUnit(<UnitModel>value).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Uniad modificada');
        this.spinner.hide('fullscreen');
        this.router.navigate(['/general/unit/list']);
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error || error, 'Error modificando unidad').forEach(
          (error) => {
            this.toastService.showError(error);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }

  createUnit(value: any) {
    value.id = null;
    this.spinner.show('fullscreen');
    const sub = this.unitService.addUnit(<UnitModel>value).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Unidad creada');
        this.spinner.hide('fullscreen');
        this.router.navigate(['/general/unit/list']);
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        processError(error.error || error, 'Error creando unidad').forEach(
          (error) => {
            this.toastService.showError(error);
          }
        );
      },
    });
    this.subscriptions$.push(sub);
  }

  saveUnit() {
    this.unitForm.markAllAsTouched();
    if (this.unitForm.valid) {
      const value = {
        ...this.unitForm.value,
      };
      if (this.isEdit) {
        this.updateUnit(value);
      } else {
        this.createUnit(value);
      }
    }
  }

  loadUnit() {
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.unitService.getUnitById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (unit) => {
          if (unit) {
            this.unitForm.setValue({
              id: unit.id,
              code: unit.code,
              name: unit.name,
              description: unit.description,
            });
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error || error, 'Error cargando unidad').forEach(
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
    this.router.navigate(['/general/unit']);
  }

  clearForm() {
    this.unitForm.reset();
    this.isEdit = false;
  }
}
