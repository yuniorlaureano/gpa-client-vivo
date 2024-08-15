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
import { ActivatedRoute, Router } from '@angular/router';
import {
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

@Component({
  selector: 'gpa-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit, OnDestroy {
  minDate: NgbDateStruct;
  products: ProductModel[] = [];
  isEdit: boolean = false;
  units$!: Observable<UnitModel[]>;
  categories$!: Observable<CategoryModel[]>;
  photo: File | null = null;
  imageUrl: string | ArrayBuffer | null =
    'assets/images/default-placeholder.png';

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
  ) {
    // Esto es parte de la validacion general
    //sirve para que la fecha de expiracion no sea menor a la fecha actual
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadProduct();
    this.handlePermissionsLoad();

    this.units$ = this.unitService.getUnits().pipe(map((data) => data.data));
    this.categories$ = this.categoryService
      .getCategory()
      .pipe(map((data) => data.data));
    if (!this.isEdit) {
      const sub = this.addonService.getAddon().subscribe({
        next: (data) => this.mapAddon(data.data),
        error: (error) => {
          this.toastService.showError('Error cargando agregados');
        },
      });
      this.subscriptions$.push(sub);
    }
  }

  //subscriptions
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
    barCode: ['', Validators.required],
    expirationDate: ['', Validators.required],
    unitId: ['', Validators.required],
    categoryId: ['', Validators.required],
    type: [
      ProductType.FinishedProduct,
      [Validators.required, Validators.min(1), Validators.max(2)],
    ],
    addons: this.fb.array([]),
  });

  //Validaciones generales para los campos del formulario
  currentDate: Date = new Date();
  //
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
  //

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

  createProduct() {
    this.productForm.get('id')?.setValue(null);
    const value = {
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

    this.spinner.show('fullscreen');
    const sub = this.productService
      .addProduct(value as ProductModel)
      .subscribe({
        next: (product) => {
          if (this.photo) {
            this.uploadFile(product.id!, () => {
              this.clearForm();
              this.toastService.showSucess('Producto agregado');
              this.spinner.hide('fullscreen');
            });
          } else {
            this.clearForm();
            this.toastService.showSucess('Producto agregado');
            this.spinner.hide('fullscreen');
          }
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al agregar producto');
        },
      });
    this.subscriptions$.push(sub);
  }

  upateProduct() {
    const value = {
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
    this.spinner.show('fullscreen');
    const sub = this.productService
      .updateProduct(value as ProductModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Producto actualizado');
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al actualizar el producto');
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
  }

  get addonsForm() {
    return this.productForm.get('addons') as FormArray;
  }

  onAddonChange() {
    console.log(this.addonsForm.value);
  }

  mapAddon(addons?: AddonModel[], callback = (id: string) => false) {
    if (addons) {
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
    if (this.isEdit && this.productForm.get('id')?.value) {
      this.spinner.show('fullscreen');
      this.uploadFile(this.productForm.get('id')?.value!, () => {
        this.clearForm();
        this.toastService.showSucess('Foto actualizada');
        this.spinner.hide('fullscreen');
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

  loadProduct() {
    //this.addonService.getAddon()
    const sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
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
        })
      )
      .subscribe({
        next: ([product, addons]) => {
          if (product) {
            this.productForm.setValue({
              id: product.id,
              code: product.code,
              name: product.name,
              price: product.price,
              description: product.description,
              barCode: product.barCode,
              expirationDate: product.expirationDate,
              unitId: product.unitId,
              categoryId: product.categoryId,
              type: product.type,
              addons: [],
            });

            if (product.addons) {
              let selectedAddon: any = {};
              product.addons.forEach(
                (addon) => (selectedAddon[addon.id!] = true)
              );
              this.mapAddon(addons!, (id) =>
                selectedAddon[id] ? true : false
              );
            }
          }
          this.spinner.hide('fullscreen');
        },
        error: (error) => {
          this.spinner.hide('fullscreen');
          this.toastService.showError('Error al cargar el producto');
        },
      });
    this.subscriptions$.push(sub);
  }
}
