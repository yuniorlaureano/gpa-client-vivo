import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { PrintInformationModel } from '../model/print-information.model';
import { PrintInformationService } from '../service/print-information.service';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';
import { createMask } from '@ngneat/input-mask';
import { validateImage } from '../../core/utils/image.utils';

@Component({
  selector: 'gpa-product',
  templateUrl: './print-information.component.html',
  styleUrl: './print-information.component.css',
})
export class PrintInformationComponent implements OnInit, OnDestroy {
  isEdit: boolean = false;
  photo: File | null = null;
  imageUrl: string | ArrayBuffer | null =
    'assets/images/default-placeholder.png';
  subscriptions$: Subscription[] = [];
  triggerLoad$ = new BehaviorSubject<boolean>(true);
  emailInputMask = createMask({ alias: 'email' });

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canEdit: boolean = false;

  //form
  printInformationForm = this.fb.group({
    id: [''],
    companyName: ['', [Validators.required, Validators.maxLength(254)]],
    companyDocument: ['', [Validators.required, Validators.maxLength(30)]],
    companyDocumentPrefix: [''],
    companyAddress: ['', [Validators.required, Validators.maxLength(254)]],
    companyPhone: ['', [Validators.required, Validators.maxLength(30)]],
    companyPhonePrefix: [''],
    companyEmail: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
    companyWebsite: ['', [Validators.required, Validators.maxLength(254)]],
    signer: ['', [Validators.required, Validators.maxLength(100)]],
    current: [true],
    storeId: [''],
  });

  constructor(
    private fb: FormBuilder,
    private printInformationService: PrintInformationService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private store: Store,
    private router: Router,
    private errorService: ErrorService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.handlePermissionsLoad(() => {
      this.loadPrintInformation();
    });
  }

  handlePermissionsLoad(onPermissionLoad: () => void) {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.General][
            PermissionConstants.Components.PrintInformation
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
    this.canEdit = ProfileUtils.validateIfCan(
      requiredPermissions,
      PermissionConstants.Permission.Update
    );
  }

  onSubmit() {
    if (this.printInformationForm.valid) {
      if (!this.isEdit) {
        this.createPrintInformation();
      } else {
        this.upatePrintInformation();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  clearFormOnCreate() {
    this.clearForm();
    this.toastService.showSucess('Informacion de impresion agregada');
    this.spinner.hide('fullscreen');
  }

  createPrintInformation() {
    this.printInformationForm.get('id')?.setValue(null);
    const value = {
      ...this.printInformationForm.value,
      storeId: this.printInformationForm.get('storeId')?.value || null,
    };

    this.spinner.show('fullscreen');
    const sub = this.printInformationService
      .addPrintInformation(value as PrintInformationModel)
      .subscribe({
        next: (product) => {
          if (this.photo) {
            this.uploadFile(product.id!, () => {
              this.clearFormOnCreate();
              this.router.navigate([
                '/general/print-information/edit/' + product.id,
              ]);
            });
          } else {
            this.clearFormOnCreate();
            this.router.navigate([
              '/general/print-information/edit/' + product.id,
            ]);
          }
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error cargando información de impresión'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  clearFormOnUpdate() {
    this.clearForm();
    this.toastService.showSucess('Registro actualizado');
    this.spinner.hide('fullscreen');
    this.router.navigate(['/general/print-information/']);
  }

  upatePrintInformation() {
    const value = {
      ...this.printInformationForm.value,
      storeId: this.printInformationForm.get('storeId')?.value || null,
    };
    this.spinner.show('fullscreen');
    const sub = this.printInformationService
      .updatePrintInformation(value as PrintInformationModel)
      .subscribe({
        next: () => {
          this.clearFormOnUpdate();
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error actualizando información de impresión'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/general/print-information/']);
  }

  clearForm() {
    this.printInformationForm.reset();
    this.isEdit = false;
    this.imageUrl = 'assets/images/default-placeholder.png';
  }

  processFileUpload(event: Event) {
    const fileElement = event.currentTarget as HTMLInputElement;
    this.photo = fileElement.files ? fileElement.files[0] : null;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = reader.result;
    };
    if (this.photo) {
      const resultError = validateImage(this.photo);
      if (resultError) {
        this.toastService.showError(resultError);
      } else {
        reader.readAsDataURL(this.photo);
        //automaticaly upload the file if the product is being edited
        this.uploadFIleOnUpdate();
      }
    } else {
      this.imageUrl = 'assets/images/default-placeholder.png';
    }
  }

  uploadFIleOnUpdate() {
    if (this.isEdit && this.printInformationForm.get('id')?.value) {
      this.spinner.show('fullscreen');
      this.uploadFile(this.printInformationForm.get('id')?.value!, (sucess) => {
        this.clearForm();
        this.spinner.hide('fullscreen');
        this.triggerLoad$.next(true);
        if (sucess) {
          this.toastService.showSucess('Foto actualizada');
        }
      });
    }
  }

  uploadFile(productId: string, func: (sucess: boolean) => void) {
    if (this.photo) {
      const formData = new FormData();
      formData.append('PrintInformationId', productId);
      formData.append('Photo', this.photo);
      const sub = this.printInformationService.uploadFile(formData).subscribe({
        next: () => {
          func(true);
        },
        error: (error) => {
          processError(error.error || error, 'Error subieno la foto').forEach(
            (err) => {
              this.errorService.addGeneralError(err);
            }
          );
          func(false);
        },
      });
      this.subscriptions$.push(sub);
    }
  }

  setPhoto(photo: string | null) {
    if (photo) {
      try {
        var fileUrl = JSON.parse(photo).fileUrl;
        this.imageUrl = fileUrl;
      } catch {}
    }
  }

  setFormValues(printInformation: PrintInformationModel) {
    this.printInformationForm.setValue({
      id: printInformation.id,
      companyName: printInformation.companyName,
      companyDocument: printInformation.companyDocument,
      companyDocumentPrefix: printInformation.companyDocumentPrefix,
      companyAddress: printInformation.companyAddress,
      companyPhone: printInformation.companyPhone,
      companyPhonePrefix: printInformation.companyPhonePrefix,
      companyEmail: printInformation.companyEmail,
      companyWebsite: printInformation.companyWebsite,
      signer: printInformation.signer,
      current: printInformation.current,
      storeId: printInformation.storeId ?? null,
    });
  }

  getIdFromParamsAndLoadPrintInformation() {
    return switchMap(([params, _]) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        return this.printInformationService.getPrintInformationById(id);
      } else {
        this.isEdit = false;
        return of(null);
      }
    });
  }

  loadPrintInformation() {
    const sub = combineLatest([this.route.paramMap, this.triggerLoad$])
      .pipe(this.getIdFromParamsAndLoadPrintInformation())
      .subscribe({
        next: (printInformation: PrintInformationModel | null) => {
          if (printInformation) {
            this.setPhoto(printInformation.companyLogo);
            this.setFormValues(printInformation);
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(
            error.error || error,
            'Error cargando información de impresión'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }
}
