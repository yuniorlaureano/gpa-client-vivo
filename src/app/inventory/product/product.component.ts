import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ProductModel } from '../models/product.model';
import { ProductService } from '../service/product.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { UnitModel } from '../../general/model/unit.model';
import { UnitService } from '../../general/service/unit.service';
import { CategoryModel } from '../models/category.model';
import { CategoryService } from '../service/category.service';
import { ProductType } from '../../core/models/product-type.enum';
import { AddonService } from '../service/addon.service';
import { AddonModel } from '../models/addon.model';
import { NgxSpinnerService } from 'ngx-spinner';
import * as ProfileUtils from '../../core/utils/profile.utils';
import * as PermissionConstants from '../../core/models/profile.constants';
import { Store } from '@ngxs/store';
import { RequiredPermissionType } from '../../core/models/required-permission.type';
import { FilterModel } from '../../core/models/filter.model';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit, OnDestroy {
  products: ProductModel[] = [];
  isEdit: boolean = false;
  units$!: Observable<UnitModel[]>;
  categories$!: Observable<CategoryModel[]>;
  photo: File | null = null;
  imageUrl: string | ArrayBuffer | null =
    'assets/images/default-placeholder.png';
  triggerLoadAddons$ = new BehaviorSubject<boolean>(false);

  subscriptions$: Subscription[] = [];

  //permissions
  canRead: boolean = false;
  canCreate: boolean = false;
  canEdit: boolean = false;

  //form
  productForm = this.fb.group({
    id: [''],
    code: ['', Validators.required],
    name: ['', Validators.required],
    price: [0.0, [Validators.required]],
    description: ['', Validators.required],
    unitId: ['', Validators.required],
    categoryId: ['', Validators.required],
    type: [
      ProductType.FinishedProduct,
      [Validators.required, Validators.min(1), Validators.max(2)],
    ],
    addons: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private unitService: UnitService,
    private categoryService: CategoryService,
    private addonService: AddonService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadProduct();
    this.handlePermissionsLoad();
    this.loadUnits();
    this.loadCategories();
    this.loadAddons();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field) as FormControl;
    return (
      control &&
      control.touched &&
      control.errors &&
      'required' in control.errors &&
      control.errors['required']
    );
  }

  handlePermissionsLoad() {
    const sub = this.store
      .select(
        (state: any) =>
          state.app.requiredPermissions[PermissionConstants.Modules.Inventory][
            PermissionConstants.Components.Product
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

  onSubmit() {
    if (this.productForm.valid) {
      if (!this.isEdit) {
        this.createProduct();
      } else {
        this.upateProduct();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  getProductValueFromForm() {
    return {
      ...this.productForm.value,
      unit: '',
      category: '',
      photo: '',
      productLocation: '',
      productLocationId: null,
      addons: this.addonsForm.value
        .filter((creadit: any) => creadit.selected)
        .map((credit: any) => credit.id),
    };
  }

  clearFormOnCreate() {
    this.clearForm();
    this.toastService.showSucess('Producto agregado');
    this.spinner.hide('fullscreen');
  }

  createProduct() {
    this.productForm.get('id')?.setValue(null);
    const value = this.getProductValueFromForm();

    this.spinner.show('fullscreen');
    const sub = this.productService
      .addProduct(value as ProductModel)
      .subscribe({
        next: (product) => {
          if (this.photo) {
            this.uploadFile(product.id!, () => {
              this.clearFormOnCreate();
              this.router.navigate(['/inventory/product/' + product.id]);
            });
          } else {
            this.clearFormOnCreate();
            this.router.navigate(['/inventory/product/' + product.id]);
          }
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error creando producto').forEach((err) => {
            this.toastService.showError(err);
          });
        },
      });
    this.subscriptions$.push(sub);
  }

  clearFormOnUpdate() {
    this.clearForm();
    this.toastService.showSucess('Producto actualizado');
    this.spinner.hide('fullscreen');
    this.router.navigate(['/inventory/product']);
  }

  upateProduct() {
    const value = this.getProductValueFromForm();
    this.spinner.show('fullscreen');
    const sub = this.productService
      .updateProduct(value as ProductModel)
      .subscribe({
        next: () => {
          this.clearFormOnUpdate();
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error actualizando producto').forEach(
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
    this.router.navigate(['/inventory/product']);
  }

  clearForm() {
    this.productForm.reset();
    this.isEdit = false;
    this.imageUrl = 'assets/images/default-placeholder.png';
    this.triggerLoadAddons$.next(true);
  }

  get addonsForm() {
    return this.productForm.get('addons') as FormArray;
  }

  mapAddon(addons?: AddonModel[], callback = (id: string) => false) {
    if (addons) {
      this.addonsForm.clear();
      for (let addon of addons) {
        this.addonsForm.push(
          this.fb.group({
            id: addon.id,
            concept: addon.concept,
            selected: callback(addon.id!),
          })
        );
      }
    }
  }

  processFileUpload(event: Event) {
    const fileElement = event.currentTarget as HTMLInputElement;
    this.photo = fileElement.files ? fileElement.files[0] : null;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = reader.result;
    };
    if (this.photo) {
      reader.readAsDataURL(this.photo);
    } else {
      this.imageUrl = 'assets/images/default-placeholder.png';
    }

    //automaticaly upload the file if the product is being edited
    this.uploadFIleOnUpdate();
  }

  uploadFIleOnUpdate() {
    if (this.isEdit && this.productForm.get('id')?.value) {
      this.spinner.show('fullscreen');
      this.uploadFile(this.productForm.get('id')?.value!, () => {
        this.clearForm();
        this.toastService.showSucess('Foto actualizada');
        this.spinner.hide('fullscreen');
        this.router.navigate(['/inventory/product']);
      });
    }
  }

  uploadFile(productId: string, func: () => void) {
    if (this.photo) {
      const formData = new FormData();
      formData.append('ProductId', productId);
      formData.append('Photo', this.photo);
      const sub = this.productService.uploadFile(formData).subscribe({
        next: () => {
          func();
        },
        error: () => {
          func();
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

  setProduct(product: ProductModel | null, addons: AddonModel[] | null) {
    if (product == null) return;

    this.setFormValues(product);
    this.setAddonsToFrom(product.addons, addons!);
  }

  setAddonsToFrom(productAddons: AddonModel[], addons: AddonModel[]) {
    let selectedAddon: any = {};
    if (addons) {
      productAddons.forEach((addon) => (selectedAddon[addon.id!] = true));
    }
    this.mapAddon(addons!, (id) => (selectedAddon[id] ? true : false));
  }

  setFormValues(product: ProductModel) {
    this.productForm.setValue({
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      description: product.description,
      unitId: product.unitId,
      categoryId: product.categoryId,
      type: product.type,
      addons: [],
    });
  }

  loadUnits() {
    const filder = new FilterModel();
    filder.pageSize = 1000;
    this.units$ = this.unitService
      .getUnits(filder)
      .pipe(map((data) => data.data));
  }

  loadCategories() {
    const filder = new FilterModel();
    filder.pageSize = 1000;
    this.categories$ = this.categoryService
      .getCategory(filder)
      .pipe(map((data) => data.data));
  }

  loadAddons() {
    if (!this.isEdit) {
      const filder = new FilterModel();
      filder.pageSize = 1000;
      const sub = this.triggerLoadAddons$
        .pipe(
          switchMap(() => {
            return this.addonService.getAddon(filder);
          })
        )
        .subscribe({
          next: (data) => this.mapAddon(data.data),
          error: (error) => {
            processError(error.error, 'Error cargando agregado').forEach(
              (err) => {
                this.toastService.showError(err);
              }
            );
          },
        });
      this.subscriptions$.push(sub);
    }
  }

  getIdFromParamsAndLoadProduct() {
    return switchMap((params: ParamMap) => {
      this.spinner.show('fullscreen');
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        return combineLatest([
          this.productService.getProductById(id),
          this.addonService.getAddon().pipe(map((data) => data.data)),
        ]);
      } else {
        this.isEdit = false;
        return of([null, null]);
      }
    });
  }

  loadProduct() {
    const sub = this.route.paramMap
      .pipe(this.getIdFromParamsAndLoadProduct())
      .subscribe({
        next: ([product, addons]) => {
          if (product) {
            this.setPhoto(product.photo);
            this.setProduct(product, addons);
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          processError(error.error, 'Error cargando producto').forEach(
            (err) => {
              this.toastService.showError(err);
            }
          );
        },
      });
    this.subscriptions$.push(sub);
  }
}
